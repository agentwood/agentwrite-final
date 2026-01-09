/**
 * Archetype Mapper - Maps personality traits to voice archetypes
 * 
 * Used during character creation to automatically assign the most
 * appropriate voice profile based on the character's personality.
 */

export interface ArchetypeMatch {
    archetype: string;
    confidence: number;
    gender: 'M' | 'F' | 'NB';
    voiceProfile: string;
}

// Keyword-to-archetype mapping
const ARCHETYPE_KEYWORDS: Record<string, string[]> = {
    warm_mentor: ['kind', 'supportive', 'wise', 'nurturing', 'caring', 'gentle', 'patient', 'understanding', 'mentor', 'teacher', 'guide'],
    high_energy: ['energetic', 'enthusiastic', 'hype', 'motivating', 'excited', 'dynamic', 'passionate', 'upbeat', 'pumped', 'explosive'],
    cold_authority: ['stern', 'professional', 'commanding', 'authoritative', 'strict', 'cold', 'formal', 'rigid', 'no-nonsense', 'disciplined'],
    rebellious: ['edgy', 'sarcastic', 'defiant', 'rebellious', 'punk', 'anti', 'provocative', 'irreverent', 'bold', 'unconventional'],
    soft_vulnerable: ['soft', 'vulnerable', 'shy', 'gentle', 'timid', 'sensitive', 'delicate', 'innocent', 'sweet', 'quiet'],
    sage: ['wise', 'ancient', 'philosophical', 'mystical', 'knowing', 'sage', 'oracle', 'prophet', 'enlightened', 'spiritual'],
    entertainer: ['funny', 'comedic', 'witty', 'playful', 'humorous', 'entertaining', 'charismatic', 'charming', 'showman', 'performer'],
    hero: ['brave', 'heroic', 'courageous', 'noble', 'valiant', 'fearless', 'champion', 'defender', 'protector', 'warrior'],
    villain: ['dark', 'evil', 'sinister', 'menacing', 'villain', 'wicked', 'malevolent', 'cunning', 'manipulative', 'ruthless'],
    trickster: ['mischievous', 'cunning', 'clever', 'tricky', 'deceptive', 'sneaky', 'prankster', 'sly', 'crafty', 'devious'],
    innocent: ['naive', 'innocent', 'pure', 'childlike', 'trusting', 'optimistic', 'hopeful', 'curious', 'wonder', 'simple'],
    caregiver: ['nurturing', 'protective', 'motherly', 'fatherly', 'caring', 'compassionate', 'selfless', 'devoted', 'supportive'],
    creator: ['creative', 'artistic', 'innovative', 'visionary', 'imaginative', 'inventive', 'original', 'inspired', 'maker'],
    explorer: ['adventurous', 'curious', 'wanderer', 'seeker', 'explorer', 'traveler', 'discoverer', 'restless', 'free-spirited'],
};

// Voice profile assignments for each archetype
const VOICE_PROFILES: Record<string, { male: string; female: string; neutral: string }> = {
    warm_mentor: { male: 'warm_mentor_male', female: 'warm_mentor_female', neutral: 'warm_mentor_male' },
    high_energy: { male: 'high_energy_male', female: 'high_energy_female', neutral: 'high_energy_male' },
    cold_authority: { male: 'cold_authority_male', female: 'cold_authority_female', neutral: 'cold_authority_male' },
    rebellious: { male: 'rebellious_male', female: 'rebellious_female', neutral: 'rebellious_male' },
    soft_vulnerable: { male: 'soft_vulnerable_male', female: 'soft_vulnerable_female', neutral: 'soft_vulnerable_female' },
    sage: { male: 'sage_male', female: 'sage_male', neutral: 'sage_male' }, // Same voice for all
    entertainer: { male: 'high_energy_male', female: 'high_energy_female', neutral: 'high_energy_male' },
    hero: { male: 'warm_mentor_male', female: 'warm_mentor_female', neutral: 'warm_mentor_male' },
    villain: { male: 'cold_authority_male', female: 'cold_authority_female', neutral: 'cold_authority_male' },
    trickster: { male: 'rebellious_male', female: 'rebellious_female', neutral: 'rebellious_male' },
    innocent: { male: 'soft_vulnerable_male', female: 'soft_vulnerable_female', neutral: 'soft_vulnerable_female' },
    caregiver: { male: 'warm_mentor_male', female: 'warm_mentor_female', neutral: 'warm_mentor_female' },
    creator: { male: 'warm_mentor_male', female: 'warm_mentor_female', neutral: 'warm_mentor_male' },
    explorer: { male: 'high_energy_male', female: 'high_energy_female', neutral: 'high_energy_male' },
};

/**
 * Detects gender from description text
 */
