/**
 * Gemini TTS Voice Metadata
 * Enhanced metadata with keywords and characteristics for voice-character matching
 */

export interface GeminiVoiceMetadata {
  voiceName: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'old';
  keywords: string[]; // Personality traits, characteristics for matching
  characteristics: {
    pitch: 'high' | 'medium' | 'low';
    speed: 'fast' | 'medium' | 'slow';
    tone: 'warm' | 'cool' | 'neutral';
    energy: 'high' | 'medium' | 'low';
    formality: 'formal' | 'casual' | 'neutral';
  };
  description: string;
}

/**
 * Enhanced metadata for all Gemini TTS voices
 * Used for voice-character matching (80-90% threshold)
 */
export const GEMINI_VOICE_METADATA: Record<string, GeminiVoiceMetadata> = {
  // Female voices
  'kore': {
    voiceName: 'kore',
    gender: 'female',
    age: 'young',
    keywords: ['warm', 'friendly', 'energetic', 'young', 'cheerful', 'approachable', 'enthusiastic'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Warm, friendly female voice, energetic and youthful',
  },
  'aoede': {
    voiceName: 'aoede',
    gender: 'female',
    age: 'middle',
    keywords: ['professional', 'clear', 'confident', 'articulate', 'strong', 'authoritative'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'formal',
    },
    description: 'Professional female voice, clear and confident',
  },
  'pulcherrima': {
    voiceName: 'pulcherrima',
    gender: 'female',
    age: 'middle',
    keywords: ['sophisticated', 'elegant', 'refined', 'polished', 'mature', 'graceful'],
    characteristics: {
      pitch: 'medium',
      speed: 'slow',
      tone: 'warm',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Sophisticated female voice, elegant and refined',
  },
  'leda': {
    voiceName: 'leda',
    gender: 'female',
    age: 'young',
    keywords: ['gentle', 'soft', 'calm', 'soothing', 'peaceful', 'tender'],
    characteristics: {
      pitch: 'high',
      speed: 'slow',
      tone: 'warm',
      energy: 'low',
      formality: 'casual',
    },
    description: 'Gentle female voice, calm and soothing',
  },
  'despina': {
    voiceName: 'despina',
    gender: 'female',
    age: 'young',
    keywords: ['playful', 'energetic', 'bubbly', 'cheerful', 'animated', 'lighthearted'],
    characteristics: {
      pitch: 'high',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Playful female voice, energetic and bubbly',
  },
  'autonoe': {
    voiceName: 'autonoe',
    gender: 'female',
    age: 'middle',
    keywords: ['mysterious', 'sultry', 'intriguing', 'alluring', 'sophisticated'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'cool',
      energy: 'low',
      formality: 'neutral',
    },
    description: 'Mysterious female voice, sultry and intriguing',
  },
  'callirrhoe': {
    voiceName: 'callirrhoe',
    gender: 'female',
    age: 'young',
    keywords: ['bright', 'energetic', 'optimistic', 'upbeat', 'vibrant'],
    characteristics: {
      pitch: 'high',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Bright female voice, energetic and optimistic',
  },
  'erinome': {
    voiceName: 'erinome',
    gender: 'female',
    age: 'middle',
    keywords: ['mature', 'calm', 'measured', 'thoughtful', 'composed'],
    characteristics: {
      pitch: 'medium',
      speed: 'slow',
      tone: 'neutral',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Mature female voice, calm and measured',
  },
  
  // Male voices
  'charon': {
    voiceName: 'charon',
    gender: 'male',
    age: 'old',
    keywords: ['deep', 'authoritative', 'wise', 'mature', 'commanding', 'gravitas'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'cool',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Deep male voice, authoritative and wise',
  },
  'fenrir': {
    voiceName: 'fenrir',
    gender: 'male',
    age: 'middle',
    keywords: ['strong', 'confident', 'powerful', 'resolute', 'determined', 'masculine'],
    characteristics: {
      pitch: 'low',
      speed: 'medium',
      tone: 'cool',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Strong male voice, confident and powerful',
  },
  'puck': {
    voiceName: 'puck',
    gender: 'male',
    age: 'young',
    keywords: ['energetic', 'playful', 'casual', 'laid-back', 'cheerful', 'relaxed'],
    characteristics: {
      pitch: 'medium',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Energetic male voice, playful and casual',
  },
  'fenrir': {
    voiceName: 'fenrir',
    gender: 'male',
    age: 'middle',
    keywords: ['confident', 'professional', 'clear', 'articulate', 'strong'],
    characteristics: {
      pitch: 'low',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'formal',
    },
    description: 'Confident male voice, professional and clear',
  },
  'zephyr': {
    voiceName: 'zephyr',
    gender: 'neutral',
    age: 'middle',
    keywords: ['versatile', 'adaptable', 'clear', 'neutral', 'balanced'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Versatile neutral voice, adaptable and clear',
  },
  'achernar': {
    voiceName: 'achernar',
    gender: 'male',
    age: 'young',
    keywords: ['bright', 'energetic', 'upbeat', 'optimistic', 'youthful'],
    characteristics: {
      pitch: 'medium',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Bright male voice, energetic and youthful',
  },
  'achird': {
    voiceName: 'achird',
    gender: 'male',
    age: 'middle',
    keywords: ['calm', 'steady', 'reliable', 'measured', 'composed'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'neutral',
      energy: 'low',
      formality: 'neutral',
    },
    description: 'Calm male voice, steady and reliable',
  },
  'algenib': {
    voiceName: 'algenib',
    gender: 'male',
    age: 'old',
    keywords: ['wise', 'thoughtful', 'patient', 'mature', 'reflective'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'warm',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Wise male voice, thoughtful and patient',
  },
  'algieba': {
    voiceName: 'algieba',
    gender: 'male',
    age: 'middle',
    keywords: ['confident', 'assertive', 'decisive', 'leadership', 'strong'],
    characteristics: {
      pitch: 'low',
      speed: 'medium',
      tone: 'cool',
      energy: 'medium',
      formality: 'formal',
    },
    description: 'Confident male voice, assertive and decisive',
  },
  'alnilam': {
    voiceName: 'alnilam',
    gender: 'male',
    age: 'young',
    keywords: ['dynamic', 'energetic', 'vibrant', 'enthusiastic', 'animated'],
    characteristics: {
      pitch: 'medium',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Dynamic male voice, energetic and vibrant',
  },
  
  // Additional voices (continuing pattern)
  'enceladus': {
    voiceName: 'enceladus',
    gender: 'neutral',
    age: 'middle',
    keywords: ['neutral', 'balanced', 'clear', 'versatile'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Neutral voice, balanced and clear',
  },
  'gacrux': {
    voiceName: 'gacrux',
    gender: 'male',
    age: 'middle',
    keywords: ['steady', 'reliable', 'grounded', 'solid'],
    characteristics: {
      pitch: 'low',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Steady male voice, reliable and grounded',
  },
  'iapetus': {
    voiceName: 'iapetus',
    gender: 'male',
    age: 'old',
    keywords: ['mature', 'experienced', 'authoritative', 'venerable'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'neutral',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Mature male voice, experienced and authoritative',
  },
  'laomedeia': {
    voiceName: 'laomedeia',
    gender: 'female',
    age: 'young',
    keywords: ['sweet', 'gentle', 'innocent', 'tender', 'kind'],
    characteristics: {
      pitch: 'high',
      speed: 'medium',
      tone: 'warm',
      energy: 'low',
      formality: 'casual',
    },
    description: 'Sweet female voice, gentle and innocent',
  },
  'orus': {
    voiceName: 'orus',
    gender: 'male',
    age: 'middle',
    keywords: ['bold', 'confident', 'assertive', 'fearless'],
    characteristics: {
      pitch: 'low',
      speed: 'medium',
      tone: 'cool',
      energy: 'high',
      formality: 'neutral',
    },
    description: 'Bold male voice, confident and assertive',
  },
  'rasalgethi': {
    voiceName: 'rasalgethi',
    gender: 'male',
    age: 'old',
    keywords: ['wise', 'sage', 'philosophical', 'contemplative'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'warm',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Wise male voice, sage and philosophical',
  },
  'sadachbia': {
    voiceName: 'sadachbia',
    gender: 'female',
    age: 'middle',
    keywords: ['elegant', 'sophisticated', 'refined', 'cultured'],
    characteristics: {
      pitch: 'medium',
      speed: 'slow',
      tone: 'cool',
      energy: 'low',
      formality: 'formal',
    },
    description: 'Elegant female voice, sophisticated and refined',
  },
  'sadaltager': {
    voiceName: 'sadaltager',
    gender: 'female',
    age: 'young',
    keywords: ['bright', 'cheerful', 'optimistic', 'radiant'],
    characteristics: {
      pitch: 'high',
      speed: 'fast',
      tone: 'warm',
      energy: 'high',
      formality: 'casual',
    },
    description: 'Bright female voice, cheerful and optimistic',
  },
  'schedar': {
    voiceName: 'schedar',
    gender: 'female',
    age: 'middle',
    keywords: ['warm', 'motherly', 'nurturing', 'caring', 'compassionate'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'warm',
      energy: 'medium',
      formality: 'casual',
    },
    description: 'Warm female voice, motherly and nurturing',
  },
  'sulafat': {
    voiceName: 'sulafat',
    gender: 'female',
    age: 'middle',
    keywords: ['serene', 'calm', 'peaceful', 'tranquil'],
    characteristics: {
      pitch: 'medium',
      speed: 'slow',
      tone: 'neutral',
      energy: 'low',
      formality: 'neutral',
    },
    description: 'Serene female voice, calm and peaceful',
  },
  'umbriel': {
    voiceName: 'umbriel',
    gender: 'male',
    age: 'middle',
    keywords: ['mysterious', 'deep', 'brooding', 'introspective'],
    characteristics: {
      pitch: 'low',
      speed: 'slow',
      tone: 'cool',
      energy: 'low',
      formality: 'neutral',
    },
    description: 'Mysterious male voice, deep and brooding',
  },
  'vindemiatrix': {
    voiceName: 'vindemiatrix',
    gender: 'female',
    age: 'middle',
    keywords: ['confident', 'strong', 'assertive', 'independent'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'cool',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Confident female voice, strong and assertive',
  },
  'zubenelgenubi': {
    voiceName: 'zubenelgenubi',
    gender: 'neutral',
    age: 'middle',
    keywords: ['versatile', 'adaptable', 'neutral', 'balanced'],
    characteristics: {
      pitch: 'medium',
      speed: 'medium',
      tone: 'neutral',
      energy: 'medium',
      formality: 'neutral',
    },
    description: 'Versatile neutral voice, adaptable and balanced',
  },
};

/**
 * Get voice metadata by voice name
 */
export function getGeminiVoiceMetadata(voiceName: string): GeminiVoiceMetadata | null {
  const normalizedName = voiceName.toLowerCase();
  return GEMINI_VOICE_METADATA[normalizedName] || null;
}

/**
 * Get all voices matching a specific gender
 */
export function getVoicesByGender(gender: 'male' | 'female' | 'neutral'): GeminiVoiceMetadata[] {
  return Object.values(GEMINI_VOICE_METADATA).filter(v => v.gender === gender);
}

/**
 * Get all voices matching a specific age
 */
export function getVoicesByAge(age: 'young' | 'middle' | 'old'): GeminiVoiceMetadata[] {
  return Object.values(GEMINI_VOICE_METADATA).filter(v => v.age === age);
}

