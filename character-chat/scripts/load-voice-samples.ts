/**
 * Load voice samples into database for OpenVoice cloning
 * This script reads the MP3 files and updates the referenceAudioBase64 field
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

import { db } from '../lib/db';

const characters = ['asha', 'eamon', 'viktor', 'tomasz', 'rajiv'];

async function main() {
    console.log('📂 Loading voice samples into database...\n');

    const samplesDir = path.join(__dirname, '../public/voice-samples');

    for (const char of characters) {
        const filePath = path.join(samplesDir, `${char}-reference.mp3`);

        if (!fs.existsSync(filePath)) {
            console.log(`  ⚠️  ${char}: File not found`);
            continue;
        }

        const audioBuffer = fs.readFileSync(filePath);
        const audioBase64 = audioBuffer.toString('base64');

        try {
            const persona = await db.personaTemplate.findFirst({
                where: { seedId: char },
            });

            if (persona) {
                await db.personaTemplate.update({
                    where: { id: persona.id },
                    data: { referenceAudioBase64: audioBase64 },
                });
                console.log(`  ✓ ${char}: Updated database (${(audioBuffer.length / 1024).toFixed(0)}KB)`);
            } else {
                console.log(`  ⚠️  ${char}: Not found in database`);
            }
        } catch (error) {
            console.error(`  ❌ ${char}: Error - ${error}`);
        }
    }

    await db.$disconnect();
    console.log('\n✅ Done! Voice samples loaded.');
}

main().catch(console.error);
