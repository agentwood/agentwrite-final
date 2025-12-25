/**
 * Programmatic SEO utilities for generating pages at scale
 */

import { db } from '../db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.ai';

export interface ProgrammaticPageConfig {
  path: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified?: Date;
}

/**
 * Generate all programmatic page configurations
 */
export async function generateProgrammaticPages(): Promise<ProgrammaticPageConfig[]> {
  const pages: ProgrammaticPageConfig[] = [];

  try {
    // Category pages
    const categories = await db.personaTemplate.groupBy({
      by: ['category'],
      where: { category: { not: null } },
    });

    categories.forEach((cat) => {
      const categoryUrl = encodeURIComponent(cat.category || '');
      pages.push({
        path: `/category/${categoryUrl}`,
        priority: 0.8,
        changeFrequency: 'daily',
      });

      // Paginated category pages (first 50 pages for SEO)
      for (let page = 2; page <= 50; page++) {
        pages.push({
          path: `/category/${categoryUrl}?page=${page}`,
          priority: 0.6,
          changeFrequency: 'daily',
        });
      }
    });

    // Archetype pages
    const archetypes = await db.personaTemplate.groupBy({
      by: ['archetype'],
      where: { archetype: { not: null } },
    });

    archetypes.forEach((arch) => {
      const archetypeUrl = encodeURIComponent(arch.archetype || '');
      pages.push({
        path: `/archetype/${archetypeUrl}`,
        priority: 0.7,
        changeFrequency: 'daily',
      });

      for (let page = 2; page <= 50; page++) {
        pages.push({
          path: `/archetype/${archetypeUrl}?page=${page}`,
          priority: 0.5,
          changeFrequency: 'daily',
        });
      }
    });

    // Category + Archetype combination pages
    const combinations = await db.personaTemplate.groupBy({
      by: ['category', 'archetype'],
      where: {
        category: { not: null },
        archetype: { not: null },
      },
    });

    combinations.forEach((combo) => {
      const categoryUrl = encodeURIComponent(combo.category || '');
      const archetypeUrl = encodeURIComponent(combo.archetype || '');
      pages.push({
        path: `/category/${categoryUrl}/archetype/${archetypeUrl}`,
        priority: 0.6,
        changeFrequency: 'weekly',
      });
    });

    // Top listing pages
    const topTypes = ['popular', 'trending', 'most-viewed', 'most-chatted', 'newest', 'top-rated'];
    topTypes.forEach((type) => {
      pages.push({
        path: `/top/${type}`,
        priority: 0.9,
        changeFrequency: 'hourly',
      });

      for (let page = 2; page <= 50; page++) {
        pages.push({
          path: `/top/${type}?page=${page}`,
          priority: 0.7,
          changeFrequency: 'hourly',
        });
      }
    });

    // Character pages (all characters)
    const characterCount = await db.personaTemplate.count();
    // We'll generate these in the sitemap directly
    // but include the count for reference
    console.log(`Total characters for indexing: ${characterCount}`);
  } catch (error) {
    console.error('Error generating programmatic pages:', error);
  }

  return pages;
}

/**
 * Estimate total indexed pages
 */
export async function estimateIndexedPages(): Promise<number> {
  let count = 0;

  try {
    // Static pages
    count += 20; // Main pages (home, about, pricing, etc.)

    // Character pages (all characters)
    const characterCount = await db.personaTemplate.count();
    count += characterCount;

    // Category pages with pagination
    const categories = await db.personaTemplate.groupBy({
      by: ['category'],
      where: { category: { not: null } },
    });
    count += categories.length * 50; // 50 pages per category

    // Archetype pages with pagination
    const archetypes = await db.personaTemplate.groupBy({
      by: ['archetype'],
      where: { archetype: { not: null } },
    });
    count += archetypes.length * 50; // 50 pages per archetype

    // Category + Archetype combinations
    const combinations = await db.personaTemplate.groupBy({
      by: ['category', 'archetype'],
      where: {
        category: { not: null },
        archetype: { not: null },
      },
    });
    count += combinations.length;

    // Top listing pages
    count += 6 * 50; // 6 types * 50 pages each
  } catch (error) {
    console.error('Error estimating pages:', error);
  }

  return count;
}


