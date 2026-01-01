/**
 * Avatar Generator Utility
 * 
 * Generates avatars based on character type:
 * - Human/Realistic characters: Realistic human photos (pravatar.cc)
 * - Fantasy characters: Waifu anime style
 * 
 * This matches the design system where:
 * - Human characters use realistic human faces
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
 * Manual mappings for audited characters with custom generated images
 */
const MANUAL_AVATARS: Record<string, string> = {
  'marjorie': '/avatars/humans/marjorie.png',
  'rajiv': '/avatars/humans/rajiv.png',
  'asha': '/avatars/humans/asha.png',
};

/**
 * Generate realistic human photo for human characters
 * Uses pravatar.cc for realistic human faces based on seed
 */
export function getRealisticHumanAvatar(
  characterId: string,
  characterName?: string
): string {
  const seed = characterId.replace(/-/g, '');
  // pravatar.cc: realistic human photos
  return `https://i.pravatar.cc/400?u=${seed}`;
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
 * Uses realistic photos from pravatar.cc
 */
export function getRealHumanAvatar(
  characterId: string,
  characterName?: string
): string {
  return getRealisticHumanAvatar(characterId, characterName);
}

/**
 * Generate avatar based on character type
 * Automatically determines if character is human or fantasy
 * Supports real human-looking images for older people
 */
export function generateAvatar(options: AvatarOptions): string {
  const { characterId, characterName, isFantasy, isHuman, isOlderPerson, isRealistic } = options;

  // Check manual mappings first
  if (MANUAL_AVATARS[characterId]) {
    return MANUAL_AVATARS[characterId];
  }

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
    return getRealisticHumanAvatar(characterId, characterName);
  }

  // Default: assume human (realistic) unless explicitly fantasy
  return getRealisticHumanAvatar(characterId, characterName);
}

/**
 * List of human/realistic character IDs that should use minimalist cartoon style
 * All others default to waifu anime (fantasy)
 */
export const HUMAN_CHARACTER_IDS = [
  'marjorie',
  'rajiv',
  'asha',
  'dex',
  'eamon',
  'viktor',
  'tomasz',
  'aaliyah',
  'california-surfer',
  'sassy-best-friend',
  'chef-gordon',
];

/**
 * Check if a character ID should use human (minimalist cartoon) style
 */
export function isHumanCharacter(characterId: string): boolean {
  return HUMAN_CHARACTER_IDS.includes(characterId);
}

