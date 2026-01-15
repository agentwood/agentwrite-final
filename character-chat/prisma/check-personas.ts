import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking personas...");
    const personas = await prisma.personaTemplate.findMany({
        take: 5,
        select: { name: true, seedId: true }
    });
    console.log("Personas found:", personas);
}

main()
    .catch(e => console.error(e))
    .finally(async () => { await prisma.$disconnect(); });
