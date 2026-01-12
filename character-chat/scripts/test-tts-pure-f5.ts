
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { runpodF5Client } from '../lib/audio/runpodF5Client';

dotenv.config({ path: '.env.local' });

async function testPureF5() {
    console.log('🧪 Testing Pure F5-TTS (FastMaya) Architecture...');

    const testText = "Listen to me, team! You must move with purpose! In this game, your heart is your greatest weapon. Now, get back out there and show them what we are made of!";

    // Coach Kofi's high-fidelity description
    const voiceDescription = "Male, middle-aged, commanding Ghanaian motivational coach with a high-energy, rhythmic, and infectious West African accent.";

    console.log(`\n🎤 Target: Coach Kofi (Ghanaian Accent)`);
    console.log(`📝 Prompt: "${voiceDescription}"`);

    const result = await runpodF5Client.synthesize(testText, {
        voice_description: voiceDescription,
        temperature: 0.8,
        speed: 1.0
    });

    if (result && result.audio) {
        const outputPath = path.join(process.cwd(), 'scripts/test_outputs/coach_kofi_f5_pure.wav');

        // Ensure directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        fs.writeFileSync(outputPath, result.audio);
        console.log(`\n✅ Success! Audio saved to: ${outputPath}`);
        console.log(`📊 Bytes: ${result.audio.length}`);
        console.log(`🎲 Seed Used: ${result.seed}`);
    } else {
        console.error('\n❌ Failed to generate audio. Check RunPod logs or API configuration.');
    }
}

testPureF5();
