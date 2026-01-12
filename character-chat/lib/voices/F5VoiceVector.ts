/**
 * F5VoiceVector v3 - Integer-Only Control Surface
 * 
 * CORE PRINCIPLE (NON-NEGOTIABLE):
 * Every voice must resolve to a fixed vector of numeric values.
 * No free text. No vibes. No "let the model infer".
 * If two voices differ semantically, they must differ numerically.
 * 
 * ⚠️ Rule: No two voices may share more than 80% identical integer values.
 */

// =============================================
// ENUM → INTEGER LOCKS (IMMUTABLE)
// These mappings are set ONCE and NEVER change.
// =============================================

export const ACCENT_ID: Record<string, number> = {
    'american-general': 1,
    'american-southern': 2,
    'british-rp': 3,
    'british-regional': 4,
    'european': 5,
    'neutral': 6,
    'irish': 7,
    'scottish': 8,
    'australian': 9,
    'other': 10,
    // Non-Western Accents (v2)
    'east-asian': 11,      // Japanese, Korean, Chinese
    'south-asian': 12,     // Indian, Pakistani, Bangladeshi
    'middle-eastern': 13,  // Arabic, Persian, Turkish
    'african': 14,         // Nigerian, Kenyan, South African, etc.
    'latin-american': 15,  // Mexican, Brazilian, Colombian, etc.
} as const;

export const SOCIAL_REGISTER_ID: Record<string, number> = {
    'working-class': 1,
    'neutral': 2,
    'educated': 3,
    'elite': 4,
    'authoritative': 5,
} as const;

export const GENDER_ID: Record<string, number> = {
    'male': 1,
    'female': 2,
} as const;

export const AGE_BAND_ID: Record<string, number> = {
    'young-adult': 1,
    'adult': 2,
    'middle-aged': 3,
    'elderly': 4,
} as const;

// =============================================
// F5 VOICE VECTOR (NUMERIC ONLY)
// This is the ONLY thing that touches F5-TTS.
// =============================================

export interface F5VoiceVector {
    // Identity
    voice_id: string;

    // Pitch & Prosody (Hz-mapped)
    pitch_baseline: number;       // 80–240 (Hz)
    pitch_variance: number;       // 0–100
    intonation_slope: number;     // -50 to +50 (negative = downward/authoritative)

    // Timing
    speaking_rate: number;        // 80–120 (percent of baseline)
    pause_frequency: number;      // 0–100 (how often pauses occur)
    pause_duration: number;       // 0–100 (how long pauses are)

    // Energy & Emotion
    energy_level: number;         // 0–100
    aggression_level: number;     // 0–100
    emotional_leakage: number;    // 0–100

    // Voice Texture
    breathiness: number;          // 0–100
    roughness: number;            // 0–100
    warmth: number;               // 0–100

    // Articulation & Rhythm
    articulation_precision: number; // 0–100 (82 = clipped academic, 40 = lazy casual)
    rhythm_variability: number;     // 0–100 (18 = steady, 75 = chaotic)
    cadence_control: number;        // 0–100 (90 = deliberate, 30 = uneven)

    // Accent & Register Anchors (INTEGER LOCKS)
    accent_id: number;              // From ACCENT_ID enum
    social_register_id: number;     // From SOCIAL_REGISTER_ID enum
    gender_id: number;              // From GENDER_ID enum
    age_band_id: number;            // From AGE_BAND_ID enum
}

// =============================================
// SIMILARITY CHECK (PREVENTS VOICE COLLAPSE)
// =============================================

/**
 * Calculate cosine similarity between two voice vectors
 * @returns Similarity score 0-1 (1 = identical)
 * 
 * NOTE: Categorical anchors have HIGH weights to ensure voices of different
 * genders/accents/ages are mathematically distinct even with similar prosody.
 */
