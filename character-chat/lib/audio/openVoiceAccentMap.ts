/**
 * Character to OpenVoice Accent Mapping
 * 
 * OpenVoice V2 supports these accents:
 * - american (US English)
 * - british (UK English)
 * - indian (Indian English)
 * - south_african (South African English)
 * - australian (Australian English)
 * 
 * For accents not directly supported, we use the closest match:
 * - Scottish → British (closest UK accent)
 * - Kenyan → South African (closest African English)
 * - Russian → British (deliberate, formal English)
 * - Polish → British (European English)
 */

export const OPENVOICE_ACCENT_MAP: Record<string, {
    accent: string;
    speed: number;
    emotion?: string;
    notes: string;
}> = {
    // Marjorie - 75yo American woman, Arizona
    'marjorie': {
        accent: 'american',
        speed: 0.85, // Slower for elderly
        emotion: 'angry', // Entitled/demanding
        notes: 'American accent correct. Slower speed for elderly feel.'
    },

    // Rajiv - 42yo Indian-American
    'rajiv': {
        accent: 'indian', // TRUE Indian accent!
        speed: 1.1, // Fast, energetic
        emotion: 'happy', // Cheerful merchant
        notes: 'Indian accent directly supported!'
    },

    // Asha - 26yo Kenyan
    'asha': {
        accent: 'south_african', // Closest to Kenyan English
        speed: 1.0,
        emotion: 'neutral',
        notes: 'South African as closest to Kenyan English. Both are African English variants.'
    },

    // Dex - 33yo Puerto Rican-American, Bronx
    'dex': {
        accent: 'american',
        speed: 1.05,
        emotion: 'angry',
        notes: 'American base. NYC/Puerto Rican rhythms via speed/emotion.'
    },

    // Eamon - 25yo Scottish
    'eamon': {
        accent: 'british', // Closest to Scottish
        speed: 1.15, // Fast gamer energy
        emotion: 'excited',
        notes: 'British as closest to Scottish. UK English family.'
    },

    // Viktor - 57yo Russian
    'viktor': {
        accent: 'british', // Formal, deliberate English
        speed: 0.9, // Slow, deliberate
        emotion: 'neutral',
        notes: 'British for formal feel. Slow speed for Russian deliberate cadence.'
    },

    // Tomasz - 34yo Polish
    'tomasz': {
        accent: 'british', // European English
        speed: 0.95,
        emotion: 'neutral',
        notes: 'British for European English feel. Polish accent not supported.'
    },

    // Aaliyah - 28yo Atlanta
    'aaliyah': {
        accent: 'american',
        speed: 1.0,
        emotion: 'neutral',
        notes: 'American correct. Atlanta/Southern via style.'
    },
};

/**
 * Get OpenVoice accent config for a character
 */
export function getOpenVoiceAccent(characterId: string): {
    accent: string;
    speed: number;
    emotion?: string;
} | null {
    const config = OPENVOICE_ACCENT_MAP[characterId];
    if (!config) return null;

    return {
        accent: config.accent,
        speed: config.speed,
        emotion: config.emotion,
    };
}

/**
 * Log accent support summary
 */
export function logAccentSummary() {
    console.log('='.repeat(70));
    console.log('OPENVOICE V2 ACCENT MAPPING');
    console.log('='.repeat(70));

    for (const [id, config] of Object.entries(OPENVOICE_ACCENT_MAP)) {
        console.log(`\n${id}: ${config.accent}`);
        console.log(`  Speed: ${config.speed}, Emotion: ${config.emotion || 'none'}`);
        console.log(`  Notes: ${config.notes}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Direct accent support: American, British, Indian, South African');
    console.log('⚠️  Approximations: Scottish→British, Kenyan→South African, Russian→British (slow)');
    console.log('='.repeat(70));
}

// Log summary when imported
if (require.main === module) {
    logAccentSummary();
}
