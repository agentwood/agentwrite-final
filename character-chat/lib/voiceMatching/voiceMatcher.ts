/**
 * Voice-Character Matching System
 * Matches characters to voices with 80-90% threshold
 * Only assigns voices if match quality is high enough
 */

import { GEMINI_VOICE_METADATA, GeminiVoiceMetadata } from '@/lib/audio/geminiVoiceMetadata';
import { db } from '@/lib/db';

export interface VoiceMatchResult {
  success: boolean;
  voiceName?: string;
  matchScore?: number; // 0-1.0 (percentage)
  reason?: string;
  matches?: Array<{
    voiceName: string;
    score: number;
    keywords: string[];
  }>;
}

/**
 * Extract character keywords from description and metadata
 */
function extractCharacterKeywords(
  description: string,
  archetype?: string,
  category?: string,
  characterKeywords?: string | null
): string[] {
  // If character keywords are already stored, use them
  if (characterKeywords) {
    try {
      const parsed = JSON.parse(characterKeywords);
      if (Array.isArray(parsed)) {
        return parsed.map((k: any) => String(k).toLowerCase());
      }
    } catch (e) {
      // Invalid JSON, continue with extraction
    }
  }

  // Extract keywords from description and metadata
  const allText = `${description || ''} ${archetype || ''} ${category || ''}`.toLowerCase();

  const keywords: string[] = [];

  // Personality traits
  const personalityTraits = [
    'shy', 'confident', 'energetic', 'calm', 'aggressive', 'gentle', 'serious', 'playful',
    'wise', 'naive', 'mature', 'youthful', 'cheerful', 'sad', 'angry', 'happy',
    'friendly', 'aloof', 'warm', 'cold', 'enthusiastic', 'laid-back', 'formal', 'casual',
    'professional', 'amateur', 'experienced', 'inexperienced', 'brave', 'cowardly',
    'strong', 'weak', 'tall', 'short', 'sophisticated', 'elegant', 'refined',
    'mysterious', 'sultry', 'bright', 'energetic', 'optimistic', 'upbeat', 'vibrant',
    'deep', 'authoritative', 'wise', 'mature', 'commanding', 'gravitas',
    'bold', 'assertive', 'fearless', 'sweet', 'innocent', 'tender', 'kind',
    'motherly', 'nurturing', 'caring', 'compassionate', 'serene', 'peaceful',
    'brooding', 'introspective', 'independent',
  ];

  for (const trait of personalityTraits) {
    if (allText.includes(trait)) {
      keywords.push(trait);
    }
  }

  // Age indicators
  if (allText.includes('young') || allText.includes('teen') || allText.includes('child') || allText.includes('kid') || allText.includes('youthful')) {
    keywords.push('young');
  } else if (allText.includes('old') || allText.includes('elder') || allText.includes('senior') || allText.includes('mature')) {
    keywords.push('old');
  } else {
    keywords.push('middle');
  }

  // Gender indicators - check for explicit gender words in description
  const maleWords = /\b(he|his|him|male|boy|man|guy|gentleman|father|dad|son|brother|husband)\b/;
  const femaleWords = /\b(she|her|hers|female|girl|woman|lady|mother|mom|daughter|sister|wife)\b/;

  const hasMale = maleWords.test(allText);
  const hasFemale = femaleWords.test(allText);

  if (hasMale && !hasFemale) {
    keywords.push('male');
  } else if (hasFemale && !hasMale) {
    keywords.push('female');
  } else if (hasMale && hasFemale) {
    keywords.push('neutral'); // Ambiguous
  } else {
    keywords.push('neutral'); // Default if unclear
  }

  return [...new Set(keywords)];
}

/**
 * Calculate match score between character keywords and voice keywords
 */
