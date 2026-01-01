/**
 * Kokoro-82M TTS Integration
 * 
 * BEST FREE TTS - Fastest (sub-0.3s), high quality, Apache 2.0 license
 * 
 * Supported accents/languages:
 * - American English (11F, 9M voices)
 * - British English (4F, 4M voices) - Use for Scottish approximation
 * - Hindi (2F, 2M voices) - Use for Indian accents
 * - French (1F), Japanese, Korean, Mandarin, Spanish, Italian, Brazilian Portuguese
 * 
 * API: https://huggingface.co/spaces/hexgrad/Kokoro-TTS
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Hugging Face Gradio API for Kokoro
const KOKORO_GRADIO_API = 'https://hexgrad-kokoro-tts.hf.space';

// Available voices from Kokoro-82M
export const KOKORO_VOICES = {
    // American English Female
    'af_bella': { gender: 'F', accent: 'american', description: 'American female, warm' },
    'af_nicole': { gender: 'F', accent: 'american', description: 'American female, clear' },
    'af_sarah': { gender: 'F', accent: 'american', description: 'American female, professional' },
    'af_sky': { gender: 'F', accent: 'american', description: 'American female, youthful' },

    // American English Male
    'am_adam': { gender: 'M', accent: 'american', description: 'American male, confident' },
    'am_michael': { gender: 'M', accent: 'american', description: 'American male, warm' },

    // British English Female
    'bf_emma': { gender: 'F', accent: 'british', description: 'British female, professional' },
    'bf_isabella': { gender: 'F', accent: 'british', description: 'British female, elegant' },

    // British English Male  
    'bm_george': { gender: 'M', accent: 'british', description: 'British male, authoritative' },
    'bm_lewis': { gender: 'M', accent: 'british', description: 'British male, warm' },

    // Hindi (Indian)
    'hf_alpha': { gender: 'F', accent: 'indian', description: 'Hindi female' },
    'hf_beta': { gender: 'F', accent: 'indian', description: 'Hindi female, warm' },
    'hm_omega': { gender: 'M', accent: 'indian', description: 'Hindi male' },
    'hm_psi': { gender: 'M', accent: 'indian', description: 'Hindi male, professional' },
} as const;

// Character to Kokoro voice mapping
export const CHARACTER_KOKORO_MAP: Record<string, {
    voice: string;
    speedFactor: number;
    notes: string;
}> = {
    // Marjorie - 75yo American woman - Use older-sounding American female
    'marjorie': {
        voice: 'af_sarah', // American female, professional (can sound more mature)
        speedFactor: 0.85, // Slower for elderly
        notes: 'Slower pace for elderly feel. American accent is correct.'
    },

    // Rajiv - 42yo Indian-American - Use Hindi voice!
    'rajiv': {
        voice: 'hm_psi', // Hindi male, professional - TRUE Indian accent
        speedFactor: 1.1, // Slightly faster for energetic personality
        notes: 'Hindi voice provides authentic Indian accent.'
    },

    // Asha - 26yo Kenyan - No Kenyan option, use British (closer to Kenyan English)
    'asha': {
        voice: 'bf_emma', // British female - Kenyan English is closer to British than American
        speedFactor: 1.0,
        notes: 'British female as best approximation for Kenyan English. No direct Kenyan support.'
    },

    // Dex - 33yo Bronx - Use American male
    'dex': {
        voice: 'am_adam', // American male, confident
        speedFactor: 1.05, // Slightly faster, punchy
        notes: 'American male. Bronx/Puerto Rican accent not directly supported.'
    },

    // Eamon - 25yo Scottish - Use British male (closest to Scottish)
    'eamon': {
        voice: 'bm_george', // British male - closest to Scottish
        speedFactor: 1.15, // Faster for energetic gamer
        notes: 'British male as approximation for Scottish. No direct Scottish support.'
    },

    // Viktor - 57yo Russian - Use British male (deliberate pace)
    'viktor': {
        voice: 'bm_george', // British male, authoritative - deliberate pacing
        speedFactor: 0.9, // Slower for deliberate Russian cadence
        notes: 'No Russian support. British male with slow pace approximates stern professor.'
    },

    // Tomasz - 34yo Polish - Use British male
    'tomasz': {
        voice: 'bm_lewis', // British male, warm
        speedFactor: 0.95,
        notes: 'No Polish support. British male provides neutral non-American accent.'
    },

    // Aaliyah - 28yo Atlanta - Use American female
    'aaliyah': {
        voice: 'af_nicole', // American female, clear
        speedFactor: 1.0,
        notes: 'American female. Atlanta Southern accent not directly supported but American base is correct.'
    },
};

/**
 * Generate speech using Kokoro-82M via Hugging Face
 */
