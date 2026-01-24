/**
 * Voice Matcher - Auto-matches characters to appropriate voices
 * 
 * This module analyzes character descriptions, categories, and personalities
 * to find the best matching voice from the voice pool.
 * 
 * HARDCODED into codebase - persists across devices/sessions
 */

import voicePool from './voice_pool.json';

interface VoicePoolEntry {
    file: string;
    gender: string;
    age: string;
    tone: string;
    energy: string;
    accent: string;
    category: string;
    tags: string[];
    suitable_for: string[];
    description: string;
}

interface CharacterInput {
    name: string;
    description?: string;
    personality?: string;
    category?: string;
    gender?: string;
}

// Tone keywords mapped to voice attributes
const TONE_KEYWORDS = {
    angry: { energy: ['intense', 'threatening', 'loud'], tone: ['gravelly', 'cold', 'rough'] },
    calm: { energy: ['calm', 'zen', 'gentle'], tone: ['warm', 'soft', 'breathy'] },
    energetic: { energy: ['hyper', 'optimistic', 'loud'], tone: ['bright'] },
    romantic: { energy: ['seductive', 'close'], tone: ['smoky', 'whisper', 'soft'] },
    wise: { energy: ['calm', 'academic'], tone: ['warm', 'precise'] },
    scary: { energy: ['threatening', 'otherworldly'], tone: ['cold', 'breathy'] },
    funny: { energy: ['optimistic', 'casual'], tone: ['bright', 'nasal'] },
    professional: { energy: ['professional', 'academic'], tone: ['clear', 'precise'] },
    mysterious: { energy: ['otherworldly', 'seductive'], tone: ['smoky', 'breathy'] },
    aggressive: { energy: ['intense', 'loud', 'street'], tone: ['gravelly', 'rough', 'raspy'] },
};

// Category to voice matching
const CATEGORY_VOICE_MAP: Record<string, string[]> = {
    romance: ['FemmeFatale', 'Intimate', 'French', 'Bubbly'],
    horror: ['Villain', 'Etheral', 'Coward'],
    comedy: ['Youtuber', 'Bubbly', 'Cockney', 'Nasal', 'Valley'],
    adventure: ['VeterenSoldier', 'Australian', 'SouthAfrican', 'Coach'],
    fantasy: ['Movetrailer', 'WiseSage', 'Etheral', 'Headmistress'],
    educational: ['Professor', 'Indian', 'WiseSage'],
    support: ['Healer', 'Grandma', 'Meditative', 'Male ASMR'],
    wellness: ['Healer', 'Meditative', 'Male ASMR'],
    villain: ['Villain', 'FemmeFatale', 'Snob'],
    military: ['VeterenSoldier', 'Coach'],
    fiction: ['Movetrailer', 'Headmistress', 'Snob'],
    motivation: ['Coach', 'WestAfrican', 'AfricanAmerican'],
    mystery: ['FemmeFatale', 'Villain', 'Etheral'],
    technology: ['Professor', 'Indian', 'Nasal'],
};

/**
 * Extract tone keywords from text
 */
function extractToneKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    const foundTones: string[] = [];

    for (const tone of Object.keys(TONE_KEYWORDS)) {
        if (lowerText.includes(tone)) {
            foundTones.push(tone);
        }
    }

    // Additional keyword detection
    if (lowerText.includes('strict') || lowerText.includes('stern')) foundTones.push('angry');
    if (lowerText.includes('gentle') || lowerText.includes('soothing')) foundTones.push('calm');
    if (lowerText.includes('bubbly') || lowerText.includes('cheerful')) foundTones.push('energetic');
    if (lowerText.includes('seductive') || lowerText.includes('flirty')) foundTones.push('romantic');
    if (lowerText.includes('elder') || lowerText.includes('mentor')) foundTones.push('wise');
    if (lowerText.includes('creepy') || lowerText.includes('dark')) foundTones.push('scary');
    if (lowerText.includes('hilarious') || lowerText.includes('silly')) foundTones.push('funny');

    return [...new Set(foundTones)];
}

