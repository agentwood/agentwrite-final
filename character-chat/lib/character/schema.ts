/**
 * FORMAL CHARACTER SCHEMA v1.0
 * 
 * Authoritative specification for Antigravity character system.
 * All downstream systems (LLM, TTS, UI) derive from this schema.
 * 
 * HARD RULES:
 * - speaking_pace must differ by ≥ 0.05 between characters
 * - No two characters may share all of: pitch_range + pace + cadence
 * - tts_spec_string must be derivable exactly from structured fields
 * - No real person names allowed anywhere
 */

// ============================================
// ENUMS (Locked, No Ambiguity)
// ============================================

export type Gender = 'male' | 'female';

export type PitchRange = 'low' | 'mid-low' | 'mid' | 'mid-high' | 'high';

export type AggressionLevel = 'none' | 'very-low' | 'low' | 'medium-low' | 'medium' | 'high';

export type DictionStyle = 'casual' | 'neutral' | 'crisp' | 'formal' | 'polished' | 'expressive';

export type CadenceStyle = 'flat' | 'steady' | 'controlled' | 'uneven' | 'dramatic' | 'restrained' | 'balanced' | 'consistent' | 'loose';

// ============================================
// VOICE PROFILE (Engine-Agnostic)
// ============================================

export interface VoiceProfile {
    voice_gender: Gender;
    pitch_range: PitchRange;
    tone_style: string;           // Descriptive but constrained (e.g., "warm, clinical, reassuring")
    speaking_pace: number;        // Range: 0.80 – 1.20
    aggression_level: AggressionLevel;
    diction_style: DictionStyle;
    cadence_style: CadenceStyle;
    tts_spec_string: string;      // Single-line, engine-facing (auto-generated)
}

// ============================================
// CHARACTER (Canonical Record)
// ============================================

export interface Character {
    character_id: string;         // Unique, stable (e.g., "doctor_male_us_01")
    display_name: string;         // User-facing name
    gender: Gender;
    country: string;              // ISO-style or descriptive (e.g., "United States", "France")
    role: string;                 // Primary occupation/function
    archetype_basis: string;      // Reference archetype (e.g., "Average American medical drama physician")

    description: string;          // 1–2 sentences, non-voice, who they are
    personality_voice_blurb: string; // EXACTLY 3 sentences describing voice personality

    voice_profile: VoiceProfile;
}

// ============================================
// TTS SPEC STRING GENERATOR
// ============================================

export function generateTTSSpecString(vp: VoiceProfile): string {
    const genderStr = vp.voice_gender === 'male' ? 'Male voice' : 'Female voice';
    const pitchStr = `${vp.pitch_range} pitch`;
    const toneStr = `${vp.tone_style} tone`;
    const paceStr = `pace ${vp.speaking_pace.toFixed(2)}x`;

    const aggressionMap: Record<AggressionLevel, string> = {
        'none': 'no aggression',
        'very-low': 'very low aggression',
        'low': 'low aggression',
        'medium-low': 'medium-low aggression',
        'medium': 'medium aggression',
        'high': 'high aggression'
    };
    const aggrStr = aggressionMap[vp.aggression_level];

    const dictionStr = `${vp.diction_style} diction`;
    const cadenceStr = `${vp.cadence_style} cadence`;

    return `${genderStr}; ${pitchStr}; ${toneStr}; ${paceStr}; ${aggrStr}; ${dictionStr}; ${cadenceStr}`;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function validateCharacter(char: Character): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Rule: character_id must exist and be non-empty
    if (!char.character_id || char.character_id.trim() === '') {
        errors.push('character_id is required');
    }

    // Rule: speaking_pace must be in range [0.80, 1.20]
    if (char.voice_profile.speaking_pace < 0.80 || char.voice_profile.speaking_pace > 1.20) {
        errors.push(`speaking_pace ${char.voice_profile.speaking_pace} out of range [0.80, 1.20]`);
    }

    // Rule: personality_voice_blurb must be exactly 3 sentences
    const sentences = char.personality_voice_blurb.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length !== 3) {
        errors.push(`personality_voice_blurb must be exactly 3 sentences (found ${sentences.length})`);
    }

    // Rule: tts_spec_string must contain required components
    const spec = char.voice_profile.tts_spec_string.toLowerCase();
    const requiredComponents = ['pitch', 'tone', 'pace', 'aggression', 'diction', 'cadence'];
    for (const comp of requiredComponents) {
        if (!spec.includes(comp)) {
            errors.push(`tts_spec_string missing required component: ${comp}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

export function generateVoiceHash(vp: VoiceProfile): string {
    return `${vp.pitch_range}|${vp.speaking_pace.toFixed(2)}|${vp.cadence_style}`;
}

export function checkCollision(newChar: Character, existingChars: Character[]): Character | null {
    const newHash = generateVoiceHash(newChar.voice_profile);

    for (const existing of existingChars) {
        const existingHash = generateVoiceHash(existing.voice_profile);
        if (newHash === existingHash && existing.character_id !== newChar.character_id) {
            return existing;
        }
    }

    return null;
}

// ============================================
// PACE COLLISION CHECK
// ============================================

export function checkPaceCollision(newPace: number, existingChars: Character[]): boolean {
    const MIN_PACE_DIFF = 0.05;

    for (const existing of existingChars) {
        const diff = Math.abs(newPace - existing.voice_profile.speaking_pace);
        if (diff < MIN_PACE_DIFF) {
            return true; // Collision
        }
    }

    return false;
}
