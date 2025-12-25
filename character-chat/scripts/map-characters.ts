/**
 * Character Mapping Script
 * Maps characters to real people or anime characters
 */

import { PrismaClient } from '@prisma/client';
import { mapCharacter } from '../lib/characterMapping/characterMapper';

const prisma = new PrismaClient();

/**
 * Map a single character
 */
async function mapSingleCharacter(characterId: string) {
  console.log(`Mapping character ${characterId}...`);
  
  const result = await mapCharacter(characterId);
  
  if (result.success) {
    console.log(`✓ Successfully mapped to: ${result.sourceCharacterName}`);
    console.log(`  Type: ${result.sourceType}`);
    console.log(`  Confidence: ${result.mappingConfidence ? (result.mappingConfidence * 100).toFixed(1) + '%' : 'N/A'}`);
    if (result.sourceCharacterUrl) {
      console.log(`  URL: ${result.sourceCharacterUrl}`);
    }
  } else {
    console.log(`✗ Mapping failed: ${result.error}`);
  }
  
  return result;
}

/**
 * Map all characters that haven't been mapped yet
 */
async function mapAllCharacters() {
  console.log('Starting character mapping...\n');
  
  try {
    // Get all unmapped characters
    const characters = await prisma.personaTemplate.findMany({
      where: {
        sourceCharacterName: null,
      },
      select: {
        id: true,
        name: true,
        category: true,
        archetype: true,
      },
      orderBy: { name: 'asc' },
    });
    
    console.log(`Found ${characters.length} unmapped characters\n`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      console.log(`[${i + 1}/${characters.length}] ${character.name} (${character.category})`);
      
      const result = await mapSingleCharacter(character.id);
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
      
      console.log(''); // Blank line
      
      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n=== Mapping Summary ===');
    console.log(`Total unmapped: ${characters.length}`);
    console.log(`Successfully mapped: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
  } catch (error) {
    console.error('Error mapping characters:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const characterId = process.argv[2];
  
  if (characterId) {
    // Map single character
    mapSingleCharacter(characterId)
      .then(() => {
        console.log('\n✓ Mapping complete');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n✗ Mapping failed:', error);
        process.exit(1);
      });
  } else {
    // Map all characters
    mapAllCharacters()
      .then(() => {
        console.log('\n✓ Mapping complete');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n✗ Mapping failed:', error);
        process.exit(1);
      });
  }
}

export { mapSingleCharacter, mapAllCharacters };

