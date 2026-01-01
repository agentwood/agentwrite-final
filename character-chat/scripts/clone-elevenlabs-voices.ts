/**
 * Clone voices in ElevenLabs using the generated reference samples
 * This creates actual cloned voices with the correct accents
 * 
 * Usage:
 *   npx tsx scripts/clone-elevenlabs-voices.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables FIRST (before any imports that use them)
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import the client class (not singleton) after env is loaded
import { ElevenLabsClient } from '../lib/audio/elevenLabsClient';

// Create client instance AFTER env vars are loaded
const client = new ElevenLabsClient();


const VOICE_SAMPLES = {
    asha: {
        name: 'Asha (Kenyan)',
        description: 'Young Kenyan woman with a warm, earnest voice and clear Kenyan English accent',
        file: 'asha-reference.mp3',
    },
    eamon: {
        name: 'Eamon (Scottish)',
        description: 'Playful Scottish man from Glasgow with a strong Scots accent and energetic delivery',
        file: 'eamon-reference.mp3',
    },
    viktor: {
        name: 'Viktor (Russian)',
        description: 'Logical Russian man from Moscow with a deep voice and clear Russian accent',
        file: 'viktor-reference.mp3',
    },
    tomasz: {
        name: 'Tomasz (Polish)',
        description: 'Calm Polish engineer from Warsaw with a steady Polish accent',
        file: 'tomasz-reference.mp3',
    },
    rajiv: {
        name: 'Rajiv (Indian)',
        description: 'Energetic Indian-American man from Mumbai with an Indian accent influenced by New Jersey',
        file: 'rajiv-reference.mp3',
    },
};

async function main() {
    console.log('🎙️  Cloning Voices in ElevenLabs');
    console.log('=================================');
    console.log('');

    if (!process.env.ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not found');
        process.exit(1);
    }

    const samplesDir = path.join(__dirname, '../public/voice-samples');

    for (const [characterId, config] of Object.entries(VOICE_SAMPLES)) {
        console.log(`\\n📢 Cloning ${config.name}...`);

        const filePath = path.join(samplesDir, config.file);
        if (!fs.existsSync(filePath)) {
            console.log(`  ⚠️  File not found: ${config.file}`);
            continue;
        }

        const audioData = fs.readFileSync(filePath);

        try {
            const result = await client.cloneVoice(
                config.name,
                config.description,
                [{ data: audioData, filename: config.file }]
            );

            if (result) {
                console.log(`  ✓ Cloned successfully!`);
                console.log(`  Voice ID: ${result.voice_id}`);
                console.log(`  Name: ${result.name}`);
                console.log('');
                console.log(`  Add this to lib/audio/elevenLabsClient.ts:`);
                console.log(`  '${characterId}': { voice_id: '${result.voice_id}', accent: '${config.description.split('with')[1]?.trim() || 'accent'}' },`);
            } else {
                console.log(`  ❌ Failed to clone voice`);
            }
        } catch (error) {
            console.error(`  ❌ Error:`, error);
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\\n=================================');
    console.log('✅ Done!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update ELEVENLABS_VOICE_MAP in lib/audio/elevenLabsClient.ts');
    console.log('2. Replace the placeholder voice IDs with the real ones above');
    console.log('3. Restart your dev server');
    console.log('');
}

main().catch(console.error);
