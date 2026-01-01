/**
 * Advanced Voice Configuration System
 * Matches voices to characters based on personality, age, gender, and traits
 * Optimizes speed and diction for each character type
 */

export interface AdvancedVoiceConfig {
  voiceName: string;
  speed: number; // 0.8 - 1.5 (slower to faster)
  pitch: number; // 0.8 - 1.3 (lower to higher)
  styleHint: string; // Natural language description for Gemini
  diction: 'slow' | 'normal' | 'fast' | 'precise' | 'casual';
  emphasis: 'low' | 'medium' | 'high'; // Emphasis on words
}

// Character trait to voice mapping
const VOICE_MAPPING: Record<string, AdvancedVoiceConfig> = {
  // Old/Wise characters
  'old': {
    voiceName: 'charon', // Deep, authoritative
    speed: 0.95, // Slightly slower, thoughtful
    pitch: 0.9, // Lower pitch
    styleHint: 'wise, thoughtful, measured pace, clear enunciation',
    diction: 'precise',
    emphasis: 'medium',
  },
  'wise': {
    voiceName: 'charon',
    speed: 0.95,
    pitch: 0.9,
    styleHint: 'calm, authoritative, thoughtful, clear',
    diction: 'precise',
    emphasis: 'medium',
  },
  'mentor': {
    voiceName: 'charon',
    speed: 0.98,
    pitch: 0.92,
    styleHint: 'patient, encouraging, clear, warm',
    diction: 'precise',
    emphasis: 'medium',
  },

  // Grumpy/Comedic characters
  'grumpy': {
    voiceName: 'puck', // Energetic, expressive
    speed: 1.1, // Faster, more animated
    pitch: 0.95, // Slightly lower
    styleHint: 'dry, muttery, comedic irritation, quick',
    diction: 'casual',
    emphasis: 'high',
  },
  'comedic': {
    voiceName: 'puck',
    speed: 1.15, // Fast, energetic
    pitch: 1.0,
    styleHint: 'energetic, expressive, animated, quick',
    diction: 'fast',
    emphasis: 'high',
  },

  // Surfer/Chill characters
  'surfer': {
    voiceName: 'kore', // Warm, friendly
    speed: 0.9, // Slower, relaxed
    pitch: 1.0,
    styleHint: 'relaxed, friendly, beachy, upbeat, laid-back',
    diction: 'casual',
    emphasis: 'low',
  },
  'chill': {
    voiceName: 'kore',
    speed: 0.9,
    pitch: 1.0,
    styleHint: 'laid-back, relaxed, easygoing',
    diction: 'casual',
    emphasis: 'low',
  },

  // Professional/Detective characters
  'detective': {
    voiceName: 'fenrir', // Strong, confident
    speed: 1.05, // Confident pace
    pitch: 0.95,
    styleHint: 'confident, sharp, analytical, clear',
    diction: 'precise',
    emphasis: 'medium',
  },
  'professional': {
    voiceName: 'aoede', // Professional female
    speed: 1.0,
    pitch: 1.0,
    styleHint: 'professional, clear, confident, articulate',
    diction: 'precise',
    emphasis: 'medium',
  },

  // Warrior/Commander characters
  'warrior': {
    voiceName: 'fenrir', // Strong, powerful
    speed: 1.1, // Commanding pace
    pitch: 0.92, // Lower, more authoritative
    styleHint: 'commanding, strong, confident, clear',
    diction: 'precise',
    emphasis: 'high',
  },
  'commander': {
    voiceName: 'fenrir',
    speed: 1.12,
    pitch: 0.9,
    styleHint: 'authoritative, commanding, strong, clear',
    diction: 'precise',
    emphasis: 'high',
  },

  // Sassy/Best Friend characters
  'sassy': {
    voiceName: 'aoede', // Professional but expressive
    speed: 1.2, // Fast, animated
    pitch: 1.05, // Slightly higher
    styleHint: 'sassy, quick-witted, expressive, animated',
    diction: 'fast',
    emphasis: 'high',
  },
  'best-friend': {
    voiceName: 'kore', // Warm, friendly
    speed: 1.1,
    pitch: 1.0,
    styleHint: 'friendly, warm, conversational, expressive',
    diction: 'casual',
    emphasis: 'medium',
  },

  // Vampire/Dark characters
  'vampire': {
    voiceName: 'charon', // Deep, mysterious
    speed: 0.92, // Slow, deliberate
    pitch: 0.88, // Lower, mysterious
    styleHint: 'elegant, mysterious, refined, deliberate',
    diction: 'precise',
    emphasis: 'low',
  },
  'dark': {
    voiceName: 'charon',
    speed: 0.95,
    pitch: 0.9,
    styleHint: 'mysterious, dark, refined',
    diction: 'precise',
    emphasis: 'low',
  },

  // Romantic characters
  'romantic': {
    voiceName: 'pulcherrima', // Sophisticated, elegant
    speed: 0.98, // Gentle pace
    pitch: 1.02, // Slightly higher, warmer
    styleHint: 'warm, gentle, romantic, soft',
    diction: 'normal',
    emphasis: 'low',
  },
  'girlfriend': {
    voiceName: 'kore', // Warm, friendly
    speed: 1.0,
    pitch: 1.0,
    styleHint: 'warm, caring, gentle, affectionate',
    diction: 'normal',
    emphasis: 'medium',
  },

  // Teacher/Educational characters
  'teacher': {
    voiceName: 'aoede', // Clear, professional
    speed: 1.0, // Clear pace
    pitch: 1.0,
    styleHint: 'clear, patient, encouraging, articulate',
    diction: 'precise',
    emphasis: 'medium',
  },
  'educational': {
    voiceName: 'aoede',
    speed: 1.0,
    pitch: 1.0,
    styleHint: 'clear, patient, educational, encouraging',
    diction: 'precise',
    emphasis: 'medium',
  },

  // Therapist/Support characters
  'therapist': {
    voiceName: 'kore', // Warm, gentle
    speed: 0.95, // Slower, calming
    pitch: 1.0,
    styleHint: 'calm, gentle, empathetic, soothing',
    diction: 'normal',
    emphasis: 'low',
  },
  'support': {
    voiceName: 'kore',
    speed: 0.95,
    pitch: 1.0,
    styleHint: 'empathetic, gentle, calm, supportive',
    diction: 'normal',
    emphasis: 'low',
  },

  // Bard/Storyteller characters
  'bard': {
    voiceName: 'puck', // Expressive, animated
    speed: 1.05, // Storytelling pace
    pitch: 1.0,
    styleHint: 'expressive, animated, storytelling, engaging',
    diction: 'normal',
    emphasis: 'high',
  },
  'storyteller': {
    voiceName: 'puck',
    speed: 1.05,
    pitch: 1.0,
    styleHint: 'expressive, engaging, animated, storytelling',
    diction: 'normal',
    emphasis: 'high',
  },

  // Older People / Senior Citizens
  'karen': {
    voiceName: 'aoede', // Higher pitched, sharp
    speed: 1.2, // Fast, demanding
    pitch: 1.15, // Higher pitch, shrill when angry
    styleHint: 'sharp, demanding, entitled, high-pitched when agitated',
    diction: 'fast',
    emphasis: 'high',
  },
  'granny': {
    voiceName: 'kore', // Warm, gentle
    speed: 0.9, // Slower, thoughtful
    pitch: 0.95, // Slightly lower, warm
    styleHint: 'warm, gentle, caring, slightly slower pace, loving',
    diction: 'slow',
    emphasis: 'medium',
  },
  'grandfather': {
    voiceName: 'charon', // Deep, calm
    speed: 0.88, // Slow, storytelling pace
    pitch: 0.9, // Lower, warm
    styleHint: 'calm, warm, storytelling, slow deliberate pace, reassuring',
    diction: 'slow',
    emphasis: 'low',
  },
  'veteran': {
    voiceName: 'fenrir', // Strong, authoritative
    speed: 1.0, // Clear, commanding
    pitch: 0.92, // Lower, gruff
    styleHint: 'gruff, authoritative, honorable, clear, military precision',
    diction: 'precise',
    emphasis: 'medium',
  },
  'elder': {
    voiceName: 'charon', // Wise, deep
    speed: 0.92, // Slower, thoughtful
    pitch: 0.9, // Lower, wise
    styleHint: 'wise, thoughtful, patient, clear enunciation',
    diction: 'precise',
    emphasis: 'medium',
  },
  'senior': {
    voiceName: 'kore', // Warm
    speed: 0.95, // Slightly slower
    pitch: 0.95, // Slightly lower
    styleHint: 'warm, patient, clear, slightly slower pace',
    diction: 'normal',
    emphasis: 'medium',
  },

  // Cultural Characters
  'tribal': {
    voiceName: 'fenrir', // Strong, proud
    speed: 1.0, // Clear, confident
    pitch: 0.95, // Lower, authoritative
    styleHint: 'proud, traditional, strong, clear, with cultural respect',
    diction: 'precise',
    emphasis: 'high',
  },
  'shaman': {
    voiceName: 'charon', // Mystical, deep
    speed: 0.9, // Slow, deliberate
    pitch: 0.88, // Lower, mystical
    styleHint: 'mystical, spiritual, connected, slow deliberate pace, wise',
    diction: 'precise',
    emphasis: 'low',
  },
  'merchant': {
    voiceName: 'puck', // Charismatic, expressive
    speed: 1.1, // Fast, engaging
    pitch: 1.0,
    styleHint: 'charismatic, engaging, hospitable, expressive, storytelling',
    diction: 'fast',
    emphasis: 'high',
  },
  'master': {
    voiceName: 'charon', // Wise, disciplined
    speed: 0.95, // Slow, deliberate
    pitch: 0.9, // Lower, authoritative
    styleHint: 'wise, disciplined, patient, clear, teaching tone',
    diction: 'precise',
    emphasis: 'medium',
  },
  'leader': {
    voiceName: 'fenrir', // Strong, passionate
    speed: 1.05, // Confident pace
    pitch: 1.0,
    styleHint: 'passionate, strong, family-oriented, warm but commanding',
    diction: 'precise',
    emphasis: 'high',
  },
  'seafarer': {
    voiceName: 'fenrir', // Rough, warm
    speed: 1.0, // Storytelling pace
    pitch: 0.95, // Lower, weathered
    styleHint: 'rough, warm, storytelling, weathered by sea, adventurous',
    diction: 'casual',
    emphasis: 'medium',
  },
  'cultural': {
    voiceName: 'kore', // Warm, respectful
    speed: 1.0,
    pitch: 1.0,
    styleHint: 'warm, respectful, culturally aware, clear',
    diction: 'normal',
    emphasis: 'medium',
  },
};

