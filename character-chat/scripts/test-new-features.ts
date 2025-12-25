/**
 * Test Script for New Features
 * Tests: Context-aware filtering, Voice matching, Character mapping
 */

import { PrismaClient } from '@prisma/client';
import { filterContent } from '../lib/contentFilter';
import { matchVoiceToCharacter } from '../lib/voiceMatching/voiceMatcher';
import { mapCharacter } from '../lib/characterMapping/characterMapper';

const prisma = new PrismaClient();

async function testContextAwareFiltering() {
  console.log('\n=== Testing Context-Aware Content Filtering ===\n');
  
  // Test 1: Fight announcer character - should allow "fight"
  const fightAnnouncer = {
    category: 'sports',
    archetype: 'announcer',
    name: 'Fight Announcer',
  };
  
  const testMessage1 = "When is the next big fight?";
  const result1 = filterContent(testMessage1, true, fightAnnouncer);
  console.log(`Test 1 - Fight Announcer: "${testMessage1}"`);
  console.log(`  Result: ${result1.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  if (!result1.allowed) {
    console.log(`  Reason: ${result1.reason}`);
  }
  
  // Test 2: Regular character - should block "fight"
  const regularChar = {
    category: 'professional',
    archetype: 'teacher',
    name: 'Teacher',
  };
  
  const result2 = filterContent(testMessage1, true, regularChar);
  console.log(`\nTest 2 - Regular Character: "${testMessage1}"`);
  console.log(`  Result: ${result2.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  if (!result2.allowed) {
    console.log(`  Reason: ${result2.reason}`);
  }
  
  // Test 3: Fantasy character - should allow "fight" in context
  const fantasyChar = {
    category: 'fantasy',
    archetype: 'warrior',
    name: 'Fantasy Warrior',
  };
  
  const result3 = filterContent(testMessage1, true, fantasyChar);
  console.log(`\nTest 3 - Fantasy Character: "${testMessage1}"`);
  console.log(`  Result: ${result3.allowed ? '✅ ALLOWED' : '❌ BLOCKED'}`);
  if (!result3.allowed) {
    console.log(`  Reason: ${result3.reason}`);
  }
}

async function testVoiceMatching() {
  console.log('\n=== Testing Voice-Character Matching ===\n');
  
  try {
    // Get a few characters to test
    const characters = await prisma.personaTemplate.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        archetype: true,
        voiceName: true,
      },
    });
    
    if (characters.length === 0) {
      console.log('⚠ No characters found in database');
      return;
    }
    
    for (const char of characters) {
      console.log(`\nTesting: ${char.name} (${char.category})`);
      console.log(`  Current voice: ${char.voiceName}`);
      
      const matchResult = await matchVoiceToCharacter(char.id, 0.8);
      
      if (matchResult.success && matchResult.voiceName) {
        console.log(`  ✅ Best match: ${matchResult.voiceName}`);
        console.log(`  Match score: ${(matchResult.matchScore! * 100).toFixed(1)}%`);
        
        if (matchResult.voiceName === char.voiceName) {
          console.log(`  ✅ Voice already matches recommendation`);
        } else {
          console.log(`  ⚠ Recommended voice differs from current`);
        }
      } else {
        console.log(`  ❌ No suitable match found (${matchResult.reason})`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error: any) {
    console.error('Error testing voice matching:', error.message);
  }
}

async function testCharacterMapping() {
  console.log('\n=== Testing Character Mapping ===\n');
  
  try {
    // Get a few unmapped characters (or use existing ones)
    const characters = await prisma.personaTemplate.findMany({
      take: 3,
      where: {
        sourceCharacterName: null,
      },
      select: {
        id: true,
        name: true,
        category: true,
        archetype: true,
        description: true,
      },
    });
    
    if (characters.length === 0) {
      console.log('⚠ No unmapped characters found');
      console.log('  (This is okay if all characters are already mapped)');
      return;
    }
    
    for (const char of characters) {
      console.log(`\nTesting: ${char.name} (${char.category})`);
      
      const mappingResult = await mapCharacter(char.id);
      
      if (mappingResult.success) {
        console.log(`  ✅ Mapped to: ${mappingResult.sourceCharacterName}`);
        console.log(`  Type: ${mappingResult.sourceType}`);
        console.log(`  Confidence: ${mappingResult.mappingConfidence ? (mappingResult.mappingConfidence * 100).toFixed(1) + '%' : 'N/A'}`);
      } else {
        console.log(`  ❌ Mapping failed: ${mappingResult.error}`);
      }
      
      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error: any) {
    console.error('Error testing character mapping:', error.message);
  }
}

async function main() {
  console.log('🧪 Testing New Features\n');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Context-aware filtering
    await testContextAwareFiltering();
    
    // Test 2: Voice matching
    await testVoiceMatching();
    
    // Test 3: Character mapping (optional - may take time)
    // Uncomment to test:
    // await testCharacterMapping();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Testing complete!');
  } catch (error) {
    console.error('\n❌ Testing failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { testContextAwareFiltering, testVoiceMatching, testCharacterMapping };


