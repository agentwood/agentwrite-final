/**
 * Script to create a test blog post
 * Run with: npx tsx scripts/create-test-post.ts
 */

import { createBlogPostFromTemplate, getContentPlan } from '../services/blogPublishingService';
import { blogService } from '../services/blogService';
import { supabase } from '../services/supabaseClient';

async function createTestPost() {
  console.log('🚀 Creating test blog post...\n');

  if (!supabase) {
    console.error('❌ Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  try {
    // Get the first template from content plan
    const templates = getContentPlan();
    const testTemplate = templates[0]; // Day 1: AI Blog Post Writer

    console.log(`📝 Creating post: "${testTemplate.title}"`);
    console.log(`   Target Keyword: ${testTemplate.targetKeyword}`);
    console.log(`   Category: ${testTemplate.category}`);
    console.log(`   Word Count: ${testTemplate.wordCount}\n`);

    // Create test content
    const testContent = `
# ${testTemplate.title}

This is a **test blog post** created automatically to verify the daily publishing system is working correctly.

## Introduction

${testTemplate.focus || 'This post demonstrates the automated blog publishing system.'}

## Key Features

- Automated publishing at 9 AM daily
- Auto-generated SEO metadata
- Auto-tagging system
- Scheduled content plan

## Target Keyword: ${testTemplate.targetKeyword}

This post targets the keyword "${testTemplate.targetKeyword}" with a keyword difficulty of ${testTemplate.keywordDifficulty} and search volume of ${testTemplate.searchVolume} per month.

## Conclusion

This test post verifies that:
1. ✅ Blog post creation works
2. ✅ Auto-tagging functions correctly
3. ✅ SEO metadata is generated
4. ✅ Posts can be published automatically

---

*This is a test post. Replace with actual content before going live.*
    `.trim();

    // Create the post
    const postId = await createBlogPostFromTemplate(testTemplate, testContent);

    if (!postId) {
      console.error('❌ Failed to create blog post');
      process.exit(1);
    }

    console.log(`✅ Blog post created successfully!`);
    console.log(`   Post ID: ${postId}\n`);

    // Fetch the created post to show details
    const post = await blogService.getPostBySlug(
      testTemplate.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    );

    if (post) {
      console.log('📊 Post Details:');
      console.log(`   Title: ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Tags: ${post.tags.join(', ')}`);
      console.log(`   Read Time: ${post.readTime} minutes`);
      console.log(`   SEO Title: ${post.seoTitle || 'N/A'}`);
      console.log(`   SEO Description: ${post.seoDescription?.substring(0, 60)}...`);
      console.log(`\n🌐 View at: /blog/${post.slug}`);
    }

    // Publish the test post
    console.log('\n📤 Publishing test post...');
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (updateError) {
      console.error('❌ Error publishing post:', updateError);
    } else {
      console.log('✅ Test post published successfully!');
    }

    console.log('\n✨ Test post creation complete!');
    console.log('   You can now view it at: /blog/' + post?.slug);

  } catch (error: any) {
    console.error('❌ Error creating test post:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestPost();
}

export { createTestPost };




