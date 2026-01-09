/**
 * Voice Assets Registry
 * Voices are ASSETS - resources with defined acoustic properties
 */

export interface VoiceAsset {
    id: string;
    name: string;
    provider: 'gemini' | 'fish_audio' | 'eleven_labs' | 'kokoro';
    external_id?: string; // Provider-specific ID (e.g., Fish Audio voice ID)

    // Acoustic properties
    gender: 'male' | 'female' | 'neutral';
    age_range: [number, number]; // [min, max] years
    pitch_range_hz: [number, number]; // [min, max] Hz
    typical_tempo_bpm: number; // Words per minute baseline
    typical_rms: number; // Loudness baseline (0-1)

    // Capabilities
    can_whisper: boolean;
    can_shout: boolean;
    emotional_range: 'narrow' | 'medium' | 'wide';
    accent?: string;

    // Metadata
    tags: string[];
    description: string;
}

/**
 * Voice Asset Registry
 * All available voices with their acoustic profiles
 */
export const VOICE_REGISTRY: Record<string, VoiceAsset> = {
    // === Gemini Voices ===
    'gemini_charon': {
        id: 'gemini_charon',
        name: 'Charon',
        provider: 'gemini',
        gender: 'male',
        age_range: [45, 65],
        pitch_range_hz: [85, 140],
        typical_tempo_bpm: 85,
        typical_rms: 0.06,
        can_whisper: true,
        can_shout: false,
        emotional_range: 'narrow',
        tags: ['deep', 'authoritative', 'calm', 'wise'],
        description: 'Deep, authoritative male voice. Excellent for wise, controlled characters.',
    },
    'gemini_fenrir': {
        id: 'gemini_fenrir',
        name: 'Fenrir',
        provider: 'gemini',
        gender: 'male',
        age_range: [30, 50],
        pitch_range_hz: [90, 160],
        typical_tempo_bpm: 100,
        typical_rms: 0.08,
        can_whisper: false,
        can_shout: true,
        emotional_range: 'wide',
        tags: ['strong', 'commanding', 'energetic', 'warrior'],
        description: 'Strong, commanding male voice with good range for action characters.',
    },
    'gemini_puck': {
        id: 'gemini_puck',
        name: 'Puck',
        provider: 'gemini',
        gender: 'male',
        age_range: [20, 35],
        pitch_range_hz: [100, 180],
        typical_tempo_bpm: 120,
        typical_rms: 0.07,
        can_whisper: false,
        can_shout: true,
        emotional_range: 'wide',
        tags: ['energetic', 'expressive', 'comedic', 'animated'],
        description: 'Energetic, expressive male voice. Good for comedic or animated characters.',
    },
    'gemini_kore': {
        id: 'gemini_kore',
        name: 'Kore',
        provider: 'gemini',
        gender: 'neutral',
        age_range: [25, 40],
        pitch_range_hz: [150, 250],
        typical_tempo_bpm: 95,
        typical_rms: 0.06,
        can_whisper: true,
        can_shout: false,
        emotional_range: 'medium',
        tags: ['warm', 'friendly', 'calm', 'gentle'],
        description: 'Warm, friendly neutral voice. Versatile for many character types.',
    },
    'gemini_aoede': {
        id: 'gemini_aoede',
        name: 'Aoede',
        provider: 'gemini',
        gender: 'female',
        age_range: [25, 45],
        pitch_range_hz: [180, 280],
        typical_tempo_bpm: 100,
        typical_rms: 0.06,
        can_whisper: true,
        can_shout: true,
        emotional_range: 'wide',
        tags: ['professional', 'clear', 'articulate', 'expressive'],
        description: 'Professional, clear female voice with good emotional range.',
    },

    // === Sophisticated Villain Voices ===
    'villain_sophisticated': {
        id: 'villain_sophisticated',
        name: 'Sophisticated Villain',
        provider: 'gemini',
        gender: 'male',
        age_range: [40, 55],
        pitch_range_hz: [90, 130], // Narrow range - controlled
        typical_tempo_bpm: 90, // Slow, deliberate
        typical_rms: 0.05, // Quiet, menacing
        can_whisper: true,
        can_shout: false, // Never loses control
        emotional_range: 'narrow', // Always composed
        tags: ['controlled', 'menacing', 'intellectual', 'calm'],
        description: 'Ultra-controlled male voice for sophisticated villains. Never raises voice.',
    },

    // === Fish Audio Voices (examples) ===
    'fish_spongebob': {
        id: 'fish_spongebob',
        name: 'SpongeBob',
        provider: 'fish_audio',
        external_id: '54e3a85ac9594ffa83264b8a494b901b',
        gender: 'male',
        age_range: [8, 15],
        pitch_range_hz: [200, 400],
        typical_tempo_bpm: 130,
        typical_rms: 0.09,
        can_whisper: false,
        can_shout: true,
        emotional_range: 'wide',
        tags: ['cartoon', 'energetic', 'squeaky', 'enthusiastic'],
        description: 'High-pitched, enthusiastic cartoon voice.',
    },
};

