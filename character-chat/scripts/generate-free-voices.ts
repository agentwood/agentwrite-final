import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * FREE VOICE GENERATION using Hugging Face Inference API
 * 
 * Uses completely free models:
 * - Chatterbox (Resemble AI) - FREE, open-source
 * - F5-TTS - FREE on Hugging Face Spaces
 * - OpenVoice - Already using this, but can use HF version
 * 
 * NO COSTS - just needs HF account (free)
 */

const HF_API_URL = 'https://api-inference.huggingface.co/models/';
const HF_TOKEN = process.env.HUGGINGFACE_TOKEN || ''; // Get free token at huggingface.co/settings/tokens

interface VoiceGenRequest {
    characterId: string;
    characterName: string;
    description: string; // Personality description for the voice
    sampleText: string;
}

const VOICE_GEN_REQUESTS: VoiceGenRequest[] = [
    {
        characterId: 'marjorie',
        characterName: 'Salty Marjorie',
        description: '75-year-old American woman, sharp tone, entitled, high-pitched when agitated',
        sampleText: "Excuse me, I've been a resident of this community for THIRTY years. This is absolutely unacceptable!",
    },
    {
        characterId: 'asha',
        characterName: 'Fearless Asha',
        description: '26-year-old Kenyan woman, clear professional voice, principled and earnest',
        sampleText: "We have to stand up for what's right. This isn't just about us, it's about everyone who comes after.",
    },
];

/**
 * Generate voice using FREE Hugging Face model
 */
async function generateVoiceWithHuggingFace(request: VoiceGenRequest): Promise<Buffer | null> {
    console.log(`\n🤗 Generating voice for ${request.characterName} using FREE Hugging Face...`);

    // Option 1: Use Chatterbox (best free option)
    const model = 'ResembleAI/resemble-enhance';

    try {
        const response = await fetch(`${HF_API_URL}${model}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: request.sampleText,
                parameters: {
                    voice_preset: request.description,
                }
            }),
        });

        if (!response.ok) {
            console.log(`   ⚠️  Model might be loading... Status: ${response.status}`);
            return null;
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`   ✅ Generated ${(audioBuffer.length / 1024).toFixed(1)}KB`);
        return audioBuffer;

    } catch (error) {
        console.error(`   ❌ Error:`, error);
        return null;
    }
}

/**
 * ALTERNATIVE: Use Fish Speech's own voice generation (still free API)
 * Fish Speech can GENERATE voices from text descriptions
 */
async function generateWithFishSpeechDescriptive(request: VoiceGenRequest): Promise<Buffer | null> {
    console.log(`\n🐟 Trying Fish Speech descriptive generation...`);

    // Fish Speech might support this in their API
    // For now, we'll use the best available voice and add strong emotion tags

    const emotionEnhancedText = `[elderly woman, sharp, entitled] ${request.sampleText}`;

    try {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: emotionEnhancedText,
                // Use ALLE voice but with strong emotion tags to modify it
                reference_id: '59e9dc1cb20c452584788a2690c80970',
                format: 'mp3',
                normalize: true,
            }),
        });

        if (!response.ok) {
            console.log(`   ❌ Failed: ${response.status}`);
            return null;
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        console.log(`   ✅ Generated ${(buffer.length / 1024).toFixed(1)}KB`);
        return buffer;

    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Main FREE voice generation pipeline
 */
async function generateFreeVoices() {
    console.log('💯 100% FREE VOICE GENERATION PIPELINE\n');
    console.log('='.repeat(70));

    const outputDir = path.join(process.cwd(), 'free-generated-voices');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const generatedVoices: Record<string, string> = {};

    for (const request of VOICE_GEN_REQUESTS) {
        console.log(`\n📋 Generating: ${request.characterName}`);

        // Try Fish Speech with strong emotion tags first (100% free, we already have API key)
        let audioBuffer = await generateWithFishSpeechDescriptive(request);

        // If that fails, try Hugging Face (also free, but needs token)
        if (!audioBuffer && HF_TOKEN) {
            audioBuffer = await generateVoiceWithHuggingFace(request);
        }

        if (audioBuffer) {
            const filename = `${request.characterId}-generated.mp3`;
            const filepath = path.join(outputDir, filename);
            fs.writeFileSync(filepath, audioBuffer);

            console.log(`💾 Saved: ${filepath}`);
            generatedVoices[request.characterId] = filepath;
        } else {
            console.log(`⚠️  Could not generate voice for ${request.characterName}`);
            console.log(`   Solution: Use best-matching Fish voice with emotion tags`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ FREE VOICE GENERATION COMPLETE!\n');

    if (Object.keys(generatedVoices).length > 0) {
        console.log('📂 Generated voices saved to: free-generated-voices/\n');
        console.log('🎧 Listen and evaluate quality');
        console.log('📤 Upload best ones to Fish Speech for cloning (still free!)\n');
    } else {
        console.log('💡 FALLBACK SOLUTION (Zero cost, works now):');
        console.log('   Just use Fish Speech\'s existing voices with STRONG emotion tags:');
        console.log('   - They already sound good with [irritated], [sharp], etc.');
        console.log('   - The emotion intelligence system is already working!');
        console.log('   - Character matching might be 3/5 instead of 5/5, but');
        console.log('     emotional expression will still beat Character.AI\n');
    }

    console.log('🏆 RECOMMENDED ZERO-COST APPROACH:');
    console.log('1. Use auto-matched voices (Rajiv, Dex) ✅');
    console.log('2. Use ALLE voice for Marjorie with [irritated, sharp, elderly] tags');
    console.log('3. Use ALLE voice for Asha with [earnest, clear, professional] tags');
    console.log('4. Emotion tags + good voices = Better than Character.AI');
    console.log('5. Total cost: $0 🎉\n');
}

// Run
if (require.main === module) {
    generateFreeVoices().catch(console.error);
}

export { generateFreeVoices };
