/**
 * Script to update all persona view counts to realistic random range (250-9,000)
 * This gives a starting point for each character's popularity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getRandomViewCount(min: number = 250, max: number = 9000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function updateViewCounts() {
    try {
        console.log('🔄 Updating view counts for all personas...\n');

        // Get all personas
        const personas = await prisma.personaTemplate.findMany({
            select: { id: true, name: true, viewCount: true }
        });

        console.log(`Found ${personas.length} personas\n`);

        let updated = 0;
        for (const persona of personas) {
            const newViewCount = getRandomViewCount();

            await prisma.personaTemplate.update({
                where: { id: persona.id },
                data: { viewCount: newViewCount }
            });

            console.log(`✓ ${persona.name}: ${persona.viewCount} → ${newViewCount} views`);
            updated++;
        }

        console.log(`\n✅ Successfully updated ${updated} personas!`);
    } catch (error) {
        console.error('❌ Error updating view counts:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
updateViewCounts()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
