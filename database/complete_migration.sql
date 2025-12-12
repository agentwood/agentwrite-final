-- ============================================
-- AGENTWRITE COMPLETE DATABASE MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor
-- This combines all migrations into one file
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FIX EXISTING TABLES (if they have wrong types)
-- ============================================

-- Drop artifacts table if it exists (will be recreated with correct types)
-- This fixes the foreign key type mismatch error
DROP TABLE IF EXISTS artifacts CASCADE;

-- Drop agent_tasks table if it exists (will be recreated with correct types)
-- This fixes the case where id column might be TEXT instead of UUID
DROP TABLE IF EXISTS agent_tasks CASCADE;

-- ============================================
-- CORE APPLICATION TABLES
-- ============================================

-- Projects table for long-form writing projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  target_word_count INTEGER NOT NULL DEFAULT 3000,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'outlining', 'writing', 'complete')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table for project content
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  version INTEGER DEFAULT 1,
  last_saved TIMESTAMPTZ DEFAULT NOW()
);

-- Outlines table for storing generated outlines
CREATE TABLE IF NOT EXISTS outlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent tasks table for tracking AI agent execution
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('plan', 'write', 'continue')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'error')),
  payload JSONB NOT NULL,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Artifacts table for agent outputs (outlines, drafts)
CREATE TABLE IF NOT EXISTS artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  agent_task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('outline', 'section_draft')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User credits table (extend existing user system)
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits BIGINT DEFAULT 225000, -- Default to Hobby plan credits
  plan TEXT DEFAULT 'hobby' CHECK (plan IN ('hobby', 'professional', 'max')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Negative for usage, positive for refills
  feature TEXT NOT NULL CHECK (feature IN ('text', 'outline', 'audio', 'video', 'image', 'system')),
  details TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG SYSTEM TABLES
-- ============================================

-- Blog Posts Table for SEO Content
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'AgentWrite Team',
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER NOT NULL DEFAULT 5,
  image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  view_count INTEGER DEFAULT 0
);

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Tags Table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Post Tags Junction Table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- CHANGELOG SYSTEM TABLES
-- ============================================

-- Changelog Table for Product Updates
CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('feature', 'improvement', 'fix', 'announcement')),
  tags TEXT[] DEFAULT '{}',
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT true
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: CORE TABLES
-- ============================================

-- Projects
CREATE POLICY "Users can manage their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- Outlines
CREATE POLICY "Users can manage their own outlines"
  ON outlines FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- Agent tasks
CREATE POLICY "Users can manage their own agent tasks"
  ON agent_tasks FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- Artifacts
CREATE POLICY "Users can manage their own artifacts"
  ON artifacts FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)
  );

-- User credits
CREATE POLICY "Users can view and update their own credits"
  ON user_credits FOR ALL
  USING (auth.uid() = user_id);

-- Credit transactions
CREATE POLICY "Users can view their own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- RLS POLICIES: BLOG SYSTEM
-- ============================================

-- Blog posts are publicly readable
CREATE POLICY "Blog posts are publicly readable"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authenticated users can create blog posts
CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update blog posts
CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete blog posts
CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  USING (auth.role() = 'authenticated');

-- Blog categories are publicly readable
CREATE POLICY "Blog categories are publicly readable"
  ON blog_categories FOR SELECT
  USING (true);

-- Authenticated users can manage blog categories
CREATE POLICY "Authenticated users can manage blog categories"
  ON blog_categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Blog tags are publicly readable
CREATE POLICY "Blog tags are publicly readable"
  ON blog_tags FOR SELECT
  USING (true);

-- Authenticated users can manage blog tags
CREATE POLICY "Authenticated users can manage blog tags"
  ON blog_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Blog post tags are publicly readable
CREATE POLICY "Blog post tags are publicly readable"
  ON blog_post_tags FOR SELECT
  USING (true);

-- Authenticated users can manage blog post tags
CREATE POLICY "Authenticated users can manage blog post tags"
  ON blog_post_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- RLS POLICIES: CHANGELOG SYSTEM
-- ============================================

-- Changelog entries are publicly readable
CREATE POLICY "Changelog entries are publicly readable"
  ON changelog_entries FOR SELECT
  USING (published = true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Core tables indexes
CREATE INDEX IF NOT EXISTS idx_projects_userid ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_projectid ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_outlines_projectid ON outlines(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_projectid ON agent_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_projectid ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_userid ON credit_transactions(user_id);

-- Blog indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- Changelog indexes
CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_category ON changelog_entries(category);
CREATE INDEX IF NOT EXISTS idx_changelog_published ON changelog_entries(published);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION init_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits, plan)
  VALUES (NEW.id, 225000, 'hobby');
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Function to deduct credits and log transaction
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_feature TEXT,
  p_details TEXT DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits BIGINT;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Check if enough credits
  IF current_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  UPDATE user_credits
  SET credits = credits - p_amount
  WHERE user_id = p_user_id;

  -- Log transaction
  INSERT INTO credit_transactions (user_id, amount, feature, details, project_id)
  VALUES (p_user_id, -p_amount, p_feature, p_details, p_project_id);

  RETURN TRUE;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================
-- TRIGGERS
-- ============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outlines_updated_at ON outlines;
CREATE TRIGGER update_outlines_updated_at BEFORE UPDATE ON outlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_changelog_updated_at ON changelog_entries;
CREATE TRIGGER update_changelog_updated_at BEFORE UPDATE ON changelog_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-create credits entry for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION init_user_credits();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- SEED DATA: BLOG CATEGORIES
-- ============================================

INSERT INTO blog_categories (name, slug, description) VALUES
  ('Video Marketing', 'video-marketing', 'Articles about video marketing strategies and tools'),
  ('Video Ideas', 'video-ideas', 'Creative video ideas and concepts'),
  ('Content Marketing', 'content-marketing', 'Content marketing strategies and automation'),
  ('AI Tools', 'ai-tools', 'AI tool reviews and comparisons'),
  ('Tutorials', 'tutorials', 'Step-by-step guides and tutorials')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Total tables created: 12
-- Total policies created: 13
-- Total indexes created: 20
-- Total functions created: 3
-- Total triggers created: 6
-- ============================================

