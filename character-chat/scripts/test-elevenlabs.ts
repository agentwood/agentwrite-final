import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
import fs from 'fs';
const { elevenLabsClient } = require('../lib/audio/elevenLabsClient');

async function main() {
    const testCharacter = 'asha';
    const testText = "Hello, I am Asha. I am from Kenya and I am happy to meet you.";
    const outputDir = path.join(process.cwd(), 'public', 'tts-test');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🎙️ Testing ElevenLabs for character: ${testCharacter}`);

    const voiceId = elevenLabsClient.getVoiceForCharacter(testCharacter);
    if (!voiceId) {
        console.error(`❌ No voice ID found for character: ${testCharacter}`);
        process.exit(1);
    }

    console.log(`✅ Using voice ID: ${voiceId}`);

    const result = await elevenLabsClient.synthesize(testText, voiceId);

    if (result) {
        const outputPath = path.join(outputDir, 'elevenlabs-test.mp3');
        fs.writeFileSync(outputPath, Buffer.from(result.audio));
        console.log(`✅ Success! Audio saved to: ${outputPath}`);
    } else {
        console.error('❌ Synthesis failed. Check API key and quota.');
    }
}

main().catch(console.error);
