#!/usr/bin/env tsx
/**
 * Dump Characters with Poor Voice Matches
 * Removes characters that couldn't find good voice matches to maintain quality
 */

import { db } from '../lib/db';

// Characters with critical mismatches that couldn't be auto-fixed
const CHARACTERS_TO_DUMP = [
    'Sonia Williams',
    'Li Na',
    'Isabella Ruiz',
    // Add any others from the final audit report
];

async function dumpLowQualityCharacters() {
    console.log('🗑️  Dumping characters with poor voice matches...\n');

    let deletedCount = 0;
    let notFoundCount = 0;

    for (const characterName of CHARACTERS_TO_DUMP) {
        try {
            const character = await db.personaTemplate.findFirst({
                where: { name: characterName },
            });

            if (!character) {
                console.log(`⚠️  Character not found: ${characterName}`);
                notFoundCount++;
                continue;
            }

            // Delete the character
            await db.personaTemplate.delete({
                where: { id: character.id },
            });

            deletedCount++;
            console.log(`🗑️  Deleted: ${characterName} (ID: ${character.id})`);
        } catch (error) {
            console.error(`❌ Error deleting ${characterName}:`, error);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  🗑️  Deleted: ${deletedCount}`);
    console.log(`  ⚠️  Not found: ${notFoundCount}`);
    console.log(`  📝 Total in list: ${CHARACTERS_TO_DUMP.length}`);
    console.log(`\n✅ Quality over quantity - keeping only well-matched characters!`);
}

async function main() {
    await dumpLowQualityCharacters();
}

main().catch(console.error);
