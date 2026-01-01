import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate reliable avatar URLs using multiple services
 * - DiceBear for stylized avatars
 * - UI Avatars as fallback
 * - Robohash for fun characters
 */
function generateReliableAvatar(character: any): string {
    const encodedName = encodeURIComponent(character.name);
    const seedName = character.name.replace(/[^a-zA-Z0-9]/g, '');

    const isHelper = character.category === 'Helper' ||
        character.category === 'helper' ||
        character.category === 'Helpful';

    const isFun = character.category === 'Fun' ||
        character.category === 'Play & Fun';

    // Use different avatar styles based on category
    if (isHelper) {
        // Professional avatars for Helper characters - use notionists-neutral for realistic look
        return `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${seedName}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=10`;
    } else if (isFun) {
        // Fun/cartoon avatars for Fun characters - use lorelei for anime-ish look
        return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seedName}&backgroundColor=ffdfbf,ffd5dc,c0aede&radius=10`;
    } else {
        // Anime/waifu style for other characters - use lorelei-neutral
        return `https://api.dicebear.com/7.x/lorelei-neutral/svg?seed=${seedName}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&radius=10`;
    }
}

/**
 * Update all avatars with reliable DiceBear URLs
 */
async function updateAllAvatars() {
    console.log('🎨 Generating reliable avatars with DiceBear...\n');

    const characters = await prisma.personaTemplate.findMany({
        select: {
            id: true,
            seedId: true,
            name: true,
            category: true,
        },
    });

    console.log(`Found ${characters.length} characters\n`);

    let updated = 0;
    let skipped = 0;

    for (const character of characters) {
        // Skip Spongebob - keep special avatar
        if (character.seedId === 'spongebob' || character.name.toLowerCase().includes('spongebob')) {
            // Give Spongebob a special URL
            await prisma.personaTemplate.update({
                where: { id: character.id },
                data: { avatarUrl: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=spongebob&eyes=cute&mouth=cute' },
            });
            console.log(`🎌 SpongeBob: Special emoji avatar`);
            skipped++;
            continue;
        }

        const avatarUrl = generateReliableAvatar(character);

        await prisma.personaTemplate.update({
            where: { id: character.id },
            data: { avatarUrl },
        });

        const isHelper = character.category === 'Helper' || character.category === 'Helpful';
        console.log(`✅ ${character.name} (${character.category}): ${isHelper ? '👤 Professional' : '🎌 Stylized'}`);
        updated++;
    }

    console.log('\n=== Avatar Generation Complete ===');
    console.log(`Total: ${characters.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Special: ${skipped}`);
    console.log('\n🎉 All avatars now use DiceBear - guaranteed to work!');
    console.log('🔄 Refresh your browser to see the avatars.');
}

updateAllAvatars()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
