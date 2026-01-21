/**
 * Archetype Coherence Profiles
 * 
 * Ensures voice, appearance, and personality are coherent for each archetype.
 * Used in Create Character to prevent mismatches like "mafia boss with soft feminine voice".
 * 
 * HARDCODED - Persists across sessions
 */

export interface ArchetypeProfile {
    id: string;
    name: string;
    displayName: string;

    // Voice requirements
    voice: {
        registryKey: string;        // Maps to registry.json archetype
        requiredGender?: 'male' | 'female' | 'neutral';
        toneKeywords: string[];     // For voice-matcher
    };

    // Avatar/appearance requirements
    appearance: {
        ageRange: 'young' | 'adult' | 'mature' | 'any';
        style: string;              // Visual style keywords
        colorPalette: string[];     // Suggested colors
        expressionKeywords: string[];
    };

    // Personality requirements
    personality: {
        requiredTraits: string[];   // Must include these
        forbiddenTraits: string[];  // Should NOT include these
        moodCategories: string[];   // Suitable mood categories
        descriptionKeywords: string[];
    };

    // For display
    icon: string;
    description: string;
}

export const ARCHETYPE_PROFILES: Record<string, ArchetypeProfile> = {
    yandere_obsessive: {
        id: 'yandere_obsessive',
        name: 'yandere',
        displayName: 'Yandere',
        voice: {
            registryKey: 'yandere_obsessive',
            requiredGender: 'female',
            toneKeywords: ['sweet', 'intense', 'obsessive', 'dangerous'],
        },
        appearance: {
            ageRange: 'young',
            style: 'cute but unsettling, pink/red tones, wide eyes, sweet smile',
            colorPalette: ['#EC4899', '#DB2777', '#831843'],
            expressionKeywords: ['intense gaze', 'sweet smile', 'obsessive'],
        },
        personality: {
            requiredTraits: ['obsessive', 'devoted', 'possessive', 'sweet'],
            forbiddenTraits: ['calm', 'detached', 'indifferent'],
            moodCategories: ['Intense', 'Romantic'],
            descriptionKeywords: ['yandere', 'obsessive', 'possessive', 'devoted', 'stalker'],
        },
        icon: '💕',
        description: 'Sweet and devoted, but dangerously obsessive',
    },

    tsundere_cold: {
        id: 'tsundere_cold',
        name: 'tsundere',
        displayName: 'Tsundere',
        voice: {
            registryKey: 'tsundere_cold',
            requiredGender: 'female',
            toneKeywords: ['sharp', 'annoyed', 'embarrassed', 'warm'],
        },
        appearance: {
            ageRange: 'young',
            style: 'proud stance, crossed arms, slight blush, fierce eyes',
            colorPalette: ['#EF4444', '#F59E0B', '#FBBF24'],
            expressionKeywords: ['pouty', 'blushing', 'annoyed', 'embarrassed'],
        },
        personality: {
            requiredTraits: ['cold', 'proud', 'secretly caring', 'easily embarrassed'],
            forbiddenTraits: ['openly affectionate', 'submissive'],
            moodCategories: ['Intense', 'Romantic', 'Playful'],
            descriptionKeywords: ['tsundere', 'cold', 'proud', 'baka', 'embarrassed'],
        },
        icon: '😤',
        description: 'Cold exterior hiding a warm heart',
    },

    kuudere_emotionless: {
        id: 'kuudere_emotionless',
        name: 'kuudere',
        displayName: 'Kuudere',
        voice: {
            registryKey: 'kuudere_emotionless',
            requiredGender: 'female',
            toneKeywords: ['calm', 'monotone', 'reserved', 'soft'],
        },
        appearance: {
            ageRange: 'young',
            style: 'neutral expression, pale colors, elegant, minimal emotion',
            colorPalette: ['#6366F1', '#8B5CF6', '#A5B4FC'],
            expressionKeywords: ['blank', 'calm', 'emotionless', 'stoic'],
        },
        personality: {
            requiredTraits: ['emotionless', 'calm', 'analytical', 'quietly caring'],
            forbiddenTraits: ['expressive', 'energetic', 'emotional'],
            moodCategories: ['Relaxed', 'Slow-Burn'],
            descriptionKeywords: ['kuudere', 'emotionless', 'calm', 'quiet', 'reserved'],
        },
        icon: '❄️',
        description: 'Calm and emotionless, with rare moments of warmth',
    },

    vampire_prince: {
        id: 'vampire_prince',
        name: 'vampire',
        displayName: 'Vampire Noble',
        voice: {
            registryKey: 'vampire_prince',
            requiredGender: 'male',
            toneKeywords: ['deep', 'smooth', 'aristocratic', 'seductive'],
        },
        appearance: {
            ageRange: 'adult',
            style: 'pale skin, red eyes, elegant dark clothing, fangs, aristocratic',
            colorPalette: ['#1F2937', '#7C3AED', '#DC2626'],
            expressionKeywords: ['smirk', 'intense gaze', 'aristocratic', 'dangerous'],
        },
        personality: {
            requiredTraits: ['charming', 'mysterious', 'dominant', 'elegant'],
            forbiddenTraits: ['clumsy', 'humble', 'simple'],
            moodCategories: ['Intense', 'Romantic', 'Slow-Burn'],
            descriptionKeywords: ['vampire', 'immortal', 'blood', 'noble', 'prince'],
        },
        icon: '🧛',
        description: 'Elegant immortal with dangerous charm',
    },

    mafia_boss: {
        id: 'mafia_boss',
        name: 'mafia',
        displayName: 'Mafia Boss',
        voice: {
            registryKey: 'mafia_boss',
            requiredGender: 'male',
            toneKeywords: ['commanding', 'low', 'threatening', 'authoritative'],
        },
        appearance: {
            ageRange: 'adult',
            style: 'sharp suit, slicked hair, dangerous eyes, cigar, scars',
            colorPalette: ['#1F2937', '#374151', '#991B1B'],
            expressionKeywords: ['intimidating', 'cold', 'calculating', 'powerful'],
        },
        personality: {
            requiredTraits: ['dominant', 'commanding', 'dangerous', 'protective'],
            forbiddenTraits: ['soft', 'timid', 'submissive', 'naive'],
            moodCategories: ['Intense', 'Romantic'],
            descriptionKeywords: ['mafia', 'boss', 'crime', 'power', 'dangerous'],
        },
        icon: '🔫',
        description: 'Dangerous crime lord with possessive tendencies',
    },

    demon_lord: {
        id: 'demon_lord',
        name: 'demon',
        displayName: 'Demon Lord',
        voice: {
            registryKey: 'demon_lord',
            requiredGender: 'male',
            toneKeywords: ['sinister', 'deep', 'otherworldly', 'seductive'],
        },
        appearance: {
            ageRange: 'adult',
            style: 'horns, red/black aesthetic, glowing eyes, dark aura, wings optional',
            colorPalette: ['#1F2937', '#DC2626', '#7C2D12'],
            expressionKeywords: ['smirk', 'sinister', 'amused', 'predatory'],
        },
        personality: {
            requiredTraits: ['cunning', 'powerful', 'seductive', 'dangerous'],
            forbiddenTraits: ['innocent', 'pure', 'humble'],
            moodCategories: ['Intense', 'Romantic'],
            descriptionKeywords: ['demon', 'devil', 'hell', 'sin', 'dark'],
        },
        icon: '😈',
        description: 'Sinister entity with dark charm',
    },

    royal_princess: {
        id: 'royal_princess',
        name: 'princess',
        displayName: 'Royal Princess',
        voice: {
            registryKey: 'royal_princess',
            requiredGender: 'female',
            toneKeywords: ['elegant', 'refined', 'soft', 'regal'],
        },
        appearance: {
            ageRange: 'young',
            style: 'crown/tiara, elegant gown, jewelry, graceful, royal colors',
            colorPalette: ['#8B5CF6', '#EC4899', '#FBBF24'],
            expressionKeywords: ['graceful', 'dignified', 'gentle smile', 'royal'],
        },
        personality: {
            requiredTraits: ['elegant', 'graceful', 'kind', 'refined'],
            forbiddenTraits: ['crude', 'vulgar', 'aggressive'],
            moodCategories: ['Romantic', 'Wholesome', 'Slow-Burn'],
            descriptionKeywords: ['princess', 'royal', 'kingdom', 'crown', 'elegant'],
        },
        icon: '👑',
        description: 'Graceful royalty with refined elegance',
    },

    witch_mysterious: {
        id: 'witch_mysterious',
        name: 'witch',
        displayName: 'Mysterious Witch',
        voice: {
            registryKey: 'witch_mysterious',
            requiredGender: 'female',
            toneKeywords: ['raspy', 'mystical', 'enchanting', 'mysterious'],
        },
        appearance: {
            ageRange: 'any',
            style: 'witch hat, dark robes, glowing elements, magical aura, mysterious',
            colorPalette: ['#7C3AED', '#4C1D95', '#059669'],
            expressionKeywords: ['knowing smile', 'mysterious', 'magical', 'enchanting'],
        },
        personality: {
            requiredTraits: ['mysterious', 'magical', 'wise', 'playful'],
            forbiddenTraits: ['simple', 'ordinary', 'mundane'],
            moodCategories: ['Playful', 'Adventurous'],
            descriptionKeywords: ['witch', 'magic', 'spell', 'potion', 'mystical'],
        },
        icon: '🧙‍♀️',
        description: 'Mystical practitioner of arcane arts',
    },

    ceo_cold: {
        id: 'ceo_cold',
        name: 'ceo',
        displayName: 'Cold CEO',
        voice: {
            registryKey: 'ceo_cold',
            requiredGender: 'male',
            toneKeywords: ['cold', 'professional', 'authoritative', 'sharp'],
        },
        appearance: {
            ageRange: 'adult',
            style: 'expensive suit, cold eyes, perfect grooming, office setting',
            colorPalette: ['#1F2937', '#374151', '#3B82F6'],
            expressionKeywords: ['cold', 'calculating', 'superior', 'professional'],
        },
        personality: {
            requiredTraits: ['cold', 'professional', 'dominant', 'successful'],
            forbiddenTraits: ['warm', 'friendly', 'approachable'],
            moodCategories: ['Intense', 'Slow-Burn'],
            descriptionKeywords: ['ceo', 'billionaire', 'corporate', 'boss', 'cold'],
        },
        icon: '💼',
        description: 'Ruthless business mogul with icy exterior',
    },

    knight_protector: {
        id: 'knight_protector',
        name: 'knight',
        displayName: 'Loyal Knight',
        voice: {
            registryKey: 'knight_protector',
            requiredGender: 'male',
            toneKeywords: ['noble', 'warm', 'protective', 'steadfast'],
        },
        appearance: {
            ageRange: 'adult',
            style: 'armor, sword, cape, noble bearing, battle-worn',
            colorPalette: ['#6B7280', '#3B82F6', '#FBBF24'],
            expressionKeywords: ['determined', 'loyal', 'protective', 'noble'],
        },
        personality: {
            requiredTraits: ['loyal', 'protective', 'honorable', 'brave'],
            forbiddenTraits: ['cowardly', 'disloyal', 'selfish'],
            moodCategories: ['Romantic', 'Adventurous', 'Wholesome'],
            descriptionKeywords: ['knight', 'protector', 'loyal', 'honor', 'sword'],
        },
        icon: '⚔️',
        description: 'Honorable warrior sworn to protect',
    },

    angel_guardian: {
        id: 'angel_guardian',
        name: 'angel',
        displayName: 'Guardian Angel',
        voice: {
            registryKey: 'angel_guardian',
            requiredGender: 'female',
            toneKeywords: ['soft', 'ethereal', 'warm', 'divine'],
        },
        appearance: {
            ageRange: 'any',
            style: 'wings, white/gold aesthetic, halo, ethereal glow, serene',
            colorPalette: ['#FBBF24', '#F9FAFB', '#60A5FA'],
            expressionKeywords: ['serene', 'gentle', 'divine', 'caring'],
        },
        personality: {
            requiredTraits: ['caring', 'protective', 'pure', 'comforting'],
            forbiddenTraits: ['cruel', 'dark', 'sinful'],
            moodCategories: ['Wholesome', 'Relaxed'],
            descriptionKeywords: ['angel', 'guardian', 'divine', 'heaven', 'wings'],
        },
        icon: '😇',
        description: 'Divine protector with gentle warmth',
    },
};

