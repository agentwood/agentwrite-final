/**
 * Supertonic Voice Mapping
 * 
 * Maps our Elite Voice Pool seeds to Supertonic's built-in voice presets.
 * Supertonic v2 has 10 presets: M1-M5 (male) and F1-F5 (female)
 */

export const SUPERTONIC_VOICE_MAP: Record<string, string> = {
    // Male voices -> M1-M5
    'Movetrailer': 'M1',      // Deep narrator
    'VeterenSoldier': 'M2',   // Authoritative
    'WiseSage': 'M3',         // Elderly wise
    'Professor': 'M4',        // Academic
    'Youtuber': 'M5',         // Energetic
    'Coach': 'M2',            // Intense motivator
    'Cockney': 'M1',          // British accent
    'Australian': 'M2',       // Australian
    'Indian': 'M4',           // Indian accent
    'WestAfrican': 'M3',      // West African
    'SouthAfrican': 'M2',     // South African
    'AfricanAmerican': 'M1',  // Smooth male
    'Villain': 'M3',          // Sinister
    'Snob': 'M4',             // Posh British
    'Meditative': 'M3',       // Calm
    'Male ASMR': 'M3',        // Soft
    'Coward': 'M5',           // Nervous
    'Nasal': 'M4',            // Nerdy

    // Female voices -> F1-F5
    'FemmeFatale': 'F1',      // Seductive
    'Headmistress': 'F2',     // Authoritative
    'Healer': 'F3',           // Compassionate
    'Grandma': 'F4',          // Elderly warm
    'Bubbly': 'F5',           // Cheerful
    'Raspy': 'F1',            // Edgy
    'Intimate': 'F3',         // ASMR
    'Etheral': 'F2',          // AI-like
    'Valley': 'F5',           // Valley girl
    'French': 'F4',           // French accent
    'Scandanavian': 'F2',     // Nordic
};

/**
 * Get the Supertonic voice preset for a given voice seed name
 */
export function getSupertonicVoice(voiceSeedName: string): string {
    return SUPERTONIC_VOICE_MAP[voiceSeedName] || 'M1'; // Default to M1
}

/**
 * Get the full path to a Supertonic voice style JSON
 */
export function getSupertonicVoicePath(voiceSeedName: string): string {
    const preset = getSupertonicVoice(voiceSeedName);
    return `/models/supertonic/voice_styles/${preset}.json`;
}
