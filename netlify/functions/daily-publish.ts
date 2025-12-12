/**
 * Netlify Serverless Function for Daily Blog Publishing
 * 
 * Configure in netlify.toml to run daily at 9 AM
 */

import { checkAndPublishScheduledPosts } from '../../services/dailyPublishingCron';

export const handler = async (event: any, context: any) => {
  // Verify it's a scheduled event
  if (event.source !== 'aws.events') {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    console.log('[Daily Publish] Starting daily publishing check...');
    
    const result = await checkAndPublishScheduledPosts();
    
    console.log('[Daily Publish] Results:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        ...result,
      }),
    };
  } catch (error: any) {
    console.error('[Daily Publish] Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

