#!/usr/bin/env npx tsx
/**
 * Clone Voice Seeds to Fish Audio
 * 
 * This script uploads the EXISTING voice samples from public/voices/seeds/
 * (originally downloaded from ElevenLabs) to Fish Audio to create custom voice clones.
 * 
 * Usage: FISH_AUDIO_API_KEY=your_key npx tsx scripts/clone-to-fish-audio.ts
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const FISH_API_KEY = process.env.FISH_AUDIO_API_KEY;
if (!FISH_API_KEY) {
    console.error('❌ Missing FISH_AUDIO_API_KEY environment variable');
    process.exit(1);
}

// Use EXISTING voice seeds (already downloaded from ElevenLabs)
const INPUT_DIR = path.join(process.cwd(), 'public', 'voices', 'seeds');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'audio', 'fishAudioCloneIds.json');

interface CloneResult {
    archetype: string;
    fish_voice_id: string;
    created_at: string;
}

async function cloneVoice(archetype: string, audioPath: string): Promise<CloneResult | null> {
    console.log(`🐟 Cloning ${archetype} to Fish Audio...`);

    try {
        const audioBuffer = await readFile(audioPath);

        // Create FormData for file upload using correct Fish Audio /model endpoint
        // See: https://fish.audio/docs/api-reference
        const formData = new FormData();
        formData.append('type', 'tts');
        formData.append('title', `Elite-${archetype}`);
        formData.append('train_mode', 'fast'); // 'fast' or 'full'
        formData.append('visibility', 'private');
        formData.append('description', `Voice clone for ${archetype} character`);

        // Audio file - must be named 'voices'
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        formData.append('voices', audioBlob, `${archetype}.mp3`);

        const response = await fetch('https://api.fish.audio/model', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Failed to clone ${archetype}: ${response.status} - ${error}`);
            return null;
        }

        const result = await response.json();
        const voiceId = result._id || result.id || result.voice_id;
        console.log(`✅ Cloned ${archetype} → ID: ${voiceId}`);

        return {
            archetype,
            fish_voice_id: voiceId,
            created_at: new Date().toISOString(),
        };

    } catch (error: any) {
        console.error(`❌ Error cloning ${archetype}:`, error.message);
        return null;
    }
}

async function main() {
    console.log('🐟 Fish Audio Voice Cloner\n');

    if (!existsSync(INPUT_DIR)) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
        console.error('   Run download-elevenlabs-samples.ts first!');
        process.exit(1);
    }

    // Load existing mappings if any
    let existingMappings: Record<string, CloneResult> = {};
    if (existsSync(OUTPUT_FILE)) {
        const existing = await readFile(OUTPUT_FILE, 'utf-8');
        existingMappings = JSON.parse(existing);
        console.log(`📁 Loaded ${Object.keys(existingMappings).length} existing mappings\n`);
    }

    const files = await readdir(INPUT_DIR);
    const mp3Files = files.filter(f => f.endsWith('.mp3'));

    console.log(`Found ${mp3Files.length} samples to clone\n`);

    const newMappings: Record<string, CloneResult> = { ...existingMappings };
    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const file of mp3Files) {
        const archetype = path.basename(file, '.mp3');

        // Skip if already cloned
        if (existingMappings[archetype]) {
            console.log(`⏭️  Skipping ${archetype} (already cloned)`);
            skipped++;
            continue;
        }

        const result = await cloneVoice(archetype, path.join(INPUT_DIR, file));

        if (result) {
            newMappings[archetype] = result;
            success++;
        } else {
            failed++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save mappings
    await writeFile(OUTPUT_FILE, JSON.stringify(newMappings, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Cloning Complete!`);
    console.log(`   ✅ New clones: ${success}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Mappings saved to: ${OUTPUT_FILE}`);

    // Generate TypeScript mapping
    console.log('\n📝 Generating TypeScript mapping...');

    const tsMapping = `// Auto-generated Fish Audio Clone IDs
// Generated: ${new Date().toISOString()}
// Source: ElevenLabs voice samples cloned to Fish Audio

export const FISH_AUDIO_CLONE_IDS: Record<string, string> = {
${Object.entries(newMappings)
            .map(([archetype, data]) => `    '${archetype}': '${data.fish_voice_id}',`)
            .join('\n')}
};
`;

    const tsPath = path.join(process.cwd(), 'lib', 'audio', 'fishAudioCloneIds.ts');
    await writeFile(tsPath, tsMapping);
    console.log(`✅ TypeScript mapping saved to: ${tsPath}`);
}

main().catch(console.error);
