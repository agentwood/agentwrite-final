/**
 * Quality Filters for Content
 * Prevents low-quality, spammy, or non-compliant content
 */

interface QualityFilterResult {
  passed: boolean;
  score: number; // 0-100
  reasons: string[];
}

/**
 * Filter content before indexing/publishing
 */
export function applyQualityFilters(content: {
  title: string;
  description: string;
  url: string;
  wordCount?: number;
}): QualityFilterResult {
  const reasons: string[] = [];
  let score = 100;

  // 1. Minimum word count (prevent thin content)
  const totalWords = (content.title + ' ' + content.description).split(/\s+/).length;
  if (totalWords < 30) {
    reasons.push('Content too short (minimum 30 words required)');
    score -= 40;
    return { passed: false, score, reasons };
  }

  // 2. Check for spam patterns
  const spamPatterns = [
    /click here/i,
    /buy now/i,
    /limited time/i,
    /\$\$\$/,
    /!!!+/,
    /free\s+free\s+free/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content.title) || pattern.test(content.description)) {
      reasons.push('Spam pattern detected');
      score -= 50;
      return { passed: false, score, reasons };
    }
  }

  // 3. Check for excessive capitalization
  const capsRatio = (content.title.match(/[A-Z]/g) || []).length / content.title.length;
  if (capsRatio > 0.5 && content.title.length > 10) {
    reasons.push('Excessive capitalization');
    score -= 20;
  }

  // 4. Check for repeated characters/words
  const repeatedChars = content.title.match(/(.)\1{3,}/g);
  if (repeatedChars) {
    reasons.push('Repeated characters detected');
    score -= 15;
  }

  // 5. Check for URL structure quality
  const urlParts = content.url.split('/').filter(p => p.length > 0);
  const lastPart = urlParts[urlParts.length - 1];
  if (lastPart && lastPart.split('-').length > 8) {
    reasons.push('URL may be over-optimized');
    score -= 10;
  }

  // 6. Check for proper punctuation (not excessive)
  const exclamationCount = (content.title.match(/!/g) || []).length;
  if (exclamationCount > 2) {
    reasons.push('Excessive exclamation marks');
    score -= 10;
  }

  // 7. Check for readable text (not all caps, not all lowercase)
  const hasVariedCase = /[a-z]/.test(content.title) && /[A-Z]/.test(content.title);
  if (!hasVariedCase && content.title.length > 15) {
    reasons.push('Text lacks proper capitalization');
    score -= 5;
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    reasons,
  };
}

/**
 * Check if content is human-readable (not bot-generated spam)
 */
export function checkHumanReadability(content: string): boolean {
  // Check for natural sentence structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return false;

  // Check average sentence length (should be 10-25 words)
  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  if (avgLength < 8 || avgLength > 30) return false;

  // Check for variety in sentence starters
  const starters = sentences.map(s => s.trim().split(/\s+/)[0].toLowerCase());
  const uniqueStarters = new Set(starters);
  if (uniqueStarters.size < sentences.length * 0.3) return false; // At least 30% variety

  return true;
}

/**
 * Validate content before SEO processing
 */
export async function validateContentQuality(content: {
  title: string;
  description: string;
  url: string;
  characterId?: string;
}): Promise<{ valid: boolean; score: number; issues: string[] }> {
  const filters = applyQualityFilters(content);
  const readable = checkHumanReadability(content.description);

  const issues = [...filters.reasons];
  if (!readable) {
    issues.push('Content may not be human-readable');
  }

  let finalScore = filters.score;
  if (!readable) {
    finalScore -= 20;
  }

  return {
    valid: filters.passed && readable && finalScore >= 70,
    score: finalScore,
    issues,
  };
}


