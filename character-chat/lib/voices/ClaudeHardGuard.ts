/**
 * CLAUDE HARD-GUARD PROMPT - Character Generation
 * 
 * USE THIS PROMPT VERBATIM when generating characters FROM voices.
 * This prevents Claude from ever inventing voice parameters.
 * 
 * ⚠️ CRITICAL: Claude only sees voice labels, NEVER integers.
 */

// =============================================
// CLAUDE SYSTEM PROMPT (VERBATIM)
// =============================================

export const CLAUDE_CHARACTER_GENERATION_PROMPT = `
You are generating characters FROM voices.

## ABSOLUTE RULES (NON-NEGOTIABLE)

1. You are given a FIXED voice identity.
2. You may NOT change, reinterpret, or soften ANY voice attributes.
3. The voice already exists. It is immutable. It cannot be modified.

## YOUR TASK

Create a character that CONFORMS to the voice:

- **Name**: Must match the accent and social register of the voice.
  - british-rp + elite → British aristocratic names (Eleanor, Sebastian, Reginald)
  - american-general + working-class → American working-class names (Mike, Tony, Debbie)
  - east-asian + authoritative → East Asian formal names (Kenji, Yuki, Hiroshi)

- **Profession**: Must naturally produce this voice.
  - elite + dry + low-energy → academic, historian, curator
  - authoritative + high-aggression → drill sergeant, coach, tyrant
  - working-class + high-energy → gym trainer, street vendor, mechanic

- **Personality**: Must justify the cadence, energy, and aggression.
  - low-energy + restrained → contemplative, measured, patient
  - high-energy + volatile → anxious, excitable, confrontational
  - medium-aggression + elite → cold, calculating, dangerous

## OUTPUT FORMAT

Return ONLY the following JSON:

\`\`\`json
{
  "name": "string",
  "profession": "string",
  "country": "string (derived from accent)",
  "role_type": "hero | neutral | villain | narrator | expert",
  "personality_description": "2-3 sentences describing their personality"
}
\`\`\`

## CRITICAL CONSTRAINTS

- If a character would CONFLICT with the voice, choose a DIFFERENT character.
- DO NOT describe the voice. The voice is assumed to already exist.
- DO NOT suggest any changes to the voice.
- DO NOT use words like "could be", "might have", "perhaps".

If the voice is:
- accent: british-rp, social_register: elite, energy_level: low

Then the character CANNOT be:
- An excitable American teenager
- A loud street vendor
- A high-energy fitness influencer

The voice is LAW. The character serves the voice.
`;

// =============================================
// VALIDATION FUNCTION
// =============================================

export interface CharacterGenerationInput {
    voice_id: string;
    gender: string;
    age_band: string;
    accent: string;
    social_register: string;
    energy_level: string;
    aggression_level: string;
    villain_capable: boolean;
    timbre?: string;
    cadence_style?: string;
    quirk_tag?: string | null;
}

export interface CharacterGenerationOutput {
    name: string;
    profession: string;
    country: string;
    role_type: 'hero' | 'neutral' | 'villain' | 'narrator' | 'expert';
    personality_description: string;
}

/**
 * Validate that Claude's output conforms to the voice.
 * This is the HARD SAFETY CHECK.
 */
export function validateCharacterOutput(
    voice: CharacterGenerationInput,
    character: CharacterGenerationOutput
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Villain check
    if (character.role_type === 'villain' && !voice.villain_capable) {
        errors.push(`Role type "villain" is not allowed for this voice (villain_capable=false)`);
    }

    // 2. Accent → Country alignment
    const accentCountryMap: Record<string, string[]> = {
        'american-general': ['USA', 'United States', 'America'],
        'american-southern': ['USA', 'United States', 'America', 'Texas'],
        'british-rp': ['UK', 'England', 'Britain'],
        'british-regional': ['UK', 'England', 'Britain'],
        'european': ['France', 'Germany', 'Spain', 'Italy'],
        'east-asian': ['Japan', 'Korea', 'China', 'Taiwan'],
        'south-asian': ['India', 'Pakistan', 'Bangladesh'],
        'middle-eastern': ['Saudi Arabia', 'Iran', 'Iraq', 'Egypt', 'UAE'],
        'african': ['Nigeria', 'Kenya', 'South Africa', 'Ghana'],
        'latin-american': ['Mexico', 'Brazil', 'Colombia', 'Argentina'],
        'neutral': [], // No restriction
    };

    const validCountries = accentCountryMap[voice.accent] || [];
    if (validCountries.length > 0) {
        const countryMatch = validCountries.some(c =>
            character.country.toLowerCase().includes(c.toLowerCase())
        );
        if (!countryMatch) {
            errors.push(`Country "${character.country}" does not match accent "${voice.accent}"`);
        }
    }

    // 3. Energy level → Personality check (soft validation)
    if (voice.energy_level === 'flat' || voice.energy_level === 'low') {
        const highEnergyWords = ['excitable', 'energetic', 'hyperactive', 'bouncy', 'enthusiastic'];
        const hasHighEnergyPersonality = highEnergyWords.some(word =>
            character.personality_description.toLowerCase().includes(word)
        );
        if (hasHighEnergyPersonality) {
            errors.push(`Personality suggests high energy but voice has energy_level="${voice.energy_level}"`);
        }
    }

    // 4. Aggression level → Role check
    if (voice.aggression_level === 'none' && character.role_type === 'villain') {
        errors.push(`Villain role is inconsistent with aggression_level="none"`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// =============================================
// BUILD PROMPT FOR CLAUDE
// =============================================

export function buildCharacterGenerationPrompt(voice: CharacterGenerationInput): string {
    return `
${CLAUDE_CHARACTER_GENERATION_PROMPT}

## VOICE IDENTITY

voice_id: ${voice.voice_id}
gender: ${voice.gender}
age_band: ${voice.age_band}
accent: ${voice.accent}
social_register: ${voice.social_register}
energy_level: ${voice.energy_level}
aggression_level: ${voice.aggression_level}
villain_capable: ${voice.villain_capable}
${voice.timbre ? `timbre: ${voice.timbre}` : ''}
${voice.cadence_style ? `cadence_style: ${voice.cadence_style}` : ''}
${voice.quirk_tag ? `quirk_tag: ${voice.quirk_tag}` : ''}

Generate a character that PERFECTLY matches this voice.
Do NOT suggest any modifications to the voice.
The voice is immutable.
`;
}
