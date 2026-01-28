
import { PrismaClient } from '@prisma/client';
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting Random Voice Audit ---');

    // 1. Fetch 10 random characters with voice seeds
    const count = await prisma.personaTemplate.count({
        where: { seedId: { not: null } }
    });

    // Get random skip
    const skip = Math.max(0, Math.floor(Math.random() * (count - 10)));

    const characters = await prisma.personaTemplate.findMany({
        where: { seedId: { not: null } },
        include: {
            voiceSeed: true
        },
        take: 10,
        skip: skip
    });

    console.log(`Auditing ${characters.length} characters...`);

    let successCount = 0;
    const report: any[] = [];

    for (const char of characters) {
        console.log(`\nTesting: ${char.name}`);
        console.log(`- Expected Voice: ${char.voiceSeed?.name}`);
        console.log(`- Voice Path: ${char.voiceSeed?.filePath}`);

        if (!char.voiceSeed?.filePath) {
            console.error(`❌ Missing voice file path!`);
            report.push({ name: char.name, status: 'FAILED', error: 'Missing voice file path' });
            continue;
        }

        try {
            const start = Date.now();
            // Synthesize short test audio
            const result = await pocketTtsClient.synthesize(
                "Hello, this is a voice audit test.",
                {
                    voicePath: char.voiceSeed.filePath,
                    speed: 1.0
                }
            );

            const duration = Date.now() - start;

            if (result && result.audio.length > 0) {
                console.log(`✅ Success in ${duration}ms (${result.audio.length} bytes)`);

                successCount++;
                report.push({
                    name: char.name,
                    voice: char.voiceSeed.name,
                    status: 'PASS',
                    duration: `${duration}ms`,
                    size: result.audio.length
                });

            } else {
                console.error(`❌ Synthesis returned empty/null result`);
                report.push({ name: char.name, status: 'FAILED', error: 'Empty result' });
            }

        } catch (error: any) {
            console.error(`❌ Failed: ${error.message}`);
            report.push({ name: char.name, status: 'FAILED', error: error.message });
        }
    }

    console.log('\n--- AUDIT REPORT ---');
    console.table(report);

    if (successCount === characters.length) {
        console.log('✅ ALL TESTS PASSED');
    } else {
        console.log(`⚠️ ${characters.length - successCount} TESTS FAILED`);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
