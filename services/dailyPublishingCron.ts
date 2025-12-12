/**
 * Daily Publishing Cron Job
 * Checks for scheduled posts and publishes them automatically
 * 
 * This should be run daily (via cron job, scheduled task, or serverless function)
 * 
 * Usage:
 * - Set up a cron job to run this daily at 9 AM
 * - Or use a serverless function (Vercel Cron, Netlify Functions, etc.)
 * - Or call this from a scheduled task
 */

import { supabase } from './supabaseClient';
import { getAllScheduledPosts, publishScheduledPost } from './blogPublishingService';
import { blogService } from './blogService';

/**
 * Check and publish scheduled posts
 * Should be called daily (e.g., via cron job)
 */
export async function checkAndPublishScheduledPosts(): Promise<{
    published: number;
    skipped: number;
    errors: number;
}> {
    if (!supabase) {
        console.error('Supabase not configured');
        return { published: 0, skipped: 0, errors: 0 };
    }

    const scheduledPosts = getAllScheduledPosts();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    let published = 0;
    let skipped = 0;
    let errors = 0;

    // First, check for any draft posts that should be published today
    // This handles posts created from templates that are ready to publish
    try {
        const { data: draftPosts, error: draftError } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'draft')
            .order('created_at', { ascending: true });

        if (!draftError && draftPosts && draftPosts.length > 0) {
            console.log(`Found ${draftPosts.length} draft post(s) to check...`);
            
            for (const post of draftPosts) {
                try {
                    // Publish draft posts (you can add date logic here if needed)
                    const success = await publishScheduledPost(post.id);
                    if (success) {
                        published++;
                        console.log(`Published: ${post.title}`);
                    } else {
                        errors++;
                        console.error(`Failed to publish: ${post.title}`);
                    }
                } catch (error) {
                    errors++;
                    console.error(`Error processing ${post.title}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error checking draft posts:', error);
    }

    // Then check scheduled posts from the content plan
    for (const scheduled of scheduledPosts) {
        const publishDate = new Date(scheduled.publishDate);
        publishDate.setHours(0, 0, 0, 0);

        // Check if this post should be published today
        if (publishDate.getTime() <= now.getTime()) {
            try {
                // Check if post already exists
                const slug = scheduled.template.title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');

                const existingPost = await blogService.getPostBySlug(slug);

                if (existingPost) {
                    // Post exists, check if it needs to be published
                    if (existingPost.status === 'draft') {
                        const success = await publishScheduledPost(existingPost.id);
                        if (success) {
                            published++;
                            console.log(`Published: ${scheduled.template.title}`);
                        } else {
                            errors++;
                            console.error(`Failed to publish: ${scheduled.template.title}`);
                        }
                    } else {
                        skipped++;
                        console.log(`Already published: ${scheduled.template.title}`);
                    }
                } else {
                    // Post doesn't exist yet - skip (needs to be created first)
                    skipped++;
                    console.log(`Post not created yet: ${scheduled.template.title}`);
                }
            } catch (error) {
                errors++;
                console.error(`Error processing ${scheduled.template.title}:`, error);
            }
        }
    }

    return { published, skipped, errors };
}

/**
 * Get posts that need to be published today
 */
export function getPostsDueToday(): Array<{ template: any; publishDate: Date }> {
    const scheduledPosts = getAllScheduledPosts();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return scheduledPosts.filter(scheduled => {
        const publishDate = new Date(scheduled.publishDate);
        publishDate.setHours(0, 0, 0, 0);
        return publishDate.getTime() <= now.getTime();
    });
}

/**
 * Manual trigger for testing
 */
export async function manualPublishCheck(): Promise<void> {
    console.log('Running daily publishing check...');
    const result = await checkAndPublishScheduledPosts();
    console.log('Publishing results:', result);
    return Promise.resolve();
}

