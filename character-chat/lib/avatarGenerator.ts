import { ARCHETYPE_PROFILES, getArchetypeAvatarPrompt } from '@/lib/character/archetype-profiles';
import { AVATAR_STYLE_GUIDE } from '@/lib/avatars/style-guide';

export interface AvatarOptions {
  characterId: string;
  characterName: string;
  style: 'REALISTIC' | 'COMIC' | 'ANIME';
  description?: string;
  archetype?: string;
  gender?: string;
}

// Core style templates derived from strict Style Guide
const STYLE_TEMPLATES = {
  REALISTIC: 'photorealistic, 8k uhd, cinematic lighting, shot on 35mm lens, highly detailed texture, realistic skin tones, masterpiece, unreal engine 5 render, ray tracing',
  COMIC: 'highly detailed comic book style, graphic novel aesthetic, sharp lines, dramatic lighting, 8k resolution, masterpiece, trending on artstation',
  ANIME: AVATAR_STYLE_GUIDE.generationParams.style, // Enforce the "Original 30" style
};

// Negative prompts to avoid bad generation
const NEGATIVE_PROMPT = AVATAR_STYLE_GUIDE.generationParams.negativePrompt;

/**
 * Generate a strict prompt for image generation models
 * Uses archetype-specific styling when available and enforces Style Guide
 */
export function constructAvatarPrompt(options: AvatarOptions): string {
  const { characterName, style, description, archetype, gender } = options;

  // 1. Start with the Style Guide Template structure if ANIME style (default)
  if (style === 'ANIME') {
    // Extract personality hints from description (simple logic)
    const personality = description ? description.slice(0, 100) : 'engaging';

    // Use the official template
    let prompt = AVATAR_STYLE_GUIDE.promptTemplate
      .replace('{name}', characterName)
      .replace('{gender}', gender || 'character')
      .replace('{personality}', personality)
      .replace('{category}', archetype ? archetype.replace(/_/g, ' ') : 'fantasy');

    return prompt;
  }

  // 2. Fallback for Explicit REALISTIC / COMIC requests (though likely unused given requirements)
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
    width: AVATAR_STYLE_GUIDE.dimensions.width,
    height: AVATAR_STYLE_GUIDE.dimensions.height,
  };
}

/**
 * Placeholder for actual generation API integration.
 * Returns the constructed prompt to be used by generation scripts.
 */
export function generateAvatar(options: AvatarOptions): string {
  const prompt = constructAvatarPrompt(options);
  // Returns a placeholder URL that would handle the generation in a real app
  // or simply returns the prompt if the caller expects a prompt string (current usage ambiguous)
  // For consistency with route.ts which expects a URL:
  return `https://avatar.agentwood.com/v1/${options.characterId}.png?prompt=${encodeURIComponent(prompt)}`;
}

/**
 * Get avatar style recommendation based on character type
 */
export function recommendStyle(category?: string, archetype?: string): 'REALISTIC' | 'COMIC' | 'ANIME' {
  // STRICT ENFORCEMENT: Default to ANIME (The "Original 30" style) for almost everything
  // unless explicitly tailored for hyper-realism.

  const c = category?.toLowerCase() || '';
  const a = archetype?.toLowerCase() || '';

  // Explicitly realistic archetypes
  const realisticArchetypes = ['mafia_boss', 'ceo_cold'];
  if (archetype && realisticArchetypes.includes(archetype)) {
    return 'REALISTIC';
  }

  // Everything else follows the "Original 30" Agentwood style
  return 'ANIME';
}
