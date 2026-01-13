import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Initiating Fresh Start: Purging all dummy data...\n');

    // 1. Wipe User Data (Tables that should be empty on a fresh start)
    console.log('🧹 Wiping User and Activity data...');

    // Order matters due to foreign keys
    await prisma.messageFeedback.deleteMany({});
    await prisma.pinnedMessage.deleteMany({});
    await prisma.voiceFeedback.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.characterComment.deleteMany({});
    await prisma.characterSave.deleteMany({});
    await prisma.userFollow.deleteMany({});
    await prisma.personaView.deleteMany({});
    await prisma.userCharacterEngagement.deleteMany({});
    await prisma.userRewardProgress.deleteMany({});
    await prisma.userLoginStreak.deleteMany({});
    await prisma.creditTransaction.deleteMany({});
    await prisma.creditPurchase.deleteMany({});
    await prisma.referralPurchase.deleteMany({});
    await prisma.payout.deleteMany({});
    await prisma.userQuota.deleteMany({});
    await prisma.subscription.deleteMany({});

    // Delete users last
    const userDeleted = await prisma.user.deleteMany({});
    console.log(`   ✅ Deleted ${userDeleted.count} users and all associated data.\n`);

    // 2. Reset Character Metrics
    console.log('📊 Resetting character engagement metrics...');
    await prisma.personaTemplate.updateMany({
        data: {
            viewCount: 0,
            chatCount: 0,
            followerCount: 0,
            interactionCount: 0,
            saveCount: 0,
            commentCount: 0,
            retentionScore: 0.0,
            trending: false,
        }
    });
    console.log('   ✅ Metrics reset to zero.\n');

    // 3. Purge Non-Elite Characters
    // We only want the 33 characters (4 core agents + 29 elite characters)
    // The core agents have IDs like "content-architect", "social-strategist", etc.
    // The elite characters have IDs like "cmk-narrator", "cmk-sergeant", etc.

    console.log('🎭 Purging non-core characters...');
    const result = await prisma.personaTemplate.deleteMany({
        where: {
            NOT: {
                OR: [
                    { id: { in: ['content-architect', 'social-strategist', 'brand-storyteller', 'growth-hacker'] } },
                    { id: { startsWith: 'cmk-' } }
                ]
            }
        }
    });
    console.log(`   ✅ Removed ${result.count} non-core characters.\n`);

    // 4. Cleanup TTS Cache
    console.log('💾 Clearing TTS cache...');
    await prisma.tTSCache.deleteMany({});
    console.log('   ✅ Cache cleared.\n');

    console.log('✨ Fresh Start Complete! The application is now clean.');
}

main()
    .catch((e) => {
        console.error('❌ Fresh Start Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
