-- AgentWrite Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_userid ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_projectid ON documents(project_id);
CREATE INDEX IF NOT EXISTS idx_outlines_projectid ON outlines(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_projectid ON agent_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_projectid ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_userid ON credit_transactions(user_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outlines_updated_at BEFORE UPDATE ON outlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user credits on signup
CREATE OR REPLACE FUNCTION init_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits, plan)
  VALUES (NEW.id, 225000, 'hobby');
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to auto-create credits entry for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION init_user_credits();

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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
