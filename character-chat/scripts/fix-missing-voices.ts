
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔧 Assigning Voices to Unvoiced Agents...");

    // 1. Brand Storyteller -> Movetrailer
    const movetrailer = await prisma.voiceSeed.findFirst({ where: { filePath: { contains: 'Movetrailer' } } });
    if (movetrailer) {
        await prisma.personaTemplate.updateMany({
            where: { name: 'Brand Storyteller' },
            data: { voiceSeedId: movetrailer.id, voiceName: 'Movetrailer' }
        });
        console.log("✅ Brand Storyteller assigned 'Movetrailer'");
    }

    // 2. Content Architect -> Professor
    const professor = await prisma.voiceSeed.findFirst({ where: { filePath: { contains: 'Professor' } } });
    if (professor) {
        await prisma.personaTemplate.updateMany({
            where: { name: 'Content Architect' },
            data: { voiceSeedId: professor.id, voiceName: 'Professor' }
        });
        console.log("✅ Content Architect assigned 'Professor'");
    }

    // 3. Growth Hacker -> Youtuber
    const youtuber = await prisma.voiceSeed.findFirst({ where: { filePath: { contains: 'Youtuber' } } });
    if (youtuber) {
        await prisma.personaTemplate.updateMany({
            where: { name: 'Growth Hacker' },
            data: { voiceSeedId: youtuber.id, voiceName: 'Youtuber' }
        });
        console.log("✅ Growth Hacker assigned 'Youtuber'");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
