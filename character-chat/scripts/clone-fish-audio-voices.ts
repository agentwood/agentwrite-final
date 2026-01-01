/**
 * Fish Audio Voice Cloning Script
 * 
 * This script:
 * 1. Searches Fish Audio library for matching voices
 * 2. Clones/generates voice samples for all characters
 * 3. Downloads samples to local storage
 * 
 * Prerequisites:
 * - Fish Audio Plus subscription ($15/mo)
 * - FISH_AUDIO_API_KEY environment variable set
 * 
 * Usage:
 *   npx ts-node scripts/clone-fish-audio-voices.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const BASE_URL = 'https://api.fish.audio';
const SAMPLES_DIR = path.join(__dirname, '../public/voice-samples');

// Character voice mapping configuration (40 original + 10 from Fish Audio Discovery = 50 total)
// ALL characters now have direct Fish Audio model IDs for reliable cloning
const CHARACTER_VOICE_CONFIG = [
    // ============= ORIGINAL 40 CHARACTERS (with direct model IDs) =============
    // RECOMMEND
    { seedId: 'marge-halloway', accent: 'American female (Arizona)', gender: 'F', fishModelId: 'e58b0d7efca34eb38d5c4985e378abcb', searchTerms: [] }, // Mature American female
    { seedId: 'raj-corner-store', accent: 'Indian-American male (NJ)', gender: 'M', fishModelId: '728f6ff2240d49308e8137ffe66008e2', searchTerms: [] }, // Adam voice - professional male
    { seedId: 'camille-laurent', accent: 'French female (Lyon)', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Friendly women voice
    { seedId: 'coach-boone', accent: 'Texas male', gender: 'M', fishModelId: '0cd6cf9684dd4cc9882fbc98957c9b1d', searchTerms: [] }, // Deep Elephant voice
    { seedId: 'yuki-tanaka', accent: 'Japanese female (Osaka)', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Influencer voice for bright energy

    // PLAY & FUN
    { seedId: 'doodle-dave', accent: 'California male', gender: 'M', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] }, // Energetic male
    { seedId: 'sunny-sato', accent: 'Japanese-American female (LA)', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Influencer - Upbeat female
    { seedId: 'nico-awkward', accent: 'Italian male (Milan)', gender: 'M', fishModelId: '68dbf91dff844e8eab1bb90fcf427582', searchTerms: [] }, // Valentino Italiano
    { seedId: 'mina-kwon', accent: 'Korean female (Seoul)', gender: 'F', fishModelId: 'a86d9eac550d4814b9b4f6fc53661930', searchTerms: [] }, // Roh Jeong-eui - Korean female
    { seedId: 'big-tom', accent: 'British male (Liverpool/Scouse)', gender: 'M', fishModelId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', searchTerms: [] }, // Historian voice - British male

    // HELPER
    { seedId: 'dr-nadia', accent: 'Lebanese female', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Friendly women - warm professional
    { seedId: 'miles-granger', accent: 'Midwest American male', gender: 'M', fishModelId: '728f6ff2240d49308e8137ffe66008e2', searchTerms: [] }, // Adam - reliable narration
    { seedId: 'priya-nair', accent: 'Indian female (Kochi)', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Friendly women - soft female
    { seedId: 'kenji-tanaka', accent: 'Japanese male (Osaka)', gender: 'M', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] }, // Energetic male - upbeat
    { seedId: 'asha-mbeki', accent: 'Kenyan female (Nairobi)', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Friendly professional female
    { seedId: 'soren-nielsen', accent: 'Danish male', gender: 'M', fishModelId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', searchTerms: [] }, // Calm narrator
    { seedId: 'imani-shah', accent: 'British Indian female (London)', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Professional female
    { seedId: 'hector-alvarez', accent: 'Mexican male', gender: 'M', fishModelId: 'b0de63ec40a241abb0ba4b4dc7b222d8', searchTerms: [] }, // Spanish/Latino male
    { seedId: 'dr-elena-petrov', accent: 'Bulgarian female', gender: 'F', fishModelId: 'e58b0d7efca34eb38d5c4985e378abcb', searchTerms: [] }, // Eastern European female
    { seedId: 'owen-mckenna', accent: 'Irish male (Galway)', gender: 'M', fishModelId: 'ab968a074e82446db1ea8a752f358971', searchTerms: [] }, // Calm soothing male

    // ORIGINAL
    { seedId: 'council-estate', accent: 'British neutral', gender: 'NB', fishModelId: 'ef9c79b62ef34530bf452c0e50e3c260', searchTerms: [] }, // Neutral narrative
    { seedId: 'queue-manager', accent: 'Singaporean male', gender: 'M', fishModelId: '0cd6cf9684dd4cc9882fbc98957c9b1d', searchTerms: [] }, // Efficient professional
    { seedId: 'auntie-saffy', accent: 'South African female', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Warm motherly female
    { seedId: 'mr-receipt', accent: 'NYC male', gender: 'M', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] }, // Fast energetic male
    { seedId: 'hush', accent: 'Icelandic female', gender: 'F', fishModelId: 'ab968a074e82446db1ea8a752f358971', searchTerms: [] }, // Calm whisper

    // ANIME & GAME
    { seedId: 'kira-neonfox', accent: 'Anime idol female', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Influencer - bubbly female
    { seedId: 'kael-drakesunder', accent: 'Deep formal male', gender: 'M', fishModelId: '0cd6cf9684dd4cc9882fbc98957c9b1d', searchTerms: [] }, // Deep wise voice
    { seedId: 'juno-gearwhistle', accent: 'Quirky female', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Energetic quirky female
    { seedId: 'seraphina-vale', accent: 'Aristocratic female', gender: 'F', fishModelId: 'e58b0d7efca34eb38d5c4985e378abcb', searchTerms: [] }, // Refined elegant female
    { seedId: 'orion-riftwalker', accent: 'Adventurer male', gender: 'M', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] }, // Playful adventurous

    // FICTION & MEDIA
    { seedId: 'wendy-hughes', accent: 'American female (DC)', gender: 'F', fishModelId: 'e58b0d7efca34eb38d5c4985e378abcb', searchTerms: [] }, // Authoritative female
    { seedId: 'detective-jun', accent: 'Korean-American male', gender: 'M', fishModelId: '5c71ab35290241ed842d036e4bb0e5da', searchTerms: [] }, // Korean male professional
    { seedId: 'captain-mireya', accent: 'Chilean female', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Strong female leader
    { seedId: 'prof-basil', accent: 'British male (Oxford)', gender: 'M', fishModelId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', searchTerms: [] }, // Academic narrator
    { seedId: 'convenience-store', accent: 'California neutral', gender: 'NB', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] }, // Friendly neutral

    // ICON
    { seedId: 'angry-karen', accent: 'American female (Florida)', gender: 'F', fishModelId: 'e58b0d7efca34eb38d5c4985e378abcb', searchTerms: [] }, // Sharp American female
    { seedId: 'jon-debater', accent: 'British male (London)', gender: 'M', fishModelId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', searchTerms: [] }, // Smooth British narrator
    { seedId: 'sweet-cs-rep', accent: 'Filipino female', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] }, // Sweet friendly female
    { seedId: 'passive-aggressive', accent: 'Canadian male', gender: 'M', fishModelId: '728f6ff2240d49308e8137ffe66008e2', searchTerms: [] }, // Polite professional male
    { seedId: 'unshakeable-optimist', accent: 'Brazilian female', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] }, // Upbeat optimistic female

    // ============= 10 FROM FISH AUDIO DISCOVERY (verified working) =============
    { seedId: 'spongebob', accent: 'Cartoon', gender: 'M', fishModelId: '54e3a85ac9594ffa83264b8a494b901b', searchTerms: [] },
    { seedId: 'energetic-male', accent: 'Energetic Male', gender: 'M', fishModelId: '802e3bc2b27e49c2995d23ef70e6ac89', searchTerms: [] },
    { seedId: 'elevenlabs-adam', accent: 'Deep Narration', gender: 'M', fishModelId: '728f6ff2240d49308e8137ffe66008e2', searchTerms: [] },
    { seedId: 'friendly-women', accent: 'Friendly Female', gender: 'F', fishModelId: 'b545c585f631496c914815291da4e893', searchTerms: [] },
    { seedId: 'alle-influencer', accent: 'Influencer Style', gender: 'F', fishModelId: '59e9dc1cb20c452584788a2690c80970', searchTerms: [] },
    { seedId: 'horror-shadow', accent: 'Horror/Eerie', gender: 'NB', fishModelId: 'ef9c79b62ef34530bf452c0e50e3c260', searchTerms: [] },
    { seedId: 'the-elephant', accent: 'Deep Wise', gender: 'M', fishModelId: '0cd6cf9684dd4cc9882fbc98957c9b1d', searchTerms: [] },
    { seedId: 'trap-a-holics', accent: 'Trap Music Tag', gender: 'M', fishModelId: '0b2e96151d67433d93891f15efc25dbd', searchTerms: [] },
    { seedId: 'sleepless-historian', accent: 'Ultra-realistic Narration', gender: 'M', fishModelId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', searchTerms: [] },
    { seedId: 'boring-history-sleep', accent: 'Calm Audiobook', gender: 'M', fishModelId: 'ab968a074e82446db1ea8a752f358971', searchTerms: [] },
];

// Sample text for each character to generate
const SAMPLE_TEXTS = {
    default: [
        "Hello there! I'm so glad to meet you. Let me tell you a bit about myself.",
        "That's really interesting. Can you tell me more about what you're thinking?",
        "I completely understand how you feel. Let's work through this together.",
        "Ha! That's quite funny. I love a good sense of humor.",
        "Hmm, let me think about that for a moment. It's a complex question.",
    ],
};

interface CharacterConfig {
    seedId: string;
    accent: string;
    gender: string;
    searchTerms: string[];
    fishModelId?: string;
}

async function searchVoices(query: string): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/model?title=${encodeURIComponent(query)}&page_size=10`, {
        headers: {
            'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to search voices: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
}

async function generateSpeech(modelId: string, text: string): Promise<Buffer> {
    const response = await fetch(`${BASE_URL}/v1/tts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text,
            reference_id: modelId,
            format: 'wav',
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

async function processCharacter(config: CharacterConfig): Promise<void> {
    console.log(`\n🎤 Processing: ${config.seedId} (${config.accent})`);

    // Create character sample directory
    const charDir = path.join(SAMPLES_DIR, config.seedId);
    if (!fs.existsSync(charDir)) {
        fs.mkdirSync(charDir, { recursive: true });
    }

    let modelId: string;
    let modelTitle: string;

    // If we have a direct Fish model ID, use it directly
    if (config.fishModelId) {
        modelId = config.fishModelId;
        modelTitle = config.seedId;
        console.log(`  ✅ Using direct model ID: ${modelId}`);
    } else {
        // Search for matching voices
        let bestMatch: any = null;
        for (const term of config.searchTerms) {
            const voices = await searchVoices(term);
            if (voices.length > 0) {
                // Filter by gender if possible
                const genderFiltered = voices.filter(v =>
                    config.gender === 'NB' ||
                    v.tags?.includes(config.gender === 'F' ? 'female' : 'male')
                );
                bestMatch = genderFiltered[0] || voices[0];
                break;
            }
        }

        if (!bestMatch) {
            console.log(`  ⚠️ No matching voice found for ${config.seedId}, skipping`);
            return;
        }

        modelId = bestMatch.id;
        modelTitle = bestMatch.title;
        console.log(`  ✅ Found voice: ${modelTitle} (${modelId})`);
    }

    // Generate samples
    const texts = SAMPLE_TEXTS.default;
    for (let i = 0; i < texts.length; i++) {
        try {
            const audio = await generateSpeech(modelId, texts[i]);
            const filename = path.join(charDir, `sample_${i + 1}.wav`);
            fs.writeFileSync(filename, audio);
            console.log(`  🔊 Generated: sample_${i + 1}.wav`);
        } catch (error: any) {
            console.error(`  ⚠️ Failed to generate sample ${i + 1}: ${error?.message}`);
        }
    }

    // Save metadata
    const metadata = {
        seedId: config.seedId,
        accent: config.accent,
        fishAudioModelId: modelId,
        originalModelTitle: modelTitle,
        sampleCount: texts.length,
        generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(charDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
}

async function main() {
    console.log('🎙️ Fish Audio Voice Cloning Script');
    console.log('==================================\n');

    if (!FISH_AUDIO_API_KEY) {
        console.error('❌ Error: FISH_AUDIO_API_KEY environment variable not set');
        console.log('\nTo set the API key:');
        console.log('  export FISH_AUDIO_API_KEY="your-api-key-here"');
        console.log('\nGet your API key from: https://fish.audio/app/settings/api');
        process.exit(1);
    }

    // Create samples directory
    if (!fs.existsSync(SAMPLES_DIR)) {
        fs.mkdirSync(SAMPLES_DIR, { recursive: true });
    }

    console.log(`📁 Output directory: ${SAMPLES_DIR}`);
    console.log(`📊 Characters to process: ${CHARACTER_VOICE_CONFIG.length}`);

    // Process each character
    for (const config of CHARACTER_VOICE_CONFIG) {
        try {
            await processCharacter(config);
            // Rate limiting - wait 2 seconds between characters
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`  ❌ Error processing ${config.seedId}:`, error);
        }
    }

    console.log('\n✨ Voice cloning complete!');
    console.log('Next steps:');
    console.log('  1. Review generated samples in:', SAMPLES_DIR);
    console.log('  2. Start XTTS-v2 server: docker run -d -p 8080:8080 ghcr.io/coqui-ai/xtts-streaming-server');
    console.log('  3. Update TTS route to use local samples');
}

main().catch(console.error);
