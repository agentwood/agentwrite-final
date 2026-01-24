import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAvatar as generateAvatarUtil } from '@/lib/avatarGenerator';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface CreateFullRequest {
    name: string;
    keywords: string;
    description?: string;
    tagline?: string;
    greeting?: string;
    category?: string;
    gender?: 'M' | 'F' | 'NB';
    voiceSeedId?: string; // REQUIRED: The seed to clone
    avatarUrl?: string;
}

/**
 * POST /api/personas/create-full
 * Creates a character using the VOICE-FIRST architecture.
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateFullRequest = await request.json();

        // 1. Validation
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (!body.voiceSeedId) {
            return NextResponse.json({ error: 'Voice Selection is required (Voice-First)' }, { status: 400 });
        }

        // 2. Fetch the Voice Seed (Source of Truth)
        const voiceSeed = await db.voiceSeed.findUnique({
            where: { id: body.voiceSeedId },
        });

        if (!voiceSeed) {
            return NextResponse.json({ error: 'Invalid Voice Seed selected' }, { status: 400 });
        }

        // 3. Create Preliminary Character Record
        // We create it first to get an ID for the VoiceIdentity name
        const character = await db.personaTemplate.create({
            data: {
                name: body.name,
                category: body.category || 'Original',
                avatarUrl: body.avatarUrl || 'pending',
                voiceName: voiceSeed.name, // Display name
                voiceSeedId: voiceSeed.id, // Link to seed
                systemPrompt: 'TREE-E System (Dynamic)', // Placeholder
                archetype: 'dynamic', // To be refined
                creationStatus: 'initializing',
                creationProgress: 10,
                creationMessage: 'Initializing character DNA...',
                gender: body.gender || (voiceSeed.gender === 'male' ? 'M' : voiceSeed.gender === 'female' ? 'F' : 'NB'),
            },
        });

        // 4. Trigger Background Process (Robust)
        // Note: In serverless, await is safer than fire-and-forget if timeout is generous. 
        // We will await the critical VoiceIdentity creation to ensure basic viability, 
        // then specific content generation can be async if needed. 
        // For reliability, we'll do it all in sequence (creation is fast enough).

        await processCharacterCreation(character.id, body, voiceSeed);

        return NextResponse.json({ id: character.id, name: character.name }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating character:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create character' },
            { status: 500 }
        );
    }
}

/**
 * Core Creation Logic
 */
async function processCharacterCreation(characterId: string, body: CreateFullRequest, voiceSeed: any) {
    try {
        await updateStatus(characterId, 'creating_voice_core', 20, 'Synthesizing voice identity...');

        // Step A: Create Voice Identity (The "Soul")
        // We clone the seed's parameters into a specific identity for this character.
        const voiceIdentityId = `vid_${characterId}`;

        // Determine pitch range based on seed gender/pitch
        let pitchMin = 100, pitchMax = 200;
        if (voiceSeed.gender === 'female') { pitchMin = 165; pitchMax = 255; }
        else if (voiceSeed.gender === 'male') { pitchMin = 85; pitchMax = 180; }

        // Shift based on seed.pitch (assuming -1.0 to 1.0 or similar)
        const pitchShift = Math.floor(voiceSeed.pitch * 20); // 20Hz shift range
        pitchMin += pitchShift;
        pitchMax += pitchShift;

        const voiceIdentity = await db.voiceIdentity.create({
            data: {
                voiceId: voiceIdentityId,
                gender: voiceSeed.gender,
                ageBand: voiceSeed.age || 'adult',
                originRegion: 'unknown', // can be refined by LLM later
                accent: voiceSeed.accent,
                pitchMin,
                pitchMax,
                speakingRateMin: Math.floor(voiceSeed.speed * 90),
                speakingRateMax: Math.floor(voiceSeed.speed * 110),
                timbre: voiceSeed.timbre || 'Balanced',
                referenceAudioPath: voiceSeed.filePath,
                displayName: `${body.name}'s Voice`,
            }
        });

        // Link Identity to Character immediately
        await db.personaTemplate.update({
            where: { id: characterId },
            data: { voiceIdentityId: voiceIdentity.id }
        });

        // Step B: Generate Content (Avatar & Profile)
        await updateStatus(characterId, 'generating_profile', 50, 'Crafting personality...');

        // 1. Avatar
        let avatarUrl = body.avatarUrl;
        if (!avatarUrl || avatarUrl === 'pending') {
            try {
                avatarUrl = await generateAvatarUtil({
                    characterId: body.name.toLowerCase().replace(/\s+/g, '-'),
                    characterName: body.name,
                    style: 'REALISTIC',
                    description: body.keywords + ` ${voiceSeed.gender} ${voiceSeed.age}`
                });
            } catch (e) {
                console.warn('Avatar generation failed, using fallback', e);
                // Keep 'pending' or use a placeholder
            }
        }

        // 2. Profile (Description, Greeting, Tagline)
        const profile = await generateProfile(body.name, body.keywords, voiceSeed.gender, body);

        // Step C: Finalize
        await updateStatus(characterId, 'ready', 100, 'Character Ready!');

        await db.personaTemplate.update({
            where: { id: characterId },
            data: {
                avatarUrl: avatarUrl || undefined,
                description: profile.description,
                greeting: profile.greeting,
                tagline: profile.tagline,
                characterKeywords: profile.personality, // Use generated traits
                voiceReady: true,
                trainingStatus: 'trained', // Basic training complete

                // Behavior defaults (can be tuned later)
                behaviorEmpathy: 50,
                behaviorAgreeable: 50,
                behaviorChaos: 50,
                styleVerbosity: 50,
            }
        });

        console.log(`✅ Character ${body.name} created with Voice Identity ${voiceIdentity.id}`);

    } catch (error: any) {
        console.error(`❌ Process failed for ${characterId}:`, error);
        await updateStatus(characterId, 'failed', 0, 'Creation failed', error.message);
    }
}

async function updateStatus(id: string, status: string, progress: number, message: string, error?: string) {
    await db.personaTemplate.update({
        where: { id },
        data: {
            creationStatus: status,
            creationProgress: progress,
            creationMessage: message,
            creationError: error
        }
    });
}

// Generate text profile using Gemini
async function generateProfile(name: string, keywords: string, gender: string, existing: CreateFullRequest) {
    // If user provided everything, use it (User Defined)
    if (existing.description && existing.greeting && existing.tagline) {
        return {
            description: existing.description,
            greeting: existing.greeting,
            tagline: existing.tagline,
            personality: keywords
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = `Create a character profile.
        Name: ${name}
        Context: ${keywords}
        Gender: ${gender}
        
        Output JSON: { "description": "max 300 chars", "greeting": "Action *style*", "tagline": "max 50 chars", "personality": "traits" }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('LLM Profile failed', e);
    }

    // Fallback
    return {
        description: existing.description || `${name} is a unique character.`,
        greeting: existing.greeting || `*smiles* Hello.`,
        tagline: existing.tagline || `${name}`,
        personality: keywords
    };
}