function calculateMatchScore(
  characterKeywords: string[],
  voiceMetadata: GeminiVoiceMetadata,
  characterGender?: string,
  characterAge?: string
): number {
  if (characterKeywords.length === 0) {
    return 0;
  }

  let score = 0;
  let maxScore = 0;

  // Gender match (CRITICAL - 50% weight)
  if (characterGender && characterGender !== 'neutral') {
    const genderMatch = characterGender.toLowerCase() === voiceMetadata.gender;
    maxScore += 0.5;
    if (genderMatch) {
      score += 0.5;
    } else if (voiceMetadata.gender === 'neutral') {
      // Neutral voices can work for any gender (partial credit)
      score += 0.25;
    } else {
      // Gender mismatch - strong penalty
      score += 0.0; // No credit for gender mismatch
    }
  } else {
    // Gender not specified or neutral - give partial credit
    maxScore += 0.5;
    score += 0.25;
  }

  // Age match (important - 20% weight)
  if (characterAge) {
    const ageMatch = characterAge.toLowerCase() === voiceMetadata.age;
    maxScore += 0.2;
    if (ageMatch) {
      score += 0.2;
    } else {
      // Partial credit for adjacent ages (young/middle or middle/old)
      const ages = ['young', 'middle', 'old'];
      const charAgeIdx = ages.indexOf(characterAge.toLowerCase());
      const voiceAgeIdx = ages.indexOf(voiceMetadata.age);
      if (Math.abs(charAgeIdx - voiceAgeIdx) === 1) {
        score += 0.1; // Half credit for adjacent age
      }
    }
  } else {
    maxScore += 0.2;
    score += 0.1; // Partial credit if age not specified
  }

  // Keyword match (30% weight - personality traits, style, etc.)
  const voiceKeywords = voiceMetadata.keywords || [];
  const keywordMatches = characterKeywords.filter(kw => voiceKeywords.includes(kw)).length;
  const keywordScore = keywordMatches / Math.max(characterKeywords.length, voiceKeywords.length, 1);
  maxScore += 0.3;
  score += keywordScore * 0.3;

  // Normalize score to 0-1 range
  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * Extract gender and age from character keywords
 */
function extractGenderAndAge(keywords: string[]): { gender?: string; age?: string } {
  const genderKeywords = keywords.filter(kw => ['male', 'female', 'neutral'].includes(kw));
  const ageKeywords = keywords.filter(kw => ['young', 'middle', 'old'].includes(kw));

  return {
    gender: genderKeywords[0],
    age: ageKeywords[0],
  };
}

/**
 * Match character to best voice (80-90% threshold)
 */
export async function matchVoiceToCharacter(
  characterId: string,
  minMatchThreshold: number = 0.65
): Promise<VoiceMatchResult> {
  try {
    // Fetch character from database
    const character = await db.personaTemplate.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        archetype: true,
        characterKeywords: true,
        voiceName: true, // Current voice (if any)
      },
    });

    if (!character) {
      return {
        success: false,
        reason: 'Character not found',
      };
    }

    // Extract character keywords
    const characterKeywords = extractCharacterKeywords(
      character.description || '',
      character.archetype,
      character.category,
      character.characterKeywords
    );

    const { gender, age } = extractGenderAndAge(characterKeywords);

    // Calculate match scores for all voices
    const voiceMatches: Array<{ voiceName: string; score: number; keywords: string[] }> = [];

    for (const [voiceName, voiceMetadata] of Object.entries(GEMINI_VOICE_METADATA)) {
      const score = calculateMatchScore(characterKeywords, voiceMetadata, gender, age);
      if (score >= minMatchThreshold) {
        voiceMatches.push({
          voiceName,
          score,
          keywords: voiceMetadata.keywords,
        });
      }
    }

    // Sort by score (highest first)
    voiceMatches.sort((a, b) => b.score - a.score);

    if (voiceMatches.length === 0) {
      return {
        success: false,
        reason: `No voices found with match score >= ${minMatchThreshold * 100}%`,
        matches: [],
      };
    }

    // Return the best match
    const bestMatch = voiceMatches[0];

    return {
      success: true,
      voiceName: bestMatch.voiceName,
      matchScore: bestMatch.score,
      matches: voiceMatches.slice(0, 5), // Top 5 matches for reference
    };
  } catch (error: any) {
    return {
      success: false,
      reason: error.message || 'Voice matching failed',
    };
  }
}

/**
 * Validate if a character's current voice is a good match
 */
export async function validateCharacterVoice(
  characterId: string,
  minMatchThreshold: number = 0.8
): Promise<{ isValid: boolean; matchScore?: number; recommendedVoice?: string }> {
  const matchResult = await matchVoiceToCharacter(characterId, minMatchThreshold);

  if (!matchResult.success) {
    return {
      isValid: false,
      recommendedVoice: matchResult.matches?.[0]?.voiceName,
    };
  }

  // Check if current voice matches the recommended voice
  const character = await db.personaTemplate.findUnique({
    where: { id: characterId },
    select: { voiceName: true },
  });

  const isValid = character?.voiceName === matchResult.voiceName;

  return {
    isValid,
    matchScore: matchResult.matchScore,
    recommendedVoice: matchResult.voiceName,
  };
}

