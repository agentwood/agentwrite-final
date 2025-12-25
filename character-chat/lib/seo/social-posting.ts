/**
 * Social Media Auto-Posting System
 * Phase 1: Quick Wins
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

interface SocialPost {
  text: string;
  imageUrl?: string;
  url: string;
  platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit';
}

/**
 * Post to Twitter/X
 */
export async function postToTwitter(
  text: string,
  url: string,
  imageUrl?: string
): Promise<boolean> {
  // Implementation depends on Twitter API v2
  // For now, return success (implement with actual API later)
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.warn('Twitter API credentials not configured');
    return false;
  }

  try {
    // TODO: Implement actual Twitter API posting
    // Using Twitter API v2 with OAuth 2.0
    console.log('Posting to Twitter:', { text, url, imageUrl });
    return true;
  } catch (error) {
    console.error('Error posting to Twitter:', error);
    return false;
  }
}

/**
 * Post to Facebook
 */
export async function postToFacebook(
  text: string,
  url: string,
  imageUrl?: string
): Promise<boolean> {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!pageAccessToken || !pageId) {
    console.warn('Facebook API credentials not configured');
    return false;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          link: url,
          access_token: pageAccessToken,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    return false;
  }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  text: string,
  url: string,
  imageUrl?: string
): Promise<boolean> {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const personUrn = process.env.LINKEDIN_PERSON_URN;

  if (!accessToken || !personUrn) {
    console.warn('LinkedIn API credentials not configured');
    return false;
  }

  try {
    // LinkedIn API implementation
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text,
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text,
                },
                originalUrl: url,
              },
            ],
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    return false;
  }
}

/**
 * Post to Reddit
 */
export async function postToReddit(
  text: string,
  url: string,
  subreddit: string = 'AICharacterChat'
): Promise<boolean> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;

  if (!clientId || !clientSecret || !username || !password) {
    console.warn('Reddit API credentials not configured');
    return false;
  }

  try {
    // Get access token first
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: `grant_type=password&username=${username}&password=${password}`,
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      return false;
    }

    // Post to subreddit
    const postResponse = await fetch(`https://oauth.reddit.com/api/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sr: subreddit,
        kind: 'link',
        title: text.substring(0, 300),
        url,
      }),
    });

    return postResponse.ok;
  } catch (error) {
    console.error('Error posting to Reddit:', error);
    return false;
  }
}

/**
 * Post to all configured social platforms
 */
export async function postToAllPlatforms(
  text: string,
  url: string,
  imageUrl?: string
): Promise<{ platform: string; success: boolean }[]> {
  const results = await Promise.allSettled([
    postToTwitter(text, url, imageUrl).then(success => ({ platform: 'twitter', success })),
    postToFacebook(text, url, imageUrl).then(success => ({ platform: 'facebook', success })),
    postToLinkedIn(text, url, imageUrl).then(success => ({ platform: 'linkedin', success })),
    postToReddit(text, url).then(success => ({ platform: 'reddit', success })),
  ]);

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    const platforms = ['twitter', 'facebook', 'linkedin', 'reddit'];
    return { platform: platforms[index], success: false };
  });
}

/**
 * Generate social media post for a character
 */
export function generateCharacterPost(character: {
  name: string;
  tagline?: string | null;
  description?: string | null;
  id: string;
}): string {
  const url = `${SITE_URL}/character/${character.id}`;
  const description = character.description 
    ? character.description.substring(0, 150) + '...'
    : character.tagline || '';
  
  return `🤖 Meet ${character.name}${character.tagline ? ` - ${character.tagline}` : ''}

${description}

Chat with ${character.name} now: ${url}

#AICharacter #Chatbot #AI #VirtualCharacter #Agentwood`;
}

/**
 * Generate social media post for a category
 */
export function generateCategoryPost(category: string, characterCount: number): string {
  const url = `${SITE_URL}/category/${encodeURIComponent(category)}`;
  
  return `✨ Discover ${characterCount.toLocaleString()} ${category} AI Characters!

Browse our collection of ${category.toLowerCase()} characters and start chatting.

Explore now: ${url}

#AICharacter #${category.replace(/\s+/g, '')} #Chatbot #AI #Agentwood`;
}


