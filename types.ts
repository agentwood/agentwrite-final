
export interface BrainstormCategory {
  id: string;
  label: string;
  iconName: string;
  color: string;
  placeholder: string;
}

export interface BrainstormRequest {
  category: string;
  prompt: string;
  context: string;
  examples: string[];
}

export interface BrainstormResponseItem {
  title: string;
  description: string;
}

export interface BrainstormResponse {
  ideas: BrainstormResponseItem[];
}

export interface BrainstormHistoryItem {
  id: string;
  timestamp: number;
  categoryLabel: string;
  request: BrainstormRequest;
}

export interface CreditTransaction {
  id: string;
  date: string;
  feature: 'Video' | 'Audio' | 'Text' | 'System';
  cost: number;
  details: string;
}

// --- AI CREATE TYPES ---

export interface StoryOption {
  text: string;
  type: 'plot' | 'character' | 'tone' | 'twist';
  label: string; // e.g. "Escalate Tension", "Reveal Secret"
}

export interface StorySegment {
  id: string;
  content: string;
  choices: StoryOption[];
  visualPrompt: string; // For generating video/images
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface InteractiveStoryState {
  title: string;
  genre: string;
  segments: StorySegment[];
  isFinished: boolean;
}

// --- LONG-FORM WRITING (ANTIGRAVITY AGENTS) ---

export interface Project {
  id: string;
  userId: string;
  title: string;
  genre: string;
  targetWordCount: number;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'outlining' | 'writing' | 'complete';
}

export interface Document {
  id: string;
  projectId: string;
  content: string;
  version: number;
  lastSaved: string;
}

export interface OutlineSection {
  id: string;
  title: string;
  wordCount: number;
  keyPoints: string[];
  order: number;
  status?: 'pending' | 'writing' | 'done';
  content?: string; // Generated section text
}

export interface AgentTask {
  id: string;
  projectId: string;
  type: 'plan' | 'write' | 'continue';
  status: 'pending' | 'running' | 'done' | 'error';
  payload: any;
  result?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Artifact {
  id: string;
  projectId: string;
  agentTaskId: string;
  type: 'outline' | 'section_draft';
  content: any;
  createdAt: string;
}

// Cost management (SudoWrite-style credit system)
export interface CostConfig {
  textGeneration: number;       // Credits per 100 words
  outlineGeneration: number;    // Credits per outline
  audioGeneration: number;      // Credits per audio (high)
  videoGeneration: number;      // Credits per video (very high)
  imageGeneration: number;      // Credits per image (high)
}

export interface UserCredits {
  userId: string;
  credits: number;
  plan: 'hobby' | 'professional' | 'max';
}