import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Add cache-busting parameter to all avatar URLs
 */
async function addCacheBuster() {
    console.log('🔄 Adding cache-busting parameters to avatar URLs...\n');

    const timestamp = Date.now();

    const characters = await prisma.personaTemplate.findMany({
        select: {
            id: true,
            name: true,
            avatarUrl: true,
        },
    });

    let updated = 0;

    for (const character of characters) {
        // Add/update cache parameter
        let newUrl = character.avatarUrl;

        // Remove existing cache parameter if present
        newUrl = newUrl.replace(/[&?]cache=\d+/, '');

        // Add new cache timestamp
        const separator = newUrl.includes('?') ? '&' : '?';
        newUrl = `${newUrl}${separator}cache=${timestamp}`;

        await prisma.personaTemplate.update({
            where: { id: character.id },
            data: { avatarUrl: newUrl },
        });

        console.log(`✅ ${character.name}`);
        updated++;
    }

    console.log(`\n✨ Updated ${updated} characters with cache-buster!`);
    console.log(`🔄 Hard refresh your browser (Cmd+Shift+R) to see changes!`);
}

addCacheBuster()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
