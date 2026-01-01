/**
 * Content Filter - Character.ai-style safety filter
 * Prevents explicit profanity, sexual content, aggression, and real-world weapons
 * Context-aware filtering based on character category/archetype
 */

interface FilterResult {
  allowed: boolean;
  reason?: string;
  filteredText?: string;
}

interface CharacterMetadata {
  category?: string;
  archetype?: string;
  name?: string;
}

// Profanity patterns (common explicit words) - Enhanced list
const PROFANITY_PATTERNS = [
  /\b(f\*\*k|fuck|f\*\*king|fucking|sh\*\*t|shit|sh\*\*ty|b\*\*ch|bitch|a\*\*hole|asshole|d\*\*k|dick|d\*\*khead|c\*\*t|cunt|p\*\*sy|pussy)\b/gi,
  /\b(n\*\*ga|nigger|n\*\*ger|n\*\*gas)\b/gi,
  /\b(m\*\*therf\*\*ker|motherfucker|m\*\*therf\*\*king)\b/gi,
  /\b(b\*\*stard|bastard|w\*\*nker|wanker|t\*\*t|twat|pr\*\*k|prick)\b/gi,
  /\b(c\*\*ksucker|cocksucker|wh\*\*re|whore|sl\*\*t|slut)\b/gi,
  /\b(d\*\*che|douche|d\*\*chebag|douchebag|f\*\*ktard|fucktard)\b/gi,
];

// Sexual content patterns - Enhanced list
const SEXUAL_PATTERNS = [
  /\b(sex|sexual|porn|pornography|masturbat|orgasm|erotic|nude|naked|genital|penis|vagina|breast|nipple|clitoris|testicle|scrotum)\b/gi,
  /\b(rape|molest|assault|abuse|sexual.*assault|sexual.*abuse)\b/gi,
  /\b(incest|pedophil|child.*sex|underage|minor.*sex)\b/gi,
  /\b(cum|sperm|ejaculat|ejaculate|oral.*sex|anal.*sex|blowjob|handjob)\b/gi,
  /\b(prostitut|prostitute|escort|hooker|stripper|stripping)\b/gi,
  /\b(hentai|xxx|nsfw|adult.*content|explicit.*content)\b/gi,
];

// Aggression patterns (context-dependent words)
const AGGRESSION_PATTERNS = [
  /\b(kill|murder|suicide|self.*harm|cut.*yourself|hurt.*yourself|die)\b/gi,
  /\b(violence|violent|attack|assault|fight|beat.*up|punch|stab|shoot)\b/gi,
  /\b(threat|threaten|harm|hurt|injure|maim)\b/gi,
];

// Context-aware allowed words for specific character types
const CONTEXT_ALLOWED_WORDS: Record<string, string[]> = {
  'sports': ['fight', 'battle', 'match', 'competition', 'combat', 'fight night', 'boxing', 'wrestling'],
  'fight': ['fight', 'battle', 'match', 'competition', 'combat', 'fight night', 'boxing', 'wrestling', 'martial arts'],
  'announcer': ['fight', 'battle', 'match', 'competition', 'combat', 'round', 'knockout', 'winner'],
  'commentator': ['fight', 'battle', 'match', 'game', 'play', 'score'],
  'fantasy': ['fight', 'battle', 'combat', 'war', 'sword', 'magic'],
  'warrior': ['fight', 'battle', 'combat', 'war', 'sword', 'weapon'],
  'educational': ['violence', 'war', 'battle', 'historical', 'history'],
};

// Character categories/archetypes that allow fight-related words
const FIGHT_ALLOWED_CATEGORIES = ['sports', 'fight', 'announcer', 'commentator', 'fantasy', 'warrior'];
const FIGHT_ALLOWED_ARCHETYPES = ['sports', 'fighter', 'announcer', 'commentator', 'warrior', 'knight', 'combat'];

// Real-world weapons (not fantasy)
const REAL_WEAPON_PATTERNS = [
  /\b(gun|pistol|rifle|shotgun|ak47|ar15|weapon|firearm|ammo|ammunition|bullet)\b/gi,
  /\b(knife|blade|switchblade|machete|dagger)\b/gi,
  /\b(bomb|explosive|grenade|dynamite|tnt)\b/gi,
  /\b(poison|toxic|venom)\b/gi,
];

// Context exceptions - words that might match but are okay in context
const SAFE_CONTEXTS = [
  /(fantasy|magical|sword|sword.*of|enchanted|legendary)/i, // Fantasy weapons are okay
  /(game|gaming|video.*game|play|character)/i, // Gaming context
  /(story|fiction|novel|book|tale)/i, // Story context
  /(history|historical|war|battle.*of)/i, // Historical context (be careful)
];

/**
 * Check if text contains profanity
 */
