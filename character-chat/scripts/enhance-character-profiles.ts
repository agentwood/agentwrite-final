/**
 * Character Profile Enhancement Script
 * Maps characters to source characters, scrapes profiles, and runs voice matching
 */

import { PrismaClient } from '@prisma/client';
import { mapCharacter } from '../lib/characterMapping/characterMapper';
import { matchVoiceToCharacter } from '../lib/voiceMatching/voiceMatcher';

const prisma = new PrismaClient();

interface EnhancementResult {
  characterId: string;
  characterName: string;
  mappingSuccess: boolean;
  voiceMatchSuccess: boolean;
  voiceMatchScore?: number;
  recommendedVoice?: string;
  currentVoice?: string;
  errors?: string[];
}

/**
 * Enhance a single character profile
 */
async function enhanceCharacter(characterId: string): Promise<EnhancementResult> {
  const errors: string[] = [];
  let mappingSuccess = false;
  let voiceMatchSuccess = false;
  let voiceMatchScore: number | undefined;
  let recommendedVoice: string | undefined;

  try {
    // Get character
    const character = await prisma.personaTemplate.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        archetype: true,
        sourceCharacterName: true,
        voiceName: true,
      },
    });

    if (!character) {
      return {
        characterId,
        characterName: 'Unknown',
        mappingSuccess: false,
        voiceMatchSuccess: false,
        errors: ['Character not found'],
      };
    }

    // Step 1: Map to source character (if not already mapped)
    if (!character.sourceCharacterName) {
      console.log(`Mapping character: ${character.name}...`);
      const mappingResult = await mapCharacter(characterId);

      if (mappingResult.success) {
        mappingSuccess = true;
        console.log(`  ✓ Mapped to: ${mappingResult.sourceCharacterName}`);
      } else {
        errors.push(`Mapping failed: ${mappingResult.error || 'Unknown error'}`);
        console.log(`  ✗ Mapping failed: ${mappingResult.error}`);
      }
    } else {
      mappingSuccess = true;
      console.log(`  ✓ Already mapped to: ${character.sourceCharacterName}`);
    }

    // Step 2: Run voice matching (80% threshold)
    console.log(`Matching voice for: ${character.name}...`);
    const voiceMatchResult = await matchVoiceToCharacter(characterId, 0.8);

    if (voiceMatchResult.success && voiceMatchResult.voiceName) {
      voiceMatchSuccess = true;
      voiceMatchScore = voiceMatchResult.matchScore;
      recommendedVoice = voiceMatchResult.voiceName;

      console.log(`  ✓ Best match: ${recommendedVoice} (${(voiceMatchScore! * 100).toFixed(1)}%)`);

      // Update voice if it's different and match is good enough
      if (character.voiceName !== recommendedVoice && voiceMatchScore !== undefined && voiceMatchScore >= 0.8) {
        await prisma.personaTemplate.update({
          where: { id: characterId },
          data: { voiceName: recommendedVoice },
        });
        console.log(`  ✓ Updated voice from ${character.voiceName} to ${recommendedVoice}`);
      } else if (character.voiceName === recommendedVoice) {
        console.log(`  ✓ Voice already matches recommendation`);
      } else {
        console.log(`  ⚠ Match score (${(voiceMatchScore! * 100).toFixed(1)}%) is below threshold, keeping current voice`);
      }
    } else {
      errors.push(`Voice matching failed: ${voiceMatchResult.reason || 'No suitable voice found'}`);
      console.log(`  ✗ Voice matching failed: ${voiceMatchResult.reason}`);
    }

    return {
      characterId,
      characterName: character.name,
      mappingSuccess,
      voiceMatchSuccess,
      voiceMatchScore,
      recommendedVoice,
      currentVoice: character.voiceName,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    return {
      characterId,
      characterName: 'Unknown',
      mappingSuccess: false,
      voiceMatchSuccess: false,
      errors: [error.message || 'Unknown error'],
    };
  }
}

/**
 * Enhance all characters
 */
async function enhanceAllCharacters() {
  console.log('Starting character profile enhancement...\n');

  try {
    // Get all characters
    const characters = await prisma.personaTemplate.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    console.log(`Found ${characters.length} characters to enhance\n`);

    const results: EnhancementResult[] = [];
    let successCount = 0;
    let needsReviewCount = 0;

    // Process each character
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      console.log(`[${i + 1}/${characters.length}] Processing: ${character.name}`);

      const result = await enhanceCharacter(character.id);
      results.push(result);

      if (result.voiceMatchSuccess && result.voiceMatchScore && result.voiceMatchScore >= 0.8) {
        successCount++;
      } else {
        needsReviewCount++;
      }

      console.log(''); // Blank line between characters

      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print summary
    console.log('\n=== Enhancement Summary ===');
    console.log(`Total characters: ${characters.length}`);
    console.log(`Successfully matched (≥80%): ${successCount}`);
    console.log(`Needs review (<80% or failed): ${needsReviewCount}`);
    console.log('');

    // Print characters that need review
    const needsReview = results.filter(r =>
      !r.voiceMatchSuccess || !r.voiceMatchScore || r.voiceMatchScore < 0.8
    );

    if (needsReview.length > 0) {
      console.log('Characters needing review:');
      for (const result of needsReview) {
        console.log(`  - ${result.characterName}`);
        if (result.errors) {
          result.errors.forEach(err => console.log(`    Error: ${err}`));
        }
        if (result.voiceMatchScore !== undefined) {
          console.log(`    Match score: ${(result.voiceMatchScore * 100).toFixed(1)}%`);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error enhancing characters:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  enhanceAllCharacters()
    .then(() => {
      console.log('\n✓ Enhancement complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Enhancement failed:', error);
      process.exit(1);
    });
}

export { enhanceCharacter, enhanceAllCharacters };


