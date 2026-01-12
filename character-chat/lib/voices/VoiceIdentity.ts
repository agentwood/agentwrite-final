/**
 * VoiceIdentity v2 - Canonical Voice Schema (LOCKED)
 * 
 * RULE ZERO: Voices are first-class objects. Characters are derived artifacts.
 * Voices are NEVER retrofitted.
 * 
 * This is the ONLY object allowed to touch F5-TTS directly.
 * 
 * v2 adds "Talkie-grade" dimensions that prevent latent collapse:
 * - expressiveness_level
 * - emotional_leakage  
 * - rhythm_variability
 * - articulation_style
 * - confidence_stability
 * - breathiness
 * - quirk_tag (ONE max per voice)
 */

// === CORE ENUMS ===

export type Gender = 'male' | 'female';

export type AgeBand = 'young-adult' | 'adult' | 'middle-aged' | 'elderly';

export type Language = 'en' | 'en-gb' | 'en-us' | 'fr' | 'es';

export type Accent =
    | 'american-general'
    | 'american-southern'
    | 'british-rp'
    | 'british-regional'
    | 'irish'
    | 'scottish'
    | 'australian'
    | 'european'
    | 'neutral'
    | 'other';

export type SocialRegister = 'working-class' | 'neutral' | 'educated' | 'elite' | 'authoritative';

export type Timbre = 'light' | 'neutral' | 'dark' | 'dry' | 'warm' | 'rough';

export type EnergyLevel = 'flat' | 'low' | 'moderate' | 'medium' | 'high';

export type AggressionLevel = 'none' | 'low' | 'medium' | 'high';

export type PitchVariance = 'very-low' | 'low' | 'medium' | 'high';

export type CadenceStyle =
    | 'steady'
    | 'deliberate'
    | 'uneven'
    | 'dramatic'
    | 'restrained'
    | 'controlled'
    | 'clipped'
    | 'flowing'
    | 'bouncing';

// === v2 DIVERSITY ENUMS (Talkie-grade) ===

export type ExpressivenessLevel = 'muted' | 'controlled' | 'expressive' | 'volatile';

export type EmotionalLeakage = 'none' | 'subtle' | 'noticeable';

export type RhythmVariability = 'low' | 'medium' | 'high';

export type ArticulationStyle =
    | 'clipped'
    | 'precise'
    | 'relaxed'
    | 'lazy'
    | 'over-enunciated';

export type ConfidenceStability = 'rock-solid' | 'steady' | 'wavering' | 'erratic';

export type Breathiness = 'none' | 'slight' | 'breathy';

/**
 * VoiceIdentity v2 - The immutable voice definition
 * 
 * @property voice_id - Immutable, unique identifier (e.g., "voice_oxford_female_01")
 */
export interface VoiceIdentity {
    // === IDENTITY (IMMUTABLE) ===
    voice_id: string;

    // === DEMOGRAPHICS ===
    gender: Gender;
    age_band: AgeBand;

    // === LANGUAGE & ACCENT ===
    language: Language;
    accent: Accent;

    // === SOCIAL ===
    social_register: SocialRegister;

    // === TONAL CHARACTERISTICS ===
    timbre: Timbre;
    energy_level: EnergyLevel;
    aggression_level: AggressionLevel;

    // === TECHNICAL PARAMETERS ===
    speaking_rate: number;        // 0.80 – 1.20
    pitch_baseline_hz: number;    // Hz (e.g., 110 for deep male, 220 for high female)
    pitch_variance: PitchVariance;
    cadence_style: CadenceStyle;

    // === v2: TALKIE-GRADE DIVERSITY ===
    expressiveness_level: ExpressivenessLevel;
    emotional_leakage: EmotionalLeakage;
    rhythm_variability: RhythmVariability;
    articulation_style: ArticulationStyle;
    confidence_stability: ConfidenceStability;
    breathiness: Breathiness;
    quirk_tag: string | null;     // ONE max, e.g., "dry sarcasm", "nervous pauses"

    // === CAPABILITIES ===
    villain_capable: boolean;

    // === REFERENCE AUDIO ===
    reference_audio_path: string;
    reference_text?: string;

    // === METADATA ===
    display_name?: string;
    description?: string;
}

/**
 * CharacterRoleType - Derived from voice capabilities
 */
export type CharacterRoleType = 'hero' | 'neutral' | 'villain' | 'narrator' | 'expert';

/**
 * DerivedCharacter - Character generated FROM a voice
 * 
 * Characters NEVER override voice attributes.
 * If a character conflicts with a voice → character is wrong, not the voice.
 */
export interface DerivedCharacter {
    character_id: string;
    voice_id: string;           // Required, immutable link to VoiceIdentity

    name: string;
    country: string;            // Derived from voice accent
    profession: string;
    role_type: CharacterRoleType;

    personality_description: string; // 2-3 sentences
}

/**
 * Hard Validation Errors
 */
export class VoiceCharacterMismatchError extends Error {
    constructor(
        public field: string,
        public voiceValue: string,
        public characterValue: string
    ) {
        super(`Voice-Character Mismatch: ${field} - Voice has "${voiceValue}", Character has "${characterValue}"`);
        this.name = 'VoiceCharacterMismatchError';
    }
}

/**
 * Validate that a character conforms to its voice
 * 
 * @throws VoiceCharacterMismatchError if validation fails
 */
export function validateCharacterVoice(
    voice: VoiceIdentity,
    character: DerivedCharacter
): void {
    // Villain check
    if (character.role_type === 'villain' && !voice.villain_capable) {
        throw new VoiceCharacterMismatchError(
            'role_type',
            'villain_capable=false',
            'villain'
        );
    }

    // Accent → Country alignment
    const accentCountryMap: Record<Accent, string[]> = {
        'american-general': ['USA', 'United States', 'America'],
        'american-southern': ['USA', 'United States', 'America', 'Texas', 'Georgia'],
        'british-rp': ['UK', 'England', 'Britain'],
        'british-regional': ['UK', 'England', 'Britain', 'Manchester', 'Liverpool'],
        'irish': ['Ireland', 'Dublin'],
        'scottish': ['Scotland', 'UK'],
        'australian': ['Australia'],
        'european': ['France', 'Germany', 'Spain', 'Italy', 'Europe'],
        'neutral': [],
        'other': [],
    };

    const validCountries = accentCountryMap[voice.accent] || [];
    if (validCountries.length > 0 && !validCountries.some(c =>
        character.country.toLowerCase().includes(c.toLowerCase())
    )) {
        console.warn(
            `[Voice Validation] Accent-Country mismatch: Voice accent is "${voice.accent}" but character country is "${character.country}"`
        );
    }
}
