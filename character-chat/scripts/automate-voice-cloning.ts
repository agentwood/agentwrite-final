import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Automated Voice Cloning Pipeline
 * 
 * Strategy:
 * 1. Map Agentwood characters → Character.AI personality equivalents
 * 2. Extract audio samples from Character.AI (or use public TTS samples)
 * 3. Upload to Fish Speech for cloning
 * 4. Auto-update voice mappings in code
 */

interface CharacterMapping {
    agentwoodId: string;
    agentwoodName: string;
    targetPersonality: string;
    voiceRequirements: {
        age: string;
        gender: 'M' | 'F';
        tone: string;
        accent?: string;
    };
    characterAIEquivalent?: string;
    sampleTextForGeneration: string;
}

// Character mappings with personality descriptions
const CHARACTER_MAPPINGS: CharacterMapping[] = [
    {
        agentwoodId: 'marjorie',
        agentwoodName: 'Salty Marjorie',
        targetPersonality: '75-year-old entitled American woman, sharp/nasal tone, Karen archetype',
        voiceRequirements: {
            age: '70-80',
            gender: 'F',
            tone: 'sharp, entitled, demanding',
            accent: 'American (Sunbelt)'
        },
        characterAIEquivalent: 'Karen from Customer Service', // Search term
        sampleTextForGeneration: "Excuse me, I've been a resident of this community for THIRTY years. This is absolutely unacceptable. Do you have ANY idea who you're talking to? I will be speaking to the manager immediately!",
    },
    {
        agentwoodId: 'rajiv',
        agentwoodName: 'Friendly Rajiv',
        targetPersonality: '42-year-old Indian-American man, warm friendly merchant, Jersey accent with Gujarati hints',
        voiceRequirements: {
            age: '40-50',
            gender: 'M',
            tone: 'warm, cheerful, fast-paced',
            accent: 'American (Jersey) with Indian hints'
        },
        sampleTextForGeneration: "Hey there, my friend! Welcome, welcome! I've got exactly what you need today. This is the best deal you'll find anywhere, I promise you. Come, let me show you!",
    },
    {
        agentwoodId: 'asha',
        agentwoodName: 'Fearless Asha',
        targetPersonality: '26-year-old Kenyan woman, professional activist, clear principled voice',
        voiceRequirements: {
            age: '25-30',
            gender: 'F',
            tone: 'clear, earnest, professional',
            accent: 'Kenyan English'
        },
        sampleTextForGeneration: "We have to stand up for what's right. This isn't just about us, it's about everyone who comes after. I know it's difficult, but we can't back down now.",
    },
    {
        agentwoodId: 'dex',
        agentwoodName: 'Angry Dex',
        targetPersonality: '33-year-old Puerto Rican-American man, street artist, Bronx accent, tough and blunt',
        voiceRequirements: {
            age: '30-35',
            gender: 'M',
            tone: 'raspy, tough, blunt',
            accent: 'NYC Bronx'
        },
        sampleTextForGeneration: "Yo, you think this is a game? I've been grinding in these streets since day one. Don't come at me with that weak stuff. Real talk, you either respect the hustle or get outta my way.",
    },
];

/**
 * Option 1: Use ElevenLabs API to generate voice samples
 * (Faster than manual, programmatic)
 */
async function generateVoiceSampleViaElevenLabs(
    characterMapping: CharacterMapping
): Promise<Buffer | null> {
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

    if (!ELEVENLABS_API_KEY) {
        console.log('⚠️  ElevenLabs API key not found, skipping generation');
        return null;
    }

    try {
        console.log(`🎙️  Generating voice sample for ${characterMapping.agentwoodName}...`);

        // Use ElevenLabs Voice Design API
        const response = await fetch('https://api.elevenlabs.io/v1/voice-generation/generate-voice', {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: characterMapping.sampleTextForGeneration,
                voice_description: characterMapping.targetPersonality,
                gender: characterMapping.voiceRequirements.gender === 'M' ? 'male' : 'female',
                age: characterMapping.voiceRequirements.age,
                accent: characterMapping.voiceRequirements.accent || 'american',
            }),
        });

        if (!response.ok) {
            console.error(`ElevenLabs error: ${response.status}`);
            return null;
        }

        const audioBuffer = Buffer.from(await response.arrayBuffer());
        console.log(`✅ Generated ${audioBuffer.length} bytes`);
        return audioBuffer;
    } catch (error) {
        console.error(`Error generating voice:`, error);
        return null;
    }
}

