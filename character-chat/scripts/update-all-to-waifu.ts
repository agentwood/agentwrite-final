import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAndUpdateCharacters() {
    console.log('📋 Fetching all characters from database...\n');

    // Get all characters
    const allCharacters = await prisma.personaTemplate.findMany({
        select: {
            seedId: true,
            name: true,
            category: true,
            avatarUrl: true
        }
    });

    console.log(`Found ${allCharacters.length} characters total\n`);

    // Group by category
    const byCategory: Record<string, typeof allCharacters> = {};
    allCharacters.forEach(char => {
        const cat = char.category || 'Unknown';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(char);
    });

    // Display categories
    Object.keys(byCategory).forEach(cat => {
        console.log(`\n${cat.toUpperCase()} (${byCategory[cat].length}):`);
        byCategory[cat].forEach(char => {
            console.log(`  - ${char.name} (${char.seedId})`);
        });
    });

    // Update non-Helper characters to waifu
    console.log('\n\n🎨 Converting non-Helper characters to waifu/anime...\n');

    let updated = 0;
    const waifuImages = [
        'https://i.waifu.pics/RNsYa~7.jpg',
        'https://i.waifu.pics/ksm2hKl.jpg',
        'https://i.waifu.pics/3Cm~8pL.jpg',
        'https://i.waifu.pics/jwW2pXk.jpg',
        'https://i.waifu.pics/kP7sWm3.jpg',
        'https://i.waifu.pics/h8Kw2Pd.jpg',
        'https://i.waifu.pics/Vm5nR9x.jpg',
        'https://i.waifu.pics/qT4mK8j.jpg',
        'https://i.waifu.pics/nL9sP5w.jpg',
        'https://i.waifu.pics/xR6dN2k.jpg',
        'https://i.waifu.pics/mP3xL5w.jpg',
        'https://i.waifu.pics/vK8dR2n.jpg',
        'https://i.waifu.pics/wN5jQ9m.jpg',
        'https://i.waifu.pics/zX7cT4p.jpg',
        'https://i.waifu.pics/bH9sV6k.jpg',
    ];

    let imageIndex = 0;

    for (const char of allCharacters) {
        // Skip Helper category and Spongebob
        if (char.category === 'Helper' || char.category === 'helper') {
            console.log(`  ⏭️  Skipping ${char.name} (Helper category)`);
            continue;
        }

        if (char.seedId === 'spongebob' || char.name.toLowerCase().includes('spongebob')) {
            console.log(`  ⏭️  Skipping ${char.name} (Special character)`);
            continue;
        }

        try {
            await prisma.personaTemplate.update({
                where: { seedId: char.seedId },
                data: { avatarUrl: waifuImages[imageIndex % waifuImages.length] }
            });
            console.log(`  ✅ ${char.name} → waifu image ${imageIndex % waifuImages.length + 1}`);
            updated++;
            imageIndex++;
        } catch (error) {
            console.error(`  ❌ Error updating ${char.name}`);
        }
    }

    console.log(`\n✨ Updated ${updated} characters to waifu/anime style!`);
}

listAndUpdateCharacters()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
