/**
 * Voice Metadata Mapping
 * Comprehensive mapping of all 30 Gemini TTS voices with characteristics
 * Used by the 5-agent audit system for voice-character matching
 */

export interface VoiceMetadata {
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'old';
  accent?: string; // e.g., "American", "British", "European", "Neutral"
  tone: string; // e.g., "warm", "authoritative", "energetic", "calm"
  style: string; // e.g., "professional", "casual", "mysterious", "friendly"
  description: string; // Full description of voice characteristics
}

/**
 * Comprehensive metadata for all 30 Gemini TTS voices
 * Based on voice characteristics and testing
 */
export const VOICE_METADATA: Record<string, VoiceMetadata> = {
  // Male voices - Deep/Authoritative
  'charon': {
    name: 'charon',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'deep, authoritative, mysterious',
    style: 'wise, contemplative, deliberate',
    description: 'Deep, resonant male voice with authoritative presence. Suitable for wise mentors, ancient characters, or mysterious figures. Slow, deliberate pace with gravitas.',
  },
  'fenrir': {
    name: 'fenrir',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'strong, confident, commanding',
    style: 'professional, authoritative, powerful',
    description: 'Strong, confident male voice with commanding presence. Suitable for warriors, leaders, detectives, or professionals. Clear and assertive.',
  },
  'achernar': {
    name: 'achernar',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'calm, deeply resonant, wise',
    style: 'contemplative, ancient, mystical',
    description: 'Calm, deeply resonant male voice with ancient wisdom. Suitable for shamans, sages, or mystical characters. Grounded and contemplative.',
  },
  'achird': {
    name: 'achird',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'clear, professional, articulate',
    style: 'professional, confident, reliable',
    description: 'Clear, professional male voice. Suitable for business professionals, teachers, or reliable characters. Articulate and confident.',
  },
  'algenib': {
    name: 'algenib',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'warm, friendly, approachable',
    style: 'casual, friendly, conversational',
    description: 'Warm, friendly male voice. Suitable for friends, casual characters, or approachable figures. Conversational and inviting.',
  },
  'algieba': {
    name: 'algieba',
    gender: 'male',
    age: 'young',
    accent: 'Neutral',
    tone: 'energetic, bright, enthusiastic',
    style: 'casual, youthful, animated',
    description: 'Energetic, bright male voice. Suitable for young characters, students, or enthusiastic personalities. Animated and lively.',
  },
  'alnilam': {
    name: 'alnilam',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'steady, reliable, calm',
    style: 'professional, steady, dependable',
    description: 'Steady, reliable male voice. Suitable for dependable characters, mentors, or calm professionals. Consistent and trustworthy.',
  },
  'enceladus': {
    name: 'enceladus',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'deep, thoughtful, measured',
    style: 'wise, patient, contemplative',
    description: 'Deep, thoughtful male voice. Suitable for wise elders, philosophers, or patient mentors. Measured and contemplative.',
  },
  'gacrux': {
    name: 'gacrux',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'strong, clear, confident',
    style: 'authoritative, clear, decisive',
    description: 'Strong, clear male voice. Suitable for leaders, commanders, or decisive characters. Confident and authoritative.',
  },
  'iapetus': {
    name: 'iapetus',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'deep, resonant, ancient',
    style: 'mysterious, ancient, powerful',
    description: 'Deep, resonant male voice with ancient quality. Suitable for ancient beings, powerful entities, or mysterious figures. Powerful and timeless.',
  },
  'orus': {
    name: 'orus',
    gender: 'male',
    age: 'middle',
    accent: 'European',
    tone: 'stern, authoritative, no-nonsense',
    style: 'professional, confrontational, rugged',
    description: 'Stern, authoritative male voice with European accent. Suitable for chefs, professionals, or no-nonsense characters. Rugged and confrontational.',
  },
  'puck': {
    name: 'puck',
    gender: 'male',
    age: 'young',
    accent: 'Neutral',
    tone: 'energetic, expressive, animated',
    style: 'comedic, playful, quick-witted',
    description: 'Energetic, expressive male voice. Suitable for comedic characters, tricksters, or playful personalities. Animated and quick-witted.',
  },
  'rasalgethi': {
    name: 'rasalgethi',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'warm, rich, engaging',
    style: 'friendly, charismatic, warm',
    description: 'Warm, rich male voice. Suitable for charismatic characters, storytellers, or engaging personalities. Warm and inviting.',
  },
  'sadachbia': {
    name: 'sadachbia',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'clear, professional, articulate',
    style: 'professional, clear, reliable',
    description: 'Clear, professional male voice. Suitable for professionals, teachers, or reliable characters. Articulate and dependable.',
  },
  'sadaltager': {
    name: 'sadaltager',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'deep, wise, patient',
    style: 'wise, patient, contemplative',
    description: 'Deep, wise male voice. Suitable for wise mentors, elders, or patient guides. Patient and contemplative.',
  },
  'schedar': {
    name: 'schedar',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'steady, reliable, calm',
    style: 'professional, steady, dependable',
    description: 'Steady, reliable male voice. Suitable for dependable characters, professionals, or calm figures. Consistent and trustworthy.',
  },
  'umbriel': {
    name: 'umbriel',
    gender: 'male',
    age: 'old',
    accent: 'Neutral',
    tone: 'deep, mysterious, dark',
    style: 'mysterious, dark, refined',
    description: 'Deep, mysterious male voice. Suitable for dark characters, vampires, or mysterious figures. Refined and dark.',
  },
  'vindemiatrix': {
    name: 'vindemiatrix',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'clear, professional, confident',
    style: 'professional, confident, articulate',
    description: 'Clear, professional male voice. Suitable for professionals, leaders, or confident characters. Articulate and confident.',
  },
  'zephyr': {
    name: 'zephyr',
    gender: 'neutral',
    age: 'young',
    accent: 'Neutral',
    tone: 'bright, light, airy',
    style: 'versatile, adaptable, clear',
    description: 'Bright, light neutral voice. Suitable for versatile characters, adaptable personalities, or neutral figures. Clear and adaptable.',
  },
  'zubenelgenubi': {
    name: 'zubenelgenubi',
    gender: 'male',
    age: 'middle',
    accent: 'Neutral',
    tone: 'warm, rich, engaging',
    style: 'friendly, charismatic, warm',
    description: 'Warm, rich male voice. Suitable for friendly characters, storytellers, or engaging personalities. Warm and inviting.',
  },

  // Female voices
  'aoede': {
    name: 'aoede',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'clear, professional, confident',
    style: 'professional, articulate, sassy',
    description: 'Clear, professional female voice. Suitable for professionals, sassy characters, or confident women. Articulate and expressive.',
  },
  'autonoe': {
    name: 'autonoe',
    gender: 'female',
    age: 'young',
    accent: 'Neutral',
    tone: 'bright, energetic, lively',
    style: 'youthful, energetic, animated',
    description: 'Bright, energetic female voice. Suitable for young characters, students, or lively personalities. Animated and enthusiastic.',
  },
  'callirrhoe': {
    name: 'callirrhoe',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'warm, friendly, approachable',
    style: 'friendly, conversational, inviting',
    description: 'Warm, friendly female voice. Suitable for friends, supportive characters, or approachable figures. Conversational and warm.',
  },
  'despina': {
    name: 'despina',
    gender: 'female',
    age: 'young',
    accent: 'Neutral',
    tone: 'sweet, gentle, soft',
    style: 'gentle, kind, soothing',
    description: 'Sweet, gentle female voice. Suitable for kind characters, gentle personalities, or soothing figures. Soft and caring.',
  },
  'erinome': {
    name: 'erinome',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'clear, articulate, professional',
    style: 'professional, clear, confident',
    description: 'Clear, articulate female voice. Suitable for professionals, teachers, or confident women. Professional and clear.',
  },
  'kore': {
    name: 'kore',
    gender: 'female',
    age: 'middle',
    tone: 'firm, warm, friendly',
    style: 'friendly, warm, conversational',
    accent: 'Neutral',
    description: 'Firm, warm female voice. Suitable for friendly characters, best friends, or warm personalities. Conversational and inviting.',
  },
  'laomedeia': {
    name: 'laomedeia',
    gender: 'female',
    age: 'young',
    accent: 'Neutral',
    tone: 'bright, cheerful, energetic',
    style: 'youthful, cheerful, animated',
    description: 'Bright, cheerful female voice. Suitable for young characters, cheerful personalities, or energetic figures. Animated and lively.',
  },
  'leda': {
    name: 'leda',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'sophisticated, elegant, refined',
    style: 'elegant, refined, sophisticated',
    description: 'Sophisticated, elegant female voice. Suitable for refined characters, elegant personalities, or sophisticated figures. Refined and polished.',
  },
  'pulcherrima': {
    name: 'pulcherrima',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'sophisticated, elegant, refined',
    style: 'elegant, refined, beautiful',
    description: 'Sophisticated, elegant female voice. Suitable for refined characters, elegant personalities, or beautiful figures. Elegant and polished.',
  },
  'sulafat': {
    name: 'sulafat',
    gender: 'female',
    age: 'middle',
    accent: 'Neutral',
    tone: 'warm, gentle, soothing',
    style: 'gentle, kind, caring',
    description: 'Warm, gentle female voice. Suitable for caring characters, gentle personalities, or soothing figures. Kind and nurturing.',
  },
};

/**
 * Get all voice names
 */
export function getAllVoiceNames(): string[] {
  return Object.keys(VOICE_METADATA);
}

/**
 * Get voice metadata by name
 */
export function getVoiceMetadata(voiceName: string): VoiceMetadata | undefined {
  return VOICE_METADATA[voiceName.toLowerCase()];
}

/**
 * Get voices by gender
 */
export function getVoicesByGender(gender: 'male' | 'female' | 'neutral'): VoiceMetadata[] {
  return Object.values(VOICE_METADATA).filter(v => v.gender === gender);
}

/**
 * Get voices by age
 */
export function getVoicesByAge(age: 'young' | 'middle' | 'old'): VoiceMetadata[] {
  return Object.values(VOICE_METADATA).filter(v => v.age === age);
}



