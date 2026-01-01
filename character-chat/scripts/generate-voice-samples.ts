/**
 * Generate Reference Audio Samples for Voice Cloning
 * 
 * Strategy: Use ElevenLabs ONE TIME to generate 30-second voice samples
 * with correct accents, then save them for OpenVoice voice cloning.
 * 
 * This is a one-time cost - after generating the samples, all future TTS
 * uses OpenVoice cloning which is free.
 * 
 * Usage:
 *   npx tsx scripts/generate-voice-samples.ts
 * 
 * Prerequisites:
 *   - ELEVENLABS_API_KEY in .env.local
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local explicitly (dotenv/config only loads .env by default)
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { db } from '../lib/db';

// ElevenLabs pre-made voices with different accents

// Use these to generate base samples, then save for OpenVoice cloning
const VOICE_SAMPLES = {
    // Asha - Kenyan female
    asha: {
        voiceId: 'ThT5KcBeYPX3keUQqHPh', // Nicole - has African accent characteristics
        accent: 'Kenyan',
        sampleText: `
      Hello, my name is Asha. I am so happy to meet you today.
      I come from Nairobi, Kenya, and I have lived there my whole life.
      The weather is beautiful in Kenya, especially during the dry season.
      I love to share stories about my homeland with friends from all over the world.
      Our culture is rich in tradition, music, and delicious food.
      I hope we can become good friends and learn from each other.
      Life is about connections, and I truly believe that every person we meet teaches us something new.
    `.trim(),
    },

    // Eamon - Scottish male  
    eamon: {
        voiceId: 'jBpfuIE2acCO8z3wKNLl', // Gigi - British but can be styled
        accent: 'Scottish',
        sampleText: `
      Och aye, good to meet ye! My name is Eamon from Glasgow.
      Scotland is a beautiful country, full of rolling hills and ancient castles.
      I love a good whisky and watching the football on a Saturday afternoon.
      The weather here can be a wee bit dreary, but we make the best of it.
      Have ye ever tried haggis? It's not for everyone, but I quite enjoy it.
      Glasgow is full of life and energy, especially on a Friday night.
      Come visit sometime, and I'll show ye around the best pubs in town.
    `.trim(),
    },

    // Viktor - Russian male
    viktor: {
        voiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum - deeper, Eastern European feel
        accent: 'Russian',
        sampleText: `
      Zdravstvuyte. My name is Viktor, and I am from Moscow.
      Russia is a vast country with a rich history spanning centuries.
      The winters here are cold, but we Russians are strong and resilient.
      I work in technology, solving complex problems every day.
      Logic and precision are very important to me in all things.
      I may seem serious, but I have a good sense of humor.
      Perhaps one day you will visit Moscow and see Red Square.
    `.trim(),
    },

    // Tomasz - Polish male
    tomasz: {
        voiceId: 'N2lVS1w4EtoT3dr4eOWO', // Callum - Eastern European
        accent: 'Polish',
        sampleText: `
      Dzień dobry! My name is Tomasz, and I come from Warsaw, Poland.
      Poland has a complicated history, but our spirit remains unbroken.
      I work as an engineer, always looking for practical solutions.
      Family is very important in Polish culture, we gather often for meals.
      Have you tried pierogi? My grandmother makes the best ones.
      I am easy-going and prefer to stay calm in any situation.
      If you need help with anything, I am always happy to assist.
    `.trim(),
    },

    // Rajiv - Indian male
    rajiv: {
        voiceId: 'TxGEqnHWrfWFTfGW9XjX', // Josh - can be energetic
        accent: 'Indian',
        sampleText: `
      Namaste! I am Rajiv, and I am from Mumbai, India.
      Mumbai is a bustling city, always full of energy and excitement.
      I grew up in New Jersey, but my family kept our traditions alive.
      I love Bollywood movies, cricket, and especially good chai tea.
      Technology has always fascinated me, and I work in software.
      Family gatherings are my favorite, with lots of food and laughter.
      Let me know if you need help with anything, I am happy to assist!
    `.trim(),
    },
};

async function generateSample(
    characterId: string,
    voiceId: string,
    text: string
): Promise<Buffer | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        console.error('ELEVENLABS_API_KEY not set in .env.local');
        return null;
    }

    console.log(`  Generating sample for ${characterId}...`);

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2', // Best for accents
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error(`  ElevenLabs error (${response.status}):`, error);
            return null;
        }

        const audioBuffer = await response.arrayBuffer();
        console.log(`  ✓ Generated ${(audioBuffer.byteLength / 1024).toFixed(1)}KB audio`);

        return Buffer.from(audioBuffer);
    } catch (error) {
        console.error(`  Error generating sample:`, error);
        return null;
    }
}

async function main() {
    console.log('🎙️  Generating Voice Reference Samples');
    console.log('=====================================');
    console.log('');
    console.log('This script uses ElevenLabs to generate 30-second voice samples');
    console.log('with correct accents for each character. These samples will be');
    console.log('saved to the database for OpenVoice voice cloning.');
    console.log('');

    if (!process.env.ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not found in .env.local');
        console.log('');
        console.log('Add this to your .env.local file:');
        console.log('ELEVENLABS_API_KEY=your_api_key_here');
        console.log('');
        console.log('Get a free API key at https://elevenlabs.io');
        process.exit(1);
    }

    // Create output directory for samples
    const outputDir = path.join(__dirname, '../public/voice-samples');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const results: { character: string; success: boolean; size?: number }[] = [];

    for (const [characterId, config] of Object.entries(VOICE_SAMPLES)) {
        console.log(`\n📢 Processing ${characterId} (${config.accent})...`);

        // Generate the audio sample
        const audioBuffer = await generateSample(
            characterId,
            config.voiceId,
            config.sampleText
        );

        if (!audioBuffer) {
            results.push({ character: characterId, success: false });
            continue;
        }

        // Save to file for backup
        const filePath = path.join(outputDir, `${characterId}-reference.mp3`);
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`  ✓ Saved to ${filePath}`);

        // Convert to base64 for database
        const audioBase64 = audioBuffer.toString('base64');

        // Update database
        try {
            const persona = await db.personaTemplate.findFirst({
                where: { seedId: characterId },
            });

            if (persona) {
                await db.personaTemplate.update({
                    where: { id: persona.id },
                    data: { referenceAudioBase64: audioBase64 },
                });
                console.log(`  ✓ Updated database for ${characterId}`);
                results.push({ character: characterId, success: true, size: audioBuffer.length });
            } else {
                console.log(`  ⚠️ Character ${characterId} not found in database`);
                results.push({ character: characterId, success: false });
            }
        } catch (error) {
            console.error(`  ❌ Database error:`, error);
            results.push({ character: characterId, success: false });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Summary
    console.log('\n');
    console.log('=====================================');
    console.log('📊 Summary');
    console.log('=====================================');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✓ Generated: ${successful.length} samples`);
    if (failed.length > 0) {
        console.log(`✗ Failed: ${failed.length} (${failed.map(f => f.character).join(', ')})`);
    }

    console.log('');
    console.log('Next steps:');
    console.log('1. OpenVoice will now use these samples for voice cloning');
    console.log('2. Characters will have their correct accents preserved');
    console.log('3. No more ElevenLabs calls needed - cloning is free!');
    console.log('');

    await db.$disconnect();
}

main().catch(console.error);
