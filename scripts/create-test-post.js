/**
 * Quick test post creation script
 * Run with: node scripts/create-test-post.js
 * 
 * Note: This requires Supabase to be configured with environment variables
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

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function createTestPost() {
  console.log('🚀 Creating test blog post...\n');

  const testPost = {
    title: 'Test Post: Daily Publishing System Works!',
    slug: generateSlug('Test Post: Daily Publishing System Works!'),
    excerpt: 'This is a test post created to verify the daily publishing system is working correctly. The system will automatically publish blog posts at 9 AM every day.',
    content: `
# Test Post: Daily Publishing System Works!

This is a **test blog post** created automatically to verify the daily publishing system is working correctly.

## What This Tests

- ✅ Blog post creation
- ✅ Auto-tagging system
- ✅ SEO metadata generation
- ✅ Scheduled publishing
- ✅ Database integration

## Daily Publishing System

The daily publishing system will:
1. Check for scheduled posts every day at 9 AM
2. Automatically publish draft posts
3. Send notifications (if configured)
4. Track publishing metrics

## Next Steps

1. Replace this with actual content
2. Set up cron job or serverless function
3. Start publishing daily!

---

*This is a test post created on ${new Date().toISOString()}*
    `.trim(),
    author: 'AgentWrite Team',
    category: 'AI Tools',
    tags: ['test', 'automation', 'blog', 'publishing', 'seo', 'content'],
    read_time: 3,
    status: 'published',
    published_at: new Date().toISOString(),
    seo_title: 'Test Post: Daily Publishing System Works! | AgentWrite',
    seo_description: 'This is a test post created to verify the daily publishing system is working correctly. The system will automatically publish blog posts at 9 AM every day.',
    seo_keywords: 'test, automation, blog publishing, daily posts, content marketing',
    view_count: 0,
  };

  try {
    console.log('📝 Creating post...');
    console.log(`   Title: ${testPost.title}`);
    console.log(`   Slug: ${testPost.slug}\n`);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(testPost)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating post:', error);
      process.exit(1);
    }

    console.log('✅ Test post created successfully!');
    console.log(`   Post ID: ${data.id}`);
    console.log(`   Status: ${data.status}`);
    console.log(`   Published: ${data.published_at}`);
    console.log(`\n🌐 View at: /blog/${data.slug}`);
    console.log(`   Or: https://yourdomain.com/blog/${data.slug}\n`);

    return data;
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestPost();

