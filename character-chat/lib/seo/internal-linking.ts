/**
 * Internal linking utilities for SEO and navigation
 */

import { db } from '../db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.ai';

export interface InternalLink {
  url: string;
  text: string;
  title?: string;
}

/**
 * Generate internal links for a character based on category/archetype
 */
export async function generateCharacterRelatedLinks(characterId: string, limit: number = 5): Promise<InternalLink[]> {
  const character = await db.personaTemplate.findUnique({
    where: { id: characterId },
    select: { category: true, archetype: true },
  });

  if (!character) return [];

  const links: InternalLink[] = [];

  // Same category characters
  if (character.category) {
    const sameCategory = await db.personaTemplate.findMany({
      where: {
        category: character.category,
        id: { not: characterId },
        viewCount: { gt: 0 },
      },
      take: Math.ceil(limit / 2),
      orderBy: { viewCount: 'desc' },
      select: { id: true, name: true },
    });

    sameCategory.forEach(char => {
      links.push({
        url: `/character/${char.id}`,
        text: char.name,
        title: `Chat with ${char.name}`,
      });
    });
  }

  // Same archetype characters
  if (character.archetype && links.length < limit) {
    const sameArchetype = await db.personaTemplate.findMany({
      where: {
        archetype: character.archetype,
        id: { not: characterId },
        viewCount: { gt: 0 },
      },
      take: limit - links.length,
      orderBy: { viewCount: 'desc' },
      select: { id: true, name: true },
    });

    sameArchetype.forEach(char => {
      links.push({
        url: `/character/${char.id}`,
        text: char.name,
        title: `Chat with ${char.name}`,
      });
    });
  }

  // Category page link
  if (character.category) {
    links.unshift({
      url: `/discover?category=${character.category}`,
      text: `More ${character.category} characters`,
      title: `Browse ${character.category} characters`,
    });
  }

  return links;
}

/**
 * Generate category navigation links
 */
export async function generateCategoryLinks(): Promise<InternalLink[]> {
  const categories = await db.personaTemplate.groupBy({
    by: ['category'],
    where: {
      category: { not: null },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  return categories.map(cat => ({
    url: `/discover?category=${cat.category}`,
    text: `${cat.category} (${cat._count.id})`,
    title: `Browse ${cat.category} characters`,
  }));
}

/**
 * Generate breadcrumb links for a character page
 */
export function generateCharacterBreadcrumbs(character: {
  id: string;
  name: string;
  category?: string | null;
}): InternalLink[] {
  const breadcrumbs: InternalLink[] = [
    { url: '/', text: 'Home' },
    { url: '/discover', text: 'Discover' },
  ];

  if (character.category) {
    breadcrumbs.push({
      url: `/discover?category=${character.category}`,
      text: character.category,
    });
  }

  breadcrumbs.push({
    url: `/character/${character.id}`,
    text: character.name,
  });

  return breadcrumbs;
}

/**
 * Generate related content suggestions
 */
export async function generateRelatedContent(characterId: string): Promise<{
  relatedCharacters: InternalLink[];
  categories: InternalLink[];
  popular: InternalLink[];
}> {
  const [relatedCharacters, categories, popular] = await Promise.all([
    generateCharacterRelatedLinks(characterId, 6),
    generateCategoryLinks(),
    db.personaTemplate.findMany({
      where: {
        id: { not: characterId },
        viewCount: { gt: 100 },
      },
      take: 5,
      orderBy: { viewCount: 'desc' },
      select: { id: true, name: true },
    }).then(chars => chars.map(char => ({
      url: `/character/${char.id}`,
      text: char.name,
      title: `Chat with ${char.name}`,
    }))),
  ]);

  return {
    relatedCharacters: relatedCharacters.slice(0, 6),
    categories: categories.slice(0, 5),
    popular,
  };
}

