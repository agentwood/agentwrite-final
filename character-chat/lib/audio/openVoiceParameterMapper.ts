/**
 * OpenVoice Parameter Mapper
 * Maps existing voice parameters to OpenVoice equivalents
 */

export interface OpenVoiceOptions {
  speed?: number;
  tone?: string;
  emotion?: string;
  accent?: string;
}

export interface VoiceParameters {
  speed?: number;
  pitch?: number;
  styleHint?: string;
  diction?: string;
  emphasis?: string;
}

/**
 * Map existing voice parameters to OpenVoice options
 */
export function mapToOpenVoiceOptions(
  params: VoiceParameters,
  characterName?: string,
  archetype?: string,
  category?: string
): OpenVoiceOptions {
  const options: OpenVoiceOptions = {};

  // Speed mapping (direct)
  if (params.speed !== undefined) {
    // Clamp speed to OpenVoice range (0.5 - 2.0)
    options.speed = Math.max(0.5, Math.min(2.0, params.speed));
  }

  // Tone mapping from styleHint
  if (params.styleHint) {
    options.tone = mapStyleHintToTone(params.styleHint);
  }

  // Emotion mapping from archetype and styleHint
  if (archetype || params.styleHint) {
    options.emotion = mapToEmotion(archetype, params.styleHint, category);
  }

  // Accent mapping from styleHint (if contains accent info)
  if (params.styleHint) {
    const accent = extractAccentFromStyleHint(params.styleHint);
    if (accent) {
      options.accent = accent;
    }
  }

  return options;
}

/**
 * Map styleHint to OpenVoice tone
 */
function mapStyleHintToTone(styleHint: string): string {
  const hint = styleHint.toLowerCase();
  
  // Map common style hints to OpenVoice tones
  const toneMap: Record<string, string> = {
    'professional': 'professional',
    'friendly': 'friendly',
    'warm': 'warm',
    'calm': 'calm',
    'energetic': 'energetic',
    'enthusiastic': 'energetic',
    'authoritative': 'authoritative',
    'confident': 'authoritative',
    'gentle': 'gentle',
    'soothing': 'gentle',
    'serious': 'serious',
    'playful': 'playful',
    'mysterious': 'mysterious',
    'dramatic': 'dramatic',
  };

  // Check for exact matches
  for (const [key, value] of Object.entries(toneMap)) {
    if (hint.includes(key)) {
      return value;
    }
  }

  // Default tone
  return 'neutral';
}

/**
 * Map archetype and styleHint to OpenVoice emotion
 */
function mapToEmotion(
  archetype?: string,
  styleHint?: string,
  category?: string
): string {
  const hint = (styleHint || '').toLowerCase();
  const arch = (archetype || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Emotion mapping
  const emotionMap: Record<string, string> = {
    'happy': 'happy',
    'joyful': 'happy',
    'excited': 'excited',
    'sad': 'sad',
    'melancholic': 'sad',
    'angry': 'angry',
    'frustrated': 'angry',
    'calm': 'calm',
    'peaceful': 'calm',
    'neutral': 'neutral',
    'confident': 'confident',
    'determined': 'confident',
  };

  // Check styleHint first
  for (const [key, value] of Object.entries(emotionMap)) {
    if (hint.includes(key)) {
      return value;
    }
  }

  // Check archetype
  if (arch.includes('hero') || arch.includes('mentor')) {
    return 'confident';
  }
  if (arch.includes('trickster') || arch.includes('jester')) {
    return 'playful';
  }
  if (arch.includes('villain') || arch.includes('antagonist')) {
    return 'serious';
  }

  // Default
  return 'neutral';
}

/**
 * Extract accent from styleHint
 */
function extractAccentFromStyleHint(styleHint: string): string | undefined {
  const hint = styleHint.toLowerCase();

  // Common accent indicators
  const accentPatterns: Record<string, string> = {
    'british': 'british',
    'uk': 'british',
    'english': 'british',
    'american': 'american',
    'us': 'american',
    'australian': 'australian',
    'irish': 'irish',
    'scottish': 'scottish',
    'southern': 'southern',
    'spanish': 'spanish',
    'french': 'french',
    'german': 'german',
    'italian': 'italian',
    'latin': 'latin',
    'asian': 'asian',
    'indian': 'indian',
  };

  for (const [key, value] of Object.entries(accentPatterns)) {
    if (hint.includes(key)) {
      return value;
    }
  }

  return undefined;
}

/**
 * Map pitch to speed adjustment (OpenVoice doesn't have direct pitch control)
 * Higher pitch = slightly faster speed
 */
export function mapPitchToSpeed(pitch: number, baseSpeed: number = 1.0): number {
  // Pitch range: 0.5 - 2.0
  // Map to speed adjustment: -0.1 to +0.1
  const pitchAdjustment = (pitch - 1.0) * 0.1;
  return Math.max(0.5, Math.min(2.0, baseSpeed + pitchAdjustment));
}




