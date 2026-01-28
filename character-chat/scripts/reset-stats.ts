import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Resetting character statistics to 0...');

    // 1. Reset PersonaTemplate stats
    await prisma.personaTemplate.updateMany({
        data: {
            viewCount: 0,
            chatCount: 0,
            interactionCount: 0,
            saveCount: 0,
            commentCount: 0,
            retentionScore: 0,
        },
    });

    console.log('✅ Stats reset complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
