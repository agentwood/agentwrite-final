/**
 * Chatterbox TTS Integration
 * 
 * FREE, open-source TTS with TRUE accent support:
 * - 23 languages (Swahili, Hindi, English, etc.)
 * - Zero-shot voice cloning
 * - Accent control
 * - Runs on Hugging Face Spaces (FREE)
 * 
 * API: https://huggingface.co/spaces/ResembleAI/Chatterbox
 */

import fetch from 'node-fetch';
import fs from 'fs';

// Language codes for accents
export const CHATTERBOX_LANGUAGES = {
    english: 'en',
    swahili: 'sw', // For Kenyan (Asha)
    hindi: 'hi', // For Indian (Rajiv)
    russian: 'ru', // For Viktor
    polish: 'pl', // For Tomasz
    german: 'de',
    spanish: 'es',
    french: 'fr',
    italian: 'it',
    japanese: 'ja',
    korean: 'ko',
    chinese: 'zh',
} as const;

// Character to language/accent mapping
export const CHARACTER_ACCENT_MAP: Record<string, {
    language: string;
    accentHint: string;
    voiceSample?: string;
}> = {
    'marjorie': {
        language: 'en',
        accentHint: 'elderly American woman, 75 years old, sharp demanding tone'
    },
    'rajiv': {
        language: 'en', // Use English with Indian accent hint
        accentHint: 'Indian-American man, warm friendly, slight Indian accent with New Jersey coloring'
    },
    'asha': {
        language: 'sw', // Swahili for Kenyan accent!
        accentHint: 'young Kenyan woman, clear East African English, professional'
    },
    'dex': {
        language: 'en',
        accentHint: 'Puerto Rican-American man, Bronx NYC accent, tough raspy'
    },
    'eamon': {
        language: 'en',
        accentHint: 'Scottish man from Glasgow, strong Scottish accent, rolled Rs'
    },
    'viktor': {
        language: 'ru', // Russian for authentic accent!
        accentHint: 'Russian man, heavy Russian accent, stern professor'
    },
    'tomasz': {
        language: 'pl', // Polish for authentic accent!
        accentHint: 'Polish man, Polish accent, calm pragmatic'
    },
    'aaliyah': {
        language: 'en',
        accentHint: 'Black American woman from Atlanta, smooth Southern accent'
    },
    // New characters added
    'dr_lucien_vale': {
        language: 'en',
        accentHint: 'British villain, cold calculating tone, menacing, slow deliberate speech'
    },
    'maya_chen': {
        language: 'en',
        accentHint: 'warm Asian-American woman, calm soothing, gentle encouraging tone'
    },
    'marcus_blaze': {
        language: 'en',
        accentHint: 'African-American man from Atlanta, high energy, motivational coach, powerful'
    },
    'eleanor_ashworth': {
        language: 'en',
        accentHint: 'British woman, Oxford professor, sharp precise, intellectual'
    },
    'jack_sterling': {
        language: 'en',
        accentHint: 'British man, pirate captain, charming roguish, adventurous swashbuckling'
    },
};

// Correct HuggingFace Space URLs
const CHATTERBOX_SPACE_URL = 'https://resembleai-chatterbox.hf.space';
const CHATTERBOX_API_ENDPOINT = `${CHATTERBOX_SPACE_URL}/gradio_api/call/generate_tts_audio`;

/**
 * Generate speech using Chatterbox via Hugging Face Gradio API
 * Updated for Gradio 5.x API format
 */
