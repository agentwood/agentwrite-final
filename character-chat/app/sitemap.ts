/**
 * Sitemap Index for 100K+ URLs
 * 
 * Uses Next.js generateSitemaps() to create multiple sitemap files:
 * - sitemap/0 = Static pages + Blog
 * - sitemap/1 = Characters (personas)
 * - sitemap/2-N = Roleplay combinations (50k per file)
 * - sitemap/N+1 = Chat-with pages
 */

import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getAllPostsWithDates } from '@/lib/blog/service';
import { SEO_DATA } from '@/lib/seo/keywords';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';
const URLS_PER_SITEMAP = 45000; // Stay under 50k limit with buffer

/**
 * Generate sitemap index - tells Next.js how many sitemap files to create
 */
export async function generateSitemaps() {
  // Calculate total roleplay combinations
  const totalRoleplay = SEO_DATA.characters.length * SEO_DATA.scenarios.length;
  const roleplaySegments = Math.ceil(totalRoleplay / URLS_PER_SITEMAP);

  // Segments: 0=static, 1=characters, 2..N=roleplay, N+1=chat-with/talk-to
  const totalSegments = 2 + roleplaySegments + 1;

  return Array.from({ length: totalSegments }, (_, i) => ({ id: i.toString() }));
}

/**
 * Generate sitemap for a specific segment
 */
export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const segmentId = parseInt(id, 10);

  // Segment 0: Static pages + Blog
  if (segmentId === 0) {
    return generateStaticSitemap();
  }

  // Segment 1: Characters
  if (segmentId === 1) {
    return generateCharacterSitemap();
  }

  // Calculate roleplay segment range
  const totalRoleplay = SEO_DATA.characters.length * SEO_DATA.scenarios.length;
  const roleplaySegments = Math.ceil(totalRoleplay / URLS_PER_SITEMAP);
  const lastRoleplaySegment = 1 + roleplaySegments;

  // Segments 2 to lastRoleplaySegment: Roleplay combinations
  if (segmentId >= 2 && segmentId <= lastRoleplaySegment) {
    const roleplayIndex = segmentId - 2;
    return generateRoleplaySitemap(roleplayIndex);
  }

  // Last segment: Chat-with + Talk-to pages
  return generateChatSitemap();
}

/**
 * Static pages + Blog posts
 */
async function generateStaticSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/discover`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/create`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/status`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.5 },
  ];

  // Add blog posts
  try {
    const blogPosts = await getAllPostsWithDates();
    blogPosts.forEach((post) => {
      staticRoutes.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (e) {
    console.error('Error fetching blog posts for sitemap:', e);
  }

  // Add category pages
  try {
    const categories = await db.personaTemplate.groupBy({ by: ['category'] });
    categories.filter(c => c.category).forEach((cat) => {
      staticRoutes.push({
        url: `${SITE_URL}/category/${encodeURIComponent(cat.category!)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      });
    });
  } catch (e) {
    console.error('Error fetching categories for sitemap:', e);
  }

  // Add archetype pages
  try {
    const archetypes = await db.personaTemplate.groupBy({ by: ['archetype'] });
    archetypes.filter(a => a.archetype).forEach((arch) => {
      staticRoutes.push({
        url: `${SITE_URL}/archetype/${encodeURIComponent(arch.archetype!)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  } catch (e) {
    console.error('Error fetching archetypes for sitemap:', e);
  }

  return staticRoutes;
}

/**
 * Character (persona) pages
 */
async function generateCharacterSitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const characters = await db.personaTemplate.findMany({
      select: { id: true, updatedAt: true, viewCount: true },
      orderBy: { viewCount: 'desc' },
      take: URLS_PER_SITEMAP,
    });

    return characters.map((char) => ({
      url: `${SITE_URL}/character/${char.id}`,
      lastModified: char.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: char.viewCount > 1000 ? 0.9 : char.viewCount > 100 ? 0.7 : 0.5,
    }));
  } catch (e) {
    console.error('Error generating character sitemap:', e);
    return [];
  }
}

/**
 * Roleplay combination pages (paginated)
 */
function generateRoleplaySitemap(segmentIndex: number): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];
  const startIndex = segmentIndex * URLS_PER_SITEMAP;
  const endIndex = startIndex + URLS_PER_SITEMAP;

  let currentIndex = 0;

  for (const char of SEO_DATA.characters) {
    for (const scenario of SEO_DATA.scenarios) {
      if (currentIndex >= startIndex && currentIndex < endIndex) {
        routes.push({
          url: `${SITE_URL}/roleplay/${char}/${scenario}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
      currentIndex++;
      if (currentIndex >= endIndex) break;
    }
    if (currentIndex >= endIndex) break;
  }

  return routes;
}

/**
 * Chat-with and Talk-to pages
 */
function generateChatSitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Chat-with pages for each character
  SEO_DATA.characters.forEach((char) => {
    routes.push({
      url: `${SITE_URL}/chat-with/${char}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Talk-to pages for each archetype
  SEO_DATA.archetypes.forEach((archetype) => {
    routes.push({
      url: `${SITE_URL}/talk-to/${archetype}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  // [character]-ai-chat pages
  SEO_DATA.characters.forEach((char) => {
    routes.push({
      url: `${SITE_URL}/${char}-ai-chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  return routes;
}
