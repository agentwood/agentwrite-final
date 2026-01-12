const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const characters = await prisma.personaTemplate.findMany({
        where: {
            OR: [
                { name: { contains: 'Rin' } },
                { name: { contains: 'Akina' } },
                { name: { contains: 'Tomoe' } },
                { name: { contains: 'Kwon' } }
            ]
        },
        select: { name: true, voiceName: true, gender: true }
    });
    console.log(JSON.stringify(characters, null, 2));
    await prisma.$disconnect();
}

main().catch(console.error);
