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

-- Enable Row Level Security for changelog (public read)
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Changelog entries are publicly readable
CREATE POLICY "Changelog entries are publicly readable"
  ON changelog_entries FOR SELECT
  USING (published = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_changelog_date ON changelog_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_category ON changelog_entries(category);
CREATE INDEX IF NOT EXISTS idx_changelog_published ON changelog_entries(published);

-- Trigger for updated_at
CREATE TRIGGER update_changelog_updated_at BEFORE UPDATE ON changelog_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT ON changelog_entries TO anon, authenticated;





