/**
 * Content Uniqueness & Originality Checks
 * Prevents duplicate content and ensures originality
 */

import { db } from '../../db';

interface UniquenessCheck {
  isUnique: boolean;
  similarityScore: number; // 0-100 (100 = completely unique)
  similarItems: Array<{ id: string; similarity: number }>;
}

/**
 * Calculate text similarity using simple word overlap
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  // Jaccard similarity
  return (intersection.size / union.size) * 100;
}

/**
 * Check if character description is unique
 */
export async function checkDescriptionUniqueness(
  description: string,
  excludeCharacterId?: string
): Promise<UniquenessCheck> {
  const allCharacters = await db.personaTemplate.findMany({
    where: {
      description: { not: null },
      ...(excludeCharacterId && { id: { not: excludeCharacterId } }),
    },
    select: {
      id: true,
      description: true,
    },
  });

  const similarItems: Array<{ id: string; similarity: number }> = [];
  let maxSimilarity = 0;

  for (const character of allCharacters) {
    if (character.description) {
      const similarity = calculateSimilarity(description, character.description);
      if (similarity > 50) { // Threshold for similarity concern
        similarItems.push({ id: character.id, similarity });
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }
  }

  return {
    isUnique: maxSimilarity < 70, // Less than 70% similar
    similarityScore: 100 - maxSimilarity,
    similarItems: similarItems.sort((a, b) => b.similarity - a.similarity).slice(0, 5),
  };
}

/**
 * Check if title is unique
 */
export async function checkTitleUniqueness(
  title: string,
  excludeCharacterId?: string
): Promise<UniquenessCheck> {
  const allCharacters = await db.personaTemplate.findMany({
    where: {
      ...(excludeCharacterId && { id: { not: excludeCharacterId } }),
    },
    select: {
      id: true,
      name: true,
      tagline: true,
    },
  });

  const similarItems: Array<{ id: string; similarity: number }> = [];
  let maxSimilarity = 0;

  for (const character of allCharacters) {
    const characterTitle = character.tagline || character.name;
    const similarity = calculateSimilarity(title, characterTitle);
    if (similarity > 60) {
      similarItems.push({ id: character.id, similarity });
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
  }

  return {
    isUnique: maxSimilarity < 80,
    similarityScore: 100 - maxSimilarity,
    similarItems: similarItems.sort((a, b) => b.similarity - a.similarity).slice(0, 5),
  };
}

/**
 * Generate unique content variations
 */
export async function generateUniqueContentVariations(
  baseContent: string,
  characterId: string,
  maxVariations: number = 3
): Promise<string[]> {
  const variations: string[] = [baseContent];
  
  // Get similar characters to avoid
  const similar = await checkDescriptionUniqueness(baseContent, characterId);
  
  // Generate variations by:
  // 1. Changing sentence structure
  // 2. Adding unique elements
  // 3. Varying word choice
  
  for (let i = 1; i < maxVariations; i++) {
    const variation = generateVariation(baseContent, i);
    const variationCheck = await checkDescriptionUniqueness(variation, characterId);
    
    if (variationCheck.isUnique) {
      variations.push(variation);
    }
  }
  
  return variations;
}

/**
 * Generate content variation
 */
function generateVariation(content: string, variationIndex: number): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  switch (variationIndex % 3) {
    case 0:
      // Rearrange sentences
      return sentences.reverse().join('. ') + '.';
    case 1:
      // Add introductory phrase
      return `Discover ${sentences[0]}. ${sentences.slice(1).join('. ')}.`;
    case 2:
      // Add concluding phrase
      return `${sentences.join('. ')}. Start chatting and explore unique conversations.`;
    default:
      return content;
  }
}

/**
 * Ensure content meets minimum uniqueness threshold
 */
export async function ensureContentUniqueness(
  content: {
    title: string;
    description: string;
    characterId: string;
  }
): Promise<{
  title: string;
  description: string;
  isUnique: boolean;
  uniquenessScore: number;
}> {
  const [titleCheck, descCheck] = await Promise.all([
    checkTitleUniqueness(content.title, content.characterId),
    checkDescriptionUniqueness(content.description, content.characterId),
  ]);

  let finalTitle = content.title;
  let finalDescription = content.description;
  let isUnique = titleCheck.isUnique && descCheck.isUnique;

  // If title not unique, generate variations
  if (!titleCheck.isUnique) {
    const titleVariations = await generateUniqueContentVariations(
      content.title,
      content.characterId,
      5
    );
    for (const variation of titleVariations) {
      const check = await checkTitleUniqueness(variation, content.characterId);
      if (check.isUnique) {
        finalTitle = variation;
        isUnique = descCheck.isUnique;
        break;
      }
    }
  }

  // If description not unique, generate variations
  if (!descCheck.isUnique) {
    const descVariations = await generateUniqueContentVariations(
      content.description,
      content.characterId,
      5
    );
    for (const variation of descVariations) {
      const check = await checkDescriptionUniqueness(variation, content.characterId);
      if (check.isUnique) {
        finalDescription = variation;
        isUnique = true;
        break;
      }
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    isUnique,
    uniquenessScore: (titleCheck.similarityScore + descCheck.similarityScore) / 2,
  };
}