export function calculateVoiceSimilarity(a: F5VoiceVector, b: F5VoiceVector): number {
    // Extract numeric values only (excluding voice_id string)
    // Categorical anchors get HEAVY weighting to prevent collapse
    const vectorA = [
        a.pitch_baseline, a.pitch_variance, a.intonation_slope,
        a.speaking_rate, a.pause_frequency, a.pause_duration,
        a.energy_level, a.aggression_level, a.emotional_leakage,
        a.breathiness, a.roughness, a.warmth,
        a.articulation_precision, a.rhythm_variability, a.cadence_control,
        // HEAVY WEIGHTS for categorical anchors (prevents collapse)
        a.accent_id * 50,           // Accent is critical
        a.social_register_id * 30,  // Social register matters
        a.gender_id * 200,          // Gender must ALWAYS separate (biggest weight)
        a.age_band_id * 40          // Age band matters
    ];

    const vectorB = [
        b.pitch_baseline, b.pitch_variance, b.intonation_slope,
        b.speaking_rate, b.pause_frequency, b.pause_duration,
        b.energy_level, b.aggression_level, b.emotional_leakage,
        b.breathiness, b.roughness, b.warmth,
        b.articulation_precision, b.rhythm_variability, b.cadence_control,
        b.accent_id * 50,
        b.social_register_id * 30,
        b.gender_id * 200,
        b.age_band_id * 40
    ];

    // Cosine similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        normA += vectorA[i] * vectorA[i];
        normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Validate a new voice doesn't collapse into existing voices
 * @throws Error if similarity > 0.8 with any existing voice
 */
export function validateVoiceUniqueness(
    newVoice: F5VoiceVector,
    existingVoices: F5VoiceVector[],
    threshold: number = 0.8
): void {
    for (const existing of existingVoices) {
        const similarity = calculateVoiceSimilarity(newVoice, existing);
        if (similarity > threshold) {
            throw new Error(
                `Voice ${newVoice.voice_id} is too similar to ${existing.voice_id} ` +
                `(similarity: ${(similarity * 100).toFixed(1)}% > ${threshold * 100}% threshold). ` +
                `Regenerate with different parameters.`
            );
        }
    }
}

// =============================================
// CONVERSION UTILITIES
// =============================================

import type { VoiceIdentity } from './VoiceIdentity';

/**
 * Convert VoiceIdentity (semantic) to F5VoiceVector (numeric)
 * This is the bridge between the human schema and the machine vector.
 */
export function voiceIdentityToF5Vector(voice: VoiceIdentity): F5VoiceVector {
    // Energy level mapping
    const energyMap: Record<string, number> = {
        'flat': 10, 'low': 25, 'moderate': 50, 'medium': 50, 'high': 80
    };

    // Aggression level mapping
    const aggressionMap: Record<string, number> = {
        'none': 0, 'low': 25, 'medium': 55, 'high': 85
    };

    // Pitch variance mapping
    const pitchVarianceMap: Record<string, number> = {
        'very-low': 5, 'low': 15, 'medium': 40, 'high': 70
    };

    // Emotional leakage mapping
    const leakageMap: Record<string, number> = {
        'none': 5, 'subtle': 25, 'noticeable': 60
    };

    // Breathiness mapping
    const breathinessMap: Record<string, number> = {
        'none': 5, 'slight': 30, 'breathy': 70
    };

    // Timbre → warmth/roughness
    const timbreWarmth: Record<string, number> = {
        'light': 45, 'neutral': 50, 'dark': 25, 'dry': 20, 'warm': 75, 'rough': 35
    };
    const timbreRoughness: Record<string, number> = {
        'light': 5, 'neutral': 15, 'dark': 30, 'dry': 20, 'warm': 10, 'rough': 70
    };

    // Articulation style mapping
    const articulationMap: Record<string, number> = {
        'clipped': 85, 'precise': 75, 'relaxed': 50, 'lazy': 30, 'over-enunciated': 90
    };

    // Cadence → control
    const cadenceMap: Record<string, number> = {
        'steady': 80, 'deliberate': 90, 'uneven': 35, 'dramatic': 60,
        'restrained': 95, 'controlled': 85, 'clipped': 88, 'flowing': 70, 'bouncing': 45
    };

    // Rhythm variability
    const rhythmMap: Record<string, number> = {
        'low': 20, 'medium': 50, 'high': 80
    };

    // Expressiveness → affects multiple params
    const expressMap: Record<string, number> = {
        'muted': 15, 'controlled': 35, 'expressive': 65, 'volatile': 85
    };

    // Confidence → intonation slope modifier
    const confidenceSlope: Record<string, number> = {
        'rock-solid': -20, 'steady': -10, 'wavering': 5, 'erratic': 15
    };

    return {
        voice_id: voice.voice_id,

        // Pitch & Prosody
        pitch_baseline: voice.pitch_baseline_hz,
        pitch_variance: pitchVarianceMap[voice.pitch_variance] || 30,
        intonation_slope: confidenceSlope[voice.confidence_stability] || -5,

        // Timing
        speaking_rate: Math.round(voice.speaking_rate * 100),
        pause_frequency: voice.cadence_style === 'deliberate' ? 65 :
            voice.cadence_style === 'restrained' ? 70 : 40,
        pause_duration: voice.energy_level === 'low' ? 60 :
            voice.energy_level === 'flat' ? 70 : 35,

        // Energy & Emotion
        energy_level: energyMap[voice.energy_level] || 50,
        aggression_level: aggressionMap[voice.aggression_level] || 0,
        emotional_leakage: leakageMap[voice.emotional_leakage] || 10,

        // Voice Texture
        breathiness: breathinessMap[voice.breathiness] || 10,
        roughness: timbreRoughness[voice.timbre] || 20,
        warmth: timbreWarmth[voice.timbre] || 50,

        // Articulation & Rhythm
        articulation_precision: articulationMap[voice.articulation_style] || 70,
        rhythm_variability: rhythmMap[voice.rhythm_variability] || 30,
        cadence_control: cadenceMap[voice.cadence_style] || 70,

        // Anchors (INTEGER LOCKS)
        accent_id: ACCENT_ID[voice.accent] || 6,
        social_register_id: SOCIAL_REGISTER_ID[voice.social_register] || 2,
        gender_id: GENDER_ID[voice.gender] || 1,
        age_band_id: AGE_BAND_ID[voice.age_band] || 2,
    };
}

/**
 * Get the numeric vector for F5-TTS from a voice_id
 * This is what the TTS route will call.
 */
export function getF5VectorForVoice(voice_id: string, voiceRegistry: Map<string, F5VoiceVector>): F5VoiceVector | null {
    return voiceRegistry.get(voice_id) || null;
}
