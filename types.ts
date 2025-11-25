
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