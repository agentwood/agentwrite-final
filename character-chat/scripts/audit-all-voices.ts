
import { PrismaClient } from '@prisma/client';
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting FULL Voice Inventory Audit ---');

    // Fetch ALL characters
    const characters = await prisma.personaTemplate.findMany({
        include: {
            voiceSeed: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    console.log(`Auditing ${characters.length} characters...`);

    const report: any[] = [];
    const markdownRows: string[] = [];
    markdownRows.push('| Character Name | Voice Name | Voice ID | Status | Audio |');
    markdownRows.push('|---|---|---|---|---|');

    let successCount = 0;
    let failCount = 0;
    let missingVoiceCount = 0;

    for (const char of characters) {
        process.stdout.write(`Testing: ${char.name.padEnd(30)} `);

        if (!char.voiceSeed) {
            console.log(`❌ No Voice Seed Assigned`);
            report.push({ name: char.name, voice: 'NONE', status: 'MISSING_SEED' });
            markdownRows.push(`| ${char.name} | *None* | N/A | 🔴 MISSING SEED | N/A |`);
            missingVoiceCount++;
            continue;
        }

        if (!char.voiceSeed.filePath) {
            console.log(`❌ Voice Seed has no file path`);
            report.push({ name: char.name, voice: char.voiceSeed.name, status: 'INVALID_SEED' });
            markdownRows.push(`| ${char.name} | ${char.voiceSeed.name} | ${char.voiceSeed.id} | 🔴 INVALID PATH | N/A |`);
            failCount++;
            continue;
        }

        try {
            const start = Date.now();
            // Synthesize short test audio
            // Use a very short text to be faster
            const result = await pocketTtsClient.synthesize(
                "Test.",
                {
                    voicePath: char.voiceSeed.filePath,
                    speed: 1.0
                }
            );

            const duration = Date.now() - start;

            if (result && result.audio.length > 0) {
                console.log(`✅ OK (${duration}ms)`);
                successCount++;
                report.push({
                    name: char.name,
                    voice: char.voiceSeed.name,
                    status: 'PASS',
                    duration: duration
                });
                markdownRows.push(`| ${char.name} | ${char.voiceSeed.name} | ${char.voiceSeed.id} | 🟢 PASS | ${duration}ms |`);
            } else {
                console.log(`❌ Empty Audio`);
                failCount++;
                report.push({ name: char.name, voice: char.voiceSeed.name, status: 'EMPTY_AUDIO' });
                markdownRows.push(`| ${char.name} | ${char.voiceSeed.name} | ${char.voiceSeed.id} | 🔴 EMPTY AUDIO | N/A |`);
            }

        } catch (error: any) {
            console.log(`❌ Error: ${error.message}`);
            failCount++;
            report.push({ name: char.name, voice: char.voiceSeed.name, status: 'ERROR', error: error.message });
            markdownRows.push(`| ${char.name} | ${char.voiceSeed.name} | ${char.voiceSeed.id} | 🔴 ERROR | ${error.message} |`);
        }
    }

    console.log('\n--- AUDIT SUMMARY ---');
    console.log(`Total: ${characters.length}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`⚠️ Missing Seed: ${missingVoiceCount}`);

    // precision: write report to file
    const reportPath = path.join(process.cwd(), 'voice_audit_report.md');
    fs.writeFileSync(reportPath, `# Voice Audit Report (${new Date().toISOString()})\n\n` + markdownRows.join('\n'));
    console.log(`\n📄 Full report saved to: ${reportPath}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
