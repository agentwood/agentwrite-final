import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const seed = await prisma.voiceSeed.findFirst({
        where: { name: 'Male ASMR' }
    });
    if (seed) {
        await prisma.voiceSeed.update({
            where: { id: seed.id },
            data: { filePath: '/voices/seeds/Male-ASMR.mp3' }
        });
        console.log('✅ Updated VoiceSeed "Male ASMR" path to /voices/seeds/Male-ASMR.mp3');
    } else {
        console.log('❌ VoiceSeed "Male ASMR" not found');
    }
}
main().finally(() => prisma.$disconnect());
