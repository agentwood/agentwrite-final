/**
 * Voice Inference Service
 * 
 * Automatically infers the best VoiceIdentity for a character based on:
 * 1. Name patterns (Eleanor = older British/American woman)
 * 2. Location mentions (Oxford = British)
 * 3. Gendered terms (hype MAN = male)
 * 4. Cultural context (trap = hip hop = young urban)
 * 5. Archetype/Role (villain, coach, professor)
 */

import { PrismaClient, VoiceIdentity } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================
// NAME PATTERNS → Gender + Age + Culture
// =============================================
const NAME_PATTERNS: Record<string, { gender?: string; age?: string; culture?: string }> = {
    // British/American older female names
    'eleanor': { gender: 'female', age: 'middle-aged', culture: 'british' },
    'margaret': { gender: 'female', age: 'elderly', culture: 'british' },
    'elizabeth': { gender: 'female', age: 'middle-aged', culture: 'british' },
    'dorothy': { gender: 'female', age: 'elderly', culture: 'british' },
    'victoria': { gender: 'female', age: 'middle-aged', culture: 'british' },
    'charlotte': { gender: 'female', age: 'middle-aged', culture: 'british' },

    // American names
    'jessica': { gender: 'female', age: 'young-adult', culture: 'american' },
    'sarah': { gender: 'female', age: 'adult', culture: 'american' },
    'mike': { gender: 'male', age: 'young-adult', culture: 'american' },
    'mikey': { gender: 'male', age: 'young-adult', culture: 'american' },
    'tyler': { gender: 'male', age: 'young-adult', culture: 'american' },

    // African names
    'kofi': { gender: 'male', age: 'adult', culture: 'african' },
    'kwame': { gender: 'male', age: 'adult', culture: 'african' },
    'adaze': { gender: 'female', age: 'adult', culture: 'african' },
    'amara': { gender: 'female', age: 'adult', culture: 'african' },

    // Asian names
    'kenji': { gender: 'male', age: 'adult', culture: 'japanese' },
    'yuki': { gender: 'female', age: 'adult', culture: 'japanese' },
    'tanaka': { gender: 'male', age: 'adult', culture: 'japanese' },
    'park': { gender: 'neutral', age: 'adult', culture: 'korean' },
    'choi': { gender: 'male', age: 'adult', culture: 'korean' },

    // Indian names
    'priya': { gender: 'female', age: 'adult', culture: 'indian' },
    'rao': { gender: 'male', age: 'middle-aged', culture: 'indian' },
    'sharma': { gender: 'male', age: 'middle-aged', culture: 'indian' },

    // Latin names
    'carlos': { gender: 'male', age: 'adult', culture: 'latin' },
    'sofia': { gender: 'female', age: 'adult', culture: 'latin' },
    'isabella': { gender: 'female', age: 'adult', culture: 'latin' },

    // Middle Eastern names
    'hakim': { gender: 'male', age: 'middle-aged', culture: 'middle-eastern' },
    'zayn': { gender: 'male', age: 'adult', culture: 'middle-eastern' },
    'omar': { gender: 'male', age: 'adult', culture: 'middle-eastern' },

    // European names
    'elara': { gender: 'female', age: 'adult', culture: 'european' },
    'lucien': { gender: 'male', age: 'adult', culture: 'european' },
    'vestra': { gender: 'female', age: 'adult', culture: 'european' },
};

// =============================================
// LOCATION → Culture (Use word boundaries!)
// =============================================
const LOCATION_KEYWORDS: Record<string, string> = {
    'oxford': 'british',
    'cambridge': 'british',
    'london': 'british',
    'england': 'british',
    'british': 'british',
    '\\buk\\b': 'british',
    'new york': 'american',
    'los angeles': 'american',
    'california': 'american',
    'american': 'american',
    'atlanta': 'american',
    'ghana': 'african',
    'nigeria': 'african',
    'african': 'african',
    'west africa': 'african',
    'tokyo': 'japanese',
    'japan': 'japanese',
    'japanese': 'japanese',
    'korea': 'korean',
    'korean': 'korean',
    'seoul': 'korean',
    '\\bindia\\b': 'indian',
    'indian': 'indian',
    'mumbai': 'indian',
    'mexico': 'latin',
    'brazil': 'latin',
    'latin ': 'latin',
    'spanish': 'latin',
    'middle east': 'middle-eastern',
    'arab': 'middle-eastern',
    'dubai': 'middle-eastern',
    'paris': 'european',
    'france': 'european',
    'french': 'european',
    'german': 'european',
    'berlin': 'european',
    'european': 'european',
};

