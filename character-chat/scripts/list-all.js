const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const personas = await prisma.personaTemplate.findMany({
        select: { name: true, seedId: true, voiceSeedId: true }
    });
    console.log(JSON.stringify(personas, null, 2));
}
main().finally(() => prisma.$disconnect());
