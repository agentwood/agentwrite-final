import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getAllPostsWithDates } from '@/lib/blog/service';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/create`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Add blog posts with actual dates
  const blogPosts = await getAllPostsWithDates();
  const blogRoutes = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  routes.push(...blogRoutes);

  try {
    // Get ALL characters for maximum indexing (up to 100k)
    const characters = await db.personaTemplate.findMany({
      select: {
        id: true,
        updatedAt: true,
        viewCount: true,
        interactionCount: true,
      },
      orderBy: [
        { viewCount: 'desc' },
        { interactionCount: 'desc' },
      ],
      take: 100000, // Scale to 100k characters
    });

    // Add character pages (all characters, not just with views)
    const characterRoutes = characters.map((character) => ({
      url: `${SITE_URL}/character/${character.id}`,
      lastModified: character.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: character.viewCount > 1000 ? 0.9 : character.viewCount > 100 ? 0.7 : character.viewCount > 0 ? 0.5 : 0.3,
    }));

    routes.push(...characterRoutes);

    // Get unique categories
    const categories = await db.personaTemplate.groupBy({
      by: ['category'],
    });

    // Add category pages (with pagination) - filter nulls
    categories
      .filter((cat) => cat.category != null && cat.category !== '')
      .forEach((cat) => {
        const categoryUrl = encodeURIComponent(cat.category || '');
        // Add main category page
        routes.push({
          url: `${SITE_URL}/category/${categoryUrl}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        });
        // Add paginated category pages (first 10 pages to preserve crawl budget)
        for (let page = 2; page <= 10; page++) {
          routes.push({
            url: `${SITE_URL}/category/${categoryUrl}?page=${page}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.4,
          });
        }
      });

    // Get unique archetypes
    const archetypes = await db.personaTemplate.groupBy({
      by: ['archetype'],
    });

    // Add archetype pages with deep pagination (200 pages) - filter nulls
    archetypes
      .filter((arch) => arch.archetype != null && arch.archetype !== '')
      .forEach((arch) => {
        const archetypeUrl = encodeURIComponent(arch.archetype || '');
        // Main archetype page
        routes.push({
          url: `${SITE_URL}/archetype/${archetypeUrl}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.7,
        });
        // Paginated archetype pages (first 10 pages to preserve crawl budget)
        for (let page = 2; page <= 10; page++) {
          routes.push({
            url: `${SITE_URL}/archetype/${archetypeUrl}?page=${page}`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.3,
          });
        }
      });

    // Add category + archetype combination pages
    const combinations = await db.personaTemplate.groupBy({
      by: ['category', 'archetype'],
    });

    // Filter nulls and add combination pages
    combinations
      .filter((combo) => combo.category != null && combo.category !== '' && combo.archetype != null && combo.archetype !== '')
      .forEach((combo) => {
        const categoryUrl = encodeURIComponent(combo.category || '');
        const archetypeUrl = encodeURIComponent(combo.archetype || '');
        routes.push({
          url: `${SITE_URL}/category/${categoryUrl}/archetype/${archetypeUrl}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        });
      });

    // Add "top" listing pages with pagination
    const topTypes = ['popular', 'trending', 'most-viewed', 'most-chatted', 'newest', 'top-rated'];
    topTypes.forEach((type) => {
      routes.push({
        url: `${SITE_URL}/top/${type}`,
        lastModified: new Date(),
        changeFrequency: 'hourly' as const,
        priority: 0.9,
      });
      // Paginated top pages (10 pages each to preserve crawl budget)
      for (let page = 2; page <= 10; page++) {
        routes.push({
          url: `${SITE_URL}/top/${type}?page=${page}`,
          lastModified: new Date(),
          changeFrequency: 'hourly' as const,
          priority: 0.5,
        });
      }
    });

    // Add A-Z character pages
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    letters.forEach((letter) => {
      routes.push({
        url: `${SITE_URL}/characters/${letter}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      });
      // Paginated A-Z pages (first 20 pages per letter to preserve crawl budget)
      for (let page = 2; page <= 20; page++) {
        routes.push({
          url: `${SITE_URL}/characters/${letter}?page=${page}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.3,
        });
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}

