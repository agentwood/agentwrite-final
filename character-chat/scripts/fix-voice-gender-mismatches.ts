/**
 * Fix Voice-Gender-Age Mismatches
 * Validates and fixes all characters to ensure voice + name + personality + gender/age all match
 */

import { PrismaClient } from '@prisma/client';
import { getVoiceMetadata, getVoicesByGender, getVoicesByAge } from './voice-metadata';
import { GoogleGenAI } from '@google/genai';

const db = new PrismaClient();

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });

interface CharacterIssue {
  id: string;
  name: string;
  currentVoice: string;
  detectedGender: 'male' | 'female' | 'neutral' | 'unknown';
  detectedAge: 'young' | 'middle' | 'old' | 'unknown';
  systemPromptGender?: 'male' | 'female' | 'unknown';
  systemPromptAge?: number;
  issue: string;
  recommendedVoice?: string;
}

/**
 * Extract gender from system prompt
 */
function extractGenderFromPrompt(systemPrompt: string): 'male' | 'female' | 'unknown' {
  const promptLower = systemPrompt.toLowerCase();
  
  // Check for explicit gender indicators
  if (promptLower.includes('man') || promptLower.includes('male') || promptLower.includes('he/him') || promptLower.includes('his')) {
    return 'male';
  }
  if (promptLower.includes('woman') || promptLower.includes('female') || promptLower.includes('she/her') || promptLower.includes('hers')) {
    return 'female';
  }
  
  // Check for age with gender context
  const ageMatch = promptLower.match(/(\d+)[-\s]year[-\s]old\s+(man|woman|male|female)/);
  if (ageMatch) {
    return ageMatch[2].includes('man') || ageMatch[2].includes('male') ? 'male' : 'female';
  }
  
  return 'unknown';
}

/**
 * Extract age from system prompt
 */
function extractAgeFromPrompt(systemPrompt: string): number | null {
  const ageMatch = systemPrompt.match(/(\d+)[-\s]year[-\s]old/);
  if (ageMatch) {
    return parseInt(ageMatch[1]);
  }
  return null;
}

/**
 * Detect gender from name
 */
function detectGenderFromName(name: string): 'male' | 'female' | 'neutral' {
  const nameLower = name.toLowerCase();
  
  // Common female endings
  const femaleEndings = ['a', 'ia', 'ina', 'ella', 'ette', 'elle', 'ana', 'ena'];
  // Common male endings
  const maleEndings = ['o', 'io', 'us', 'er', 'or', 'an', 'en', 'on', 'el', 'al'];
  
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
  
  // Common name patterns
  const femaleNames = ['maria', 'sophia', 'emily', 'sarah', 'anna', 'lisa', 'jennifer', 'elizabeth', 'michelle', 'jessica'];
  const maleNames = ['michael', 'john', 'david', 'james', 'robert', 'william', 'richard', 'joseph', 'thomas', 'charles', 'darius', 'marco', 'robert'];
  
  for (const name of femaleNames) {
    if (nameLower.includes(name)) return 'female';
  }
  
  for (const name of maleNames) {
    if (nameLower.includes(name)) return 'male';
  }
  
  return 'neutral';
}

/**
 * Get age category from age number
 */
function getAgeCategory(age: number | null): 'young' | 'middle' | 'old' {
  if (!age) return 'middle';
  if (age <= 25) return 'young';
  if (age >= 60) return 'old';
  return 'middle';
}

/**
 * Find best matching voice based on gender and age
 */
function findBestVoice(gender: 'male' | 'female' | 'neutral', age: 'young' | 'middle' | 'old', description: string): string {
  const descLower = description.toLowerCase();
  
  // Get voices matching gender
  const genderVoices = getVoicesByGender(gender === 'neutral' ? 'male' : gender);
  
  // Filter by age
  const ageVoices = getVoicesByAge(age);
  
  // Find intersection
  const matchingVoices = genderVoices.filter(v => ageVoices.some(av => av.name === v.name));
  
  if (matchingVoices.length > 0) {
    // Prefer voices that match description traits
    if (descLower.includes('deep') || descLower.includes('low') || descLower.includes('baritone')) {
      const deep = matchingVoices.find(v => v.tone.includes('deep') || v.tone.includes('low'));
      if (deep) return deep.name;
    }
    if (descLower.includes('bright') || descLower.includes('energetic')) {
      const bright = matchingVoices.find(v => v.tone.includes('bright') || v.tone.includes('energetic'));
      if (bright) return bright.name;
    }
    return matchingVoices[0].name;
  }
  
  // Fallback: use gender-appropriate voice
  if (gender === 'female') {
    return age === 'old' ? 'schedar' : age === 'young' ? 'autonoe' : 'aoede';
  } else if (gender === 'male') {
    return age === 'old' ? 'charon' : age === 'young' ? 'puck' : 'fenrir';
  }
  
  return 'kore'; // Neutral fallback
}

/**
 * Validate and fix all characters
 */
