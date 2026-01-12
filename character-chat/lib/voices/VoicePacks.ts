/**
 * Voice Packs & Clusters - Character AI-Grade Voice Groups
 * 
 * These exports organize voices into thematic clusters for:
 * 1. Heroes & Villains (High Retention)
 * 2. Strict Coach / Drill / Discipline
 * 3. Emotional Characters
 * 
 * Used for character generation and voice assignment.
 */

import type { F5VoiceVector } from './F5VoiceVector';

// =============================================
// VOICE PACK: HEROES & VILLAINS (High Retention)
// =============================================

export const HEROES_PACK: string[] = [
    'voice_japanese_hero_male_01',        // Japanese Stoic Hero
    'voice_west_african_motivation_coach_male_01', // African Motivational Coach
    'voice_indian_teacher_wise_male_01',  // Indian Wise Teacher
    'voice_narrator_doc_male_01',         // Documentary Narrator (heroic narration)
    'voice_narrator_doc_female_01',       // Documentary Narrator Female
];

export const VILLAINS_PACK: string[] = [
    'voice_villain_intellectual_male_01', // Dr. Vale archetype
    'voice_villain_elegant_female_01',    // European Femme Fatale
    'voice_villain_brutal_male_01',       // Working-class Enforcer
    'voice_villain_calm_male_01',         // Calm Psychopath
    'voice_japanese_villain_cold_male_01', // Japanese Cold Villain
    'voice_indian_villain_ruthless_female_01', // Indian Ruthless Villain
    'voice_middle_east_tyrant_male_01',   // Middle Eastern Tyrant
    'voice_african_villain_strategist_female_01', // African Cold Strategist
    'voice_latam_angry_karen_female_01',  // Latin American Angry Karen (antagonist)
];

// =============================================
// VOICE CLUSTER: STRICT COACH / DRILL / DISCIPLINE
// =============================================

export const DISCIPLINE_CLUSTER: string[] = [
    'voice_korean_drill_sergeant_male_01', // Korean Drill Sergeant
    'voice_latam_gym_coach_strict_male_01', // Latin American Strict Gym Coach
    'voice_middle_east_tyrant_male_01',     // Middle Eastern Tyrant (authoritative)
    'voice_west_african_motivation_coach_male_01', // African Coach (motivational discipline)
    'voice_oxford_male_01',                 // Oxford Academic (intellectual discipline)
];

// =============================================
// VOICE CLUSTER: EMOTIONAL / CARING
// =============================================

export const EMOTIONAL_CLUSTER: string[] = [
    'voice_korean_worried_mom_female_01',  // Worried Korean Mom
    'voice_casual_us_female_01',           // Casual American Female
    'voice_middle_east_warrior_poet_male_01', // Warrior Poet (emotional intensity)
    'voice_indian_teacher_wise_male_01',   // Wise Teacher (nurturing)
];

// =============================================
// VOICE INTERPOLATION RULES
// =============================================

/**
 * Voice Interpolation allows emotional transitions WITHOUT losing voice identity.
 * 
 * SAFE INTERPOLATION BOUNDS:
 * - energy_level: ±20 from baseline
 * - speaking_rate: ±10 from baseline
 * - emotional_leakage: ±25 from baseline
 * - pause_frequency: ±15 from baseline
 * 
 * LOCKED (NEVER INTERPOLATE):
 * - pitch_baseline (identity anchor)
 * - accent_id (identity anchor)
 * - gender_id (identity anchor)
 * - age_band_id (identity anchor)
 * - social_register_id (identity anchor)
 */

export interface VoiceInterpolationBounds {
    energy_level: { min: number; max: number };
    speaking_rate: { min: number; max: number };
    emotional_leakage: { min: number; max: number };
    pause_frequency: { min: number; max: number };
    aggression_level: { min: number; max: number };
}

export function getInterpolationBounds(baseVector: F5VoiceVector): VoiceInterpolationBounds {
    return {
        energy_level: {
            min: Math.max(0, baseVector.energy_level - 20),
            max: Math.min(100, baseVector.energy_level + 20),
        },
        speaking_rate: {
            min: Math.max(70, baseVector.speaking_rate - 10),
            max: Math.min(130, baseVector.speaking_rate + 10),
        },
        emotional_leakage: {
            min: Math.max(0, baseVector.emotional_leakage - 25),
            max: Math.min(100, baseVector.emotional_leakage + 25),
        },
        pause_frequency: {
            min: Math.max(0, baseVector.pause_frequency - 15),
            max: Math.min(100, baseVector.pause_frequency + 15),
        },
        aggression_level: {
            min: Math.max(0, baseVector.aggression_level - 15),
            max: Math.min(100, baseVector.aggression_level + 15),
        },
    };
}

/**
 * Interpolate a voice for emotional context (angry, calm, excited, etc.)
 * without losing core identity.
 */
export function interpolateVoice(
    baseVector: F5VoiceVector,
    emotion: 'angry' | 'calm' | 'excited' | 'sad' | 'neutral'
): F5VoiceVector {
    const bounds = getInterpolationBounds(baseVector);
    const result = { ...baseVector };

    switch (emotion) {
        case 'angry':
            result.energy_level = Math.min(bounds.energy_level.max, baseVector.energy_level + 15);
            result.speaking_rate = Math.min(bounds.speaking_rate.max, baseVector.speaking_rate + 8);
            result.aggression_level = Math.min(bounds.aggression_level.max, baseVector.aggression_level + 10);
            result.emotional_leakage = Math.min(bounds.emotional_leakage.max, baseVector.emotional_leakage + 20);
            break;

        case 'calm':
            result.energy_level = Math.max(bounds.energy_level.min, baseVector.energy_level - 15);
            result.speaking_rate = Math.max(bounds.speaking_rate.min, baseVector.speaking_rate - 8);
            result.pause_frequency = Math.min(bounds.pause_frequency.max, baseVector.pause_frequency + 10);
            result.emotional_leakage = Math.max(bounds.emotional_leakage.min, baseVector.emotional_leakage - 15);
            break;

        case 'excited':
            result.energy_level = bounds.energy_level.max;
            result.speaking_rate = Math.min(bounds.speaking_rate.max, baseVector.speaking_rate + 10);
            result.emotional_leakage = Math.min(bounds.emotional_leakage.max, baseVector.emotional_leakage + 20);
            break;

        case 'sad':
            result.energy_level = bounds.energy_level.min;
            result.speaking_rate = Math.max(bounds.speaking_rate.min, baseVector.speaking_rate - 10);
            result.pause_frequency = Math.min(bounds.pause_frequency.max, baseVector.pause_frequency + 15);
            break;

        case 'neutral':
        default:
            // No changes, return base vector
            break;
    }

    return result;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

export function getVoicesByPack(packName: 'heroes' | 'villains' | 'discipline' | 'emotional'): string[] {
    switch (packName) {
        case 'heroes': return HEROES_PACK;
        case 'villains': return VILLAINS_PACK;
        case 'discipline': return DISCIPLINE_CLUSTER;
        case 'emotional': return EMOTIONAL_CLUSTER;
        default: return [];
    }
}

// Note: isVoiceVillainCapable and getVoiceVector are defined in the seed file
// to avoid circular imports. Import them from there if needed.

