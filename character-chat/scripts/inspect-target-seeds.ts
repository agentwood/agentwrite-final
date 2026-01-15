import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targets = ['Snob', 'Meditative', 'VeterenSoldier', 'Grandma', 'FemmeFatale']; // Include some working ones for comparison
    const seeds = await prisma.voiceSeed.findMany({
        where: { name: { in: targets } },
        select: { name: true, filePath: true, referenceText: true }
    });

    seeds.forEach(s => {
        console.log(`\nName: ${s.name}`);
        console.log(`Path: ${s.filePath}`);
        console.log(`Text Length: ${s.referenceText?.length}`);
        console.log(`Text Preview: ${s.referenceText?.substring(0, 50)}...`);
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
