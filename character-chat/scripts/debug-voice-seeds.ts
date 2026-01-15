import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const seeds = await prisma.voiceSeed.findMany({
        select: { name: true, referenceText: true },
    });
    console.log('--- Voice Seeds ---');
    seeds.forEach(s => {
        const transcriptStatus = s.referenceText ? (s.referenceText.length > 5 ? '✅' : '⚠️ Short') : '❌ Missing';
        console.log(`"${s.name}" (Transcript: ${transcriptStatus})`);
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
