import 'dotenv/config';
import { fishSpeechClient } from '../lib/audio/fishSpeechClient';
import path from 'path';

async function main() {
    console.log('🔍 Debugging Fish Audio Encoding...');

    // 1. Mock Data (Kofi)
    const voiceId = "coach_kofi_01";
    const refPath = "reference_audio/regional/clean_kofi.wav"; // Use CLEAN file
    const refText = "My brother! Today is the day we conquer the mountain together! Are you ready to shine? The strength is in your spirit!";

    console.log(`\n📂 Loading Reference: ${refPath}`);

    try {
        // Load Audio explicitly to see the log
        const b64 = await fishSpeechClient.loadReferenceAudio(refPath);
        if (!b64) {
            console.error("❌ Failed to load audio (returned undefined)");
            return;
        }
        console.log(`✅ Loaded Base64 Length: ${b64.length}`);

        // 2. Mock Request
        const payload = {
            text: "Testing encoding.",
            characterId: "debug_char",
            voice_id: voiceId,
            lock_enforcement: true,
            constraints: {
                pitch_min: 95, pitch_max: 130,
                speaking_rate_min: 105, speaking_rate_max: 120,
                energy_baseline: 80, aggression_baseline: 55,
                articulation_precision: 60, rhythm_variability: 70,
                warmth: 65, roughness: 8,
                accent_id: 9,
                gender_lock: 1, age_lock: 1
            },
            prohibitions: {
                forbidden_accents: [1, 2],
                forbidden_genders: [0],
                forbidden_age_locks: [0]
            },
            referenceAudio: `data:audio/wav;base64,${b64}`,
            referenceText: refText
        };

        console.log('\n🚀 Attempting Synthesis with Base64 payload...');
        await fishSpeechClient.synthesize(payload);
        console.log('✅ Synthesis Succeeded!');

    } catch (error: any) {
        console.error('\n❌ Synthesis Failed:');
        console.error(error.message);
        if (error.message.includes('500')) {
            console.log('   (This confirms the encoding error is reproducible locally)');
        }
    }
}

main();