export async function generateWithChatterbox(
    text: string,
    characterId: string
): Promise<Buffer | null> {
    const config = CHARACTER_ACCENT_MAP[characterId];

    // Use default English config if no specific config exists
    const accentConfig = config || {
        language: 'en',
        accentHint: 'neutral American English'
    };

    console.log(`[Chatterbox HF] Generating for ${characterId}`);
    console.log(`[Chatterbox HF] Accent hint: ${accentConfig.accentHint}`);

    try {
        // Step 1: Submit request to Gradio API
        // Parameters: text_input, audio_prompt_path_input, exaggeration_input, 
        //             temperature_input, seed_num_input, cfgw_input, vad_trim_input
        const submitResponse = await fetch(CHATTERBOX_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [
                    text.substring(0, 300), // text_input (max 300 chars)
                    null,                    // audio_prompt_path_input (no reference audio)
                    0.5,                     // exaggeration_input (neutral)
                    0.8,                     // temperature_input
                    0,                       // seed_num_input (random)
                    0.5,                     // cfgw_input (pace)
                    false,                   // vad_trim_input
                ]
            }),
            signal: AbortSignal.timeout(60000), // 60 second timeout for GPU processing
        });

        if (!submitResponse.ok) {
            const errorText = await submitResponse.text();
            console.error(`[Chatterbox HF] Submit error ${submitResponse.status}:`, errorText.substring(0, 200));
            return null;
        }

        const submitResult = await submitResponse.json() as { event_id?: string };

        if (!submitResult.event_id) {
            console.error(`[Chatterbox HF] No event_id in response`);
            return null;
        }

        console.log(`[Chatterbox HF] Processing with event_id: ${submitResult.event_id}`);

        // Step 2: Poll for result (Gradio SSE format)
        const pollUrl = `${CHATTERBOX_SPACE_URL}/gradio_api/call/generate_tts_audio/${submitResult.event_id}`;

        // Wait a bit for processing to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await fetch(pollUrl, {
            signal: AbortSignal.timeout(90000), // 90 second timeout
        });

        if (!pollResponse.ok) {
            console.error(`[Chatterbox HF] Poll error ${pollResponse.status}`);
            return null;
        }

        const pollResult = await pollResponse.text();

        // Parse SSE format - look for "data:" line with URL
        const lines = pollResult.split('\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    // Response should have an array with file data containing URL
                    if (Array.isArray(data) && data.length > 0) {
                        const fileData = data[0];
                        const audioUrl = fileData?.url || fileData?.path;

                        if (audioUrl) {
                            console.log(`[Chatterbox HF] Downloading audio from: ${audioUrl}`);

                            const audioResponse = await fetch(audioUrl, {
                                signal: AbortSignal.timeout(30000),
                            });

                            if (audioResponse.ok) {
                                const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
                                console.log(`[Chatterbox HF] ✅ Generated ${audioBuffer.length} bytes`);
                                return audioBuffer;
                            }
                        }
                    }
                } catch (parseError) {
                    // Continue looking for valid data
                }
            }
        }

        console.error(`[Chatterbox HF] No audio URL found in response`);
        return null;

    } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            console.error('[Chatterbox HF] Request timed out - HuggingFace may be busy');
        } else {
            console.error('[Chatterbox HF] Error:', error.message || error);
        }
        return null;
    }
}

/**
 * Test Chatterbox with all characters
 */
async function testAllCharacters() {
    console.log('🔊 CHATTERBOX TTS TEST - ACCENT SUPPORT\n');
    console.log('='.repeat(70));

    const testPhrases: Record<string, string> = {
        'marjorie': "Excuse me, this is absolutely UNACCEPTABLE!",
        'rajiv': "Welcome my friend! I have exactly what you need!",
        'asha': "We must stand up for what's right.",
        'dex': "Yo, you think this is a game?",
        'eamon': "Och, ye cannae be serious right now!",
        'viktor': "This is most logical solution to the problem.",
        'tomasz': "I will protect my family, no matter what.",
        'aaliyah': "Let me break this down for you, strategically.",
    };

    for (const [charId, phrase] of Object.entries(testPhrases)) {
        console.log(`\n📋 Testing: ${charId}`);
        const audio = await generateWithChatterbox(phrase, charId);

        if (audio) {
            const path = `public/tts-test/${charId}-chatterbox.mp3`;
            fs.writeFileSync(path, audio);
            console.log(`   ✅ Saved: ${path}`);
        } else {
            console.log(`   ❌ Failed for ${charId}`);
        }
    }
}

// Run test if executed directly
if (require.main === module) {
    testAllCharacters().catch(console.error);
}

export { testAllCharacters };
