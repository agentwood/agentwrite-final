import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Character Voice & Archetype Audit...');

    const characters = await prisma.personaTemplate.findMany({
        include: {
            voiceIdentity: true,
            voiceSeed: true,
        },
    });

    console.log(`📊 Found ${characters.length} characters.`);

    const issues: any[] = [];
    const voiceMap: Record<string, number> = {};

    for (const char of characters) {
        const missing: string[] = [];

        // Check Archetype
        if (!char.archetype) {
            missing.push('archetype');
        }

        // Check Voice ID (V2 Architecture)
        // We expect either a voiceIdentityId OR a voiceSeedId for "voiceReady" chars
        // Or at least a valid voiceName/openVoiceVoiceId for legacy.
        const hasV2Voice = !!char.voiceIdentityId || !!char.voiceSeedId;

        if (!hasV2Voice) {
            missing.push('voice_configuration (Missing V2 voiceSeedId or voiceIdentityId)');
        }

        // Track voice usage
        const voiceKey = char.voiceIdentityId || char.voiceSeedId || char.voiceName || 'unknown';
        voiceMap[voiceKey] = (voiceMap[voiceKey] || 0) + 1;

        if (missing.length > 0) {
            issues.push({
                name: char.name,
                id: char.id,
                missing,
                category: char.category,
                voiceReady: char.voiceReady,
            });
        }
    }

    // Report Issues
    if (issues.length > 0) {
        console.log('\n❌ Found Issues in the following characters:');
        console.table(issues);
    } else {
        console.log('\n✅ All characters have Archetypes and Voice configurations.');
    }

    // Check for duplicates
    console.log('\n📢 Voice Usage Stats (Top 10):');
    const sortedVoices = Object.entries(voiceMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.table(sortedVoices);

    console.log('\n🏁 Audit Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