/**
 * Validate character coherence against archetype
 */
export function validateCoherence(
    archetypeId: string,
    character: {
        gender?: string;
        description?: string;
        personality?: string;
    }
): { valid: boolean; issues: string[] } {
    const profile = ARCHETYPE_PROFILES[archetypeId];
    if (!profile) {
        return { valid: true, issues: [] }; // No profile = no validation
    }

    const issues: string[] = [];
    const text = `${character.description || ''} ${character.personality || ''}`.toLowerCase();

    // Check gender match
    if (profile.voice.requiredGender && character.gender) {
        const genderMap: Record<string, string> = { M: 'male', F: 'female', NB: 'neutral' };
        const charGender = genderMap[character.gender] || character.gender.toLowerCase();
        if (profile.voice.requiredGender !== 'neutral' && charGender !== profile.voice.requiredGender) {
            issues.push(`${profile.displayName} archetype typically requires ${profile.voice.requiredGender} gender`);
        }
    }

    // Check for forbidden traits
    for (const forbidden of profile.personality.forbiddenTraits) {
        if (text.includes(forbidden.toLowerCase())) {
            issues.push(`Trait "${forbidden}" conflicts with ${profile.displayName} archetype`);
        }
    }

    return {
        valid: issues.length === 0,
        issues,
    };
}

