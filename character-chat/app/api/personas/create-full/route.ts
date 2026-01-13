import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matchArchetype, generateTTSVoiceSpec } from '@/lib/characterCreation/archetypeMapper';
import { buildSystemPrompt } from '@/lib/prompts';
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
    archetype?: string;
    voiceId?: string;
    voiceSeedId?: string; // Voice seed ID from VoiceSelector
    avatarUrl?: string; // Allow passing detailed avatar URL or base64
}

// ... existing helper functions ...

/**
 * POST /api/personas/create-full
 * Creates a character with AI-generated image, description, and voice matching
 */
export async function POST(request: NextRequest) {
    try {
        const body: CreateFullRequest = await request.json();

        if (!body.name) {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Create initial character record with pending status
        const character = await db.personaTemplate.create({
            data: {
                name: body.name,
                category: body.category || 'Original',
                avatarUrl: body.avatarUrl || 'pending',
                voiceName: body.voiceId || 'default',
                systemPrompt: 'pending',
                archetype: body.archetype || 'warm_mentor',
                creationStatus: 'pending',
                creationProgress: 0,
                creationMessage: 'Starting character creation...',
            },
        });

        // Return immediately with character ID for polling
        const responseData = { id: character.id, name: character.name };

        // Background processing (this runs after response is sent)
        processCharacterCreation(character.id, body).catch(console.error);

        return NextResponse.json(responseData, { status: 201 });
    } catch (error: any) {
        console.error('Error creating character:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create character' },
            { status: 500 }
        );
    }
}

/**
 * Background function to process character creation
 */
async function processCharacterCreation(characterId: string, body: CreateFullRequest) {
    try {
        // Step 1: Match archetype (or use provided)
        await updateStatus(characterId, 'matching_voice', 10, 'Analyzing personality...');
        let archetypeMatch;

        if (body.archetype) {
            archetypeMatch = {
                archetype: body.archetype,
                confidence: 1.0,
                gender: body.gender || 'NB',
                voiceProfile: 'custom'
            };
        } else {
            archetypeMatch = matchArchetype(body.description || '', body.keywords, body.gender);
        }

        // Step 2: Generate avatar (or use provided)
        await updateStatus(characterId, 'generating_avatar', 30, 'Creating unique avatar...');
        let avatarUrl = body.avatarUrl;
        if (!avatarUrl || avatarUrl === 'pending') {
            avatarUrl = await generateAvatar(body.name, body.keywords, body.gender || archetypeMatch.gender);
        }

        // Step 3: Generate personality/description (or use provided)
        await updateStatus(characterId, 'generating_personality', 60, 'Crafting personality...');
        let profile;
        if (body.description && body.greeting && body.tagline) {
            profile = {
                description: body.description,
                greeting: body.greeting,
                tagline: body.tagline,
                personality: body.keywords // Assume keywords are personality if fully provided
            };
        } else {
            profile = await generateProfile(body.name, body.keywords, body.gender || archetypeMatch.gender);
        }

        // Step 4: Build system prompt
        await updateStatus(characterId, 'finalizing', 85, 'Finalizing character...');
        const systemPrompt = buildSystemPrompt(
            profile.description,
            ['Keep responses appropriate and engaging.'],
            ['conversational'],
            [],
            body.name
        );

        // Generate TTS voice spec
        const ttsVoiceSpec = generateTTSVoiceSpec(archetypeMatch.archetype, body.gender || archetypeMatch.gender);

        // Step 5: Update character with all data
        await db.personaTemplate.update({
            where: { id: characterId },
            data: {
                avatarUrl,
                description: profile.description,
                greeting: profile.greeting,
                tagline: profile.tagline,
                gender: body.gender || archetypeMatch.gender,
                archetype: archetypeMatch.archetype,
                ttsVoiceSpec,
                systemPrompt,
                characterKeywords: body.keywords,
                mappingConfidence: archetypeMatch.confidence,
                voiceSeedId: body.voiceSeedId || undefined, // Save the selected voice seed
                voiceReady: true, // Fish Speech v1.5 ready
                creationStatus: 'ready',
                creationProgress: 100,
                creationMessage: 'Character is ready!',
            },
        });

        console.log(`✅ Character ${body.name} (${characterId}) created successfully`);
    } catch (error: any) {
        console.error(`❌ Character creation failed for ${characterId}:`, error);
        await updateStatus(
            characterId,
            'failed',
            0,
            'Character creation failed',
            error.message || 'Unknown error'
        );
    }
}

// Helper functions (Implementation)
async function updateStatus(id: string, status: string, progress: number, message: string, error?: string) {
    await db.personaTemplate.update({
        where: { id },
        data: {
            creationStatus: status,
            creationProgress: progress,
            creationMessage: message,
        }
    });
}

async function generateAvatar(name: string, keywords: string, gender: string) {
    // Utilize the strict visual style generator we updated
    return generateAvatarUtil({
        characterId: name.toLowerCase().replace(/\s+/g, '-'),
        characterName: name,
        style: 'REALISTIC', // Default to realistic
        description: keywords
    });
}

async function generateProfile(name: string, keywords: string, gender: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Create a rich, immersive character profile for an AI companion app.
        
        Name: ${name}
        Keywords/Context: ${keywords}
        Gender: ${gender}
        
        Generate a JSON object with:
        1. description: A shorter setting/background (under 300 chars) establishing who they are.
        2. greeting: A catchy, in-character opening line (NOT "Hello I am..."). It should show, not tell. Action *asterisks* allowed.
        3. tagline: A short hook (under 50 chars).
        4. personality: A comma-separated list of traits.
        
        Return JSON ONLY.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
                description: data.description || `A unique character named ${name}.`,
                greeting: data.greeting || `*smiles* Hi there.`,
                tagline: data.tagline || `${name} - AI Companion`,
                personality: data.personality || keywords
            };
        }
    } catch (error) {
        console.error('LLM Profile Generation failed:', error);
    }

    // Fallback if LLM fails (Better than "Hello I am name")
    return {
        description: `A unique character named ${name} known for ${keywords}.`,
        greeting: `*looks at you with interest* Greetings.`,
        tagline: `${name} - ${keywords}`,
        personality: keywords
    };
}
