/**
 * Reference Asset Harvester (Phase 5 - REFINED)
 * 
 * Switches to WAV for better cloning fidelity.
 * Also saves TRANSCRIPT as .txt (Required by some zero-shot solvers).
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

import { ElevenLabsClient } from '../lib/audio/elevenLabsClient';

const elevenLabs = new ElevenLabsClient();

const HARVEST_MAP = {
    'voice_japanese_hero_male_01': {
        elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
        text: "Justice is not a concept. It is an action. State your case. The sands shift, but the stars remain.",
        language: 'ja'
    },
    'voice_korean_worried_mom_female_01': {
        elevenLabsVoiceId: 'ThT5KcBeYPX3keUQqHPh',
        text: "Aigoo! Look at you, so thin! Have you eaten? You work too hard, really! Take a rest, please.",
        language: 'ko'
    },
    'voice_indian_teacher_wise_male_01': {
        elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
        text: "Do not rush. The numbers will wait for you. Let us find the beauty in this equation.",
        language: 'hi'
    },
    'voice_west_african_motivation_coach_male_01': {
        elevenLabsVoiceId: 'ThT5KcBeYPX3keUQqHPh',
        text: "My brother! Today is the day we conquer the mountain together! Are you ready to shine? The strength is in your spirit!",
        language: 'en'
    },
    'voice_latam_gym_coach_strict_male_01': {
        elevenLabsVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
        text: "Hands up! Chin down! You want to be a champion or a punching bag? Move! Faster! Push yourself!",
        language: 'es'
    }
};

async function harvest() {
    console.log('🚜 Re-Harvesting Regional Identity Assets (WAV + TXT)...\n');

    if (!elevenLabs.isConfigured()) {
        console.error('❌ ElevenLabs not configured.');
        return;
    }

    const relativeDir = 'public/reference_audio/regional';
    const outputDir = path.join(process.cwd(), relativeDir);
    await fs.mkdir(outputDir, { recursive: true });

    for (const [voiceId, config] of Object.entries(HARVEST_MAP)) {
        console.log(`🎤 Harvesting identity for: ${voiceId}`);
        const audioPath = path.join(outputDir, `${voiceId}.wav`);
        const textPath = path.join(outputDir, `${voiceId}.txt`);

        try {
            // Generate
            const result = await elevenLabs.synthesize(config.text, config.elevenLabsVoiceId, {
                stability: 0.4,
                similarity_boost: 0.8,
                format: 'wav' // REQUEST WAV
            });

            if (result && result.audio) {
                const realAudioPath = path.join(outputDir, `${voiceId}.wav`);
                await fs.writeFile(realAudioPath, Buffer.from(result.audio));
                await fs.writeFile(textPath, config.text);
                console.log(`  ✅ Successfully harvested: ${realAudioPath} and ${textPath}`);
            } else {
                console.error(`  ❌ Failed to generate audio for ${voiceId}`);
            }

        } catch (error: any) {
            console.error(`  ❌ Failed to harvest ${voiceId}: ${error.message}`);
        }
    }

    console.log('\n✨ Asset Harvesting Complete!');
}

harvest();
