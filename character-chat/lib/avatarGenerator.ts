/**
 * Avatar Generator Utility
 * 
 * Enforces strict visual styles:
 * 1. Photorealistic (Default for human/helpful characters)
 * 2. Detailed Comic / Realistic Anime (For fantasy/creative characters)
 * 
 * NEW: Archetype-aware generation with coherent style
 * 
 * BANNED STYLES: 
 * - Cartoons
 * - Flat illustrations
 * - "Homework helper" style vectors
 */

import { ARCHETYPE_PROFILES, getArchetypeAvatarPrompt } from '@/lib/character/archetype-profiles';

export interface AvatarOptions {
  characterId: string;
  characterName: string;
  style: 'REALISTIC' | 'COMIC' | 'ANIME';
  description?: string;
  archetype?: string;
  gender?: string;
}

// Core style templates
const STYLE_TEMPLATES = {
  REALISTIC: 'photorealistic, 8k uhd, cinematic lighting, shot on 35mm lens, highly detailed texture, realistic skin tones, masterpiece',
  COMIC: 'highly detailed comic book style, graphic novel aesthetic, sharp lines, dramatic lighting, 8k resolution, masterpiece, trending on artstation',
  ANIME: 'stylized anime digital painting, highly detailed, cinematic lighting, dark atmospheric background, professional character art, expressive eyes, fantasy character design',
};

// Negative prompts to avoid bad generation
const NEGATIVE_PROMPT = 'low quality, blurry, distorted, cartoon, 3D render, chibi, deformed, ugly, duplicate, watermark, text, logo, simple, flat, vector';

/**
 * Generate a strict prompt for image generation models
 * Uses archetype-specific styling when available
 */
export function constructAvatarPrompt(options: AvatarOptions): string {
  const { characterName, style, description, archetype, gender } = options;

  // If archetype is specified and has a profile, use enhanced prompt
  if (archetype && ARCHETYPE_PROFILES[archetype]) {
    return getArchetypeAvatarPrompt(archetype, characterName, gender || 'neutral');
  }

  // Standard prompt construction
  const basePrompt = description
    ? `Portrait of ${characterName}, ${description}`
    : `Portrait of ${characterName}`;

  const styleTemplate = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.ANIME;

  return `${basePrompt}, ${styleTemplate}`;
}

/**
 * Get full generation parameters including negative prompt
 */
export function getGenerationParams(options: AvatarOptions): {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
} {
  return {
    prompt: constructAvatarPrompt(options),
    negativePrompt: NEGATIVE_PROMPT,
    width: 1024,
    height: 1024,
  };
}

/**
 * Placeholder for actual generation API integration.
 * Returns the constructed prompt to be used by generation scripts.
 */
export function generateAvatar(options: AvatarOptions): string {
  // In production, this would call Gemini/DALL-E/Stable Diffusion
  // For now, returns the prompt for use by generation scripts
  return constructAvatarPrompt(options);
}

/**
 * Get avatar style recommendation based on character type
 */
export function recommendStyle(category?: string, archetype?: string): 'REALISTIC' | 'COMIC' | 'ANIME' {
  // Fantasy/anime archetypes should use ANIME style
  const animeArchetypes = ['yandere_obsessive', 'tsundere_cold', 'kuudere_emotionless', 'vampire_prince', 'demon_lord', 'royal_princess', 'witch_mysterious', 'angel_guardian', 'knight_protector'];

  if (archetype && animeArchetypes.includes(archetype)) {
    return 'ANIME';
  }

  // Modern archetypes use realistic
  const realisticArchetypes = ['mafia_boss', 'ceo_cold'];
  if (archetype && realisticArchetypes.includes(archetype)) {
    return 'REALISTIC';
  }

  // Category-based fallback
  const animeCategories = ['Anime & Game', 'Fiction & Media', 'Roleplay', 'Playful'];
  if (category && animeCategories.includes(category)) {
    return 'ANIME';
  }

  // Default to ANIME for consistency with existing characters
  return 'ANIME';
}
