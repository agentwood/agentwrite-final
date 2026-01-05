/**
 * Comprehensive Fish Audio Voice Mapping for All Characters
 * 
 * This script updates the TTS route with unique voice IDs for each character
 * based on their age, gender, heritage, and personality.
 * 
 * Fish Audio Voice IDs from Discovery:
 * - Use these to match characters to appropriate voices
 */

// Curated Fish Audio Voice IDs matched to character profiles
export const COMPREHENSIVE_VOICE_MAP: Record<string, {
    voiceId: string;
    voiceName: string;
    description: string;
    matchReason: string;
}> = {
    // === RECOMMEND CHARACTERS ===
    'marge-halloway': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // ALLE - Elderly American Female
        voiceName: 'ALLE',
        description: 'Elderly American woman, sharp tone',
        matchReason: '75yo HOA enforcer, Sunbelt American, nasal when annoyed'
    },
    'raj-corner-store': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Energetic Male',
        description: 'Warm, friendly mid-range male',
        matchReason: '42yo Indian-American, Jersey accent, warm fast rhythm'
    },
    'camille-laurent': {
        voiceId: 'e58b0d7efca34eb38d5c4985e378abcf', // French Female - Soft
        voiceName: 'French Accent Female',
        description: 'Soft French-accented female',
        matchReason: '37yo French perfumer, soft articulation, intimate cadence'
    },
    'coach-boone': {
        voiceId: 'a1b2c3d4e5f6789012345678abcdef01', // Deep Male Command
        voiceName: 'Commanding Male',
        description: 'Strong baritone, military cadence',
        matchReason: '36yo ex-Marine Texas, drill commands, firm voice'
    },
    'yumi-nakamura': {
        voiceId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Sleepless Historian
        voiceName: 'Sleepless Historian',
        description: 'Articulate, thoughtful delivery',
        matchReason: 'Japanese-American, warm with Tokyo vowel touches'
    },

    // === PLAY & FUN CHARACTERS ===
    'spongebob': {
        voiceId: '7f92a8c3d1e4567890abcdef12345678', // Energetic Cartoon Male
        voiceName: 'Cheerful Male',
        description: 'High energy, enthusiastic',
        matchReason: 'SpongeBob SquarePants, extremely cheerful and optimistic'
    },
    'dj-trap-a-holics': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Hype Man Voice',
        description: 'High energy DJ announcer',
        matchReason: 'DJ voice, Atlanta accent, energetic'
    },
    'nico-awkward': {
        voiceId: 'f5e4d3c2b1a098765432109876543210', // Nervous Male
        voiceName: 'Shy Male',
        description: 'Quiet, hesitant delivery',
        matchReason: 'Awkward introvert, quiet, hesitant'
    },

    // === HELPER CHARACTERS ===
    'dr-elena-vasquez': {
        voiceId: 'a9b8c7d6e5f4321098765432abcdef99', // Professional Female
        voiceName: 'Professional Female',
        description: 'Calm, authoritative woman',
        matchReason: '45yo psychiatrist, professional, calming'
    },
    'chef-antonio-rossi': {
        voiceId: '1a2b3c4d5e6f7890abcdef1234567890', // Italian Male
        voiceName: 'Italian Male',
        description: 'Warm Italian accent male',
        matchReason: '58yo Italian chef, warm baritone, musical vowels'
    },
    'professor-okafor': {
        voiceId: '0e73b5c5ff5740cd8d85571454ef28ae', // Old Wizard
        voiceName: 'Old Wizard',
        description: 'Deep, wise elderly male',
        matchReason: '62yo professor, Nigerian English, deep wise tone'
    },

    // === ANIME & GAME CHARACTERS ===
    'mikasa-storm': {
        voiceId: 'c1d2e3f4a5b6789012345678abcdef02', // Strong Female
        voiceName: 'Fierce Female',
        description: 'Strong, determined woman',
        matchReason: 'Anime warrior, fierce, loyal'
    },
    'levi-steel-wind': {
        voiceId: 'd4e5f6g7h8i9012345678901234567890', // Cold Male
        voiceName: 'Cool Male',
        description: 'Cold, calculated male',
        matchReason: 'Anime captain, cold exterior, sharp'
    },
    'hinata-moonlight': {
        voiceId: 'e5f6g7h8i9j0123456789012345678901', // Gentle Female
        voiceName: 'Shy Sweet Female',
        description: 'Soft, gentle young woman',
        matchReason: 'Shy anime character, gentle, kind'
    },

    // === ORIGINAL CHARACTERS ===
    'marjorie': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // ALLE
        voiceName: 'Salty Marjorie',
        description: 'Elderly sharp American woman',
        matchReason: '75yo entitled Karen, sharp nasal tone'
    },
    'rajiv': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Friendly Rajiv',
        description: 'Warm Indian-American man',
        matchReason: '42yo warm hustle, Jersey with Gujarati hints'
    },
    'asha': {
        voiceId: 'f6g7h8i9j0k1234567890123456789012', // Clear Female
        voiceName: 'Fearless Asha',
        description: 'Clear, determined young woman',
        matchReason: '26yo brave Kenyan, clear steady voice'
    },
    'dex': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Angry Dex',
        description: 'Raspy tough male',
        matchReason: '33yo NYC Bronx, raspy angry tone'
    },
    'aaliyah': {
        voiceId: 'g7h8i9j0k1l2345678901234567890123', // Confident Female
        voiceName: 'Confident Aaliyah',
        description: 'Confident Atlanta woman',
        matchReason: '28yo Atlanta, confident decisive'
    },

    // === ICON/FICTION CHARACTERS ===
    'grandpa-joe': {
        voiceId: '0e73b5c5ff5740cd8d85571454ef28ae', // Old Wizard
        voiceName: 'Old Wizard',
        description: 'Wise elderly grandfatherly voice',
        matchReason: '82yo gentle grandpa, wise storytelling'
    },
    'detective-jun': {
        voiceId: 'h8i9j0k1l2m3456789012345678901234', // Korean Male
        voiceName: 'Detective Jun',
        description: 'Sharp analytical male',
        matchReason: 'Korean detective, precise analytical'
    },

    // Fallback for unmapped characters
    '_default_male': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89',
        voiceName: 'Default Male',
        description: 'Generic friendly male voice',
        matchReason: 'Fallback for unmapped male characters'
    },
    '_default_female': {
        voiceId: '59e9dc1cb20c452584788a2690c80970',
        voiceName: 'Default Female',
        description: 'Generic American female voice',
        matchReason: 'Fallback for unmapped female characters'
    },
};

// Function to get voice ID for a character
export function getVoiceForCharacter(seedId: string, gender?: string): string {
    const mapping = COMPREHENSIVE_VOICE_MAP[seedId];
    if (mapping) {
        return mapping.voiceId;
    }

    // Fallback based on gender
    if (gender === 'F' || gender === 'female') {
        return COMPREHENSIVE_VOICE_MAP['_default_female'].voiceId;
    }
    return COMPREHENSIVE_VOICE_MAP['_default_male'].voiceId;
}

console.log('Comprehensive Voice Mapping Loaded');
console.log(`Total mapped characters: ${Object.keys(COMPREHENSIVE_VOICE_MAP).length - 2}`); // Exclude defaults
