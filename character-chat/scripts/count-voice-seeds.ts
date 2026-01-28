
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.voiceSeed.count();
    console.log(`Total VoiceSeeds: ${count}`);

    const categories = await prisma.voiceSeed.groupBy({
        by: ['category'],
        _count: true
    });
    console.log("Categories:", categories);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
