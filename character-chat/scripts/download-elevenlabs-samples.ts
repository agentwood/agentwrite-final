#!/usr/bin/env npx tsx
/**
 * Download ElevenLabs Voice Samples
 * 
 * This script downloads a high-quality audio sample for each voice archetype
 * defined in registry.json. These samples will be used to clone voices into Fish Audio.
 * 
 * Usage: ELEVENLABS_API_KEY=your_key npx tsx scripts/download-elevenlabs-samples.ts
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Load registry
import registry from '../lib/voices/registry.json';

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY environment variable');
    process.exit(1);
}

// Sample text for voice generation (30+ seconds when spoken)
const SAMPLE_TEXT = `Hello, I'm your AI companion. Let me tell you a story about adventure, wisdom, and the human spirit. 

My voice is unique to me, and I'm here to help you on your journey. Whether you need guidance, entertainment, or just someone to talk to, I'll be right here.

Every great story begins with a single step into the unknown. The path ahead may be uncertain, but together we'll discover what lies beyond the horizon. 

Remember, the most powerful journeys are the ones we take together. So let's begin.`;

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'voices', 'elevenlabs');

interface ArchetypeEntry {
    voice_id: string;
    provider: string;
    model: string;
    status: string;
    notes: string;
}

async function downloadSample(archetype: string, entry: ArchetypeEntry): Promise<boolean> {
    const outputPath = path.join(OUTPUT_DIR, `${archetype}.mp3`);

    // Skip if already exists
    if (existsSync(outputPath)) {
        console.log(`⏭️  Skipping ${archetype} (already exists)`);
        return true;
    }

    console.log(`📥 Downloading ${archetype} (${entry.notes})...`);

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${entry.voice_id}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVEN_API_KEY!,
                },
                body: JSON.stringify({
                    text: SAMPLE_TEXT,
                    model_id: entry.model || 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Failed ${archetype}: ${response.status} - ${error}`);
            return false;
        }

        const audioBuffer = await response.arrayBuffer();
        await writeFile(outputPath, Buffer.from(audioBuffer));
        console.log(`✅ Downloaded ${archetype} (${Math.round(audioBuffer.byteLength / 1024)}KB)`);
        return true;

    } catch (error: any) {
        console.error(`❌ Error downloading ${archetype}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🎙️  ElevenLabs Sample Downloader\n');

    // Create output directory
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

    const archetypes = registry.archetypes as Record<string, ArchetypeEntry>;
    const entries = Object.entries(archetypes);

    console.log(`Found ${entries.length} archetypes to download\n`);

    let success = 0;
    let failed = 0;

    for (const [archetype, entry] of entries) {
        if (entry.status !== 'active') {
            console.log(`⏭️  Skipping ${archetype} (inactive)`);
            continue;
        }

        const result = await downloadSample(archetype, entry);
        if (result) {
            success++;
        } else {
            failed++;
        }

        // Rate limiting - ElevenLabs has limits
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Download Complete!`);
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