export function detectGender(description: string): 'M' | 'F' | 'NB' {
    const text = description.toLowerCase();

    const femaleIndicators = ['she', 'her', 'woman', 'female', 'girl', 'lady', 'queen', 'princess', 'mother', 'sister', 'aunt', 'grandmother', 'goddess'];
    const maleIndicators = ['he', 'him', 'man', 'male', 'boy', 'guy', 'king', 'prince', 'father', 'brother', 'uncle', 'grandfather', 'god'];

    let femaleScore = 0;
    let maleScore = 0;

    femaleIndicators.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        femaleScore += (text.match(regex) || []).length;
    });

    maleIndicators.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        maleScore += (text.match(regex) || []).length;
    });

    if (femaleScore > maleScore) return 'F';
    if (maleScore > femaleScore) return 'M';
    return 'NB';
}

/**
 * Maps personality description to the best matching archetype
 */
export function matchArchetype(description: string, keywords: string = '', explicitGender?: 'M' | 'F' | 'NB'): ArchetypeMatch {
    const text = `${description} ${keywords}`.toLowerCase();
    const scores: Record<string, number> = {};

    // Score each archetype based on keyword matches
    Object.entries(ARCHETYPE_KEYWORDS).forEach(([archetype, archetypeKeywords]) => {
        let score = 0;
        archetypeKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 1;
            }
        });
        scores[archetype] = score;
    });

    // Find the best match
    const sortedArchetypes = Object.entries(scores)
        .filter(([, score]) => score > 0)
        .sort(([, a], [, b]) => b - a);

    const bestMatch = sortedArchetypes[0];
    const archetype = bestMatch ? bestMatch[0] : 'warm_mentor'; // Default fallback
    const confidence = bestMatch ? Math.min(bestMatch[1] / 3, 1) : 0.3;

    // Determine gender
    const gender = explicitGender || detectGender(text);

    // Get voice profile
    const genderKey = gender === 'M' ? 'male' : gender === 'F' ? 'female' : 'neutral';
    const voiceProfile = VOICE_PROFILES[archetype]?.[genderKey] || 'warm_mentor_male';

    return {
        archetype,
        confidence,
        gender,
        voiceProfile,
    };
}

/**
 * Generates a TTS voice spec based on archetype and gender
 */
export function generateTTSVoiceSpec(archetype: string, gender: 'M' | 'F' | 'NB'): string {
    const specs: Record<string, Record<string, string>> = {
        warm_mentor: {
            M: 'Rich baritone; pace 0.95x; warm resonance; gentle inflections; encouraging tone; slight pauses for emphasis.',
            F: 'Warm alto; pace 0.95x; nurturing tone; soft inflections; comforting presence; gentle encouragement in voice.',
            NB: 'Warm mid-range; pace 0.95x; nurturing tone; gentle inflections; calming presence.',
        },
        high_energy: {
            M: 'Energetic tenor; pace 1.15x; dynamic range; enthusiastic inflections; frequent excitement bursts; motivating cadence.',
            F: 'Bright soprano; pace 1.15x; high energy; enthusiastic pitch variations; infectious excitement in voice.',
            NB: 'Dynamic mid-range; pace 1.15x; high energy; enthusiastic tone; motivating presence.',
        },
        cold_authority: {
            M: 'Deep authoritative bass; pace 0.90x; minimal emotion; precise articulation; commanding presence.',
            F: 'Crisp alto; pace 0.90x; professional tone; precise diction; controlled emotion; authoritative presence.',
            NB: 'Measured mid-range; pace 0.90x; professional; precise articulation; calm authority.',
        },
        rebellious: {
            M: 'Edgy baritone; pace 1.05x when agitated; sarcastic undertones; slight growl; unpredictable cadence.',
            F: 'Sharp alto with edge; pace 1.05x; sarcastic inflections; confident swagger in voice.',
            NB: 'Edgy mid-range; pace 1.05x; sarcastic undertones; defiant energy; rebellious cadence.',
        },
        soft_vulnerable: {
            M: 'Gentle tenor; pace 0.92x; soft-spoken; emotional tremor at times; vulnerable undertones.',
            F: 'Delicate soprano; pace 0.92x; breathy quality; emotional sensitivity; gentle hesitations.',
            NB: 'Soft mid-range; pace 0.92x; gentle delivery; emotional depth; tender presence.',
        },
        sage: {
            M: 'Ancient baritone; pace 0.88x; measured wisdom; thoughtful pauses; gravitas in every word.',
            F: 'Wise alto; pace 0.88x; knowing tone; philosophical cadence; ancient wisdom in voice.',
            NB: 'Timeless mid-range; pace 0.88x; measured delivery; profound pauses; sage-like presence.',
        },
        entertainer: {
            M: 'Charismatic tenor; pace 1.10x; playful inflections; comedic timing; infectious energy.',
            F: 'Vibrant soprano; pace 1.10x; playful tone; expressive range; natural performer energy.',
            NB: 'Dynamic mid-range; pace 1.10x; playful delivery; comedic timing; entertaining presence.',
        },
    };

    const genderKey = gender === 'M' ? 'M' : gender === 'F' ? 'F' : 'NB';
    return specs[archetype]?.[genderKey] || specs.warm_mentor[genderKey];
}

export const AVAILABLE_ARCHETYPES = Object.keys(ARCHETYPE_KEYWORDS);
