/**
 * Bulk Database Operations for Performance
 * Phase 2: Scale
 */

import { db } from '../../db';
import { processInParallel } from '../parallel-processing';

/**
 * Bulk index characters to Google
 */
export async function bulkIndexCharacters(
  characterIds: string[],
  concurrency: number = 10
): Promise<{ success: number; failed: number }> {
  const { submitToGoogleIndexing } = await import('../google-indexing');
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';
  
  let success = 0;
  let failed = 0;

  await processInParallel(
    characterIds,
    async (characterId) => {
      const url = `${baseUrl}/character/${characterId}`;
      const result = await submitToGoogleIndexing(url);
      return result;
    },
    concurrency
  ).then(results => {
    results.forEach(result => {
      if (result) success++;
      else failed++;
    });
  });

  return { success, failed };
}

/**
 * Bulk update character metadata
 */
export async function bulkUpdateCharacterMetadata(
  updates: Array<{
    id: string;
    data: {
      viewCount?: number;
      interactionCount?: number;
      followerCount?: number;
    };
  }>,
  concurrency: number = 20
): Promise<void> {
  await processInParallel(
    updates,
    async (update) => {
      await db.personaTemplate.update({
        where: { id: update.id },
        data: update.data,
      });
    },
    concurrency
  );
}

/**
 * Bulk generate internal links for characters
 */
export async function bulkGenerateLinks(
  characterIds: string[],
  concurrency: number = 10
): Promise<Map<string, number>> {
  const linkCounts = new Map<string, number>();
  
  await processInParallel(
    characterIds,
    async (characterId) => {
      const { generateOptimizedLinks } = await import('../internal-linking-optimizer');
      const links = await generateOptimizedLinks(characterId, 20);
      linkCounts.set(characterId, links.length);
      return links.length;
    },
    concurrency
  );

  return linkCounts;
}

/**
 * Bulk export character data for sitemap
 */
export async function bulkExportCharacterData(
  limit: number = 100000,
  batchSize: number = 1000
): Promise<Array<{
  id: string;
  updatedAt: Date | null;
  viewCount: number;
}>> {
  const results: Array<{
    id: string;
    updatedAt: Date | null;
    viewCount: number;
  }> = [];

  let offset = 0;
  while (offset < limit) {
    const batch = await db.personaTemplate.findMany({
      select: {
        id: true,
        updatedAt: true,
        viewCount: true,
      },
      orderBy: {
        viewCount: 'desc',
      },
      take: batchSize,
      skip: offset,
    });

    if (batch.length === 0) break;

    results.push(...batch);
    offset += batchSize;
  }

  return results;
}


