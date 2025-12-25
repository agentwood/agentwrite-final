/**
 * Voice Fix Script
 * Automatically fixes voices that don't match character descriptions
 * Uses validation system to determine correct voices
 */

import { PrismaClient } from '@prisma/client';
import { validateVoiceForCharacter, CharacterMetadata } from '../lib/audio/voiceValidator';
import { getAdvancedVoiceConfig } from '../lib/audio/advancedVoiceConfig';

const prisma = new PrismaClient();

interface FixResult {
  fixed: number;
  skipped: number;
  errors: number;
  details: Array<{
    characterId: string;
    characterName: string;
    oldVoice: string;
    newVoice: string;
    reason: string;
  }>;
}

async function fixVoices(
  dryRun: boolean = true,
  minConfidence: number = 0.7,
  maxFixes: number = 100
): Promise<FixResult> {
  console.log(`🔧 Starting voice fix${dryRun ? ' (DRY RUN)' : ''}...\n`);
  
  // Fetch all characters
  const allCharacters = await prisma.personaTemplate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tagline: true,
      category: true,
      archetype: true,
      voiceName: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Found ${allCharacters.length} characters\n`);
  
  const result: FixResult = {
    fixed: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };
  
  for (const char of allCharacters) {
    if (result.fixed >= maxFixes) {
      console.log(`\n⚠️  Reached max fixes limit (${maxFixes})`);
      break;
    }
    
    const character: CharacterMetadata = {
      name: char.name,
      description: char.description,
      tagline: char.tagline,
      category: char.category,
      archetype: char.archetype,
      voiceName: char.voiceName,
    };
    
    // Validate current voice
    const validation = validateVoiceForCharacter(character);
    
    // Only fix if validation fails and we have a recommendation
    if (!validation.isValid && validation.recommendations) {
      const recommendation = validation.recommendations;
      
      // Only fix if confidence is high enough
      if (recommendation.confidence >= minConfidence) {
        const newVoice = recommendation.suggestedVoice;
        
        if (char.voiceName.toLowerCase() !== newVoice.toLowerCase()) {
          console.log(`\n🔧 Fixing: ${char.name}`);
          console.log(`   Current: ${char.voiceName} (Score: ${validation.score}/100)`);
          console.log(`   New: ${newVoice} (Confidence: ${(recommendation.confidence * 100).toFixed(0)}%)`);
          console.log(`   Reason: ${recommendation.reason}`);
          
          if (!dryRun) {
            try {
              await prisma.personaTemplate.update({
                where: { id: char.id },
                data: { voiceName: newVoice },
              });
              
              result.fixed++;
              result.details.push({
                characterId: char.id,
                characterName: char.name,
                oldVoice: char.voiceName,
                newVoice: newVoice,
                reason: recommendation.reason,
              });
              
              console.log(`   ✅ Fixed!`);
            } catch (error: any) {
              console.error(`   ❌ Error: ${error.message}`);
              result.errors++;
            }
          } else {
            result.fixed++;
            result.details.push({
              characterId: char.id,
              characterName: char.name,
              oldVoice: char.voiceName,
              newVoice: newVoice,
              reason: recommendation.reason,
            });
            console.log(`   ⚠️  Would fix (dry run)`);
          }
        } else {
          result.skipped++;
        }
      } else {
        result.skipped++;
        console.log(`\n⏭️  Skipping: ${char.name} (confidence too low: ${(recommendation.confidence * 100).toFixed(0)}%)`);
      }
    } else {
      result.skipped++;
    }
  }
  
  console.log(`\n📊 Fix Results:`);
  console.log(`   ${dryRun ? 'Would fix' : 'Fixed'}: ${result.fixed}`);
  console.log(`   Skipped: ${result.skipped}`);
  console.log(`   Errors: ${result.errors}`);
  
  if (dryRun) {
    console.log(`\n⚠️  This was a DRY RUN. No changes were made.`);
    console.log(`   Run with --apply to actually fix voices.`);
  }
  
  return result;
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const minConfidence = args.includes('--confidence') 
  ? parseFloat(args[args.indexOf('--confidence') + 1]) || 0.7
  : 0.7;
const maxFixes = args.includes('--max')
  ? parseInt(args[args.indexOf('--max') + 1]) || 100
  : 100;

// Run fix
fixVoices(dryRun, minConfidence, maxFixes)
  .then(() => {
    console.log('\n✅ Fix complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });



