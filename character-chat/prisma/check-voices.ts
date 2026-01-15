import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const seeds = await prisma.voiceSeed.findMany({
        take: 5
    });
    console.log(seeds);
}

main()
    .finally(async () => { await prisma.$disconnect(); });