function containsProfanity(text: string): boolean {
  return PROFANITY_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if text contains sexual content
 */
function containsSexualContent(text: string): boolean {
  return SEXUAL_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if character allows fight-related words
 */
function allowsFightWords(characterMetadata?: CharacterMetadata): boolean {
  if (!characterMetadata) return false;

  const category = characterMetadata.category?.toLowerCase() || '';
  const archetype = characterMetadata.archetype?.toLowerCase() || '';
  const name = characterMetadata.name?.toLowerCase() || '';
  const description = ''; // Could add description check if needed

  // Check category matches
  const categoryMatch = FIGHT_ALLOWED_CATEGORIES.some(allowed =>
    category.includes(allowed) || category === allowed
  );

  // Check archetype matches
  const archetypeMatch = FIGHT_ALLOWED_ARCHETYPES.some(allowed =>
    archetype.includes(allowed) || archetype === allowed
  );

  // Check name/description contains relevant keywords
  const keywordMatch = name.includes('announcer') || name.includes('commentator') ||
    name.includes('fighter') || name.includes('sports') ||
    name.includes('fight') || description.includes('announcer') ||
    description.includes('commentator');

  return categoryMatch || archetypeMatch || keywordMatch;
}

/**
 * Check if text contains aggression/violence (context-aware)
 * RELAXED: Only blocks explicit self-harm, allows normal usage of words like "die", "kill" in context
 */
function containsAggression(text: string, characterMetadata?: CharacterMetadata): boolean {
  const lowerText = text.toLowerCase();
  const allowsFight = allowsFightWords(characterMetadata);

  // SELF-HARM PATTERNS ONLY - These are always blocked
  // Only blocks when text explicitly mentions wanting to harm oneself
  const selfHarmPatterns = [
    /\b(i\s+want\s+to\s+(die|kill\s+myself)|want\s+to\s+end\s+(my|it\s+all))/i,
    /\b(suicide|self[- ]?harm|cut\s+my(self)?|hurt\s+myself)/i,
    /\b(kill\s+myself|end\s+my\s+life)/i,
  ];

  if (selfHarmPatterns.some(pattern => pattern.test(lowerText))) {
    return true; // Always block explicit self-harm
  }

  // THREATS AGAINST OTHERS - Block direct threats
  const directThreats = /\b(i('m| am| will)\s+(going\s+to\s+)?(kill|murder|hurt|attack)\s+(you|him|her|them))\b/i;
  if (directThreats.test(lowerText)) {
    return true; // Block direct threats
  }

  // Check for fight-related words (context-dependent)
  const fightWords = ['fight', 'battle', 'match', 'competition', 'combat', 'boxing', 'wrestling', 'martial arts'];
  const foundFightWord = fightWords.some(word => {
    // Use word boundary regex for accurate matching
    const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
    return regex.test(lowerText);
  });

  if (foundFightWord) {
    // Fight-related word found - allow if character type permits it
    if (allowsFight) {
      return false; // Allowed for fight/sports characters
    }
    // Not a fight character, but might be in safe context
    const isSafeContext = /(game|gaming|video.*game|fantasy|magical|story|fiction|history|historical)/i.test(text);
    return !isSafeContext; // Block unless in safe context
  }

  // Check for other aggression words (attack, assault, etc.)
  const otherAggression = /\b(attack|assault|beat.*up|punch|stab|shoot|violence|violent)\b/gi.test(text);
  if (otherAggression) {
    // These are more severe - only allow in specific safe contexts
    const isSafeContext = /(game|gaming|video.*game|fantasy|magical|story|fiction|history|historical)/i.test(text);
    return !isSafeContext; // Block unless in safe context
  }

  return false; // No aggression found
}

/**
 * Check if text mentions real-world weapons (not fantasy)
 */
function containsRealWeapons(text: string): boolean {
  const hasWeapon = REAL_WEAPON_PATTERNS.some(pattern => pattern.test(text));
  if (!hasWeapon) return false;

  // Check if it's in a safe context (fantasy, gaming, story)
  const isSafeContext = SAFE_CONTEXTS.some(context => context.test(text));
  return !isSafeContext;
}

/**
 * Filter text content (context-aware based on character metadata)
 */
export function filterContent(
  text: string,
  isUserInput: boolean = false,
  characterMetadata?: CharacterMetadata
): FilterResult {
  const lowerText = text.toLowerCase();

  // Check profanity
  if (containsProfanity(lowerText)) {
    return {
      allowed: false,
      reason: "Profanity is not allowed.",
    };
  }

  // Check sexual content
  if (containsSexualContent(lowerText)) {
    return {
      allowed: false,
      reason: "Sexual content is not allowed.",
    };
  }

  // Check aggression (context-aware, stricter for user input)
  if (containsAggression(lowerText, characterMetadata)) {
    if (isUserInput) {
      return {
        allowed: false,
        reason: "Violent or aggressive content is not allowed.",
      };
    }
    // For AI responses, allow if it's clearly in character (e.g., detective, knight)
    // but still flag for review
  }

  // Check real-world weapons
  if (containsRealWeapons(lowerText)) {
    return {
      allowed: false,
      reason: "Discussion of real-world weapons is not allowed. Fantasy weapons are okay.",
    };
  }

  return { allowed: true };
}

/**
 * Sanitize text by replacing blocked words with asterisks
 */
export function sanitizeText(text: string): string {
  let sanitized = text;

  // Replace profanity
  PROFANITY_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, (match) => '*'.repeat(match.length));
  });

  return sanitized;
}

/**
 * Check if response should be blocked and provide alternative (context-aware)
 */
export function shouldBlockResponse(
  text: string,
  characterMetadata?: CharacterMetadata
): { blocked: boolean; alternative?: string } {
  const filterResult = filterContent(text, false, characterMetadata);

  if (!filterResult.allowed) {
    return {
      blocked: true,
      alternative: "I'm sorry, I can't discuss that topic. Is there something else you'd like to talk about?",
    };
  }

  return { blocked: false };
}


