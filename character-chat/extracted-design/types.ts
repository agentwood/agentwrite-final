export interface Character {
  id: string;
  name: string;
  creator: string;
  description: string;
  avatarUrl: string;
  backgroundImageUrl?: string; // For scenes
  interactions: string;
  tagline?: string;
  systemInstruction?: string; // For Gemini
  greeting?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewState {
  DISCOVER = 'DISCOVER',
  CHAT = 'CHAT',
  CREATE = 'CREATE'
}

export interface ChatSession {
  characterId: string;
  messages: Message[];
}

export interface VoiceConfig {
  name: string;
  pitch: number;
  rate: number;
  lang: string;
}
