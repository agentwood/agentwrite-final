/**
 * Character Mapper
 * Maps characters to real people or anime characters for better voice matching
 */

import { db } from '@/lib/db';
import { scrapeCharacterProfile, extractKeywords, CharacterProfile } from './webScraper';
import { TOP_30_ANIME, getAnimeSource, searchAnimeSources } from './animeSources';
import { getCelebritiesForProfession, searchCelebrities } from './celebritySources';

export interface CharacterMappingResult {
  success: boolean;
  sourceCharacterName?: string;
  sourceCharacterUrl?: string;
  sourceType?: 'anime' | 'celebrity' | 'real_person';
  sourceDescription?: string;
  characterKeywords?: string[];
  mappingConfidence?: number;
  error?: string;
}

/**
 * Extract keywords from character description
 */
function extractCharacterKeywords(description: string, archetype?: string, category?: string): string[] {
  const allText = `${description} ${archetype || ''} ${category || ''}`.toLowerCase();
  
  const keywords: string[] = [];
  
  // Personality traits
  const personalityTraits = [
    'shy', 'confident', 'energetic', 'calm', 'aggressive', 'gentle', 'serious', 'playful',
    'wise', 'naive', 'mature', 'youthful', 'cheerful', 'sad', 'angry', 'happy',
    'friendly', 'aloof', 'warm', 'cold', 'enthusiastic', 'laid-back', 'formal', 'casual',
    'professional', 'amateur', 'experienced', 'inexperienced', 'brave', 'cowardly',
    'strong', 'weak', 'tall', 'short', 'young', 'old', 'middle-aged',
  ];
  
  for (const trait of personalityTraits) {
    if (allText.includes(trait)) {
      keywords.push(trait);
    }
  }
  
  // Age indicators
  if (allText.includes('young') || allText.includes('teen') || allText.includes('child') || allText.includes('kid')) {
    keywords.push('young');
  } else if (allText.includes('old') || allText.includes('elder') || allText.includes('senior')) {
    keywords.push('old');
  } else {
    keywords.push('middle');
  }
  
  // Gender indicators (basic)
  if (allText.includes(' he ') || allText.includes(' his ') || allText.includes(' male ') || allText.includes(' boy ')) {
    keywords.push('male');
  } else if (allText.includes(' she ') || allText.includes(' her ') || allText.includes(' female ') || allText.includes(' girl ')) {
    keywords.push('female');
  }
  
  return [...new Set(keywords)];
}

/**
 * Calculate similarity score between character and source profile
 */
function calculateSimilarityScore(
  characterKeywords: string[],
  sourceKeywords: string[]
): number {
  if (characterKeywords.length === 0 || sourceKeywords.length === 0) {
    return 0;
  }
  
  const matches = characterKeywords.filter(keyword => sourceKeywords.includes(keyword)).length;
  const total = Math.max(characterKeywords.length, sourceKeywords.length);
  
  return matches / total;
}

/**
 * Map fantasy character to anime character
 */
async function mapToAnimeCharacter(
  characterName: string,
  description: string,
  archetype?: string,
  category?: string
): Promise<CharacterMappingResult | null> {
  // Extract keywords from character
  const characterKeywords = extractCharacterKeywords(description, archetype, category);
  
  // Search through top anime for matching characters
  // For now, we'll use a simple approach - in production, this could use AI/ML for better matching
  let bestMatch: { anime: string; characterName: string; url: string; score: number } | null = null;
  
  // Check if character description mentions any anime
  for (const anime of TOP_30_ANIME) {
    const animeNameLower = anime.name.toLowerCase();
    if (description.toLowerCase().includes(animeNameLower) || 
        characterName.toLowerCase().includes(animeNameLower)) {
      // Found anime reference - construct character URL (simplified)
      const characterUrl = `${anime.wikiBaseUrl}/${characterName.replace(/\s+/g, '_')}`;
      bestMatch = {
        anime: anime.name,
        characterName: characterName,
        url: characterUrl,
        score: 0.8, // High confidence if anime is mentioned
      };
      break;
    }
  }
  
  if (!bestMatch) {
    // No direct match found - return null for now
    // In production, this could use semantic search or AI matching
    return null;
  }
  
  // Try to scrape the character profile
  let profile: CharacterProfile | null = null;
  try {
    profile = await scrapeCharacterProfile(bestMatch.url, 'anime');
  } catch (error) {
    console.error('Error scraping anime character:', error);
  }
  
  const sourceKeywords = profile ? extractKeywords(profile) : characterKeywords;
  const confidence = profile ? calculateSimilarityScore(characterKeywords, sourceKeywords) : 0.6;
  
  return {
    success: true,
    sourceCharacterName: bestMatch.characterName,
    sourceCharacterUrl: bestMatch.url,
    sourceType: 'anime',
    sourceDescription: profile?.description || description,
    characterKeywords: JSON.stringify(characterKeywords),
    mappingConfidence: Math.max(confidence, 0.6),
  };
}

