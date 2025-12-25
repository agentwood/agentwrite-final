
export interface Agent {
  id: string;
  name: string;
  role: string;
  category: 'Fantasy' | 'Sports' | 'Historical' | 'Sci-Fi' | 'Villain' | 'Mentor';
  description: string;
  avatar: string;
  chats: string;
  author: string;
  systemPrompt: string;
  accentColor: string;
  traits: {
    aggression: number; // 0-100
    culture: string;
    style: string;
    voiceName: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SavedChat {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  lastMessage: string;
  timestamp: number;
  messages: Message[];
}

export interface UserProfile {
  name: string;
  plan: 'Free' | 'Pro Plus';
  points: number;
  completedQuests: string[];
}

export type ViewState = 'discover' | 'home' | 'library' | 'voice-studio' | 'chat' | 'story-studio' | 'rewards';
