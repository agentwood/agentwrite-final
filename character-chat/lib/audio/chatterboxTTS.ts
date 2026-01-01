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

// Hugging Face Inference API endpoint for Chatterbox
const CHATTERBOX_API = 'https://resemble-ai-chatterbox.hf.space/api/tts';
const CHATTERBOX_GRADIO = 'https://resemble-ai-chatterbox.hf.space/call/generate';

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
};

/**
 * Generate speech using Chatterbox via Hugging Face Gradio API
 */
export async function generateWithChatterbox(
    text: string,
    characterId: string
): Promise<Buffer | null> {
    const config = CHARACTER_ACCENT_MAP[characterId];
    if (!config) {
        console.log(`[Chatterbox] No accent config for ${characterId}`);
        return null;
    }

    console.log(`[Chatterbox] Generating for ${characterId}`);
    console.log(`[Chatterbox] Language: ${config.language}, Accent: ${config.accentHint}`);

    try {
        // Chatterbox Gradio API format
        const response = await fetch(CHATTERBOX_GRADIO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [
                    text, // Text to synthesize
                    config.language, // Language code
                    0.5, // CFG weight (0 = ignore reference accent, 0.5 = balanced)
                    0.3, // Temperature
                    null, // Reference audio (null for default)
                ]
            }),
            signal: AbortSignal.timeout(30000),
        });

        if (!response.ok) {
            console.error(`[Chatterbox] API error: ${response.status}`);
            return null;
        }

        const result = await response.json() as any;

        // Get event ID for async result
        if (result.event_id) {
            // Poll for result
            const pollUrl = `https://resemble-ai-chatterbox.hf.space/call/generate/${result.event_id}`;
            const pollResponse = await fetch(pollUrl);

            if (pollResponse.ok) {
                const pollResult = await pollResponse.text();
                // Parse Gradio SSE format
                const lines = pollResult.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        if (data[0]?.url) {
                            // Download audio from URL
                            const audioResponse = await fetch(data[0].url);
                            if (audioResponse.ok) {
                                const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
                                console.log(`[Chatterbox] ✅ Generated ${audioBuffer.length} bytes`);
                                return audioBuffer;
                            }
                        }
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.error('[Chatterbox] Error:', error);
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
