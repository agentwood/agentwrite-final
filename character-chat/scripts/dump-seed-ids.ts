import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Dumping Persona Seed IDs...");
    
    const personas = await prisma.personaTemplate.findMany({
        select: { name: true, seedId: true }
    });

    console.log(JSON.stringify(personas, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => { await prisma.$disconnect(); });
