/**
 * Voice Validation System
 * Ensures voices match character description, age, culture, and location
 */

import { getAdvancedVoiceConfig, detectGenderFromName } from './advancedVoiceConfig';

export interface VoiceValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: {
    suggestedVoice: string;
    reason: string;
    confidence: number; // 0-1
  } | null;
}

export interface CharacterMetadata {
  name: string;
  description?: string | null;
  tagline?: string | null;
  category: string;
  archetype: string;
  voiceName: string;
  age?: string | null;
  culture?: string | null;
  location?: string | null;
}

/**
 * Validate if a voice matches the character
 */
export function validateVoiceForCharacter(
  character: CharacterMetadata
): VoiceValidationResult {
  const issues: string[] = [];
  let score = 100;
  
  // Extract character traits
  const nameLower = character.name.toLowerCase();
  const descLower = (character.description || '').toLowerCase();
  const taglineLower = (character.tagline || '').toLowerCase();
  const archLower = character.archetype.toLowerCase();
  const catLower = character.category.toLowerCase();
  const allText = `${nameLower} ${descLower} ${taglineLower} ${archLower} ${catLower}`;
  
  // Detect gender from name
  const detectedGender = detectGenderFromName(character.name);
  
  // Get expected voice configuration
  const expectedConfig = getAdvancedVoiceConfig(
    character.name,
    character.archetype,
    character.category,
    character.tagline,
    character.description
  );
  
  const currentVoice = character.voiceName.toLowerCase();
  const expectedVoice = expectedConfig.voiceName.toLowerCase();
  
  // Gender mismatch check
  const femaleVoices = ['aoede', 'kore', 'leda', 'autonoe', 'callirrhoe', 'despina', 'erinome', 'pulcherrima', 'sadachbia', 'sadaltager', 'schedar', 'sulafat', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];
  const maleVoices = ['fenrir', 'charon', 'puck', 'achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'charon', 'enceladus', 'gacrux', 'iapetus', 'orus', 'rasalgethi', 'umbriel'];
  const neutralVoices = ['kore', 'puck', 'zephyr'];
  
  // Check gender-voice alignment
  if (detectedGender === 'female' && maleVoices.includes(currentVoice)) {
    issues.push(`Gender mismatch: Female character "${character.name}" has male voice "${currentVoice}"`);
    score -= 30;
  } else if (detectedGender === 'male' && femaleVoices.includes(currentVoice) && !neutralVoices.includes(currentVoice)) {
    issues.push(`Gender mismatch: Male character "${character.name}" has female voice "${currentVoice}"`);
    score -= 30;
  }
  
  // Check if voice matches expected archetype
  if (currentVoice !== expectedVoice) {
    const reason = getVoiceMismatchReason(character, currentVoice, expectedVoice);
    issues.push(`Voice mismatch: Current "${currentVoice}" doesn't match expected "${expectedVoice}" for archetype "${character.archetype}"`);
    score -= 20;
    
    // If score is still high, it might be acceptable
    if (score > 50) {
      // Check if current voice is at least gender-appropriate
      const isGenderAppropriate = 
        (detectedGender === 'female' && (femaleVoices.includes(currentVoice) || neutralVoices.includes(currentVoice))) ||
        (detectedGender === 'male' && (maleVoices.includes(currentVoice) || neutralVoices.includes(currentVoice))) ||
        detectedGender === 'neutral';
      
      if (isGenderAppropriate) {
        score += 10; // Partial credit for gender match
      }
    }
  }
  
  // Age-based validation
  const ageIndicators = ['old', 'elder', 'senior', 'grandfather', 'grandmother', 'granny', 'veteran', 'young', 'teen', 'child', 'kid'];
  const hasAgeIndicator = ageIndicators.some(indicator => allText.includes(indicator));
  
  if (hasAgeIndicator) {
    // Old characters should have deeper, slower voices
    if ((allText.includes('old') || allText.includes('elder') || allText.includes('senior')) && 
        !['charon', 'fenrir', 'kore'].includes(currentVoice)) {
      issues.push(`Age mismatch: Older character should use deeper voice like "charon" or "fenrir", not "${currentVoice}"`);
      score -= 15;
    }
    
    // Young characters should have higher-pitched voices
    if ((allText.includes('young') || allText.includes('teen') || allText.includes('child')) && 
        !['kore', 'puck', 'aoede'].includes(currentVoice)) {
      issues.push(`Age mismatch: Younger character should use lighter voice like "kore" or "puck", not "${currentVoice}"`);
      score -= 15;
    }
  }
  
  // Culture/location validation (basic)
  const culturalVoices: Record<string, string[]> = {
    'asian': ['kore', 'aoede'],
    'european': ['kore', 'puck', 'fenrir'],
    'african': ['fenrir', 'charon'],
    'latin': ['kore', 'aoede', 'puck'],
    'middle eastern': ['kore', 'fenrir'],
  };
  
  // Check for cultural indicators
  const culturalKeywords: Record<string, string[]> = {
    'asian': ['japanese', 'chinese', 'korean', 'asian', 'tokyo', 'beijing', 'seoul'],
    'latin': ['spanish', 'mexican', 'latin', 'brazil', 'argentina', 'colombia'],
    'african': ['african', 'nigerian', 'kenyan', 'south african'],
    'middle eastern': ['arab', 'persian', 'turkish', 'middle east'],
  };
  
  for (const [culture, keywords] of Object.entries(culturalKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      const appropriateVoices = culturalVoices[culture] || [];
      if (!appropriateVoices.includes(currentVoice)) {
        issues.push(`Cultural mismatch: ${culture} character should use voices like ${appropriateVoices.join(', ')}, not "${currentVoice}"`);
        score -= 10;
      }
    }
  }
  
  // Generate recommendation
  let recommendation: VoiceValidationResult['recommendations'] = null;
  if (score < 70 || issues.length > 0) {
    recommendation = {
      suggestedVoice: expectedVoice,
      reason: `Based on character traits: ${character.archetype}, ${detectedGender} gender, ${character.category} category`,
      confidence: score < 50 ? 0.9 : 0.7,
    };
  }
  
  return {
    isValid: score >= 70,
    score: Math.max(0, Math.min(100, score)),
    issues,
    recommendations,
  };
}

/**
 * Get reason for voice mismatch
 */
function getVoiceMismatchReason(
  character: CharacterMetadata,
  currentVoice: string,
  expectedVoice: string
): string {
  const detectedGender = detectGenderFromName(character.name);
  
  if (detectedGender === 'female' && ['fenrir', 'charon', 'puck'].includes(currentVoice)) {
    return 'Female character should use a more feminine voice';
  }
  
  if (detectedGender === 'male' && ['aoede', 'kore'].includes(currentVoice) && !['kore', 'puck'].includes(currentVoice)) {
    return 'Male character should use a more masculine voice';
  }
  
  return `Voice doesn't match archetype "${character.archetype}"`;
}

/**
 * Batch validate all characters
 */
export async function validateAllCharacters(
  characters: CharacterMetadata[]
): Promise<{
  valid: CharacterMetadata[];
  invalid: Array<{ character: CharacterMetadata; validation: VoiceValidationResult }>;
  needsReview: Array<{ character: CharacterMetadata; validation: VoiceValidationResult }>;
}> {
  const valid: CharacterMetadata[] = [];
  const invalid: Array<{ character: CharacterMetadata; validation: VoiceValidationResult }> = [];
  const needsReview: Array<{ character: CharacterMetadata; validation: VoiceValidationResult }> = [];
  
  for (const character of characters) {
    const validation = validateVoiceForCharacter(character);
    
    if (validation.isValid && validation.score >= 80) {
      valid.push(character);
    } else if (validation.score < 50) {
      invalid.push({ character, validation });
    } else {
      needsReview.push({ character, validation });
    }
  }
  
  return { valid, invalid, needsReview };
}



