/**
 * Fish Audio TTS Client
 * 
 * Uses Fish Audio API to generate speech using cloned voice models.
 * Works with the character voice mappings from the cloning script.
 */

const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const FISH_AUDIO_BASE_URL = 'https://api.fish.audio';

// Character to Fish Audio Model ID mapping
// ONLY characters with UNIQUE voice models (no duplicates)
const CHARACTER_VOICE_MAP: Record<string, string> = {
    // ============================================
    // ORIGINAL UNIQUE-VOICE CHARACTERS (6)
    // ============================================
    'spongebob': '54e3a85ac9594ffa83264b8a494b901b',
    'trap-a-holics': '0b2e96151d67433d93891f15efc25dbd',
    'nico-awkward': '68dbf91dff844e8eab1bb90fcf427582',
    'mina-kwon': 'a86d9eac550d4814b9b4f6fc53661930',
    'detective-jun': '5c71ab35290241ed842d036e4bb0e5da',
    'hector-alvarez': 'b0de63ec40a241abb0ba4b4dc7b222d8',

    // ============================================
    // VOICE-FIRST CHARACTERS (16 NEW)
    // ============================================

    // SPANISH (3)
    'isabella-reyes': '26ff45fab722431c85eea2536e5c5197',      // Poetic Mexican grandmother
    'sofia-vega': 'f742629937b64075a7e7d21f1bec3c64',          // Latin American life coach
    'valentino-estrada': 'a1fe2e1b6f324e27929d5088f2d09be3',   // Spanish fashion consultant

    // BRITISH (4)
    'bernard-quinn': '65c0b8155c464a648161af8877404f11',       // British stoic philosopher
    'liam-ashford': '30c0f62e3e6d45d88387d1b8f84e1685',        // Calm British art curator
    'winston-morris': '5e79e8f5d2b345f98baa8c83c947532d',      // Warm British storyteller
    'edmund-blackwell': 'e5f3047b09ab468da84ca21e3f511680',    // British history professor

    // JAPANESE (3)
    'yumi-nakamura': '5161d41404314212af1254556477c17d',       // Energetic Japanese entertainer
    'mana-hayashi': 'fbea303b64374bffb8843569404b095e',        // Friendly hobby enthusiast
    'fuka-shimizu': '46745543e52548238593a3962be77e3a',        // Japanese lifestyle influencer

    // KOREAN (3)
    'hoshi-kim': '561686c0427b4656b34b960b05b33e56',           // K-pop trainee
    'taesung-lee': '41fbe1068fab4c76aa51c8c16bbad2bd',         // Korean storyteller
    'jinwoo-park': 'a9574d6184714eac96a0a892b719289f',         // Korean drama writer

    // FRENCH (2)
    'adelie-moreau': '15799596f2c0443389c90607c7cb5414',       // French language tutor
    'camille-beaumont': '39ea65c267be4bd6a3ed301520625bb7',    // French fashion stylist

    // UNIQUE ENGLISH (1)
    'alex-hype': '52e0660e03fe4f9a8d2336f67cab5440',           // WWE-style hype man

    // ============================================
    // NEW DETAILED CHARACTERS (10)
    // ============================================
    'marcus-chen': '52e0660e03fe4f9a8d2336f67cab5440',         // Tech entrepreneur (alex-hype voice)
    'zara-okonkwo': '26ff45fab722431c85eea2536e5c5197',        // African fashion designer
    'dr-elena-vasquez': 'f742629937b64075a7e7d21f1bec3c64',    // Therapist (sofia-vega voice)
    'chef-antonio-rossi': '30c0f62e3e6d45d88387d1b8f84e1685',  // Italian chef (liam-ashford voice)
    'rei-tanaka': '5161d41404314212af1254556477c17d',          // Game developer (yumi-nakamura voice)
    'maya-patel': 'fbea303b64374bffb8843569404b095e',          // Yoga instructor (mana-hayashi voice)
    'dj-kira-brooks': '46745543e52548238593a3962be77e3a',      // Music producer (fuka-shimizu voice)
    'professor-david-okafor': '65c0b8155c464a648161af8877404f11', // History professor
    'sarah-wheeler': '15799596f2c0443389c90607c7cb5414',       // Adventure guide (adelie-moreau voice)
    'grandpa-joe': '5e79e8f5d2b345f98baa8c83c947532d',         // Wise grandfather (winston-morris voice)

    // ============================================
    // FUN CATEGORY CHARACTERS (3) - NEW
    // ============================================
    'doodle-dave': '52e0660e03fe4f9a8d2336f67cab5440',         // West Coast game host (alex-hype voice)
    'sunny-sato': '5161d41404314212af1254556477c17d',          // Japanese-American randomizer (yumi-nakamura voice)
    'big-tom': '65c0b8155c464a648161af8877404f11',             // Liverpool pub quiz master (bernard-quinn voice)
};

export interface FishAudioConfig {
    seedId: string;
    text: string;
    format?: 'wav' | 'mp3' | 'opus';
}

/**
 * Check if Fish Audio API is available
 */
export function isFishAudioAvailable(): boolean {
    return !!FISH_AUDIO_API_KEY;
}

/**
 * Get the Fish Audio model ID for a character
 */
export function getFishAudioModelId(seedId: string): string | null {
    return CHARACTER_VOICE_MAP[seedId] || null;
}

/**
 * Check if a character has a cloned Fish Audio voice
 */
export function hasClonedVoice(seedId: string): boolean {
    return seedId in CHARACTER_VOICE_MAP;
}

/**
 * Get all characters with cloned voices
 */
export function getClonedVoiceCharacters(): string[] {
    return Object.keys(CHARACTER_VOICE_MAP);
}

/**
 * Generate speech using Fish Audio API
 */
export async function generateSpeechFishAudio(config: FishAudioConfig): Promise<Buffer> {
    if (!FISH_AUDIO_API_KEY) {
        throw new Error('FISH_AUDIO_API_KEY environment variable not set');
    }

    const modelId = getFishAudioModelId(config.seedId);
    if (!modelId) {
        throw new Error(`No Fish Audio model found for character: ${config.seedId}`);
    }

    // Add signal for timeout - give plenty of time for long texts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
        const response = await fetch(`${FISH_AUDIO_BASE_URL}/v1/tts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: config.text,
                reference_id: modelId,
                format: config.format || 'mp3',
                // Audio quality settings to prevent cutoff
                chunk_length: 300, // Larger chunks for smoother audio
                normalize: true,
                mp3_bitrate: 128,
                opus_bitrate: 64,
                latency: 'normal', // Use 'normal' latency for complete audio
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fish Audio TTS failed: ${response.status} - ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Fish Audio TTS timeout - text may be too long');
        }
        throw error;
    }
}

/**
 * Generate streaming speech using Fish Audio API
 */
export async function* generateSpeechStreamFishAudio(config: FishAudioConfig): AsyncGenerator<Buffer> {
    if (!FISH_AUDIO_API_KEY) {
        throw new Error('FISH_AUDIO_API_KEY environment variable not set');
    }

    const modelId = getFishAudioModelId(config.seedId);
    if (!modelId) {
        throw new Error(`No Fish Audio model found for character: ${config.seedId}`);
    }

    const response = await fetch(`${FISH_AUDIO_BASE_URL}/v1/tts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: config.text,
            reference_id: modelId,
            format: config.format || 'mp3',
            streaming: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`Fish Audio streaming failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No response body reader');
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield Buffer.from(value);
    }
}
