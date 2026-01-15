import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Searching for 'Dame'...");
    
    const personas = await prisma.personaTemplate.findMany({
        where: {
            OR: [
                { name: { contains: 'Dame', mode: 'insensitive' } },
                { description: { contains: 'Dame', mode: 'insensitive' } }
            ]
        },
        select: { name: true, seedId: true, voiceSeedId: true, description: true }
    });

    console.log(JSON.stringify(personas, null, 2));
}

main()
    .finally(async () => { await prisma.$disconnect(); });
