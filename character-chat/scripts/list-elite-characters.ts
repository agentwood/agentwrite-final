import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const characters = await prisma.personaTemplate.findMany({
        where: { seedId: { not: null } },
        select: { name: true, seedId: true },
    });
    console.log('Elite characters with seedId:');
    characters.forEach(c => {
        console.log(`- ${c.name}: ${c.seedId}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
