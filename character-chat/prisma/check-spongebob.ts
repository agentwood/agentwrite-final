import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sb = await prisma.personaTemplate.findUnique({
        where: { seedId: 'spongebob' },
        include: { voiceSeed: true }
    });
    console.log(JSON.stringify(sb, null, 2));
}

main()
    .finally(async () => { await prisma.$disconnect(); });
