/**
 * Vercel Serverless Function for Daily Blog Publishing
 * 
 * This function runs daily at 9 AM (configured in vercel.json)
 * It checks for scheduled posts and publishes them automatically
 */

import { checkAndPublishScheduledPosts } from '../services/dailyPublishingCron';

export default async function handler(req: any, res: any) {
  // Only allow POST requests (cron jobs typically use POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify cron secret (optional security)
  const cronSecret = req.headers['x-cron-secret'];
  const expectedSecret = process.env.CRON_SECRET;
  
  if (expectedSecret && cronSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('[Daily Publish] Starting daily publishing check...');
    
    const result = await checkAndPublishScheduledPosts();
    
    console.log('[Daily Publish] Results:', result);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('[Daily Publish] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

