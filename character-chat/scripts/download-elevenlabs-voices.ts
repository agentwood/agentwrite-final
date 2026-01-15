#!/usr/bin/env npx tsx
/**
 * Download ElevenLabs Voices with FULL METADATA
 * 
 * MANDATORY RULE: This script captures ALL metadata including transcripts.
 * Never download audio without the corresponding transcript text.
 * 
 * Usage: ELEVENLABS_API_KEY=your_key npx tsx scripts/download-elevenlabs-voices.ts
 */

import { mkdir, writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVEN_API_KEY) {
    console.error('❌ Missing ELEVENLABS_API_KEY environment variable');
    process.exit(1);
}

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'voices', 'elevenlabs');
const METADATA_FILE = path.join(process.cwd(), 'lib', 'audio', 'voiceMetadata.json');

// Sample text for generating audio samples (30+ seconds when spoken)
const SAMPLE_TRANSCRIPT = `Hello, I'm your AI companion. Let me tell you a story about adventure, wisdom, and the human spirit. 

My voice is unique to me, and I'm here to help you on your journey. Whether you need guidance, entertainment, or just someone to talk to, I'll be right here.

Every great story begins with a single step into the unknown. The path ahead may be uncertain, but together we'll discover what lies beyond the horizon. 

Remember, the most powerful journeys are the ones we take together. So let's begin.`;

interface VoiceMetadata {
    voice_id: string;
    name: string;
    transcript: string;        // MANDATORY - text spoken in the sample
    description: string;
    labels: Record<string, string>;
    accent: string;
    gender: string;
    age: string;
    use_case: string;
    preview_url: string | null;
    downloaded_at: string;
    audio_file: string;
}

interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    description?: string;
    labels?: Record<string, string>;
    preview_url?: string;
}

async function getVoiceDetails(voiceId: string): Promise<ElevenLabsVoice | null> {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
            headers: { 'xi-api-key': ELEVEN_API_KEY! }
        });

        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

async function downloadVoiceSample(voiceId: string, voiceName: string): Promise<Buffer | null> {
    console.log(`📥 Generating sample for ${voiceName}...`);

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVEN_API_KEY!,
                },
                body: JSON.stringify({
                    text: SAMPLE_TRANSCRIPT,
                    model_id: 'eleven_multilingual_v2',
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
            console.error(`❌ Failed to generate sample for ${voiceName}: ${response.status}`);
            return null;
        }

        return Buffer.from(await response.arrayBuffer());
    } catch (error: any) {
        console.error(`❌ Error generating sample for ${voiceName}:`, error.message);
        return null;
    }
}

async function downloadVoice(voiceId: string): Promise<VoiceMetadata | null> {
    // 1. Get voice details from ElevenLabs API
    const details = await getVoiceDetails(voiceId);
    if (!details) {
        console.error(`❌ Could not fetch details for voice ${voiceId}`);
        return null;
    }

    const labels = details.labels || {};
    const safeName = details.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const audioPath = path.join(OUTPUT_DIR, `${safeName}.mp3`);

    // 2. Download/generate audio sample
    const audioBuffer = await downloadVoiceSample(voiceId, details.name);
    if (!audioBuffer) return null;

    await writeFile(audioPath, audioBuffer);
    console.log(`✅ Saved: ${safeName}.mp3 (${Math.round(audioBuffer.length / 1024)}KB)`);

    // 3. Create metadata object with ALL required fields
    const metadata: VoiceMetadata = {
        voice_id: voiceId,
        name: details.name,
        transcript: SAMPLE_TRANSCRIPT,  // MANDATORY - always capture transcript
        description: details.description || '',
        labels: labels,
        accent: labels.accent || 'Unknown',
        gender: labels.gender || 'Unknown',
        age: labels.age || 'Unknown',
        use_case: labels.use_case || 'general',
        preview_url: details.preview_url || null,
        downloaded_at: new Date().toISOString(),
        audio_file: `/voices/elevenlabs/${safeName}.mp3`,
    };

    return metadata;
}

async function main() {
    console.log('🎙️  ElevenLabs Voice Downloader (With Metadata)\n');
    console.log('⚠️  RULE: All downloads include transcript + full metadata\n');

    // Create output directory
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Load existing metadata
    let allMetadata: Record<string, VoiceMetadata> = {};
    if (existsSync(METADATA_FILE)) {
        allMetadata = JSON.parse(await readFile(METADATA_FILE, 'utf-8'));
        console.log(`📁 Loaded ${Object.keys(allMetadata).length} existing voice records\n`);
    }

    // Get list of available voices
    console.log('📋 Fetching available voices from ElevenLabs...');
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVEN_API_KEY! }
    });

    if (!voicesResponse.ok) {
        console.error('❌ Failed to fetch voices list');
        process.exit(1);
    }

    const { voices } = await voicesResponse.json() as { voices: ElevenLabsVoice[] };
    console.log(`Found ${voices.length} voices\n`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const voice of voices) {
        // Skip if already downloaded
        if (allMetadata[voice.voice_id]) {
            console.log(`⏭️  Skipping ${voice.name} (already downloaded)`);
            skipped++;
            continue;
        }

        const metadata = await downloadVoice(voice.voice_id);
        if (metadata) {
            allMetadata[voice.voice_id] = metadata;
            success++;
        } else {
            failed++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Save all metadata
    await writeFile(METADATA_FILE, JSON.stringify(allMetadata, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Download Complete!`);
    console.log(`   ✅ New downloads: ${success}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📁 Audio: ${OUTPUT_DIR}`);
    console.log(`   📋 Metadata: ${METADATA_FILE}`);
    console.log('\n🔒 All voices include transcript + full metadata');
}

main().catch(console.error);