/**
 * Detect gender from name (basic heuristic)
 */
export function detectGenderFromName(name: string): 'male' | 'female' | 'neutral' {
  const nameLower = name.toLowerCase();

  // Common female name endings
  const femaleEndings = ['a', 'ia', 'ina', 'ella', 'ette', 'elle', 'ana', 'ena', 'ina', 'ia'];
  // Common male name endings  
  const maleEndings = ['o', 'io', 'us', 'er', 'or', 'an', 'en', 'on', 'el', 'al'];

  // Check endings
  for (const ending of femaleEndings) {
    if (nameLower.endsWith(ending) && nameLower.length > 3) {
      return 'female';
    }
  }

  for (const ending of maleEndings) {
    if (nameLower.endsWith(ending) && nameLower.length > 3) {
      return 'male';
    }
  }

  // Check for common female name patterns (expanded list)
  const femaleNames = ['maria', 'sophia', 'emily', 'sarah', 'anna', 'lisa', 'jessica', 'jennifer', 'nicole', 'rachel', 'elizabeth', 'michelle', 'ashley', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'laura', 'sharon', 'cynthia', 'kathleen', 'amy', 'angela', 'shirley', 'brenda', 'pamela', 'emma', 'nancy', 'betty', 'helen', 'sandra', 'donna', 'carol', 'ruth', 'kimberly', 'virginia', 'martha', 'debra', 'carolyn', 'christine', 'marie', 'janet', 'catherine', 'frances', 'ann', 'joyce', 'diane', 'alice', 'julie', 'heather', 'teresa', 'doris', 'gloria', 'evelyn', 'jean', 'cheryl', 'mildred', 'katherine', 'joan', 'judith', 'rose', 'janice', 'kelly', 'judy', 'christina', 'kathy', 'theresa', 'beverly', 'denise', 'tammy', 'irene', 'jane', 'lori', 'marilyn', 'andrea', 'kathryn', 'louise', 'sara', 'anne', 'jacqueline', 'wanda', 'bonnie', 'julia', 'ruby', 'lois', 'tina', 'phyllis', 'norma', 'paula', 'diana', 'annie', 'lillian', 'robin', 'peggy', 'crystal', 'gladys', 'rita', 'dawn', 'connie', 'florence', 'tracy', 'edna', 'tiffany', 'carmen', 'rosa', 'cindy', 'grace', 'wendy', 'victoria', 'edith', 'kim', 'sherry', 'sylvia', 'josephine', 'thelma', 'shannon', 'sheila', 'ethel', 'ellen', 'elaine', 'marjorie', 'carrie', 'charlotte', 'monica', 'esther', 'pauline', 'juanita', 'anita', 'rhonda', 'hazel', 'amber', 'eva', 'debbie', 'april', 'leslie', 'clara', 'lucille', 'jamie', 'joanne', 'eleanor', 'valerie', 'danielle', 'megan', 'alicia', 'suzanne', 'michele', 'gail', 'bertha', 'terri', 'gertrude', 'lucy', 'tonya', 'ella', 'stacey', 'wilma', 'gina', 'kristin', 'jessie', 'natalie', 'agnes', 'vera', 'charlene', 'bessie', 'delores', 'melinda', 'pearl', 'arlene', 'maureen', 'colleen', 'allison', 'tamara', 'joy', 'georgia', 'constance', 'lillie', 'claudia', 'jackie', 'marcia', 'tanya', 'nellie', 'minnie', 'marlene', 'heidi', 'glenda', 'lydia', 'viola', 'courtney', 'marian', 'stella', 'caroline', 'dora', 'vickie', 'mattie', 'maxine', 'irma', 'mabel', 'marsha', 'myrtle', 'lena', 'christy', 'deanna', 'patsy', 'hilda', 'gwendolyn', 'jennie', 'nora', 'margie', 'nina', 'cassandra', 'leah', 'penny', 'kay', 'priscilla', 'naomi', 'carole', 'brandy', 'olga', 'billie', 'dianne', 'tracey', 'leona', 'jenny', 'felicia', 'sonia', 'miriam', 'velma', 'becky', 'bobbie', 'vivian', 'roberta', 'holly', 'brittany', 'melanie', 'loretta', 'yolanda', 'jeanette', 'laurie', 'katie', 'kristen', 'vanessa', 'alma', 'sue', 'elsie', 'beth', 'jeanne', 'rosemary', 'linda', 'karen', 'susan'];

  // Check for common male name patterns (expanded list)
  const maleNames = ['michael', 'john', 'david', 'james', 'robert', 'william', 'richard', 'joseph', 'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'timothy', 'ronald', 'jason', 'edward', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'frank', 'gregory', 'raymond', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'henry', 'adam', 'douglas', 'nathan', 'zachary', 'kyle', 'noah', 'ethan', 'jeremy', 'walter', 'christian', 'keith', 'roger', 'terry', 'gerald', 'harold', 'sean', 'austin', 'carl', 'arthur', 'lawrence', 'dylan', 'jesse', 'jordan', 'bryan', 'billy', 'joe', 'bruce', 'ralph', 'roy', 'wayne', 'eugene', 'louis', 'philip', 'johnny', 'howard', 'alan', 'juan', 'willie', 'russell', 'harry', 'albert', 'randy', 'carlos', 'victor', 'jimmy', 'craig', 'bobby', 'phillip', 'samuel', 'fred'];

  for (const name of femaleNames) {
    if (nameLower.includes(name)) {
      return 'female';
    }
  }

  for (const name of maleNames) {
    if (nameLower.includes(name)) {
      return 'male';
    }
  }

  return 'neutral';
}

/**
 * Get optimal voice configuration for a character
 */
export function getAdvancedVoiceConfig(
  characterName: string,
  archetype: string,
  category: string,
  tagline?: string | null,
  description?: string | null
): AdvancedVoiceConfig {
  const nameLower = characterName.toLowerCase();
  const archLower = archetype.toLowerCase();
  const catLower = category.toLowerCase();
  const taglineLower = (tagline || '').toLowerCase();
  const descLower = (description || '').toLowerCase();

  const allText = `${nameLower} ${archLower} ${catLower} ${taglineLower} ${descLower}`;

  // Detect gender from name
  const detectedGender = detectGenderFromName(characterName);

  // Check for specific character traits (in order of specificity)
  const traitChecks = [
    // Older people (check first for specificity)
    'karen', 'granny', 'grandfather', 'veteran', 'elder', 'senior',
    // Cultural characters
    'tribal', 'shaman', 'merchant', 'master', 'leader', 'seafarer', 'cultural',
    // Existing traits
    'grumpy', 'old', 'wise', 'mentor', 'surfer', 'chill',
    'detective', 'professional', 'warrior', 'commander',
    'sassy', 'best-friend', 'vampire', 'dark', 'romantic',
    'girlfriend', 'teacher', 'educational', 'therapist',
    'support', 'bard', 'storyteller', 'comedic'
  ];

  for (const trait of traitChecks) {
    if (allText.includes(trait)) {
      const config = VOICE_MAPPING[trait];
      if (config) {
        // CRITICAL: Adjust voice based on detected gender - ensure gender matches
        let voiceName = config.voiceName;

        // Female voices: aoede, kore, pulcherrima, zephyr
        // Male voices: fenrir, charon, puck, gacrux, orus
        // Neutral voices: kore, puck (can work for both)

        if (detectedGender === 'female') {
          // Force female voices for female characters
          if (voiceName === 'charon' || voiceName === 'fenrir' || voiceName === 'orus' || voiceName === 'gacrux') {
            voiceName = 'aoede'; // Clear female voice
          } else if (voiceName === 'puck') {
            voiceName = 'kore'; // More feminine than puck
          }
        } else if (detectedGender === 'male') {
          // Force male voices for male characters
          if (voiceName === 'aoede' || voiceName === 'pulcherrima' || voiceName === 'zephyr') {
            voiceName = 'fenrir'; // Strong male voice
          } else if (voiceName === 'kore') {
            voiceName = 'puck'; // More masculine than kore
          }
        }

        return { ...config, voiceName }; // Return copy with gender-adjusted voice
      }
    }
  }

  // Default based on category and gender - ensure gender matches
  let defaultVoice: string;
  if (detectedGender === 'female') {
    defaultVoice = 'aoede'; // Clear female voice
  } else if (detectedGender === 'male') {
    defaultVoice = 'fenrir'; // Strong male voice
  } else {
    defaultVoice = 'kore'; // Neutral fallback
  }

  if (catLower.includes('comedy')) {
    return {
      voiceName: defaultVoice,
      speed: 1.1,
      pitch: detectedGender === 'female' ? 1.05 : 1.0,
      styleHint: 'energetic, expressive, animated',
      diction: 'fast',
      emphasis: 'high',
    };
  }

  if (catLower.includes('adventure') || catLower.includes('fiction')) {
    return {
      voiceName: detectedGender === 'female' ? 'kore' : 'fenrir',
      speed: 1.05,
      pitch: detectedGender === 'female' ? 1.0 : 0.95,
      styleHint: 'confident, strong, clear',
      diction: 'precise',
      emphasis: 'medium',
    };
  }

  if (catLower.includes('romance')) {
    return {
      voiceName: defaultVoice,
      speed: 1.0,
      pitch: detectedGender === 'female' ? 1.02 : 1.0,
      styleHint: 'warm, gentle, caring',
      diction: 'normal',
      emphasis: 'medium',
    };
  }

  // Default configuration with gender awareness
  return {
    voiceName: defaultVoice,
    speed: 1.0,
    pitch: detectedGender === 'female' ? 1.02 : (detectedGender === 'male' ? 0.98 : 1.0),
    styleHint: 'natural, conversational, clear',
    diction: 'normal',
    emphasis: 'medium',
  };
}

/**
 * Convert diction to speed multiplier
 */
export function getSpeedFromDiction(diction: string): number {
  switch (diction) {
    case 'slow': return 0.85;
    case 'casual': return 0.95;
    case 'normal': return 1.0;
    case 'precise': return 1.05;
    case 'fast': return 1.15;
    default: return 1.0;
  }
}

