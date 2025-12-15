/**
 * Content Filter - Character.ai-style safety filter
 * Prevents explicit profanity, sexual content, aggression, and real-world weapons
 */

interface FilterResult {
  allowed: boolean;
  reason?: string;
  filteredText?: string;
}

// Profanity patterns (common explicit words)
const PROFANITY_PATTERNS = [
  /\b(f\*\*k|fuck|sh\*\*t|shit|b\*\*ch|bitch|a\*\*hole|asshole|d\*\*k|dick|c\*\*t|cunt|p\*\*sy|pussy)\b/gi,
  /\b(n\*\*ga|nigger|n\*\*ger)\b/gi,
  /\b(m\*\*therf\*\*ker|motherfucker)\b/gi,
];

// Sexual content patterns
const SEXUAL_PATTERNS = [
  /\b(sex|sexual|porn|pornography|masturbat|orgasm|erotic|nude|naked|genital|penis|vagina|breast|nipple)\b/gi,
  /\b(rape|molest|assault|abuse)\b/gi,
  /\b(incest|pedophil|child.*sex)\b/gi,
];

// Aggression patterns
const AGGRESSION_PATTERNS = [
  /\b(kill|murder|suicide|self.*harm|cut.*yourself|hurt.*yourself|die)\b/gi,
  /\b(violence|violent|attack|assault|fight|beat.*up|punch|stab|shoot)\b/gi,
  /\b(threat|threaten|harm|hurt|injure|maim)\b/gi,
];

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
 * Check if text contains aggression/violence
 */
function containsAggression(text: string): boolean {
  return AGGRESSION_PATTERNS.some(pattern => pattern.test(text));
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
 * Filter text content
 */
export function filterContent(text: string, isUserInput: boolean = false): FilterResult {
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
  
  // Check aggression (stricter for user input)
  if (containsAggression(lowerText)) {
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
 * Check if response should be blocked and provide alternative
 */
export function shouldBlockResponse(text: string): { blocked: boolean; alternative?: string } {
  const filterResult = filterContent(text, false);
  
  if (!filterResult.allowed) {
    return {
      blocked: true,
      alternative: "I'm sorry, I can't discuss that topic. Is there something else you'd like to talk about?",
    };
  }
  
  return { blocked: false };
}

