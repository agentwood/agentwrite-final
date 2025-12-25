/**
 * Apply Audit Results
 * Updates database with optimal voice assignments for all 30 characters
 */

import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type { AuditResult } from './score-and-rank';
import { getVoiceMetadata } from './voice-metadata';

const db = new PrismaClient();

/**
 * Update characters in database with optimal voices
 */
export async function applyAuditResults(): Promise<void> {
  // Load audit results
  const resultsPath = join(__dirname, 'audit-results.json');
  const resultsData = await readFile(resultsPath, 'utf-8');
  const results: AuditResult[] = JSON.parse(resultsData);

  console.log(`Updating ${results.length} characters with optimal voices...`);

  for (const result of results) {
    const voiceMetadata = getVoiceMetadata(result.bestVoice);
    if (!voiceMetadata) {
      console.warn(`Voice metadata not found for ${result.bestVoice}, skipping ${result.characterName}`);
      continue;
    }

    // Generate styleHint based on voice metadata and character
    const styleHint = `${voiceMetadata.tone}, ${voiceMetadata.style}, ${voiceMetadata.description.substring(0, 100)}`;

    try {
      await db.personaTemplate.update({
        where: { id: result.characterId },
        data: {
          voiceName: result.bestVoice,
          styleHint: styleHint,
        },
      });

      console.log(`✓ Updated ${result.characterName} -> ${result.bestVoice} (Score: ${result.bestScore.toFixed(2)})`);
    } catch (error) {
      console.error(`Error updating ${result.characterName}:`, error);
    }
  }

  console.log(`\nUpdated ${results.length} characters successfully`);
}

/**
 * Optionally mark other characters as not featured
 */
export async function markOtherCharactersAsUnfeatured(): Promise<void> {
  // Load audit results to get character IDs
  const resultsPath = join(__dirname, 'audit-results.json');
  const resultsData = await readFile(resultsPath, 'utf-8');
  const results: AuditResult[] = JSON.parse(resultsData);

  const featuredCharacterIds = results.map(r => r.characterId);

  try {
    // Mark featured characters
    await db.personaTemplate.updateMany({
      where: {
        id: { in: featuredCharacterIds },
      },
      data: {
        featured: true,
      },
    });

    // Mark others as not featured (get all IDs first, then filter)
    const allCharacters = await db.personaTemplate.findMany({
      select: { id: true },
    });
    const otherCharacterIds = allCharacters
      .map(c => c.id)
      .filter(id => !featuredCharacterIds.includes(id));

    if (otherCharacterIds.length > 0) {
      await db.personaTemplate.updateMany({
        where: {
          id: { in: otherCharacterIds },
        },
        data: {
          featured: false,
        },
      });
    }

    console.log(`Marked ${featuredCharacterIds.length} characters as featured, others as unfeatured`);
  } catch (error) {
    console.error('Error marking characters:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await applyAuditResults();
    await markOtherCharactersAsUnfeatured();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

