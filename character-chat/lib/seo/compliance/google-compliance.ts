/**
 * Google Compliance & Quality Checks
 * Ensures content meets Google's guidelines and won't be flagged as spam
 */

import { db } from '../../db';

interface QualityCheck {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  warnings: string[];
}

/**
 * Check if content meets Google's quality guidelines
 */
export async function checkGoogleCompliance(content: {
  title: string;
  description: string;
  url: string;
  content?: string;
  characterId?: string;
  category?: string;
  archetype?: string;
}): Promise<QualityCheck> {
  const issues: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // 1. Check for duplicate content
  const duplicateCheck = await checkDuplicateContent(content);
  if (!duplicateCheck.passed) {
    issues.push(...duplicateCheck.issues);
    score -= duplicateCheck.deduction;
  }

  // 2. Check content length (must be substantial)
  const lengthCheck = checkContentLength(content);
  if (!lengthCheck.passed) {
    issues.push(...lengthCheck.issues);
    score -= lengthCheck.deduction;
  }

  // 3. Check for keyword stuffing
  const keywordCheck = checkKeywordStuffing(content);
  if (!keywordCheck.passed) {
    issues.push(...keywordCheck.issues);
    score -= keywordCheck.deduction;
  }

  // 4. Check for originality (not template-based spam)
  const originalityCheck = await checkOriginality(content);
  if (!originalityCheck.passed) {
    issues.push(...originalityCheck.issues);
    score -= originalityCheck.deduction;
  }

  // 5. Check for over-optimization
  const optimizationCheck = checkOverOptimization(content);
  if (!optimizationCheck.passed) {
    warnings.push(...optimizationCheck.warnings);
    score -= optimizationCheck.deduction;
  }

  // 6. Check for thin content
  const thinContentCheck = checkThinContent(content);
  if (!thinContentCheck.passed) {
    issues.push(...thinContentCheck.issues);
    score -= thinContentCheck.deduction;
  }

  return {
    passed: score >= 70 && issues.length === 0,
    score: Math.max(0, score),
    issues,
    warnings,
  };
}

/**
 * Check for duplicate or near-duplicate content
 */
async function checkDuplicateContent(content: {
  title: string;
  description: string;
  url: string;
  characterId?: string;
}): Promise<{ passed: boolean; issues: string[]; deduction: number }> {
  const issues: string[] = [];
  let deduction = 0;

  if (content.characterId) {
    // Check if this character's metadata is unique
    const similarCharacters = await db.personaTemplate.findMany({
      where: {
        id: { not: content.characterId },
        OR: [
          { description: content.description },
          { tagline: content.title.substring(0, 100) },
        ],
      },
      take: 5,
    });

    if (similarCharacters.length > 0) {
      issues.push('Similar content found for other characters');
      deduction += 20;
    }
  }

  // Check title uniqueness (fuzzy match)
  const titleWords = content.title.toLowerCase().split(/\s+/);
  const titleSignature = titleWords.slice(0, 5).join(' ');

  const duplicateTitles = await db.personaTemplate.findMany({
    where: {
      name: { contains: titleSignature, mode: 'insensitive' },
      ...(content.characterId && { id: { not: content.characterId } }),
    },
    take: 1,
  });

  if (duplicateTitles.length > 0) {
    issues.push('Title too similar to existing content');
    deduction += 15;
  }

  return {
    passed: issues.length === 0,
    issues,
    deduction,
  };
}

/**
 * Check content length (must be substantial, not thin)
 */
function checkContentLength(content: {
  title: string;
  description: string;
  content?: string;
}): { passed: boolean; issues: string[]; deduction: number } {
  const issues: string[] = [];
  let deduction = 0;

  // Title should be 30-60 characters
  if (content.title.length < 30) {
    issues.push('Title too short (should be 30-60 characters)');
    deduction += 10;
  } else if (content.title.length > 60) {
    issues.push('Title too long (should be 30-60 characters)');
    deduction += 5;
  }

  // Description should be 120-160 characters
  if (content.description.length < 120) {
    issues.push('Description too short (should be 120-160 characters)');
    deduction += 15;
  } else if (content.description.length > 160) {
    // Warning but not a critical issue
    deduction += 5;
  }

  // If there's content, it should be substantial (minimum 300 words)
  if (content.content) {
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount < 300) {
      issues.push('Content too short (should be at least 300 words)');
      deduction += 20;
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    deduction,
  };
}

