import { PrismaClient } from '@prisma/client';
import { HELPFUL_CHARACTERS } from './helpful-characters-data';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to seed 15 new helpful characters...');

    for (const char of HELPFUL_CHARACTERS) {
        const greeting = `Hello! I'm ${char.name}. ${char.description}`;

        // Check if character already exists
        const existing = await prisma.personaTemplate.findUnique({
            where: { seedId: char.seedId }
        });

        if (existing) {
            console.log(`Skipping existing character: ${char.name}`);
            continue;
        }

        await prisma.personaTemplate.create({
            data: {
                seedId: char.seedId,
                name: char.name,
                handle: `@${char.seedId.replace(/-/g, '_')}`,
                tagline: char.tagline,
                description: char.description,
                greeting: greeting,
                category: char.category,
                avatarUrl: `/characters/${char.seedId}.png`,
                voiceName: char.voiceName,
                archetype: char.archetype,
                systemPrompt: char.systemPrompt,
                viewCount: Math.floor(Math.random() * (9000 - 2000 + 1)) + 2000,
                voiceReady: true,
            }
        });

        console.log(`✅ Seeded: ${char.name}`);
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
