
import dotenv from 'dotenv';
import path from 'path';

// MUST BE FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { fishSpeechClient } from '../lib/audio/fishSpeechClient';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function test() {
    const charName = process.argv[2] || 'Coach Kofi';
    const testText = process.argv[3] || "My brother! Today we conquer the mountain together! Are you ready to shine?";

    console.log(`🚀 TESTING LIVE TTS CONNECTION for ${charName}...`);

    if (!fishSpeechClient.isConfigured()) {
        console.log('🔄 Manually re-syncing Fish Audio key...');
        // @ts-ignore - for testing
        fishSpeechClient.apiKey = process.env.FISH_AUDIO_API_KEY || process.env.FISH_SPEECH_API_KEY || '';
    }

    if (!fishSpeechClient.isConfigured()) {
        console.error('❌ Fish Audio Client STILL NOT configured.');
        return;
    }

    const persona = await prisma.personaTemplate.findFirst({
        where: { name: charName },
        include: { voiceIdentity: true }
    });

    if (!persona || !persona.voiceIdentity) {
        console.error(`❌ ${charName} or VoiceIdentity not found in DB!`);
        return;
    }

    console.log(`✅ Character: ${persona.name}`);
    console.log(`✅ Voice Link: ${persona.voiceIdentity.voiceId}`);

    const audioPath = path.resolve(process.cwd(), persona.voiceIdentity.referenceAudioPath);
    if (!fs.existsSync(audioPath)) {
        console.error(`❌ Audio missing at ${audioPath}`);
        return;
    }

    const audioBase64 = fs.readFileSync(audioPath).toString('base64');
    let referenceText = "";
    const textPath = audioPath.replace(/\.(mp3|wav)$/, '.txt');
    if (fs.existsSync(textPath)) {
        referenceText = fs.readFileSync(textPath, 'utf-8');
        console.log(`✅ Loaded transcript: ${referenceText.substring(0, 30)}...`);
    }

    console.log(`⏳ Calling Fish Audio (Zero-Shot Fallback) for: ${charName}...`);
    try {
        const result = await fishSpeechClient.synthesize({
            text: testText,
            characterId: persona.id,
            archetype: persona.archetype,
            gender: persona.gender === 'female' ? 'female' : 'male',
            referenceAudio: audioBase64,
            referenceText: referenceText
        });

        if (result) {
            console.log(`✨ SUCCESS (Fish)! Generated ${result.length} bytes.`);
            const safeName = charName.toLowerCase().replace(/\s+/g, '_');
            const outPath = path.resolve(process.cwd(), `test_${safeName}_fish.wav`);
            fs.writeFileSync(outPath, result);
            console.log(`💾 Saved to ${outPath}`);
        } else {
            console.error('❌ Fish returned NULL.');
        }
    } catch (e: any) {
        console.error(`❌ Fish error: ${e.message}`);
    }
}

test()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
