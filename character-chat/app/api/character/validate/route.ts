/**
 * Character Validation API
 * 
 * Validates new character submissions against the formal schema.
 * Implements the n8n-style filter logic for Antigravity character ingestion.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    Character,
    validateCharacter,
    checkCollision,
    checkPaceCollision,
    generateVoiceHash,
    generateTTSSpecString
} from '@/lib/character/schema';

import { db } from '@/lib/db';

interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    collision?: {
        field: string;
        collidingCharacterId: string;
    };
    normalized?: {
        character_id: string;
        tts_spec_string: string;
    };
}

export async function POST(request: NextRequest): Promise<NextResponse<ValidationResult>> {
    try {
        const character: Character = await request.json();

        const errors: string[] = [];
        const warnings: string[] = [];

        // =============================================
        // STEP 1: Schema Validation
        // =============================================
        const schemaResult = validateCharacter(character);
        if (!schemaResult.valid) {
            errors.push(...schemaResult.errors);
        }

        // =============================================
        // STEP 2: Load Existing Characters for Collision Check
        // =============================================
        const existingFromDB = await db.personaTemplate.findMany({
            select: {
                seedId: true,
                gender: true,
                ttsVoiceSpec: true,
            }
        });

        // Combine canonical + DB characters for collision check
        const allExisting: any[] = existingFromDB.map(c => ({
            character_id: c.seedId || '',
            voice_profile: {
                pitch_range: 'mid', // Default for legacy
                speaking_pace: 1.0,
                cadence_style: 'steady',
            }
        }));

        // =============================================
        // STEP 3: Voice Collision Check
        // =============================================
        const collision = checkCollision(character, allExisting);
        if (collision) {
            warnings.push(`Voice profile collision with ${collision.character_id}. Consider adjusting pace by ±0.05.`);
        }

        // =============================================
        // STEP 4: Pace Collision Check
        // =============================================
        const paceCollision = checkPaceCollision(
            character.voice_profile.speaking_pace,
            allExisting.filter(c => c.character_id !== character.character_id)
        );
        if (paceCollision) {
            warnings.push(`Speaking pace too similar to existing character in DB. Must differ by ≥0.05.`);
        }

        // =============================================
        // STEP 5: Generate/Verify TTS Spec String
        // =============================================
        const expectedSpec = generateTTSSpecString(character.voice_profile);
        if (character.voice_profile.tts_spec_string !== expectedSpec) {
            warnings.push(`tts_spec_string mismatch. Expected: "${expectedSpec}"`);
        }

        // =============================================
        // STEP 6: Antigravity Normalization
        // =============================================
        const normalized = {
            character_id: character.character_id,
            tts_spec_string: expectedSpec,
            antigravity: {
                'voice.spec': expectedSpec,
                'character.personality': character.personality_voice_blurb,
                'metadata.archetype': character.archetype_basis,
            }
        };

        return NextResponse.json({
            valid: errors.length === 0,
            errors,
            warnings,
            collision: collision ? {
                field: 'voice_profile',
                collidingCharacterId: collision.character_id
            } : undefined,
            normalized
        });

    } catch (error: any) {
        return NextResponse.json({
            valid: false,
            errors: [`Server error: ${error.message}`],
            warnings: []
        }, { status: 500 });
    }
}
