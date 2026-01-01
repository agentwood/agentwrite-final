export interface Character {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatarUrl: string;
  gradient?: string;
  tags?: string[];
  // broadened to string to support the new dynamic categories
  category?: string; 
  totalChats?: string;
  author?: string;
  prompts?: string[]; // For conversation starters
  introMessage?: string;
}

export enum PageView {
  HOME = 'HOME',
  LIBRARY = 'LIBRARY',
  CREATE = 'CREATE',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT',
}

export enum SettingsTab {
  GENERAL = 'GENERAL',
  SUBSCRIPTION = 'SUBSCRIPTION',
  PAYOUTS = 'PAYOUTS',
}

export interface PayoutTransaction {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Processing' | 'Held (90 Days)';
  period: string;
}