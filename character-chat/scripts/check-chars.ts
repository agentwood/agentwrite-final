import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const characters = await prisma.personaTemplate.findMany({
        select: { id: true, name: true, featured: true },
        where: { featured: true }
    });
    console.log(JSON.stringify(characters, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
