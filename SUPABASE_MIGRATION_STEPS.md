# Supabase Migration Steps - Complete Guide

## 📋 Overview

This guide will walk you through migrating your Supabase database to support the blog system, changelog, and all features.

## 🎯 What Gets Created

The migration creates:
- ✅ Blog posts table (`blog_posts`)
- ✅ Blog categories table (`blog_categories`)
- ✅ Blog tags table (`blog_tags`)
- ✅ Blog post tags junction table (`blog_post_tags`)
- ✅ Changelog entries table (`changelog_entries`)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic updates

## 🚀 Step-by-Step Instructions

### Step 1: Access Supabase Dashboard

1. **Go to**: [https://supabase.com](https://supabase.com)
2. **Sign in** to your account
3. **Select your project** (or create a new one)

### Step 2: Open SQL Editor

1. In the left sidebar, click **"SQL Editor"**
2. Click **"New query"** (or the `+` button)
3. You'll see a blank SQL editor

### Step 3: Copy Migration SQL

1. **Open** the file: `database/complete_migration.sql`
2. **Copy ALL** the contents (Ctrl+A / Cmd+A, then Ctrl+C / Cmd+C)
3. **Paste** into the Supabase SQL Editor

### Step 4: Review the SQL (Optional)

The migration includes:
- Table creation
- RLS policies (security)
- Indexes (performance)
- Triggers (automatic updates)

**Important**: The migration is idempotent (safe to run multiple times) - it uses `IF NOT EXISTS` checks.

### Step 5: Run the Migration

1. **Click "Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. **Wait** for execution (usually 5-10 seconds)
3. **Check** for errors in the results panel

### Step 6: Verify Success

You should see:
- ✅ "Success. No rows returned" (or similar)
- ✅ No error messages
- ✅ Execution time shown

### Step 7: Verify Tables Created

1. Go to **"Table Editor"** in the left sidebar
2. You should see these new tables:
   - ✅ `blog_posts`
   - ✅ `blog_categories`
   - ✅ `blog_tags`
   - ✅ `blog_post_tags`
   - ✅ `changelog_entries`

### Step 8: Verify RLS Policies

1. Go to **"Authentication"** → **"Policies"**
2. Or go to **"Table Editor"** → Select a table → **"Policies"** tab
3. You should see policies like:
   - "Blog posts are publicly readable"
   - "Authenticated users can create blog posts"
   - "Authenticated users can update blog posts"

### Step 9: Test Database Connection

1. **Check environment variables** in your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Get these values** from Supabase:
   - Go to **"Settings"** → **"API"**
   - Copy **"Project URL"** → `VITE_SUPABASE_URL`
   - Copy **"anon public"** key → `VITE_SUPABASE_ANON_KEY`

3. **Test connection** by visiting `/blog-admin` (should load without errors)

## 📝 Detailed Steps with Screenshots Guide

### Step 1: Login to Supabase

1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your credentials
3. Select your project from the list

### Step 2: Navigate to SQL Editor

**Path**: Left Sidebar → SQL Editor → New Query

**Visual Guide**:
```
Supabase Dashboard
├── Table Editor
├── Authentication
├── SQL Editor ← Click here
│   └── New query ← Click here
├── Database
└── Settings
```

### Step 3: Prepare SQL File

**File Location**: `database/complete_migration.sql`

**What to do**:
1. Open the file in your code editor
2. Select all (Ctrl+A / Cmd+A)
3. Copy (Ctrl+C / Cmd+C)

**File Contents Include**:
- All table definitions
- RLS policies
- Indexes
- Triggers
- Sample data (categories)

### Step 4: Paste and Run

1. **Paste** the SQL into the editor
2. **Review** (optional but recommended)
3. **Click "Run"** button (top right)
4. **Wait** for execution

**Expected Result**:
```
Success. No rows returned
Time: 0.234s
```

### Step 5: Verify Tables

**Path**: Table Editor

**Check for**:
- `blog_posts` - Main blog posts table
- `blog_categories` - Blog categories
- `blog_tags` - Blog tags
- `blog_post_tags` - Post-tag relationships
- `changelog_entries` - Changelog entries

**What to look for**:
- Tables appear in the list
- Each table has columns visible
- No error indicators

### Step 6: Check RLS Policies

**Path**: Table Editor → Select `blog_posts` → Policies tab

**Expected Policies**:
1. ✅ "Blog posts are publicly readable" (SELECT)
2. ✅ "Authenticated users can create blog posts" (INSERT)
3. ✅ "Authenticated users can update blog posts" (UPDATE)
4. ✅ "Authenticated users can delete blog posts" (DELETE)

**If policies are missing**:
- The migration may have failed
- Re-run the migration
- Check for error messages

## 🔧 Troubleshooting

### Error: "relation already exists"

**Cause**: Tables already exist from a previous migration

**Solution**: 
- The migration uses `IF NOT EXISTS`, so this shouldn't happen
- If it does, drop tables first:
  ```sql
  DROP TABLE IF EXISTS blog_post_tags CASCADE;
  DROP TABLE IF EXISTS blog_tags CASCADE;
  DROP TABLE IF EXISTS blog_categories CASCADE;
  DROP TABLE IF EXISTS blog_posts CASCADE;
  DROP TABLE IF EXISTS changelog_entries CASCADE;
  ```
- Then re-run the migration

### Error: "permission denied"

**Cause**: Insufficient permissions

**Solution**:
- Make sure you're logged in as project owner
- Or use the service role key (not recommended for client-side)

### Error: "function does not exist"

**Cause**: Missing helper functions

**Solution**:
- The migration includes function creation
- Make sure you copied the ENTIRE file
- Re-run the complete migration

### Tables Not Appearing

**Possible Causes**:
1. Migration didn't run successfully
2. Wrong project selected
3. Browser cache issue

**Solutions**:
1. Check SQL Editor for error messages
2. Verify you're in the correct project
3. Refresh the page (Ctrl+F5 / Cmd+Shift+R)
4. Re-run the migration

### RLS Policies Not Working

**Symptoms**:
- Can't create posts via Blog Admin
- "Permission denied" errors

**Solutions**:
1. Verify policies exist (Step 8 above)
2. Check that you're authenticated
3. Verify RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'blog%';
   ```
   All should show `t` (true) for `rowsecurity`

## ✅ Verification Checklist

After migration, verify:

- [ ] All 5 tables exist in Table Editor
- [ ] `blog_posts` table has all columns:
  - id, title, slug, excerpt, content
  - author, category, tags, read_time
  - status, published_at, created_at, updated_at
  - seo_title, seo_description, seo_keywords
  - view_count, image_url
- [ ] RLS policies are enabled (4 policies for blog_posts)
- [ ] Can view blog posts (public read works)
- [ ] Can create blog posts (authenticated write works)
- [ ] Environment variables are set correctly
- [ ] Blog Admin page loads without errors
- [ ] Can create a test post

## 🧪 Test the Migration

### Test 1: Create a Test Post

1. **Run test script**:
   ```bash
   node scripts/create-test-post.js
   ```

2. **Or create via Blog Admin**:
   - Go to `/blog-admin`
   - Click "Create New Post"
   - Fill in details
   - Save

3. **Verify**:
   - Post appears in database
   - Post is viewable on `/blog`
   - No permission errors

### Test 2: Verify RLS

1. **As authenticated user**:
   - Create a post → Should work ✅
   - Edit a post → Should work ✅

2. **As public user**:
   - View published posts → Should work ✅
   - Create a post → Should fail (expected) ✅

## 📊 Migration File Breakdown

### What `complete_migration.sql` Contains:

1. **Extensions** (UUID, timestamps)
2. **Helper Functions** (update timestamps)
3. **Core Tables** (projects, documents, etc.)
4. **Blog Tables** (blog_posts, categories, tags)
5. **Changelog Table** (changelog_entries)
6. **RLS Policies** (security rules)
7. **Indexes** (performance optimization)
8. **Triggers** (automatic updates)
9. **Seed Data** (default categories)

## 🎯 Quick Start (TL;DR)

1. **Go to**: Supabase Dashboard → SQL Editor
2. **Open**: `database/complete_migration.sql`
3. **Copy**: All contents
4. **Paste**: Into SQL Editor
5. **Run**: Click "Run" button
6. **Verify**: Check Table Editor for new tables
7. **Test**: Create a test post

## 📚 Additional Resources

- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **SQL Editor Guide**: [https://supabase.com/docs/guides/database/tables](https://supabase.com/docs/guides/database/tables)
- **RLS Guide**: [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

## 🆘 Need Help?

If you encounter issues:

1. **Check error messages** in SQL Editor
2. **Verify environment variables** are set
3. **Check Supabase logs** (Settings → Logs)
4. **Review RLS policies** are correct
5. **Test with a simple query**:
   ```sql
   SELECT * FROM blog_posts LIMIT 1;
   ```

## ✅ You're Done!

Once migration is complete:
- ✅ Blog system is ready
- ✅ Changelog system is ready
- ✅ Auto-publishing will work
- ✅ Blog Admin is functional

**Next**: Start creating blog posts via `/blog-admin`!




