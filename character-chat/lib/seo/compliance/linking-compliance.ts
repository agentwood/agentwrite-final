/**
 * Internal Linking Compliance
 * Ensures internal links follow Google's guidelines (natural, not spammy)
 */

interface LinkQuality {
  natural: boolean;
  relevant: boolean;
  notOverOptimized: boolean;
  score: number; // 0-100
  issues: string[];
}

/**
 * Check if internal linking is compliant
 */
export function checkLinkingCompliance(
  pageUrl: string,
  links: Array<{
    url: string;
    anchorText: string;
    relevance: number;
  }>
): LinkQuality {
  const issues: string[] = [];
  let score = 100;

  // 1. Check link count (shouldn't be excessive)
  if (links.length > 50) {
    issues.push('Too many internal links (max 50 recommended)');
    score -= 20;
  } else if (links.length > 30) {
    issues.push('Many internal links (consider reducing to 30)');
    score -= 10;
  }

  // 2. Check for exact match anchor text spam
  const anchorTexts = links.map(l => l.anchorText.toLowerCase());
  const duplicateAnchors = anchorTexts.filter((text, index) => 
    anchorTexts.indexOf(text) !== index
  );
  
  if (duplicateAnchors.length > 5) {
    issues.push('Too many duplicate anchor texts (over-optimization)');
    score -= 25;
  }

  // 3. Check for keyword-stuffed anchors
  const keywordStuffedAnchors = links.filter(link => {
    const words = link.anchorText.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(w => 
      ['ai', 'character', 'chat', 'chatbot'].includes(w)
    ).length;
    return keywordCount > 2;
  });

  if (keywordStuffedAnchors.length > links.length * 0.3) {
    issues.push('Too many keyword-stuffed anchor texts');
    score -= 20;
  }

  // 4. Check relevance distribution (should vary)
  const highRelevanceCount = links.filter(l => l.relevance > 0.8).length;
  if (highRelevanceCount > links.length * 0.7) {
    issues.push('Too many high-relevance links (may look unnatural)');
    score -= 10;
  }

  // 5. Check for reciprocal links (A->B and B->A immediately)
  // This is a simplified check - would need full page analysis for complete check
  // For now, we'll rely on relevance scoring

  return {
    natural: score >= 70,
    relevant: links.every(l => l.relevance > 0.5),
    notOverOptimized: duplicateAnchors.length <= 3 && keywordStuffedAnchors.length <= links.length * 0.2,
    score: Math.max(0, score),
    issues,
  };
}

/**
 * Generate natural, compliant internal links
 */
export function generateNaturalLinks(
  allLinks: Array<{
    url: string;
    anchorText: string;
    relevance: number;
  }>,
  maxLinks: number = 30
): Array<{
  url: string;
  anchorText: string;
  relevance: number;
}> {
  // Sort by relevance, but add some randomness to avoid perfect patterns
  const sortedLinks = [...allLinks].sort((a, b) => b.relevance - a.relevance);
  
  // Take top links, but vary anchor text
  const selected: Array<{ url: string; anchorText: string; relevance: number }> = [];
  const usedAnchors = new Set<string>();
  
  for (const link of sortedLinks) {
    if (selected.length >= maxLinks) break;
    
    // If anchor text is unique enough, include it
    const anchorLower = link.anchorText.toLowerCase();
    const isUnique = !usedAnchors.has(anchorLower);
    
    if (isUnique || Math.random() > 0.3) { // 30% chance to allow duplicates if highly relevant
      selected.push(link);
      usedAnchors.add(anchorLower);
    }
  }
  
  // Shuffle slightly to avoid perfect relevance order (more natural)
  return selected.sort(() => Math.random() - 0.3);
}

/**
 * Ensure canonical tags are properly set (no duplicate content issues)
 */
export function generateCanonicalUrl(
  url: string,
  isCanonical: boolean = true
): string {
  // Remove query parameters for canonical (unless they're meaningful)
  const urlObj = new URL(url, 'https://agentwood.xyz');
  
  // Keep only meaningful query params (like page numbers for pagination)
  const meaningfulParams = ['page'];
  const params = new URLSearchParams();
  
  for (const param of meaningfulParams) {
    const value = urlObj.searchParams.get(param);
    if (value) {
      params.set(param, value);
    }
  }
  
  const canonicalPath = urlObj.pathname;
  const canonicalQuery = params.toString();
  
  return canonicalPath + (canonicalQuery ? `?${canonicalQuery}` : '');
}

