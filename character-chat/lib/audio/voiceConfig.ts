/**
 * Realistic Voice Configuration
 * Maps character personas to appropriate realistic voices
 */

// Export voice metadata from geminiVoiceMetadata
export { GEMINI_VOICE_METADATA, getGeminiVoiceMetadata, getVoicesByGender, getVoicesByAge } from './geminiVoiceMetadata';
export type { GeminiVoiceMetadata } from './geminiVoiceMetadata';

export interface VoiceConfig {
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'old';
  style: string;
  realistic: boolean;
  keywords?: string[]; // Keywords for matching (personality traits, characteristics)
  voiceCharacteristics?: {
    pitch?: 'high' | 'medium' | 'low';
    speed?: 'fast' | 'medium' | 'slow';
    tone?: 'warm' | 'cool' | 'neutral';
    energy?: 'high' | 'medium' | 'low';
    formality?: 'formal' | 'casual' | 'neutral';
  };
}

export const REALISTIC_VOICES: Record<string, VoiceConfig> = {
  // Male voices
  'James': {
    name: 'James',
    description: 'Professional male voice, clear and articulate',
    gender: 'male',
    age: 'middle',
    style: 'professional, clear, confident',
    realistic: true,
  },
  'Michael': {
    name: 'Michael',
    description: 'Warm male voice, friendly and approachable',
    gender: 'male',
    age: 'middle',
    style: 'warm, friendly, conversational',
    realistic: true,
  },
  'David': {
    name: 'David',
    description: 'Deep male voice, authoritative and mature',
    gender: 'male',
    age: 'old',
    style: 'deep, authoritative, wise',
    realistic: true,
  },
  'Robert': {
    name: 'Robert',
    description: 'Casual male voice, laid-back and natural',
    gender: 'male',
    age: 'young',
    style: 'casual, natural, relaxed',
    realistic: true,
  },
  
  // Female voices
  'Sarah': {
    name: 'Sarah',
    description: 'Professional female voice, clear and confident',
    gender: 'female',
    age: 'middle',
    style: 'professional, clear, confident',
    realistic: true,
  },
  'Emily': {
    name: 'Emily',
    description: 'Warm female voice, friendly and energetic',
    gender: 'female',
    age: 'young',
    style: 'warm, friendly, energetic',
    realistic: true,
  },
  'Jennifer': {
    name: 'Jennifer',
    description: 'Sophisticated female voice, elegant and refined',
    gender: 'female',
    age: 'middle',
    style: 'sophisticated, elegant, refined',
    realistic: true,
  },
  'Lisa': {
    name: 'Lisa',
    description: 'Gentle female voice, calm and soothing',
    gender: 'female',
    age: 'middle',
    style: 'gentle, calm, soothing',
    realistic: true,
  },
  
  // Neutral/Character voices
  'Alex': {
    name: 'Alex',
    description: 'Neutral voice, versatile and adaptable',
    gender: 'neutral',
    age: 'middle',
    style: 'versatile, adaptable, clear',
    realistic: true,
  },
};

// Valid Gemini TTS voice names (from API)
export const VALID_GEMINI_VOICES = [
  'achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe',
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir',
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck',
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar',
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'
] as const;

// Map all voice names to valid Gemini voices
export const VOICE_MIGRATION_MAP: Record<string, string> = {
  // Keep valid Gemini voices as-is
  'Puck': 'puck',
  'Kore': 'kore',
  'Charon': 'charon',
  'Aoede': 'aoede',
  'Fenrir': 'fenrir',
  'Achernar': 'achernar',
  'Achird': 'achird',
  'Algenib': 'algenib',
  'Algieba': 'algieba',
  'Alnilam': 'alnilam',
  'Autonoe': 'autonoe',
  'Callirrhoe': 'callirrhoe',
  'Despina': 'despina',
  'Enceladus': 'enceladus',
  'Erinome': 'erinome',
  'Gacrux': 'gacrux',
  'Iapetus': 'iapetus',
  'Laomedeia': 'laomedeia',
  'Leda': 'leda',
  'Orus': 'orus',
  'Pulcherrima': 'pulcherrima',
  'Rasalgethi': 'rasalgethi',
  'Sadachbia': 'sadachbia',
  'Sadaltager': 'sadaltager',
  'Schedar': 'schedar',
  'Sulafat': 'sulafat',
  'Umbriel': 'umbriel',
  'Vindemiatrix': 'vindemiatrix',
  'Zephyr': 'zephyr',
  'Zubenelgenubi': 'zubenelgenubi',
  // Map invalid names to valid ones
  'Emily': 'kore',        // Warm female -> kore
  'Sarah': 'aoede',       // Professional female -> aoede
  'Jennifer': 'pulcherrima', // Sophisticated -> pulcherrima
  'Lisa': 'kore',         // Gentle -> kore
  'James': 'charon',      // Professional male -> charon
  'Michael': 'fenrir',    // Warm male -> fenrir
  'David': 'charon',      // Deep male -> charon
  'Robert': 'puck',       // Casual male -> puck
  'Alex': 'zephyr',       // Neutral -> zephyr
};

/**
 * Get the best realistic voice for a character
 */
export function getRealisticVoice(characterName: string, archetype: string, gender?: string): string {
  // Determine gender from character name/archetype if not provided
  const inferredGender = gender || inferGender(characterName, archetype);
  
  // Select appropriate voice based on character
  if (inferredGender === 'male') {
    if (archetype.includes('old') || archetype.includes('wise') || archetype.includes('mentor')) return 'David';
    if (archetype.includes('casual') || archetype.includes('surfer') || archetype.includes('comedic')) return 'Robert';
    if (archetype.includes('professional') || archetype.includes('detective')) return 'James';
    return 'Michael'; // Default warm male
  } else if (inferredGender === 'female') {
    if (archetype.includes('professional') || archetype.includes('sassy') || archetype.includes('best friend')) return 'Sarah';
    if (archetype.includes('gentle') || archetype.includes('sweet') || archetype.includes('therapy')) return 'Lisa';
    if (archetype.includes('sophisticated') || archetype.includes('elegant')) return 'Jennifer';
    return 'Emily'; // Default warm female
  }
  
  return 'Alex'; // Neutral default
}

function inferGender(name: string, archetype: string): 'male' | 'female' | 'neutral' {
  const nameLower = name.toLowerCase();
  const archLower = archetype.toLowerCase();
  
  // Female indicators
  if (nameLower.includes('girl') || nameLower.includes('woman') || 
      archLower.includes('girl') || archLower.includes('woman') ||
      nameLower.includes('tsundere') || nameLower.includes('yandere') ||
      nameLower.includes('dere') || nameLower.includes('anime girl')) {
    return 'female';
  }
  
  // Male indicators
  if (nameLower.includes('man') || nameLower.includes('guy') ||
      archLower.includes('man') || archLower.includes('guy') ||
      nameLower.includes('old man') || nameLower.includes('surfer') ||
      nameLower.includes('detective') || nameLower.includes('chef')) {
    return 'male';
  }
  
  return 'neutral';
}

