/**
 * Google Indexing API Integration for Instant Indexing
 * Phase 1: Quick Wins
 */

const GOOGLE_INDEXING_API_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';

interface IndexingRequest {
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
}

/**
 * Submit URL to Google Indexing API for instant indexing
 */
export async function submitToGoogleIndexing(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<boolean> {
  const accessToken = process.env.GOOGLE_INDEXING_API_TOKEN;

  if (!accessToken) {
    console.warn('Google Indexing API token not configured');
    return false;
  }

  try {
    const response = await fetch(GOOGLE_INDEXING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google Indexing API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error submitting to Google Indexing API:', error);
    return false;
  }
}

/**
 * Batch submit URLs to Google Indexing API (parallel processing)
 */
export async function batchSubmitToGoogleIndexing(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
  concurrency: number = 10 // Process 10 URLs in parallel
): Promise<{ success: number; failed: number }> {
  const results = { success: 0, failed: 0 };

  // Process in batches for parallel execution
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const promises = batch.map(url => submitToGoogleIndexing(url, type));
    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        results.success++;
      } else {
        results.failed++;
      }
    });
  }

  return results;
}

/**
 * Submit new character page to Google Indexing
 */
export async function indexCharacterPage(characterId: string): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';
  const url = `${baseUrl}/character/${characterId}`;
  return submitToGoogleIndexing(url, 'URL_UPDATED');
}

/**
 * Submit new category/archetype page to Google Indexing
 */
export async function indexListingPage(path: string): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';
  const url = `${baseUrl}${path}`;
  return submitToGoogleIndexing(url, 'URL_UPDATED');
}

