/**
 * Avatar Generator Utility
 * 
 * Enforces strict visual styles:
 * 1. Photorealistic (Default for human/helpful characters)
 * 2. Detailed Comic / Realistic Anime (For fantasy/creative characters)
 * 
 * BANNED STYLES: 
 * - Cartoons
 * - Flat illustrations
 * - "Homework helper" style vectors
 */

export interface AvatarOptions {
  characterId: string;
  characterName: string;
  style: 'REALISTIC' | 'COMIC'; // Strict typing
  description?: string;
}

/**
 * Generate a strict prompt for image generation models (Gemini/DALL-E)
 * This does not generate the image itself but constructs the mandatory prompt structure.
 */
export function constructAvatarPrompt(options: AvatarOptions): string {
  const { characterName, style, description } = options;

  const basePrompt = description
    ? `Portrait of ${characterName}, ${description}`
    : `Portrait of ${characterName}`;

  if (style === 'COMIC') {
    return `${basePrompt}, highly detailed comic book style, graphic novel aesthetic, sharp lines, dramatic lighting, 8k resolution, masterpiece, trending on artstation`;
  }

  // Default to REALISTIC
  return `${basePrompt}, photorealistic, 8k uhd, cinematic lighting, shot on 35mm lens, highly detailed texture, realistic skin tones, masterpiece`;
}

/**
 * Placeholder for actual generation API integration.
 * For now, returns high-quality static placeholders matching the style,
 * or redirects to a generation route if we had one connected here.
 */
export function generateAvatar(options: AvatarOptions): string {
  // In a real generation flow, this would call the image gen API.
  // For immediate visual fix without burning credits on millions of regenerations:
  // We map to specific high-quality Collections or use a consistent seed with style params.

  // Using Dicebear as a fallback is BANNED by user constraints (it looks too cartoonish).
  // so we return a placeholder that indicates "Generation Pending" or a high-quality stock.

  // Ideally, this function is called by `scripts/generate-avatars.ts` which ACTUALLY interacts with Gemini/DALL-E.
  // So here we just return the constructed prompt to be used by that script.
  return constructAvatarPrompt(options);
}