export async function generateWithKokoro(
    text: string,
    characterId: string
): Promise<Buffer | null> {
    const config = CHARACTER_KOKORO_MAP[characterId];
    if (!config) {
        console.log(`[Kokoro] No voice config for ${characterId}, using default`);
        return null;
    }

    console.log(`[Kokoro] Generating for ${characterId}`);
    console.log(`[Kokoro] Voice: ${config.voice}, Speed: ${config.speedFactor}`);

    try {
        // Gradio API call with polling
        const submitResponse = await fetch(`${KOKORO_GRADIO_API}/call/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: [text, config.voice, config.speedFactor]
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!submitResponse.ok) {
            console.error(`[Kokoro] Submit error: ${submitResponse.status}`);
            return null;
        }

        const submitResult = await submitResponse.json() as { event_id?: string };
        if (!submitResult.event_id) {
            console.error('[Kokoro] No event_id returned');
            return null;
        }

        // Poll for result
        const pollResponse = await fetch(
            `${KOKORO_GRADIO_API}/call/generate/${submitResult.event_id}`,
            { signal: AbortSignal.timeout(30000) }
        );

        if (!pollResponse.ok) {
            console.error(`[Kokoro] Poll error: ${pollResponse.status}`);
            return null;
        }

        // Parse SSE response
        const responseText = await pollResponse.text();
        const lines = responseText.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (Array.isArray(data) && data[0]?.path) {
                        // Download audio from returned path
                        const audioUrl = `${KOKORO_GRADIO_API}/file=${data[0].path}`;
                        const audioResponse = await fetch(audioUrl);

                        if (audioResponse.ok) {
                            const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
                            console.log(`[Kokoro] ✅ Generated ${audioBuffer.length} bytes`);
                            return audioBuffer;
                        }
                    }
                } catch (e) {
                    // Continue parsing
                }
            }
        }

        console.error('[Kokoro] No audio in response');
        return null;

    } catch (error) {
        console.error('[Kokoro] Error:', error);
        return null;
    }
}

/**
 * Test all characters with Kokoro
 */
async function testAllCharacters() {
    console.log('🎤 KOKORO-82M TTS TEST - ALL CHARACTERS\n');
    console.log('='.repeat(70));
    console.log('Note: Kokoro is the FASTEST TTS (sub-0.3s) and FREE!');
    console.log('It supports: American, British, Hindi accents');
    console.log('='.repeat(70));

    const testPhrases: Record<string, string> = {
        'marjorie': "Excuse me, this is absolutely unacceptable!",
        'rajiv': "Welcome my friend! I have exactly what you need!",
        'asha': "We must stand up for what's right.",
        'dex': "Yo, you think this is a game?",
        'eamon': "Och, ye cannae be serious right now!",
        'viktor': "This is most logical solution to problem.",
        'tomasz': "I will protect my family, no matter what.",
        'aaliyah': "Let me break this down for you, strategically.",
    };

    const outputDir = path.join(process.cwd(), 'public', 'tts-test');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const [charId, phrase] of Object.entries(testPhrases)) {
        console.log(`\n📋 Testing: ${charId}`);
        const config = CHARACTER_KOKORO_MAP[charId];
        console.log(`   Voice: ${config?.voice}, Notes: ${config?.notes}`);

        const audio = await generateWithKokoro(phrase, charId);

        if (audio) {
            const filepath = path.join(outputDir, `${charId}-kokoro.mp3`);
            fs.writeFileSync(filepath, audio);
            console.log(`   ✅ Saved: ${filepath}`);
        } else {
            console.log(`   ❌ Failed for ${charId}`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETE');
    console.log('Listen to samples at: http://localhost:3000/tts-test/');
    console.log('='.repeat(70));
}

// Run test
if (require.main === module) {
    testAllCharacters().catch(console.error);
}

export { testAllCharacters };
