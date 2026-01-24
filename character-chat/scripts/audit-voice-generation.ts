import { PrismaClient } from '@prisma/client';
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Independent Voice Audit...');

    // Get all voice seeds
    const seeds = await prisma.voiceSeed.findMany();
    console.log(`📊 Found ${seeds.length} voice seeds to test.`);

    const results: any[] = [];
    const outputDir = path.join(process.cwd(), 'audit_output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    for (const seed of seeds) {
        console.log(`\n🎤 Testing Voice: ${seed.name} (${seed.gender}, ${seed.category})`);

        const text = "This is a test of the emergency voice broadcast system.";
        const startTime = Date.now();

        try {
            // Direct call to Pocket TTS client (or Fish depending on config)
            // We assume pocketTtsClient handles the logic based on env vars
            const result = await pocketTtsClient.synthesize(text, {
                voiceName: seed.name, // Pass seed name as voice identifier
                // voiceId: seed.id // Optional if needed by specific implementation
            });

            const duration = Date.now() - startTime;

            if (result && result.audio) {
                const status = '✅ OK';
                console.log(`   Status: ${status} (${duration}ms)`);
                results.push({
                    voice: seed.name,
                    status: 'OK',
                    latency: duration,
                    size: result.audio.length
                });

                // Optional: Save sample to verify audio content manually if needed
                // fs.writeFileSync(path.join(outputDir, `${seed.name}.wav`), Buffer.from(result.audio, 'base64'));

            } else {
                conststatus = '❌ FAILED (No Audio)';
                console.error(`   Status: ${status}`);
                results.push({
                    voice: seed.name,
                    status: 'FAILED',
                    error: 'No audio returned'
                });
            }

        } catch (error: any) {
            const status = '❌ ERROR';
            console.error(`   Status: ${status} - ${error.message}`);
            results.push({
                voice: seed.name,
                status: 'ERROR',
                error: error.message
            });
        }
    }

    console.log('\n📊 Audit Summary:');
    console.table(results);

    const failed = results.filter(r => r.status !== 'OK');
    if (failed.length > 0) {
        console.log(`\n⚠️  ${failed.length} voices failed to generate.`);
        process.exit(1);
    } else {
        console.log('\n✅ All voices generated successfully.');
        process.exit(0);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
