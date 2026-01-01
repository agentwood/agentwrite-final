
import React from 'react';

export interface CharacterProfile {
  name: string;
  tagline: string;
  description: string;
  avatarUrl: string;
  category: string;
  handle: string;
  chatCount: string;
  isLive?: boolean;
}

export type Category = "All" | "Play & Fun" | "Helper" | "Original" | "Anime & Game" | "Fiction & Media";

export type View = 'discover' | 'affiliates' | 'character' | 'settings' | 'rewards' | 'create';