/**
 * Check for keyword stuffing
 */
function checkKeywordStuffing(content: {
  title: string;
  description: string;
  content?: string;
}): { passed: boolean; issues: string[]; deduction: number } {
  const issues: string[] = [];
  let deduction = 0;

  const checkKeywordDensity = (text: string, keyword: string): number => {
    const words = text.toLowerCase().split(/\s+/);
    const keywordMatches = words.filter(w => w.includes(keyword.toLowerCase())).length;
    return (keywordMatches / words.length) * 100;
  };

  // Check for excessive keyword repetition
  const text = `${content.title} ${content.description} ${content.content || ''}`;
  const words = text.toLowerCase().split(/\s+/);
  const wordFrequency: Record<string, number> = {};

  words.forEach(word => {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord.length > 3) {
      wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
  });

  // Check if any word appears more than 5% of the time (keyword stuffing threshold)
  const totalWords = words.length;
  for (const [word, count] of Object.entries(wordFrequency)) {
    const density = (count / totalWords) * 100;
    if (density > 5) {
      issues.push(`Keyword stuffing detected: "${word}" appears ${density.toFixed(1)}% of the time`);
      deduction += 25;
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    deduction,
  };
}

/**
 * Check for originality (not template-based spam)
 */
async function checkOriginality(content: {
  title: string;
  description: string;
  characterId?: string;
  category?: string;
  archetype?: string;
}): Promise<{ passed: boolean; issues: string[]; deduction: number }> {
  const issues: string[] = [];
  let deduction = 0;

  // Check for template patterns (common spam indicators)
  const templatePatterns = [
    /^[A-Z][a-z]+\s+AI\s+Character$/i,
    /^Chat\s+with\s+.+$/i,
    /^Discover\s+.+\s+Characters$/i,
    /^\d+\s+.+\s+Characters$/i,
  ];

  for (const pattern of templatePatterns) {
    if (pattern.test(content.title)) {
      // Template patterns are common, just log as warning (not blocking)
      deduction += 3;
    }
  }

  // Check if description is unique (not repeated across many characters)
  if (content.description) {
    const descriptionWords = content.description.toLowerCase().split(/\s+/).slice(0, 10).join(' ');
    
    const similarDescriptions = await db.personaTemplate.findMany({
      where: {
        description: {
          contains: descriptionWords.substring(0, 50),
          mode: 'insensitive',
        },
        ...(content.characterId && { id: { not: content.characterId } }),
      },
      take: 3,
    });

    if (similarDescriptions.length >= 3) {
      issues.push('Description too similar to multiple other characters');
      deduction += 20;
    }
  }

  return {
    passed: issues.length === 0,
    issues,
    deduction,
  };
}

/**
 * Check for over-optimization (excessive SEO)
 */
function checkOverOptimization(content: {
  title: string;
  description: string;
  url: string;
}): { passed: boolean; warnings: string[]; deduction: number } {
  const warnings: string[] = [];
  let deduction = 0;

  // Check for excessive keyword usage in title
  const titleWords = content.title.toLowerCase().split(/\s+/);
  const commonKeywords = ['ai', 'character', 'chat', 'chatbot', 'virtual'];
  const keywordCount = titleWords.filter(w => commonKeywords.includes(w)).length;
  
  if (keywordCount > 2) {
    warnings.push('Title may be over-optimized with too many keywords');
    deduction += 5;
  }

  // Check URL structure (should be natural, not keyword-stuffed)
  const urlParts = content.url.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  if (lastPart && lastPart.split('-').length > 5) {
    warnings.push('URL may be over-optimized');
    deduction += 5;
  }

  return {
    passed: warnings.length === 0,
    warnings,
    deduction,
  };
}

/**
 * Check for thin content
 */
function checkThinContent(content: {
  description: string;
  content?: string;
}): { passed: boolean; issues: string[]; deduction: number } {
  const issues: string[] = [];
  let deduction = 0;

  // Description must have substance
  if (content.description.split(/\s+/).length < 20) {
    issues.push('Description is too short (thin content)');
    deduction += 25;
  }

  // If there's content, it must be substantial
  if (content.content && content.content.split(/\s+/).length < 200) {
    issues.push('Content is too short (thin content)');
    deduction += 30;
  }

  return {
    passed: issues.length === 0,
    issues,
    deduction,
  };
}

/**
 * Generate unique, compliant content
 */
export async function generateCompliantContent(
  character: {
    id: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    category?: string | null;
    archetype?: string | null;
  }
): Promise<{
  title: string;
  description: string;
  passed: boolean;
  qualityScore: number;
}> {
  // Generate unique title variations
  const titleVariations = generateUniqueTitle(character);
  
  // Generate unique description
  const description = await generateUniqueDescription(character);

  // Check compliance
  const compliance = await checkGoogleCompliance({
    title: titleVariations[0],
    description,
    url: `/character/${character.id}`,
    characterId: character.id,
    category: character.category || undefined,
    archetype: character.archetype || undefined,
  });

  // If not compliant, try variations
  if (!compliance.passed) {
    for (const title of titleVariations.slice(1)) {
      const altCompliance = await checkGoogleCompliance({
        title,
        description,
        url: `/character/${character.id}`,
        characterId: character.id,
      });

      if (altCompliance.passed) {
        return {
          title,
          description,
          passed: true,
          qualityScore: altCompliance.score,
        };
      }
    }
  }

  return {
    title: titleVariations[0],
    description,
    passed: compliance.passed,
    qualityScore: compliance.score,
  };
}

/**
 * Generate unique title variations
 */
function generateUniqueTitle(character: {
  name: string;
  tagline?: string | null;
  category?: string | null;
}): string[] {
  const variations: string[] = [];

  // Variation 1: Name + tagline
  if (character.tagline) {
    variations.push(`${character.name} - ${character.tagline}`);
  }

  // Variation 2: Name + category (if relevant)
  if (character.category) {
    variations.push(`${character.name} | ${character.category} AI Character`);
  }

  // Variation 3: Name + descriptive
  variations.push(`Chat with ${character.name} - AI Character Conversation`);

  // Variation 4: Name only (most natural)
  variations.push(`${character.name} - AI Character Chat`);

  return variations;
}

/**
 * Generate unique description (ensures no duplicates)
 */
async function generateUniqueDescription(character: {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  category?: string | null;
}): Promise<string> {
  let baseDescription = character.description || character.tagline || '';

  // If no description, generate one
  if (!baseDescription) {
    baseDescription = `Chat with ${character.name}, an AI character${character.category ? ` from the ${character.category} category` : ''}. Start a conversation and explore unique interactions.`;
  }

  // Check for uniqueness
  const similarDescriptions = await db.personaTemplate.findMany({
    where: {
      description: {
        contains: baseDescription.substring(0, 50),
        mode: 'insensitive',
      },
      id: { not: character.id },
    },
    take: 1,
  });

  // If duplicate found, add unique elements
  if (similarDescriptions.length > 0 && baseDescription.length < 100) {
    const uniqueSuffix = character.category
      ? ` Discover ${character.name} and explore ${character.category.toLowerCase()} AI characters.`
      : ` Start chatting with ${character.name} today.`;
    baseDescription = baseDescription + uniqueSuffix;
  }

  // Ensure proper length (120-160 characters)
  if (baseDescription.length < 120) {
    const suffix = ` Explore unique conversations and interact with ${character.name} on Agentwood.`;
    baseDescription = (baseDescription + suffix).substring(0, 160);
  } else if (baseDescription.length > 160) {
    baseDescription = baseDescription.substring(0, 157) + '...';
  }

  return baseDescription;
}