/**
 * Option 2: Use free Fish Audio voices as templates
 * (Search Fish Audio library for similar personalities)
 */
async function findSimilarFishVoice(
    characterMapping: CharacterMapping
): Promise<string | null> {
    try {
        const response = await fetch('https://api.fish.audio/model', {
            headers: {
                'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}`,
            },
        });

        const data: any = await response.json();
        const voices = data.items || [];

        // Search for matching gender and English language
        const candidates = voices.filter((v: any) => {
            const isEnglish = v.languages?.includes('en');
            const matchesGender = characterMapping.voiceRequirements.gender === 'F'
                ? v.title.toLowerCase().includes('female') || v.title.toLowerCase().includes('woman')
                : v.title.toLowerCase().includes('male') || v.title.toLowerCase().includes('man');

            return isEnglish && matchesGender;
        });

        if (candidates.length > 0) {
            console.log(`Found ${candidates.length} potential voices for ${characterMapping.agentwoodName}`);
            return candidates[0]._id;
        }

        return null;
    } catch (error) {
        console.error('Error searching Fish voices:', error);
        return null;
    }
}

/**
 * Upload audio to Fish Speech for cloning
 */
async function cloneVoiceInFishSpeech(
    characterName: string,
    audioBuffer: Buffer
): Promise<string | null> {
    try {
        // Save temp audio file
        const tempPath = `/tmp/${characterName}-sample.mp3`;
        fs.writeFileSync(tempPath, audioBuffer);

        console.log(`📤 Uploading to Fish Speech for cloning...`);

        // Note: Fish Speech cloning requires web UI upload currently
        // This would need their API endpoint for voice cloning (if available)
        // For now, we'll use existing voices and document the manual step

        console.log(`⚠️  Fish Speech cloning API not publicly available yet`);
        console.log(`📝 Audio saved to: ${tempPath}`);
        console.log(`   → Upload manually at: https://fish.audio/app/voice-cloning/`);

        return null;
    } catch (error) {
        console.error('Error cloning voice:', error);
        return null;
    }
}

/**
 * Main automation function
 */
async function automateVoiceCloning() {
    console.log('🚀 Starting Automated Voice Cloning Pipeline\n');
    console.log('='.repeat(60));

    const results: Record<string, string> = {};

    for (const mapping of CHARACTER_MAPPINGS) {
        console.log(`\n📋 Processing: ${mapping.agentwoodName}`);
        console.log(`   Personality: ${mapping.targetPersonality}\n`);

        // Strategy 1: Try to find existing Fish voice
        console.log('🔍 Searching Fish Speech library...');
        const existingVoice = await findSimilarFishVoice(mapping);

        if (existingVoice) {
            console.log(`✅ Found similar voice: ${existingVoice}`);
            results[mapping.agentwoodId] = existingVoice;
            continue;
        }

        // Strategy 2: Generate with ElevenLabs (if API key available)
        const audioSample = await generateVoiceSampleViaElevenLabs(mapping);

        if (audioSample) {
            // Clone in Fish Speech (manual step for now)
            await cloneVoiceInFishSpeech(mapping.agentwoodName, audioSample);
            console.log(`⏳ Manual cloning required - check /tmp/ directory`);
        } else {
            console.log(`⚠️  Skipping ${mapping.agentwoodName} - no audio generated`);
        }
    }

    // Output voice mapping code
    console.log('\n' + '='.repeat(60));
    console.log('📝 UPDATE app/api/tts/route.ts with:\n');
    console.log('const FISH_VOICE_MAP: Record<string, string> = {');
    for (const [id, voiceId] of Object.entries(results)) {
        console.log(`  '${id}': '${voiceId}',`);
    }
    console.log('};');

    console.log('\n✅ Pipeline complete!');
}

// Run if executed directly
if (require.main === module) {
    automateVoiceCloning().catch(console.error);
}

export { automateVoiceCloning, CHARACTER_MAPPINGS };
