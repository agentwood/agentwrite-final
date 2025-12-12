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

-- Enable Row Level Security for blog posts (public read, admin write)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Blog posts are publicly readable
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

CREATE POLICY "Blog categories are publicly readable"
  ON blog_categories FOR SELECT
  USING (true);

-- Authenticated users can manage blog categories
CREATE POLICY "Authenticated users can manage blog categories"
  ON blog_categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Blog tags are publicly readable"
  ON blog_tags FOR SELECT
  USING (true);

-- Authenticated users can manage blog tags
CREATE POLICY "Authenticated users can manage blog tags"
  ON blog_tags FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Blog post tags are publicly readable"
  ON blog_post_tags FOR SELECT
  USING (true);

-- Authenticated users can manage blog post tags
CREATE POLICY "Authenticated users can manage blog post tags"
  ON blog_post_tags FOR ALL
  USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag ON blog_post_tags(tag_id);

-- Trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT SELECT ON blog_categories TO anon, authenticated;
GRANT SELECT ON blog_tags TO anon, authenticated;
GRANT SELECT ON blog_post_tags TO anon, authenticated;

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
  ('Creative Writing', 'creative-writing', 'Articles about creative writing, storytelling, and fiction'),
  ('Content Writing', 'content-writing', 'Blog posts, articles, and content creation guides'),
  ('Story Writing', 'story-writing', 'Fiction writing, novels, short stories, and narratives'),
  ('AI Tools', 'ai-tools', 'AI tool reviews, comparisons, and guides'),
  ('Tutorials', 'tutorials', 'Step-by-step guides and tutorials'),
  ('Writing Tips', 'writing-tips', 'Best practices, techniques, and strategies for writers'),
  ('Tool Comparisons', 'tool-comparisons', 'Head-to-head comparisons of writing tools and platforms')
ON CONFLICT (name) DO NOTHING;

