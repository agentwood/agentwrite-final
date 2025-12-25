-- ============================================
-- VERIFY POSTS IN DATABASE
-- ============================================
-- Run this in Supabase SQL Editor to check posts
-- ============================================

-- 1. Count posts by status
SELECT 
    status,
    COUNT(*) as count
FROM blog_posts
GROUP BY status
ORDER BY status;

-- 2. List all posts (if any exist)
SELECT 
    id,
    title,
    slug,
    status,
    published_at,
    category
FROM blog_posts
ORDER BY created_at DESC
LIMIT 20;

-- 3. Check if published posts exist
SELECT 
    COUNT(*) as published_count
FROM blog_posts
WHERE status = 'published';

-- Expected result: Should show 5 if seed data was run successfully



