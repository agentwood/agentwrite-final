
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Generating Character Voice Chart...");

    // Fetch all characters with their voice seed
    const characters = await prisma.personaTemplate.findMany({
        orderBy: { name: 'asc' },
        include: {
            voiceSeed: true
        }
    });

    console.log(`| Character Name | Voice Name | Voice ID | Category |`);
    console.log(`|---|---|---|---|`);

    for (const char of characters) {
        // Fallback if voiceSeed is null (should be 0 based on audit)
        const voiceName = char.voiceSeed?.name || char.voiceName || '❌ Missing';
        const voiceId = char.voiceSeed?.id || 'N/A';
        const category = char.category || 'Unknown';

        console.log(`| **${char.name}** | ${voiceName} | \`${voiceId}\` | ${category} |`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