// =============================================
// GENDERED TERMS → Gender
// =============================================
const GENDER_TERMS = {
    male: ['man', 'he', 'his', 'him', 'male', 'gentleman', 'sir', 'mr', 'boy', 'guy', 'dude', 'bro', 'king', 'father', 'dad', 'son', 'brother', 'coach', 'sergeant', 'general', 'professor', 'dr.'],
    female: ['woman', 'she', 'her', 'female', 'lady', 'miss', 'mrs', 'ms', 'girl', 'queen', 'mother', 'mom', 'daughter', 'sister', 'countess', 'empress']
};

// =============================================
// CULTURAL/ARCHETYPE KEYWORDS → Voice Style
// =============================================
const ARCHETYPE_KEYWORDS: Record<string, { energy?: string; accent?: string; age?: string }> = {
    // Hip Hop / Urban
    'trap': { energy: 'high', accent: 'american', age: 'young-adult' },
    'hype': { energy: 'high', accent: 'american', age: 'young-adult' },
    'dj': { energy: 'high', accent: 'american', age: 'young-adult' },
    'hip hop': { energy: 'high', accent: 'american', age: 'young-adult' },
    'rapper': { energy: 'high', accent: 'american', age: 'young-adult' },
    'urban': { energy: 'high', accent: 'american', age: 'young-adult' },

    // Academic
    'professor': { energy: 'low', accent: 'neutral', age: 'middle-aged' },
    'historian': { energy: 'low', accent: 'neutral', age: 'middle-aged' },
    'academic': { energy: 'low', accent: 'neutral', age: 'middle-aged' },
    'scholar': { energy: 'low', accent: 'neutral', age: 'middle-aged' },
    'philosopher': { energy: 'low', accent: 'european', age: 'middle-aged' },

    // Villain
    'villain': { energy: 'low', accent: 'neutral', age: 'adult' },
    'evil': { energy: 'low', accent: 'neutral', age: 'adult' },
    'mastermind': { energy: 'low', accent: 'neutral', age: 'adult' },
    'psychopath': { energy: 'low', accent: 'neutral', age: 'adult' },

    // Coach / Motivational
    'coach': { energy: 'high', accent: 'neutral', age: 'adult' },
    'motivational': { energy: 'high', accent: 'neutral', age: 'adult' },
    'trainer': { energy: 'high', accent: 'neutral', age: 'adult' },
    'gym': { energy: 'high', accent: 'neutral', age: 'adult' },

    // Military
    'sergeant': { energy: 'high', accent: 'neutral', age: 'middle-aged' },
    'general': { energy: 'medium', accent: 'neutral', age: 'middle-aged' },
    'military': { energy: 'medium', accent: 'neutral', age: 'adult' },
    'drill': { energy: 'high', accent: 'neutral', age: 'middle-aged' },
};

// =============================================
// MAIN INFERENCE FUNCTION
// =============================================

export interface CharacterMetadata {
    name: string;
    description?: string;
    tagline?: string;
    archetype?: string;
    category?: string;
    heritage?: string;
}

export interface InferredVoice {
    gender: 'male' | 'female';
    age: 'young-adult' | 'adult' | 'middle-aged' | 'elderly';
    accent: string;
    energy: 'low' | 'medium' | 'high';
    confidence: number;
    reasoning: string[];
}

