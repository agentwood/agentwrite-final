const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const personas = await prisma.personaTemplate.findMany({
            select: { name: true, seedId: true }
        });
        console.log(JSON.stringify(personas, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}
main();