/**
 * Score a voice against character requirements
 */
function scoreVoice(
    voiceName: string,
    voice: VoicePoolEntry,
    character: CharacterInput,
    toneKeywords: string[]
): number {
    let score = 0;

    // Gender matching (high priority)
    if (character.gender) {
        const charGender = character.gender.toLowerCase();
        if (voice.gender === charGender) score += 50;
        else if (voice.gender !== charGender && charGender !== 'neutral') score -= 30;
    }

    // Category matching
    if (character.category) {
        const categoryVoices = CATEGORY_VOICE_MAP[character.category.toLowerCase()];
        if (categoryVoices?.includes(voiceName)) score += 40;
    }

    // Tone keyword matching
    for (const tone of toneKeywords) {
        const toneAttrs = TONE_KEYWORDS[tone as keyof typeof TONE_KEYWORDS];
        if (toneAttrs) {
            if (toneAttrs.energy.includes(voice.energy)) score += 20;
            if (toneAttrs.tone.includes(voice.tone)) score += 20;
        }
    }

    // Suitable_for matching
    const combinedText = `${character.name} ${character.description || ''} ${character.personality || ''}`.toLowerCase();
    for (const suitableFor of voice.suitable_for) {
        if (combinedText.includes(suitableFor.toLowerCase())) score += 25;
    }

    // Tag matching
    for (const tag of voice.tags) {
        if (combinedText.includes(tag.toLowerCase())) score += 15;
    }

    return score;
}

/**
 * Main function: Match character to best voice
 */
export function matchVoiceToCharacter(character: CharacterInput): string {
    const combinedText = `${character.description || ''} ${character.personality || ''}`;
    const toneKeywords = extractToneKeywords(combinedText);

    let bestVoice = 'WiseSage'; // Default fallback
    let bestScore = -Infinity;

    for (const [voiceName, voiceData] of Object.entries(voicePool)) {
        const score = scoreVoice(voiceName, voiceData as VoicePoolEntry, character, toneKeywords);

        if (score > bestScore) {
            bestScore = score;
            bestVoice = voiceName;
        }
    }

    return bestVoice;
}

/**
 * Get tone modifiers for TTS based on persona description
 */
export function getToneModifiers(personaDescription: string): {
    speed: number;
    pitch?: number;
    aggression?: number;
    energy?: number;
} {
    const text = personaDescription.toLowerCase();
    const modifiers: { speed: number; pitch?: number; aggression?: number; energy?: number } = {
        speed: 1.0,
    };

    // Angry/aggressive
    if (text.includes('angry') || text.includes('aggressive') || text.includes('furious')) {
        modifiers.speed = 1.1;
        modifiers.aggression = 0.7;
    }

    // Calm/relaxed
    if (text.includes('calm') || text.includes('relaxed') || text.includes('soothing')) {
        modifiers.speed = 0.9;
        modifiers.energy = 0.3;
    }

    // Energetic/excited
    if (text.includes('energetic') || text.includes('excited') || text.includes('hyper')) {
        modifiers.speed = 1.2;
        modifiers.energy = 0.9;
    }

    // Sad/melancholy
    if (text.includes('sad') || text.includes('melancholy') || text.includes('depressed')) {
        modifiers.speed = 0.85;
        modifiers.energy = 0.2;
    }

    return modifiers;
}

/**
 * Get all available voices for Create Character mode
 * Dynamically loads from voice_pool.json
 */
export function getAvailableVoices(): Array<{
    id: string;
    name: string;
    gender: string;
    preview: string;
    category: string;
}> {
    return Object.entries(voicePool).map(([id, voice]) => ({
        id,
        name: formatVoiceName(id),
        gender: capitalizeFirst((voice as VoicePoolEntry).gender),
        preview: (voice as VoicePoolEntry).description.slice(0, 40) + '...',
        category: (voice as VoicePoolEntry).category,
    }));
}

function formatVoiceName(id: string): string {
    // Convert camelCase/PascalCase to readable
    return id
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
