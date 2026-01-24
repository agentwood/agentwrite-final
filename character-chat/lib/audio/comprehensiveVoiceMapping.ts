/**
 * Comprehensive Fish Audio Voice Mapping for All Characters
 * 
 * SECURITY NOTE: Real Voice IDs are loaded from environment variables.
 * NO HARDCODED IDS ALLOWED.
 */

// Helper to get voice ID securely
const getVoiceId = (envKey: string) => {
    const val = process.env[envKey];
    if (!val) {
        console.warn(`[VoiceSecurity] Missing environment variable: ${envKey}`);
        return 'MISSING_ENV_VAR';
    }
    return val;
};

// Curated Fish Audio Voice IDs matched to character profiles
export const COMPREHENSIVE_VOICE_MAP: Record<string, {
    voiceId: string;
    voiceName: string;
    description: string;
    matchReason: string;
}> = {
    // === RECOMMEND CHARACTERS ===
    'marge-halloway': {
        voiceId: getVoiceId('VOICE_ID_ALLE_ELDERLY'),
        voiceName: 'ALLE',
        description: 'Elderly American woman, sharp tone',
        matchReason: '75yo HOA enforcer, Sunbelt American, nasal when annoyed'
    },
    'raj-corner-store': {
        voiceId: getVoiceId('VOICE_ID_ENERGETIC_MALE'),
        voiceName: 'Energetic Male',
        description: 'Warm, friendly mid-range male',
        matchReason: '42yo Indian-American, Jersey accent, warm fast rhythm'
    },
    'camille-laurent': {
        voiceId: getVoiceId('VOICE_ID_FRENCH_FEMALE_SOFT'),
        voiceName: 'French Accent Female',
        description: 'Soft French-accented female',
        matchReason: '37yo French perfumer, soft articulation, intimate cadence'
    },
    'coach-boone': {
        voiceId: getVoiceId('VOICE_ID_COMMANDING_MALE'),
        voiceName: 'Commanding Male',
        description: 'Strong baritone, military cadence',
        matchReason: '36yo ex-Marine Texas, drill commands, firm voice'
    },
    'yumi-nakamura': {
        voiceId: getVoiceId('VOICE_ID_SLEEPLESS_HISTORIAN'),
        voiceName: 'Sleepless Historian',
        description: 'Articulate, thoughtful delivery',
        matchReason: 'Japanese-American, warm with Tokyo vowel touches'
    },
    'spongebob': {
        voiceId: getVoiceId('VOICE_ID_SPONGEBOB'),
        voiceName: 'Cheerful Male',
        description: 'High energy, enthusiastic',
        matchReason: 'SpongeBob SquarePants, extremely cheerful and optimistic'
    },
    'trap-a-holics': {
        voiceId: getVoiceId('VOICE_ID_DJ_TRAP'),
        voiceName: 'Hype Man Voice',
        description: 'High energy DJ announcer',
        matchReason: 'DJ voice, Atlanta accent, energetic'
    },
    'nico-awkward': {
        voiceId: getVoiceId('VOICE_ID_NICO_AWKWARD'),
        voiceName: 'Shy Male',
        description: 'Quiet, hesitant delivery',
        matchReason: 'Awkward introvert, quiet, hesitant'
    },

    // Default/Fallbacks
    '_default_male': {
        voiceId: getVoiceId('VOICE_ID_DEFAULT_MALE'),
        voiceName: 'Default Male',
        description: 'Generic friendly male voice',
        matchReason: 'Fallback for unmapped male characters'
    },
    '_default_female': {
        voiceId: getVoiceId('VOICE_ID_DEFAULT_FEMALE'),
        voiceName: 'Default Female',
        description: 'Generic American female voice',
        matchReason: 'Fallback for unmapped female characters'
    },
};

export function getVoiceForCharacter(seedId: string, gender?: string): string {
    const mapping = COMPREHENSIVE_VOICE_MAP[seedId];
    if (mapping) {
        return mapping.voiceId;
    }
    if (gender === 'F' || gender === 'female') {
        const fallback = COMPREHENSIVE_VOICE_MAP['_default_female'];
        return fallback ? fallback.voiceId : 'MISSING_VOICE_ID';
    }
    const fallbackMale = COMPREHENSIVE_VOICE_MAP['_default_male'];
    return fallbackMale ? fallbackMale.voiceId : 'MISSING_VOICE_ID';
}

console.log('Secure Voice Mapping Loaded');
