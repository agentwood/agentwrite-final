# Supabase Database Migration Guide

## Overview
This guide will help you set up the complete database schema for AgentWrite in Supabase. The migrations include:
1. Core application tables (projects, documents, outlines, etc.)
2. Blog system tables
3. Changelog system tables

## Prerequisites
- Supabase account and project created
- Access to Supabase SQL Editor
- Admin access to your Supabase project

## Migration Steps

### Step 1: Access Supabase SQL Editor
1. Log in to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run Core Schema Migration
**File**: `database/schema.sql`

This creates the core application tables:
- `projects` - Writing projects
- `documents` - Project content
- `outlines` - Generated outlines
- `agent_tasks` - AI agent execution tracking
- `artifacts` - Agent outputs
- `user_credits` - User credit system
- `credit_transactions` - Credit audit trail

**Action**: Copy the entire contents of `database/schema.sql` and paste into SQL Editor, then click **Run**.

**Expected Result**: 
- ✅ 7 tables created
- ✅ RLS policies enabled
- ✅ Indexes created
- ✅ Functions and triggers created

### Step 3: Run Blog Schema Migration
**File**: `database/blog_schema.sql`

This creates the blog system tables:
- `blog_posts` - Blog articles
- `blog_categories` - Post categories
- `blog_tags` - Post tags
- `blog_post_tags` - Post-tag relationships

**Action**: Copy the entire contents of `database/blog_schema.sql` and paste into SQL Editor, then click **Run**.

**Expected Result**:
- ✅ 4 tables created
- ✅ Default categories inserted
- ✅ RLS policies enabled
- ✅ Indexes created

### Step 4: Run Changelog Schema Migration
**File**: `database/changelog_schema.sql`

This creates the changelog system:
- `changelog_entries` - Product update entries

**Action**: Copy the entire contents of `database/changelog_schema.sql` and paste into SQL Editor, then click **Run**.

**Expected Result**:
- ✅ 1 table created
- ✅ RLS policies enabled
- ✅ Indexes created

## Verification Queries

After running all migrations, verify everything is set up correctly:

