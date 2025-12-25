-- ============================================
-- VERIFY CONNECTION AND DATA
-- ============================================
-- Run this to verify everything is working
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'blog_posts';

-- 2. Count total posts
SELECT 
    status,
    COUNT(*) as count
FROM blog_posts
GROUP BY status;

-- 3. Test public read query (this is what the app uses)
SELECT 
    id,
    title,
    slug,
    status,
    published_at,
    category
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10;

-- 4. If no published posts, you'll see 0 rows
--    Run: database/seed_data_writing.sql to add posts