/**
 * Get suggested archetype based on description
 */
export function suggestArchetype(description: string, gender?: string): string | null {
    const text = description.toLowerCase();

    for (const [id, profile] of Object.entries(ARCHETYPE_PROFILES)) {
        const matchCount = profile.personality.descriptionKeywords.filter(
            kw => text.includes(kw.toLowerCase())
        ).length;

        if (matchCount >= 2) {
            // Check gender compatibility
            if (profile.voice.requiredGender && gender) {
                const genderMap: Record<string, string> = { M: 'male', F: 'female', NB: 'neutral' };
                const charGender = genderMap[gender] || gender.toLowerCase();
                if (profile.voice.requiredGender !== 'neutral' && charGender !== profile.voice.requiredGender) {
                    continue; // Skip if gender mismatch
                }
            }
            return id;
        }
    }

    return null;
}

/**
 * Get avatar generation prompt for archetype
 */
export function getArchetypeAvatarPrompt(archetypeId: string, name: string, gender: string): string {
    const profile = ARCHETYPE_PROFILES[archetypeId];
    if (!profile) {
        return `${name}, ${gender} character portrait, stylized anime digital painting`;
    }

    return `${name}, ${gender} ${profile.displayName} character portrait,
    ${profile.appearance.style},
    ${profile.appearance.expressionKeywords.join(', ')},
    color palette: ${profile.appearance.colorPalette.join(', ')},
    stylized anime digital painting, highly detailed,
    cinematic lighting, dark atmospheric background,
    professional character art, expressive eyes`.trim().replace(/\s+/g, ' ');
}

export default ARCHETYPE_PROFILES;
