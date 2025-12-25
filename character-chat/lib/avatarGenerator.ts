/**
 * Avatar Generator Utility
 * 
 * Generates avatars based on character type:
 * - Human/Realistic characters: Minimalist cartoon style (template style)
 * - Fantasy characters: Waifu anime style
 * 
 * This matches the design system where:
 * - Human characters use the minimalist cartoon template style
 * - Fantasy characters use waifu anime style (like Talkie AI)
 */

export interface AvatarOptions {
  characterId: string;
  characterName: string;
  isFantasy?: boolean;
  isHuman?: boolean;
  isOlderPerson?: boolean; // For real human-looking images (Karen, granny, etc.)
  isRealistic?: boolean; // For cultural characters that should look realistic
}

/**
 * Generate minimalist cartoon avatar for human/realistic characters
 * Uses Dicebear's "avataaars" style - minimalist cartoon with simple lines
 * Similar to the template: clean, simple, limited color palette
 */
export function getMinimalistCartoonAvatar(
  characterId: string,
  characterName?: string
): string {
  const seed = characterId.replace(/-/g, '');
  // Dicebear avataaars: minimalist cartoon style
  // Colors: soft pastels matching template aesthetic
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`;
}

/**
 * Generate waifu anime avatar for fantasy characters
 * Uses thiswaifudoesnotexist.net for high-quality waifu anime images
 */
export function getWaifuAnimeAvatar(
  characterId: string,
  characterName?: string
): string {
  const seed = characterId.replace(/-/g, '');
  return `https://www.thiswaifudoesnotexist.net/v2/${seed.length > 8 ? seed.substring(0, 8) : seed.padEnd(8, '0')}.jpg`;
}

/**
 * Generate real human-looking avatar for older people (Karen, granny, etc.)
 * Uses thispersondoesnotexist.net or similar service for realistic human faces
 */
export function getRealHumanAvatar(
  characterId: string,
  characterName?: string
): string {
  const seed = characterId.replace(/-/g, '');
  // Using thispersondoesnotexist.net for realistic human faces
  // Note: This service generates random faces, so we use seed for consistency
  // Alternative: Use a seed-based face generation API if available
  const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://thispersondoesnotexist.net/?seed=${seedNum}`;
}

/**
 * Generate avatar based on character type
 * Automatically determines if character is human or fantasy
 * Supports real human-looking images for older people
 */
export function generateAvatar(options: AvatarOptions): string {
  const { characterId, characterName, isFantasy, isHuman, isOlderPerson, isRealistic } = options;

  // Real human-looking images for older people (Karen, granny, etc.)
  if (isOlderPerson || (isHuman && isOlderPerson)) {
    return getRealHumanAvatar(characterId, characterName);
  }

  // Realistic cultural characters
  if (isRealistic && !isFantasy) {
    return getRealHumanAvatar(characterId, characterName);
  }

  // Explicit flags take precedence
  if (isFantasy) {
    return getWaifuAnimeAvatar(characterId, characterName);
  }
  
  if (isHuman) {
    return getMinimalistCartoonAvatar(characterId, characterName);
  }

  // Default: assume human (minimalist cartoon) unless explicitly fantasy
  // This matches the template style preference
  return getMinimalistCartoonAvatar(characterId, characterName);
}

/**
 * List of human/realistic character IDs that should use minimalist cartoon style
 * All others default to waifu anime (fantasy)
 */
export const HUMAN_CHARACTER_IDS = [
  'grumpy-old-man',
  'california-surfer',
  'sassy-best-friend',
  'chef-gordon',
  'ai-tutor',
  'therapy-bot',
  'shy-introvert',
  'confident-leader',
  'comedic-relief',
  'romantic-partner',
  'cyberpunk-hacker',
  'mafia-job-report',
];

/**
 * Check if a character ID should use human (minimalist cartoon) style
 */
export function isHumanCharacter(characterId: string): boolean {
  return HUMAN_CHARACTER_IDS.includes(characterId);
}

