/**
 * Standalone Node.js script for daily blog publishing
 * Can be run via cron: 0 9 * * * node /path/to/scripts/daily-publish-node.js
 * 
 * Note: Rename to .mjs or use tsx/ts-node for TypeScript support
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndPublishScheduledPosts() {
  console.log(`[${new Date().toISOString()}] Starting daily publishing check...\n`);

  // Get scheduled posts from localStorage equivalent (we'll use a database table instead)
  // For now, check for draft posts that should be published
  
  try {
    // Get all draft posts
    const { data: draftPosts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (!draftPosts || draftPosts.length === 0) {
      console.log('✅ No draft posts to publish');
      return { published: 0, skipped: 0, errors: 0 };
    }

    console.log(`📝 Found ${draftPosts.length} draft post(s)`);

    let published = 0;
    let skipped = 0;
    let errors = 0;

    for (const post of draftPosts) {
      try {
        // Check if post should be published today
        // For now, publish all drafts (you can add date logic here)
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`❌ Failed to publish: ${post.title}`, updateError);
          errors++;
        } else {
          console.log(`✅ Published: ${post.title}`);
          published++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${post.title}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Published: ${published}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);

    return { published, skipped, errors };
  } catch (error) {
    console.error('❌ Error in publishing check:', error);
    return { published: 0, skipped: 0, errors: 1 };
  }
}

// Run the check
checkAndPublishScheduledPosts()
  .then((result) => {
    process.exit(result.errors > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