/**
 * Get a voice asset by ID
 */
export function getVoiceAsset(id: string): VoiceAsset | undefined {
    return VOICE_REGISTRY[id];
}

/**
 * Find voices matching specific requirements
 */
export function findVoicesBySpec(requirements: {
    gender?: 'male' | 'female' | 'neutral';
    min_age?: number;
    max_age?: number;
    max_pitch_variance?: number;
    max_tempo_bpm?: number;
    max_rms?: number;
    required_tags?: string[];
    excluded_capabilities?: ('can_whisper' | 'can_shout')[];
}): VoiceAsset[] {
    return Object.values(VOICE_REGISTRY).filter(voice => {
        // Gender check
        if (requirements.gender && voice.gender !== requirements.gender && voice.gender !== 'neutral') {
            return false;
        }

        // Age range check
        if (requirements.min_age && voice.age_range[1] < requirements.min_age) {
            return false;
        }
        if (requirements.max_age && voice.age_range[0] > requirements.max_age) {
            return false;
        }

        // Pitch variance check (difference between min and max)
        if (requirements.max_pitch_variance) {
            const voicePitchVariance = voice.pitch_range_hz[1] - voice.pitch_range_hz[0];
            if (voicePitchVariance > requirements.max_pitch_variance) {
                return false;
            }
        }

        // Tempo check
        if (requirements.max_tempo_bpm && voice.typical_tempo_bpm > requirements.max_tempo_bpm) {
            return false;
        }

        // RMS (loudness) check
        if (requirements.max_rms && voice.typical_rms > requirements.max_rms) {
            return false;
        }

        // Required tags check
        if (requirements.required_tags) {
            const hasAllTags = requirements.required_tags.every(tag =>
                voice.tags.includes(tag)
            );
            if (!hasAllTags) {
                return false;
            }
        }

        // Excluded capabilities check (e.g., villain that can't shout)
        if (requirements.excluded_capabilities) {
            for (const cap of requirements.excluded_capabilities) {
                if (voice[cap]) {
                    return false;
                }
            }
        }

        return true;
    });
}

/**
 * Calculate compatibility score between a voice and requirements
 */
export function calculateVoiceCompatibility(
    voice: VoiceAsset,
    requirements: {
        gender: 'male' | 'female' | 'neutral';
        age_range: [number, number];
        pitch_range_hz: [number, number];
        max_pitch_variance: number;
        max_tempo_bpm: number;
        max_rms: number;
    }
): { score: number; issues: string[] } {
    let score = 100;
    const issues: string[] = [];

    // Gender mismatch
    if (requirements.gender !== 'neutral' && voice.gender !== requirements.gender && voice.gender !== 'neutral') {
        score -= 50;
        issues.push(`Gender mismatch: requires ${requirements.gender}, voice is ${voice.gender}`);
    }

    // Age range overlap
    const ageOverlap = Math.max(0,
        Math.min(voice.age_range[1], requirements.age_range[1]) -
        Math.max(voice.age_range[0], requirements.age_range[0])
    );
    if (ageOverlap === 0) {
        score -= 30;
        issues.push(`Age mismatch: requires ${requirements.age_range[0]}-${requirements.age_range[1]}, voice is ${voice.age_range[0]}-${voice.age_range[1]}`);
    }

    // Pitch range
    if (voice.pitch_range_hz[0] < requirements.pitch_range_hz[0] - 20 ||
        voice.pitch_range_hz[1] > requirements.pitch_range_hz[1] + 20) {
        score -= 15;
        issues.push(`Pitch range mismatch: requires ${requirements.pitch_range_hz[0]}-${requirements.pitch_range_hz[1]}Hz`);
    }

    // Pitch variance (control)
    const voicePitchVariance = voice.pitch_range_hz[1] - voice.pitch_range_hz[0];
    if (voicePitchVariance > requirements.max_pitch_variance) {
        score -= 20;
        issues.push(`Too much pitch variance: ${voicePitchVariance}Hz exceeds max ${requirements.max_pitch_variance}Hz`);
    }

    // Tempo
    if (voice.typical_tempo_bpm > requirements.max_tempo_bpm) {
        score -= 15;
        issues.push(`Tempo too fast: ${voice.typical_tempo_bpm}bpm exceeds max ${requirements.max_tempo_bpm}bpm`);
    }

    // RMS (loudness)
    if (voice.typical_rms > requirements.max_rms) {
        score -= 15;
        issues.push(`Too loud: RMS ${voice.typical_rms} exceeds max ${requirements.max_rms}`);
    }

    return { score: Math.max(0, score), issues };
}
