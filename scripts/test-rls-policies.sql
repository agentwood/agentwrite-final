-- ============================================
-- TEST RLS POLICIES FOR BLOG POSTS
-- ============================================
-- Run this in Supabase SQL Editor to verify RLS policies are set up correctly
-- ============================================

-- Check if RLS is enabled
SELECT 
    tablename, 
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'blog_posts';

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'blog_posts'
ORDER BY policyname;

-- Test query as anonymous user (simulating public access)
-- This should work if RLS policies are correct
SELECT 
    id,
    title,
    slug,
    status,
    published_at
FROM blog_posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 5;

-- If the above query fails, you may need to recreate the policy:
-- DROP POLICY IF EXISTS "Blog posts are publicly readable" ON blog_posts;
-- CREATE POLICY "Blog posts are publicly readable"
--   ON blog_posts FOR SELECT
--   USING (status = 'published');



