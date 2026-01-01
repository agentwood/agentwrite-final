import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of seedId to local avatar path (generated avatars)
const AVATAR_UPDATES: Record<string, string> = {
    // Already generated avatars
    'marge-halloway': '/avatars/marge-halloway.png',
    'raj-corner-store': '/avatars/raj.png',
    'yuki-tanaka': '/avatars/yuki-tanaka.png',
    'coach-boone': '/avatars/coach-boone.png',
    'dr-nadia': '/avatars/dr-nadia.png',
    'kira-neonfox': '/avatars/kira-neonfox.png',
    'auntie-saffy': '/avatars/auntie-saffy.png',
    'camille-laurent': '/avatars/camille-laurent.png',
    'doodle-dave': '/avatars/doodle-dave.png',
    'sunny-sato': '/avatars/sunny-sato.png',
    'nico-awkward': '/avatars/nico-awkward.png',
    'mina-kwon': '/avatars/mina-kwon.png',

    // Avatars to be generated (will use local path once generated)
    'big-tom': '/avatars/big-tom.png',
    'miles-granger': '/avatars/miles-granger.png',
    'priya-nair': '/avatars/priya-nair.png',
    'council-estate': '/avatars/council-estate.png',
    'queue-manager': '/avatars/queue-manager.png',
    'mr-receipt': '/avatars/mr-receipt.png',
    'hush': '/avatars/hush.png',
    'kael-drakesunder': '/avatars/kael-drakesunder.png',
    'juno-gearwhistle': '/avatars/juno-gearwhistle.png',
    'seraphina-vale': '/avatars/seraphina-vale.png',
    'orion-riftwalker': '/avatars/orion-riftwalker.png',
    'wendy-hughes': '/avatars/wendy-hughes.png',
    'detective-jun': '/avatars/detective-jun.png',
    'captain-mireya': '/avatars/captain-mireya.png',
    'prof-basil': '/avatars/prof-basil.png',
    'convenience-store': '/avatars/convenience-store.png',
    'angry-karen': '/avatars/angry-karen.png',
    'jon-debater': '/avatars/jon-debater.png',
    'sweet-cs-rep': '/avatars/sweet-cs-rep.png',
    'passive-aggressive': '/avatars/passive-aggressive.png',
    'unshakeable-optimist': '/avatars/unshakeable-optimist.png',
};

async function main() {
    console.log('🖼️  Updating character avatar URLs...\n');

    let updated = 0;
    let notFound = 0;

    for (const [seedId, avatarUrl] of Object.entries(AVATAR_UPDATES)) {
        const result = await prisma.personaTemplate.updateMany({
            where: { seedId },
            data: { avatarUrl },
        });

        if (result.count > 0) {
            console.log(`  ✅ ${seedId} -> ${avatarUrl}`);
            updated++;
        } else {
            console.log(`  ⚠️  ${seedId} - not found in database`);
            notFound++;
        }
    }

    console.log(`\n✨ Updated ${updated} characters, ${notFound} not found.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
