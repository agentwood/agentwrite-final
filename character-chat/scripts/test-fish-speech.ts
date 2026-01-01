import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Explicitly load from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

const FISH_SPEECH_API_KEY = process.env.FISH_SPEECH_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

console.log('Environment check:', {
    hasFishKey: !!FISH_SPEECH_API_KEY,
    fishKeyLength: FISH_SPEECH_API_KEY.length,
});

const TEST_TEXT = "Excuse me, I've been a resident of this community for THIRTY years, and I will NOT tolerate this kind of behavior. Do you have any idea who you're talking to?";
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'tts-test');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function testGeminiTTS() {
    console.log('🎤 Testing Gemini TTS (Current Stack)...');

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: `Generate speech with the following characteristics:
Voice: aoede (female, mature)
Style: sharp, demanding, entitled, high-pitched when agitated, sunbelt american accent
Text: "${TEST_TEXT}"`
                }]
            }],
            systemInstruction: 'You are a text-to-speech system. Generate natural speech audio.',
        });

        // Note: Gemini doesn't have built-in TTS in free tier
        // This is a placeholder - we'll use the existing API
        console.log('⚠️  Gemini TTS requires API integration, using mock');

        const outputPath = path.join(OUTPUT_DIR, 'current-stack.mp3');
        // Create empty file as placeholder
        fs.writeFileSync(outputPath, Buffer.from([]));

        console.log(`✅ Gemini TTS placeholder saved`);
        return outputPath;
    } catch (error) {
        console.error('❌ Gemini TTS failed:', error);
        throw error;
    }
}

async function testFishSpeech() {
    console.log('🐟 Testing Fish Speech...');

    try {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: TEST_TEXT,
                // Omit reference_id to use default voice
                format: 'mp3',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fish Speech API failed (${response.status}): ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const outputPath = path.join(OUTPUT_DIR, 'fish-speech.mp3');
        fs.writeFileSync(outputPath, buffer);

        console.log(`✅ Fish Speech audio saved (${buffer.length} bytes)`);
        return outputPath;
    } catch (error) {
        console.error('❌ Fish Speech test failed:', error);
        throw error;
    }
}

async function main() {
    console.log('🚀 Starting Fish Speech API Test...\n');

    try {
        // Test Fish Speech only for now
        const fishPath = await testFishSpeech();

        console.log('\n✅ Fish Speech Test Complete!');
        console.log(`Audio saved to: ${fishPath}`);
        console.log('\nTo test:');
        console.log('1. Start dev server: npm run dev');
        console.log('2. Visit: http://localhost:3000/tts-test/fish-speech.mp3');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

main();