export function inferVoiceFromCharacter(character: CharacterMetadata): InferredVoice {
    const reasoning: string[] = [];
    let gender: 'male' | 'female' = 'male'; // Default
    let age: InferredVoice['age'] = 'adult';
    let accent = 'american';
    let energy: InferredVoice['energy'] = 'medium';
    let genderConfidence = 0;
    let cultureConfidence = 0;

    const fullText = `${character.name} ${character.description || ''} ${character.tagline || ''} ${character.archetype || ''} ${character.heritage || ''}`.toLowerCase();
    const nameLower = character.name.toLowerCase();

    // 1. Check name patterns
    for (const [pattern, traits] of Object.entries(NAME_PATTERNS)) {
        if (nameLower.includes(pattern)) {
            if (traits.gender) {
                gender = traits.gender as 'male' | 'female';
                genderConfidence += 30;
                reasoning.push(`Name "${pattern}" suggests ${gender}`);
            }
            if (traits.age) {
                age = traits.age as InferredVoice['age'];
                reasoning.push(`Name suggests ${age} age group`);
            }
            if (traits.culture) {
                accent = traits.culture === 'british' ? 'british-rp' :
                    traits.culture === 'american' ? 'american-general' :
                        traits.culture === 'african' ? 'african' :
                            traits.culture === 'japanese' || traits.culture === 'korean' ? 'east-asian' :
                                traits.culture === 'indian' ? 'south-asian' :
                                    traits.culture === 'latin' ? 'latin-american' :
                                        traits.culture === 'middle-eastern' ? 'middle-eastern' :
                                            traits.culture === 'european' ? 'european' : 'neutral';
                cultureConfidence += 30;
                reasoning.push(`Name suggests ${traits.culture} culture`);
            }
            break;
        }
    }

    // 2. Check location keywords (only if name didn't provide strong culture signal)
    if (cultureConfidence < 30) {
        for (const [keyword, culture] of Object.entries(LOCATION_KEYWORDS)) {
            // Use regex for patterns that start with \b
            const isRegexPattern = keyword.startsWith('\\');
            const matches = isRegexPattern
                ? new RegExp(keyword, 'i').test(fullText)
                : fullText.includes(keyword);

            if (matches) {
                const accentMapping: Record<string, string> = {
                    'british': 'british-rp',
                    'american': 'american-general',
                    'african': 'african',
                    'japanese': 'east-asian',
                    'korean': 'east-asian',
                    'indian': 'south-asian',
                    'latin': 'latin-american',
                    'middle-eastern': 'middle-eastern',
                    'european': 'european',
                };
                accent = accentMapping[culture] || accent;
                cultureConfidence += 20;
                reasoning.push(`Location keyword "${keyword}" suggests ${culture} accent`);
                break;
            }
        }
    }

    // 3. Check gendered terms
    for (const term of GENDER_TERMS.male) {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        if (regex.test(fullText)) {
            gender = 'male';
            genderConfidence += 20;
            reasoning.push(`Gendered term "${term}" indicates male`);
            break;
        }
    }
    for (const term of GENDER_TERMS.female) {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        if (regex.test(fullText)) {
            gender = 'female';
            genderConfidence += 20;
            reasoning.push(`Gendered term "${term}" indicates female`);
            break;
        }
    }

    // 4. Check archetype/cultural keywords
    for (const [keyword, traits] of Object.entries(ARCHETYPE_KEYWORDS)) {
        if (fullText.includes(keyword)) {
            if (traits.energy) energy = traits.energy as InferredVoice['energy'];
            if (traits.age) age = traits.age as InferredVoice['age'];
            if (traits.accent && cultureConfidence < 30) {
                accent = traits.accent === 'american' ? 'american-general' : traits.accent;
            }
            reasoning.push(`Keyword "${keyword}" suggests ${traits.energy || 'medium'} energy, ${traits.age || 'adult'} age`);
            break;
        }
    }

    const confidence = Math.min(100, genderConfidence + cultureConfidence + 40);

    return { gender, age, accent, energy, confidence, reasoning };
}

// =============================================
// MATCH TO VOICE IDENTITY
// =============================================

export async function matchVoiceIdentity(character: CharacterMetadata): Promise<VoiceIdentity | null> {
    const inferred = inferVoiceFromCharacter(character);

    console.log(`\n🔍 Voice Inference for "${character.name}"`);
    console.log(`   Inferred: ${inferred.gender}, ${inferred.age}, ${inferred.accent}, ${inferred.energy} energy`);
    console.log(`   Confidence: ${inferred.confidence}%`);
    console.log(`   Reasoning:`);
    inferred.reasoning.forEach(r => console.log(`     - ${r}`));

    // Find best matching voice
    const voices = await prisma.voiceIdentity.findMany();

    let bestMatch: VoiceIdentity | null = null;
    let bestScore = 0;

    for (const voice of voices) {
        let score = 0;

        // Gender match (most important)
        if (voice.gender === inferred.gender) score += 40;

        // Age match
        if (voice.ageBand === inferred.age) score += 20;

        // Accent match
        if (voice.accent === inferred.accent) score += 30;
        else if (voice.accent?.includes(inferred.accent.split('-')[0])) score += 15;

        // Energy match
        if (voice.energyLevel === inferred.energy) score += 10;

        if (score > bestScore) {
            bestScore = score;
            bestMatch = voice;
        }
    }

    if (bestMatch) {
        console.log(`   ✅ Best Match: ${bestMatch.displayName} (${bestMatch.voiceId}) - Score: ${bestScore}`);
    }

    return bestMatch;
}

// Export for use in character creation
export { prisma };