async function validateAndFixAll() {
  console.log('🔍 Validating all characters for voice-gender-age mismatches...\n');
  
  const allCharacters = await db.personaTemplate.findMany({
    select: {
      id: true,
      name: true,
      voiceName: true,
      description: true,
      systemPrompt: true,
      category: true,
      archetype: true,
    },
  });
  
  const issues: CharacterIssue[] = [];
  
  for (const char of allCharacters) {
    if (!char.voiceName) continue;
    
    // Extract gender and age from multiple sources
    const nameGender = detectGenderFromName(char.name);
    const promptGender = extractGenderFromPrompt(char.systemPrompt || '');
    const promptAge = extractAgeFromPrompt(char.systemPrompt || '');
    const ageCategory = getAgeCategory(promptAge);
    
    // Use prompt gender if available, otherwise use name detection
    const finalGender = promptGender !== 'unknown' ? promptGender : (nameGender === 'neutral' ? 'male' : nameGender);
    
    // Get current voice metadata
    const currentVoiceMeta = getVoiceMetadata(char.voiceName);
    
    if (!currentVoiceMeta) {
      issues.push({
        id: char.id,
        name: char.name,
        currentVoice: char.voiceName,
        detectedGender: finalGender,
        detectedAge: ageCategory,
        systemPromptGender: promptGender,
        systemPromptAge: promptAge || undefined,
        issue: `Invalid voice name: ${char.voiceName}`,
      });
      continue;
    }
    
    // Check gender mismatch
    const genderMismatch = 
      (finalGender === 'male' && currentVoiceMeta.gender === 'female') ||
      (finalGender === 'female' && currentVoiceMeta.gender === 'male');
    
    // Check age mismatch (less strict - allow some flexibility)
    const ageMismatch = 
      (ageCategory === 'old' && currentVoiceMeta.age === 'young') ||
      (ageCategory === 'young' && currentVoiceMeta.age === 'old');
    
    if (genderMismatch || ageMismatch) {
      const recommendedVoice = findBestVoice(finalGender, ageCategory, char.description || '');
      
      issues.push({
        id: char.id,
        name: char.name,
        currentVoice: char.voiceName,
        detectedGender: finalGender,
        detectedAge: ageCategory,
        systemPromptGender: promptGender,
        systemPromptAge: promptAge || undefined,
        issue: genderMismatch 
          ? `Gender mismatch: ${finalGender} character has ${currentVoiceMeta.gender} voice`
          : `Age mismatch: ${ageCategory} character has ${currentVoiceMeta.age} voice`,
        recommendedVoice,
      });
    }
  }
  
  console.log(`Found ${issues.length} characters with mismatches:\n`);
  
  // Show top 20 issues
  issues.slice(0, 20).forEach((issue, idx) => {
    console.log(`${idx + 1}. ${issue.name}`);
    console.log(`   Current: ${issue.currentVoice} (${getVoiceMetadata(issue.currentVoice)?.gender}/${getVoiceMetadata(issue.currentVoice)?.age})`);
    console.log(`   Should be: ${issue.detectedGender}/${issue.detectedAge}`);
    console.log(`   Recommended: ${issue.recommendedVoice}`);
    console.log(`   Issue: ${issue.issue}\n`);
  });
  
  if (issues.length > 20) {
    console.log(`... and ${issues.length - 20} more\n`);
  }
  
  // Ask for confirmation before fixing
  console.log(`\n🔧 Ready to fix ${issues.length} characters.`);
  console.log('This will update voiceName in the database to match gender and age.\n');
  
  // Auto-fix all issues
  let fixed = 0;
  for (const issue of issues) {
    if (issue.recommendedVoice) {
      try {
        await db.personaTemplate.update({
          where: { id: issue.id },
          data: { voiceName: issue.recommendedVoice },
        });
        fixed++;
        console.log(`✓ Fixed: ${issue.name} -> ${issue.recommendedVoice}`);
      } catch (error) {
        console.error(`✗ Failed to fix ${issue.name}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Fixed ${fixed} out of ${issues.length} characters.`);
  
  // Also fix system prompts to ensure correct pronouns
  console.log('\n🔧 Fixing system prompts to ensure correct pronouns...\n');
  
  let promptFixed = 0;
  for (const char of allCharacters) {
    if (!char.systemPrompt) continue;
    
    const promptGender = extractGenderFromPrompt(char.systemPrompt);
    const nameGender = detectGenderFromName(char.name);
    const finalGender = promptGender !== 'unknown' ? promptGender : (nameGender === 'neutral' ? 'male' : nameGender);
    
    // Check if pronouns are correct
    const hasCorrectPronouns = 
      (finalGender === 'male' && (char.systemPrompt.includes('he/him') || char.systemPrompt.includes('he') || char.systemPrompt.includes('his'))) ||
      (finalGender === 'female' && (char.systemPrompt.includes('she/her') || char.systemPrompt.includes('she') || char.systemPrompt.includes('hers')));
    
    if (!hasCorrectPronouns) {
      // Update system prompt with correct pronouns
      const pronounSection = finalGender === 'male' 
        ? 'Use your CORRECT GENDER PRONOUNS (he/him/his) in third person descriptions'
        : 'Use your CORRECT GENDER PRONOUNS (she/her/hers) in third person descriptions';
      
      // Check if pronoun section exists and update it
      if (char.systemPrompt.includes('PRONOUN RULES')) {
        const updatedPrompt = char.systemPrompt.replace(
          /Use your CORRECT GENDER PRONOUNS[^]*?in third person descriptions/g,
          pronounSection
        );
        
        if (updatedPrompt !== char.systemPrompt) {
          try {
            await db.personaTemplate.update({
              where: { id: char.id },
              data: { systemPrompt: updatedPrompt },
            });
            promptFixed++;
            console.log(`✓ Fixed pronouns: ${char.name} (${finalGender})`);
          } catch (error) {
            console.error(`✗ Failed to fix pronouns for ${char.name}:`, error);
          }
        }
      }
    }
  }
  
  console.log(`\n✅ Fixed pronouns for ${promptFixed} characters.`);
}

async function main() {
  try {
    await validateAndFixAll();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();



