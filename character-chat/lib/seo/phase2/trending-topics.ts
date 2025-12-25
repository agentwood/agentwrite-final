/**
 * Trending Topics Integration
 * Phase 2: Scale
 */

import { db } from '../../db';

interface TrendingTopic {
  keyword: string;
  searchVolume: number;
  trendScore: number;
  relatedCharacters: string[];
}

/**
 * Get trending topics from character interactions
 */
export async function getTrendingTopics(limit: number = 20): Promise<TrendingTopic[]> {
  // Get characters with highest recent interaction growth
  const recentCharacters = await db.personaTemplate.findMany({
    where: {
      interactionCount: { gt: 0 },
    },
    orderBy: {
      interactionCount: 'desc',
    },
    take: limit * 2, // Get more to filter
    select: {
      id: true,
      name: true,
      category: true,
      interactionCount: true,
      viewCount: true,
    },
  });

  // Calculate trend scores (interaction growth rate)
  const trendingTopics: TrendingTopic[] = recentCharacters.slice(0, limit).map(char => ({
    keyword: char.name,
    searchVolume: char.viewCount || 0,
    trendScore: (char.interactionCount || 0) / Math.max(1, char.viewCount || 1),
    relatedCharacters: [char.id],
  }));

  // Add category-based trending topics
  const categoryStats = await db.personaTemplate.groupBy({
    by: ['category'],
    where: {
      category: { not: null },
      interactionCount: { gt: 0 },
    },
    _sum: {
      interactionCount: true,
      viewCount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        interactionCount: 'desc',
      },
    },
    take: 10,
  });

  categoryStats.forEach(cat => {
    if (cat.category) {
      trendingTopics.push({
        keyword: `${cat.category} characters`,
        searchVolume: cat._sum.viewCount || 0,
        trendScore: (cat._sum.interactionCount || 0) / Math.max(1, cat._sum.viewCount || 1),
        relatedCharacters: [], // Will be populated separately
      });
    }
  });

  return trendingTopics.sort((a, b) => b.trendScore - a.trendScore).slice(0, limit);
}

/**
 * Generate content pages for trending topics
 */
export async function generateTrendingTopicPages(): Promise<Array<{
  path: string;
  title: string;
  description: string;
  keywords: string[];
}>> {
  const topics = await getTrendingTopics(50);
  
  return topics.map(topic => ({
    path: `/trending/${encodeURIComponent(topic.keyword.toLowerCase().replace(/\s+/g, '-'))}`,
    title: `Trending: ${topic.keyword} AI Characters`,
    description: `Discover trending ${topic.keyword} AI characters. Chat with the most popular and engaging characters.`,
    keywords: [
      `trending ${topic.keyword}`,
      `${topic.keyword} AI characters`,
      'popular characters',
      'AI chatbot',
    ],
  }));
}


