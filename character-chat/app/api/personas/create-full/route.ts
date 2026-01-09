import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { matchArchetype, generateTTSVoiceSpec } from '@/lib/characterCreation/archetypeMapper';
import { buildSystemPrompt } from '@/lib/prompts';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
            'Keep responses appropriate and engaging.',
            'conversational',
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