### Check Tables Exist
```sql
-- Check all tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected**: Should see:
- agent_tasks
- artifacts
- blog_categories
- blog_post_tags
- blog_posts
- blog_tags
- changelog_entries
- credit_transactions
- documents
- outlines
- projects
- user_credits

### Check RLS Policies
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

**Expected**: All tables should have `rowsecurity = true`

### Check Blog Categories
```sql
-- Verify default blog categories were inserted
SELECT * FROM blog_categories;
```

**Expected**: Should see 5 categories:
- Video Marketing
- Video Ideas
- Content Marketing
- AI Tools
- Tutorials

## Seed Data (Optional)

### Seed Initial Blog Posts
```sql
-- Insert sample blog posts
INSERT INTO blog_posts (
    title,
    slug,
    excerpt,
    content,
    author,
    category,
    tags,
    read_time,
    published_at,
    status,
    seo_title,
    seo_description,
    seo_keywords
) VALUES
(
    'Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024',
    'ultimate-guide-ai-video-marketing-2024',
    'Discover how AI video marketing tools are transforming content creation. Learn strategies, tools, and best practices for generating video ideas and automating your marketing workflow.',
    '# Ultimate Guide to AI Video Marketing

Video marketing has become the cornerstone of modern digital marketing strategies. With AI-powered tools revolutionizing content creation, brands can now produce high-quality video content at scale.

## What is AI Video Marketing?

AI video marketing leverages artificial intelligence to automate and enhance video content creation, from ideation to production.

## Key Benefits

1. **Scalability**: Create unlimited video content
2. **Cost-Effectiveness**: Reduce production costs
3. **Consistency**: Maintain brand voice
4. **Speed**: Generate ideas in minutes

## Conclusion

AI video marketing is transforming how brands create and distribute video content.',
    'AgentWrite Team',
    'Video Marketing',
    ARRAY['AI video marketing', 'video ideas', 'content marketing'],
    8,
    NOW(),
    'published',
    'Ultimate Guide to AI Video Marketing: Boost Your Brand in 2024',
    'Discover how AI video marketing tools are transforming content creation. Learn strategies, tools, and best practices.',
    'AI video marketing, video ideas, content marketing, marketing automation'
),
(
    '100 Video Ideas for Brands: AI-Generated Concepts That Convert',
    '100-video-ideas-brands-ai-generated',
    'Never run out of video content ideas. Our AI-powered generator creates unlimited creative video concepts tailored to your brand, industry, and marketing goals.',
    '# 100 Video Ideas for Brands

Running out of video content ideas? You''re not alone. Content creators and marketers constantly struggle with ideation.

## Why Video Ideas Matter

Great video content starts with great ideas. Without compelling concepts, even the best production quality won''t save your video.

## Categories of Video Ideas

- Product Demos
- Behind-the-Scenes
- Customer Testimonials
- Educational Content
- Entertainment

## Conclusion

With AI-powered video idea generators, you''ll never run out of creative concepts.',
    'AgentWrite Team',
    'Video Ideas',
    ARRAY['video ideas', 'brand content', 'social media'],
    6,
    NOW() - INTERVAL '1 day',
    'published',
    '100 Video Ideas for Brands: AI-Generated Concepts That Convert',
    'Never run out of video content ideas. Our AI-powered generator creates unlimited creative video concepts.',
    'video ideas, brand content, social media, content ideas'
),
(
    'Content Marketing Automation: Complete Guide to AI Tools',
    'content-marketing-automation-ai-tools-guide',
    'Streamline your content creation process with AI-powered automation. Learn how to generate blog posts, social media content, and marketing copy at scale.',
    '# Content Marketing Automation

Streamline your content creation process with AI-powered automation tools.

## Benefits of Automation

- Save time
- Scale production
- Maintain consistency
- Reduce costs

## Top Tools

1. AgentWrite
2. Jasper
3. Copy.ai
4. Writesonic

## Conclusion

Content marketing automation is essential for scaling your content strategy.',
    'AgentWrite Team',
    'Content Marketing',
    ARRAY['content automation', 'AI tools', 'marketing'],
    10,
    NOW() - INTERVAL '2 days',
    'published',
    'Content Marketing Automation: Complete Guide to AI Tools',
    'Streamline your content creation process with AI-powered automation. Learn how to generate content at scale.',
    'content automation, AI tools, marketing, content creation'
);
```

### Seed Initial Changelog Entries
```sql
-- Insert sample changelog entries
INSERT INTO changelog_entries (
    title,
    description,
    date,
    category,
    tags,
    version,
    published
) VALUES
(
    'Video Script Generator - New AI Tool',
    'Introducing our new AI-powered video script generator. Create professional scripts for YouTube, social media, and marketing videos in minutes.',
    CURRENT_DATE,
    'feature',
    ARRAY['video', 'script', 'AI', 'new feature'],
    '2.1.0',
    true
),
(
    'Blog System Launch',
    'We''ve launched our new blog system with full database integration. Publish SEO-optimized articles daily to improve keyword rankings.',
    CURRENT_DATE,
    'feature',
    ARRAY['blog', 'SEO', 'content'],
    '2.0.0',
    true
),
(
    'Enhanced Video Ideas Generator',
    'Improved the video ideas generator with better AI prompts and more creative output. Now generates more specific, actionable video concepts.',
    CURRENT_DATE - INTERVAL '1 day',
    'improvement',
    ARRAY['video ideas', 'AI', 'improvement'],
    NULL,
    true
),
(
    'SEO Landing Pages Added',
    'Created three new SEO-optimized landing pages: Content Marketing AI, Video Script Generator, and Video Marketing Tools.',
    CURRENT_DATE - INTERVAL '1 day',
    'feature',
    ARRAY['SEO', 'landing pages', 'marketing'],
    NULL,
    true
),
(
    'Image Generation Fix',
    'Fixed image generation issues in AICreatePage and PersonaPage. Updated API calls to use correct Gemini model.',
    CURRENT_DATE - INTERVAL '2 days',
    'fix',
    ARRAY['bug fix', 'images', 'API'],
    NULL,
    true
);
```

## Troubleshooting

### Error: "relation already exists"
**Solution**: The table already exists. You can either:
1. Drop the table first: `DROP TABLE IF EXISTS table_name CASCADE;`
2. Or skip this migration if the table structure matches

### Error: "permission denied"
**Solution**: Ensure you're using the SQL Editor with admin privileges, not a restricted user.

### Error: "function does not exist"
**Solution**: Make sure you ran `schema.sql` first, as it creates the `update_updated_at_column()` function used by other migrations.

### RLS Policies Not Working
**Solution**: Verify RLS is enabled:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## Post-Migration Checklist

- [ ] All tables created successfully
- [ ] RLS policies enabled on all tables
- [ ] Indexes created for performance
- [ ] Default blog categories inserted
- [ ] Functions and triggers working
- [ ] Test queries return expected results
- [ ] Sample data inserted (optional)

## Environment Variables

After migrations, ensure your `.env` file has:
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Settings** → **API** in your Supabase dashboard.

## Testing the Connection

Test that your app can connect to the database:

1. Start your development server
2. Navigate to `/blog` - should load (may be empty if no posts)
3. Navigate to `/changelog` - should load (may be empty if no entries)
4. Check browser console for any database errors

## Next Steps

1. **Seed Initial Content**: Run the seed data queries above
2. **Create Admin Interface**: Build admin pages to manage blog posts and changelog entries
3. **Set Up Monitoring**: Monitor database performance in Supabase dashboard
4. **Backup Strategy**: Set up automatic backups in Supabase

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Verify RLS policies in **Authentication** → **Policies**
3. Test queries directly in SQL Editor
4. Check application console for error messages

## Migration Order Summary

1. ✅ `database/schema.sql` (Core tables)
2. ✅ `database/blog_schema.sql` (Blog system)
3. ✅ `database/changelog_schema.sql` (Changelog system)
4. ✅ Seed data (Optional)

**Total Migration Time**: ~2-5 minutes

---

**Note**: Always backup your database before running migrations in production!




