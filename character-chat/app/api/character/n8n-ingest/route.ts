/**
 * n8n Webhook API for Character Ingestion Pipeline
 * 
 * This endpoint receives character data from n8n workflows,
 * validates against the formal schema, and ingests into the system.
 * 
 * Workflow: n8n → POST /api/character/n8n-ingest → Validate → Store
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    Character,
    VoiceProfile,
    validateCharacter,
    checkCollision,
    generateTTSSpecString,
    generateVoiceHash
} from '@/lib/character/schema';

import { db } from '@/lib/db';

interface N8NIngestRequest {
    // Required fields
    character_id: string;
    display_name: string;
    gender: 'male' | 'female';
    role: string;
    description: string;
    personality_voice_blurb: string;

    // Voice profile fields
    pitch_range: string;
    tone_style: string;
    speaking_pace: number;
    aggression_level: string;
    diction_style: string;
    cadence_style: string;

    // Optional
    country?: string;
    archetype_basis?: string;
    avatar_url?: string;

    // n8n metadata
    workflow_id?: string;
    execution_id?: string;
}

interface N8NIngestResponse {
    success: boolean;
    character_id?: string;
    status: 'created' | 'updated' | 'rejected';
    validation: {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    collision?: {
        detected: boolean;
        resolution?: string;
    };
}

export async function POST(request: NextRequest): Promise<NextResponse<N8NIngestResponse>> {
    try {
        const body: N8NIngestRequest = await request.json();

        const errors: string[] = [];
        const warnings: string[] = [];

        // =============================================
        // STEP 1: Basic Field Validation
        // =============================================
        if (!body.character_id) errors.push('character_id is required');
        if (!body.display_name) errors.push('display_name is required');
        if (!['male', 'female'].includes(body.gender)) errors.push('gender must be male or female');
        if (!body.personality_voice_blurb) errors.push('personality_voice_blurb is required');

        // Check 3-sentence rule
        if (body.personality_voice_blurb) {
            const sentences = body.personality_voice_blurb.split(/[.!?]+/).filter(s => s.trim().length > 0);
            if (sentences.length !== 3) {
                errors.push(`personality_voice_blurb must be exactly 3 sentences (found ${sentences.length})`);
            }
        }

        // Validate pace range
        if (body.speaking_pace < 0.80 || body.speaking_pace > 1.20) {
            errors.push(`speaking_pace ${body.speaking_pace} out of range [0.80, 1.20]`);
        }

        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                status: 'rejected',
                validation: { valid: false, errors, warnings }
            }, { status: 400 });
        }

        // =============================================
        // STEP 2: Build Voice Profile
        // =============================================
        const voiceProfile: VoiceProfile = {
            voice_gender: body.gender,
            pitch_range: body.pitch_range as any,
            tone_style: body.tone_style,
            speaking_pace: body.speaking_pace,
            aggression_level: body.aggression_level as any,
            diction_style: body.diction_style as any,
            cadence_style: body.cadence_style as any,
            tts_spec_string: '' // Will be generated
        };

        // Generate TTS spec string from structured fields
        voiceProfile.tts_spec_string = generateTTSSpecString(voiceProfile);

        // =============================================
        // STEP 3: Collision Check
        // =============================================
        const voiceHash = generateVoiceHash(voiceProfile);

        // Check against canonical characters
        let collisionDetected = false;
        let collisionResolution: string | undefined;

        // Check against DB characters (Simulated for now, or rely on unique constraints)
        // V3: Collision checks should be done against the vector database or existing DB records.
        // For now, we trust the DB unique constraints and the VoiceFirst vector allocator.


        // =============================================
        // STEP 4: Database Upsert
        // =============================================
        const dbRecord = {
            seedId: body.character_id,
            name: body.display_name,
            handle: `@${body.character_id.replace(/_/g, '_')}`,
            description: body.description,
            category: body.role,
            gender: body.gender === 'male' ? 'M' : 'F',
            heritage: body.country || 'Unknown',
            archetype: body.archetype_basis || body.role,
            ttsVoiceSpec: voiceProfile.tts_spec_string,
            greeting: body.personality_voice_blurb,
            tagline: body.description,
            accentProfile: voiceProfile.tone_style,
            voiceName: `n8n-${body.character_id}`,
            avatarUrl: body.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(body.display_name)}&background=random&size=400`,
            systemPrompt: `You are ${body.display_name}, a ${body.role}. ${body.description} ${body.personality_voice_blurb}`,
        };

        // Check if exists
        const existing = await db.personaTemplate.findUnique({
            where: { seedId: body.character_id }
        });

        let status: 'created' | 'updated';

        if (existing) {
            await db.personaTemplate.update({
                where: { seedId: body.character_id },
                data: dbRecord
            });
            status = 'updated';
        } else {
            await db.personaTemplate.create({
                data: dbRecord
            });
            status = 'created';
        }

        // =============================================
        // STEP 5: Return Success Response
        // =============================================
        console.log(`[n8n-ingest] ${status.toUpperCase()}: ${body.display_name} (${body.character_id})`);

        return NextResponse.json({
            success: true,
            character_id: body.character_id,
            status,
            validation: { valid: true, errors: [], warnings },
            collision: collisionDetected ? {
                detected: true,
                resolution: collisionResolution
            } : { detected: false }
        });

    } catch (error: any) {
        console.error('[n8n-ingest] Error:', error);

        return NextResponse.json({
            success: false,
            status: 'rejected',
            validation: {
                valid: false,
                errors: [`Server error: ${error.message}`],
                warnings: []
            }
        }, { status: 500 });
    }
}

// GET endpoint for health check / workflow testing
export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        endpoint: '/api/character/n8n-ingest',
        version: '1.0',
        schema_version: 'formal-v1',
        required_fields: [
            'character_id',
            'display_name',
            'gender',
            'role',
            'description',
            'personality_voice_blurb',
            'pitch_range',
            'tone_style',
            'speaking_pace',
            'aggression_level',
            'diction_style',
            'cadence_style'
        ],
        constraints: {
            speaking_pace: '[0.80, 1.20]',
            personality_voice_blurb: 'exactly 3 sentences',
            gender: 'male | female'
        }
    });
}
