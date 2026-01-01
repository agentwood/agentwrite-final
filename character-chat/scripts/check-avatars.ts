import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAvatars() {
    const characters = await prisma.personaTemplate.findMany({
        select: {
            name: true,
            avatarUrl: true,
        },
        take: 10,
    });

    console.log('=== First 10 Character Avatars ===\n');

    characters.forEach((char) => {
        console.log(`${char.name}:`);
        console.log(`  ${char.avatarUrl}\n`);
    });
}

checkAvatars()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
