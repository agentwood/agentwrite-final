import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const characters = await prisma.personaTemplate.findMany({
        select: { id: true, name: true, seedId: true },
    });
    console.log('Characters:');
    characters.forEach(c => {
        console.log(`- ${c.name} (ID: ${c.id}, seedId: ${c.seedId})`);
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
