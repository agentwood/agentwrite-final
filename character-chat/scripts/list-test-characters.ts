import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCharacters() {
    const characters = await prisma.personaTemplate.findMany({
        take: 10,
        select: {
            id: true,
            seedId: true,
            name: true,
            voiceName: true,
            voiceReady: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    console.log('Available characters for testing:\n');
    characters.forEach((char, i) => {
        console.log(`${i + 1}. ${char.name}`);
        console.log(`   ID: ${char.id}`);
        console.log(`   SeedID: ${char.seedId || 'N/A'}`);
        console.log(`   Voice: ${char.voiceName}`);
        console.log(`   Ready: ${char.voiceReady ? '✅' : '❌'}`);
        console.log('');
    });

    return characters;
}

listCharacters()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
