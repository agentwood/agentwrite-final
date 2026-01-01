/**
 * Internal Linking Optimization System
 * Phase 1: Quick Wins
 */

import { db } from '../db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

interface InternalLink {
  fromUrl: string;
  toUrl: string;
  anchorText: string;
  relevance: number; // 0-1 relevance score
}

/**
 * Generate optimized internal links for a character page (Google-compliant)
 */
export async function generateOptimizedLinks(
  characterId: string,
  maxLinks: number = 25 // Reduced from 20, but keep under 30 for compliance
): Promise<InternalLink[]> {
  const character = await db.personaTemplate.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      name: true,
      category: true,
      archetype: true,
      description: true,
    },
  });

  if (!character) {
    return [];
  }

  const links: InternalLink[] = [];

  // Same category characters (high relevance)
  if (character.category) {
    const sameCategory = await db.personaTemplate.findMany({
      where: {
        category: character.category,
        id: { not: characterId },
        viewCount: { gt: 0 },
      },
      take: Math.min(10, maxLinks),
      orderBy: { viewCount: 'desc' },
      select: { id: true, name: true, viewCount: true },
    });

    sameCategory.forEach(char => {
      links.push({
        fromUrl: `${SITE_URL}/character/${characterId}`,
        toUrl: `${SITE_URL}/character/${char.id}`,
        anchorText: char.name,
        relevance: 0.9,
      });
    });
  }

  // Same archetype characters (high relevance)
  if (character.archetype && links.length < maxLinks) {
    const sameArchetype = await db.personaTemplate.findMany({
      where: {
        archetype: character.archetype,
        id: { not: characterId },
        category: { not: character.category },
        viewCount: { gt: 0 },
      },
      take: Math.min(5, maxLinks - links.length),
      orderBy: { viewCount: 'desc' },
      select: { id: true, name: true },
    });

    sameArchetype.forEach(char => {
      links.push({
        fromUrl: `${SITE_URL}/character/${characterId}`,
        toUrl: `${SITE_URL}/character/${char.id}`,
        anchorText: char.name,
        relevance: 0.8,
      });
    });
  }

  // Category page link
  if (character.category) {
    links.push({
      fromUrl: `${SITE_URL}/character/${characterId}`,
      toUrl: `${SITE_URL}/category/${encodeURIComponent(character.category)}`,
      anchorText: `More ${character.category} characters`,
      relevance: 0.95,
    });
  }

  // Top pages links
  links.push({
    fromUrl: `${SITE_URL}/character/${characterId}`,
    toUrl: `${SITE_URL}/top/popular`,
    anchorText: 'Popular characters',
    relevance: 0.7,
  });

  links.push({
    fromUrl: `${SITE_URL}/character/${characterId}`,
    toUrl: `${SITE_URL}/top/trending`,
    anchorText: 'Trending characters',
    relevance: 0.7,
  });

  // Import compliance check
  const { generateNaturalLinks, checkLinkingCompliance } = await import('./compliance/linking-compliance');

  // Sort by relevance and limit
  const sortedLinks = links
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxLinks * 2); // Get more to filter

  // Apply compliance filtering - map to expected format
  const naturalLinks = generateNaturalLinks(
    sortedLinks.map(link => ({
      url: link.toUrl,
      anchorText: link.anchorText,
      relevance: link.relevance
    })),
    maxLinks
  );

  // Map back to InternalLink format
  const compliantLinks: InternalLink[] = naturalLinks.map((link) => ({
    fromUrl: `${SITE_URL}/character/${characterId}`,
    toUrl: link.url,
    anchorText: link.anchorText,
    relevance: link.relevance
  }));

  // Verify compliance (using natural links format)
  const compliance = checkLinkingCompliance(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz'}/character/${characterId}`,
    naturalLinks
  );

  if (!compliance.natural && compliance.score < 70) {
    console.warn(`Linking compliance score for character ${characterId}: ${compliance.score}`, compliance.issues);
    // Still return links, but log warning for monitoring
  }

  return compliantLinks;
}

/**
 * Generate internal links for listing pages
 */
export async function generateListingPageLinks(
  pageType: 'category' | 'archetype' | 'top',
  pageValue: string,
  currentPage: number = 1
): Promise<InternalLink[]> {
  const links: InternalLink[] = [];
  const baseUrl = pageType === 'top'
    ? `${SITE_URL}/top/${pageValue}`
    : pageType === 'category'
      ? `${SITE_URL}/category/${encodeURIComponent(pageValue)}`
      : `${SITE_URL}/archetype/${encodeURIComponent(pageValue)}`;

  // Pagination links
  if (currentPage > 1) {
    links.push({
      fromUrl: `${baseUrl}${currentPage > 1 ? `?page=${currentPage}` : ''}`,
      toUrl: currentPage === 2 ? baseUrl : `${baseUrl}?page=${currentPage - 1}`,
      anchorText: 'Previous page',
      relevance: 0.9,
    });
  }

  links.push({
    fromUrl: `${baseUrl}${currentPage > 1 ? `?page=${currentPage}` : ''}`,
    toUrl: `${baseUrl}?page=${currentPage + 1}`,
    anchorText: 'Next page',
    relevance: 0.9,
  });

  // Related category/archetype links
  if (pageType === 'category') {
    const relatedCategories = await db.personaTemplate.groupBy({
      by: ['category'],
      where: {
        category: { not: pageValue },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    relatedCategories.forEach(cat => {
      if (cat.category) {
        links.push({
          fromUrl: baseUrl,
          toUrl: `${SITE_URL}/category/${encodeURIComponent(cat.category)}`,
          anchorText: `${cat.category} characters`,
          relevance: 0.7,
        });
      }
    });
  }

  // Homepage and discover links
  links.push({
    fromUrl: baseUrl,
    toUrl: SITE_URL,
    anchorText: 'Home',
    relevance: 0.8,
  });

  links.push({
    fromUrl: baseUrl,
    toUrl: `${SITE_URL}/discover`,
    anchorText: 'Discover all characters',
    relevance: 0.85,
  });

  return links.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Inject internal links into HTML content
 */
export function injectInternalLinks(
  htmlContent: string,
  links: InternalLink[]
): string {
  let content = htmlContent;

  // Simple keyword-based linking (can be enhanced with NLP)
  links.forEach(link => {
    // Only inject if anchor text appears in content and not already linked
    const anchorRegex = new RegExp(`(^|[^>])${escapeRegex(link.anchorText)}([^<]|$)`, 'gi');
    if (anchorRegex.test(content) && !content.includes(`href="${link.toUrl}"`)) {
      content = content.replace(
        anchorRegex,
        `$1<a href="${link.toUrl}" class="internal-link">${link.anchorText}</a>$2`
      );
    }
  });

  return content;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

