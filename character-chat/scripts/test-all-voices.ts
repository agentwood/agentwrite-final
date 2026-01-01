import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Test Fish Speech TTS for all 4 characters
 * Generates sample audio to verify quality
 */

interface CharacterTest {
    id: string;
    name: string;
    text: string;
    voiceId: string;
    emotionTag: string;
}

const TESTS: CharacterTest[] = [
    {
        id: 'marjorie',
        name: 'Salty Marjorie',
        text: "Excuse me, I've been a resident of this community for THIRTY years. This is absolutely UNACCEPTABLE!",
        voiceId: '59e9dc1cb20c452584788a2690c80970',
        emotionTag: 'elderly woman, indignant, sharp',
    },
    {
        id: 'rajiv',
        name: 'Friendly Rajiv',
        text: "Welcome, welcome my friend! I have exactly what you need today. Come in, come in!",
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89',
        emotionTag: 'warm man, cheerful',
    },
    {
        id: 'asha',
        name: 'Fearless Asha',
        text: "We have to stand up for what's right. This isn't just about us, it's about everyone who comes after.",
        voiceId: '59e9dc1cb20c452584788a2690c80970',
        emotionTag: 'young woman, earnest, professional',
    },
    {
        id: 'dex',
        name: 'Angry Dex',
        text: "Yo, you think this is a GAME? I've been grinding in these streets since DAY ONE!",
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89',
        emotionTag: 'tough man, angry, raspy',
    },
];

async function testCharacterVoice(test: CharacterTest) {
    console.log(`\n🎭 Testing: ${test.name}`);
    console.log(`   Voice ID: ${test.voiceId.substring(0, 8)}...`);
    console.log(`   Emotion: ${test.emotionTag}`);

    const emotionalText = `[${test.emotionTag}] ${test.text}`;

    try {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: emotionalText,
                reference_id: test.voiceId,
                format: 'mp3',
                normalize: true,
            }),
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            console.log(`   ❌ Failed: ${response.status} ${response.statusText}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save to test directory
        const outputDir = path.join(process.cwd(), 'public', 'tts-test');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `${test.id}-fish-speech.mp3`;
        const filepath = path.join(outputDir, filename);
        fs.writeFileSync(filepath, buffer);

        console.log(`   ✅ Generated: ${(buffer.length / 1024).toFixed(1)}KB`);
        console.log(`   📂 Saved: ${filename}`);

        return filename;

    } catch (error) {
        console.log(`   ❌ Error: ${error}`);
        return null;
    }
}

async function runAllTests() {
    console.log('🎯 FISH SPEECH TTS TEST - ALL CHARACTERS\n');
    console.log('='.repeat(70));

    const results: Record<string, string> = {};

    for (const test of TESTS) {
        const filename = await testCharacterVoice(test);
        if (filename) {
            results[test.id] = filename;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TEST COMPLETE!\n');

    if (Object.keys(results).length > 0) {
        console.log('🎧 LISTEN TO SAMPLES:');
        console.log('   Make sure dev server is running: npm run dev');
        console.log('   Then visit these URLs:\n');

        for (const [id, filename] of Object.entries(results)) {
            const character = TESTS.find(t => t.id === id)!;
            console.log(`   ${character.name}:`);
            console.log(`   → http://localhost:3000/tts-test/${filename}\n`);
        }

        console.log('📊 EVALUATION CHECKLIST:');
        console.log('   - Does Marjorie sound elderly/entitled?');
        console.log('   - Does Rajiv sound warm/friendly?');
        console.log('   - Does Asha sound young/professional?');
        console.log('   - Does Dex sound tough/angry?');
        console.log('   - Compare to Character.AI quality');
        console.log('\n🎉 If quality is good, the TTS upgrade is COMPLETE!\n');
    } else {
        console.log('⚠️  No audio generated. Check Fish Speech API key and quota.');
    }
}

runAllTests().catch(console.error);
