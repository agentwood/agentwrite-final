import { PrismaClient } from '@prisma/client';
import { HELPFUL_CHARACTERS } from './helpful-characters-data';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to seed 15 new helpful characters...');

    for (const char of HELPFUL_CHARACTERS) {
        const greeting = char.greeting || `Hello! I'm ${char.name}. ${char.description}`;

        // Create or update character (UPSERT)
        await prisma.personaTemplate.upsert({
            where: { seedId: char.seedId },
            update: {
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
            },
            create: {
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

        console.log(`✅ Upserted: ${char.name}`);
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
