
import React from 'react';

export interface CharacterProfile {
  id: string;
  seedId?: string;
  name: string;
  tagline: string;
  description: string;
  greeting?: string;
  avatarUrl: string;
  category: string;
  handle: string;
  chatCount: number;
  viewCount: number;
  isLive?: boolean;
  isOfficial?: boolean;
  chatStarters?: string[];
  voiceName?: string;
  styleHint?: string;
  archetype?: string;
}

export type Category = "All" | "Play & Fun" | "Helper" | "Original" | "Anime & Game" | "Fiction & Media" | "Helpful" | "Icon" | "Romance" | "Educational" | "Fun" | "Relaxed" | "Intense" | "Playful" | "Slow-Burn" | "Wholesome" | "Adventurous";

export type View = 'discover' | 'affiliates' | 'character' | 'settings' | 'rewards' | 'create' | 'blog' | 'favorites' | 'chat' | 'craft' | 'search';
