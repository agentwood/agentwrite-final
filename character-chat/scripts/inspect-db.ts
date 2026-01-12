
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.personaTemplate.count();
    console.log(`Total Personas: ${count}`);

    const personas = await prisma.personaTemplate.findMany({
        take: 20,
        select: { id: true, name: true, voiceIdentityId: true, voiceReady: true }
    });
    console.log("First 20 Personas:", JSON.stringify(personas, null, 2));

    const kofi = await prisma.personaTemplate.findFirst({
        where: {
            OR: [
                { name: { contains: 'Kofi' } },
                { id: 'coach-kofi' }
            ]
        }
    });
    console.log("Kofi Search Result:", kofi);
}

main()
    .finally(() => prisma.$disconnect());