/**
 * Map real human character to celebrity
 */
async function mapToCelebrity(
  characterName: string,
  description: string,
  archetype?: string,
  category?: string
): Promise<CharacterMappingResult | null> {
  // Extract profession from description/category
  const allText = `${description} ${category || ''} ${archetype || ''}`.toLowerCase();
  
  // Map category/archetype to profession
  const professionMap: Record<string, string> = {
    'therapist': 'therapist',
    'counselor': 'therapist',
    'doctor': 'doctor',
    'physician': 'doctor',
    'teacher': 'teacher',
    'educator': 'teacher',
    'lawyer': 'lawyer',
    'attorney': 'lawyer',
    'coach': 'coach',
    'trainer': 'coach',
  };
  
  let profession: string | null = null;
  for (const [key, value] of Object.entries(professionMap)) {
    if (allText.includes(key)) {
      profession = value;
      break;
    }
  }
  
  if (!profession) {
    return null; // No profession found
  }
  
  // Get celebrities for this profession
  const celebrities = getCelebritiesForProfession(profession);
  if (celebrities.length === 0) {
    return null;
  }
  
  // For now, pick the top celebrity (in production, use semantic matching)
  const celebrity = celebrities[0];
  
  // Try to scrape the celebrity profile
  let profile: CharacterProfile | null = null;
  if (celebrity.wikipediaUrl) {
    try {
      profile = await scrapeCharacterProfile(celebrity.wikipediaUrl, 'celebrity');
    } catch (error) {
      console.error('Error scraping celebrity profile:', error);
    }
  }
  
  const characterKeywords = extractCharacterKeywords(description, archetype, category);
  const sourceKeywords = profile ? extractKeywords(profile) : characterKeywords;
  const confidence = profile ? calculateSimilarityScore(characterKeywords, sourceKeywords) : 0.7;
  
  return {
    success: true,
    sourceCharacterName: celebrity.name,
    sourceCharacterUrl: celebrity.wikipediaUrl || undefined,
    sourceType: 'celebrity',
    sourceDescription: profile?.description || celebrity.description || description,
    characterKeywords: JSON.stringify(characterKeywords),
    mappingConfidence: Math.max(confidence, 0.7),
  };
}

/**
 * Map a character to a real person or anime character
 */
export async function mapCharacter(
  characterId: string
): Promise<CharacterMappingResult> {
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
        sourceCharacterName: true, // Check if already mapped
      },
    });
    
    if (!character) {
      return {
        success: false,
        error: 'Character not found',
      };
    }
    
    // Skip if already mapped
    if (character.sourceCharacterName) {
      return {
        success: false,
        error: 'Character already mapped',
      };
    }
    
    const description = character.description || '';
    const category = character.category?.toLowerCase() || '';
    const archetype = character.archetype?.toLowerCase() || '';
    
    // Determine if fantasy or real human
    const isFantasy = category.includes('fantasy') || 
                     category.includes('anime') ||
                     archetype.includes('fantasy') ||
                     archetype.includes('anime');
    
    let result: CharacterMappingResult | null = null;
    
    if (isFantasy) {
      // Try to map to anime character
      result = await mapToAnimeCharacter(
        character.name,
        description,
        archetype,
        category
      );
    } else {
      // Try to map to celebrity/real person
      result = await mapToCelebrity(
        character.name,
        description,
        archetype,
        category
      );
    }
    
    if (!result || !result.success) {
      return {
        success: false,
        error: 'No suitable mapping found',
      };
    }
    
    // Update character in database
    await db.personaTemplate.update({
      where: { id: characterId },
      data: {
        sourceCharacterName: result.sourceCharacterName,
        sourceCharacterUrl: result.sourceCharacterUrl,
        sourceType: result.sourceType,
        sourceDescription: result.sourceDescription,
        characterKeywords: result.characterKeywords,
        mappingConfidence: result.mappingConfidence,
      },
    });
    
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Mapping failed',
    };
  }
}

