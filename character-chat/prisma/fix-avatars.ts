
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing broken avatars (iterative mode)...');

    // Fetch ALL characters
    const characters = await prisma.personaTemplate.findMany();
    console.log(`Scanning ${characters.length} characters...`);

    let updatedCount = 0;

    for (const char of characters) {
        let needsUpdate = false;
        const url = char.avatarUrl;

        if (!url) needsUpdate = true;
        else if (url.includes('unsplash.com')) needsUpdate = true;
        else if (url.includes('ui-avatars.com')) needsUpdate = true;
        else if (url.trim() === '') needsUpdate = true;

        if (needsUpdate) {
            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: { avatarUrl: '/avatars/mystery-character.png' }
            });
            updatedCount++;
            process.stdout.write('.');
        }
    }

    console.log(`\nDone. Updated ${updatedCount} characters.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
