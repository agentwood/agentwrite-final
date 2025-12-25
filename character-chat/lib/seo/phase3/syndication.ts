/**
 * Multi-Platform Syndication System
 * Phase 3: Advanced (Month 2+)
 */

interface SyndicationPlatform {
  name: string;
  apiEndpoint: string;
  enabled: boolean;
}

const SYNDICATION_PLATFORMS: SyndicationPlatform[] = [
  {
    name: 'Medium',
    apiEndpoint: 'https://api.medium.com/v1',
    enabled: !!process.env.MEDIUM_ACCESS_TOKEN,
  },
  {
    name: 'Dev.to',
    apiEndpoint: 'https://dev.to/api/articles',
    enabled: !!process.env.DEV_TO_API_KEY,
  },
  {
    name: 'Hashnode',
    apiEndpoint: 'https://api.hashnode.com',
    enabled: !!process.env.HASHNODE_API_KEY,
  },
];

/**
 * Syndicate content to multiple platforms
 */
export async function syndicateContent(
  content: {
    title: string;
    content: string;
    tags: string[];
    canonicalUrl: string;
  }
): Promise<{ platform: string; success: boolean; url?: string }[]> {
  const results = [];

  for (const platform of SYNDICATION_PLATFORMS.filter(p => p.enabled)) {
    try {
      const result = await syndicateToPlatform(platform, content);
      results.push({ platform: platform.name, success: true, url: result.url });
    } catch (error) {
      console.error(`Failed to syndicate to ${platform.name}:`, error);
      results.push({ platform: platform.name, success: false });
    }
  }

  return results;
}

async function syndicateToPlatform(
  platform: SyndicationPlatform,
  content: {
    title: string;
    content: string;
    tags: string[];
    canonicalUrl: string;
  }
): Promise<{ url: string }> {
  switch (platform.name) {
    case 'Medium':
      return await syndicateToMedium(content);
    case 'Dev.to':
      return await syndicateToDevTo(content);
    case 'Hashnode':
      return await syndicateToHashnode(content);
    default:
      throw new Error(`Unknown platform: ${platform.name}`);
  }
}

async function syndicateToMedium(content: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl: string;
}): Promise<{ url: string }> {
  const userId = process.env.MEDIUM_USER_ID;
  const accessToken = process.env.MEDIUM_ACCESS_TOKEN;

  const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: content.title,
      contentFormat: 'html',
      content: content.content,
      tags: content.tags.slice(0, 5),
      canonicalUrl: content.canonicalUrl,
      publishStatus: 'public',
    }),
  });

  const data = await response.json();
  return { url: data.data.url };
}

async function syndicateToDevTo(content: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl: string;
}): Promise<{ url: string }> {
  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.DEV_TO_API_KEY!,
    },
    body: JSON.stringify({
      article: {
        title: content.title,
        body_markdown: content.content,
        tags: content.tags.slice(0, 4),
        canonical_url: content.canonicalUrl,
        published: true,
      },
    }),
  });

  const data = await response.json();
  return { url: data.url };
}

async function syndicateToHashnode(content: {
  title: string;
  content: string;
  tags: string[];
  canonicalUrl: string;
}): Promise<{ url: string }> {
  const response = await fetch('https://api.hashnode.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.HASHNODE_API_KEY!,
    },
    body: JSON.stringify({
      query: `
        mutation CreateStory($input: CreateStoryInput!) {
          createStory(input: $input) {
            post {
              url
            }
          }
        }
      `,
      variables: {
        input: {
          title: content.title,
          contentMarkdown: content.content,
          tags: content.tags.map(tag => ({ name: tag, slug: tag.toLowerCase() })),
          isRepublished: {
            originalArticleURL: content.canonicalUrl,
          },
        },
      },
    }),
  });

  const data = await response.json();
  return { url: data.data.createStory.post.url };
}

