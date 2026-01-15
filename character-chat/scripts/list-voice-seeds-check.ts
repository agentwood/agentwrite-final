import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const seeds = await prisma.voiceSeed.findMany({
        select: { name: true, referenceText: true },
    });
    console.log('Voice Seeds and Transcript Stats:');
    let missing = 0;
    seeds.forEach(s => {
        const hasText = !!s.referenceText && s.referenceText.length > 5;
        // console.log(`- ${s.name}: ${hasText ? '✅' : '❌'}`);
        if (!hasText) missing++;
    });
    console.log(`Total Seeds: ${seeds.length}`);
    console.log(`With Transcript: ${seeds.length - missing}`);
    console.log(`Missing Transcript: ${missing}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
