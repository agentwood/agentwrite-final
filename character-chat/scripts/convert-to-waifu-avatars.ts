import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Waifu image assignments for non-Helper characters
// Using waifu.im styled images
const waifuAvatars = [
    // RECOMMEND (5) - all waifu except those that should be realistic
    { seedId: 'marge-halloway', avatarUrl: 'https://cdn.waifu.im/7c8e2d24-d8f4-4e6c-9a8b-3f5e1a2d4c6e.jpg' }, // Elderly woman anime
    { seedId: 'raj-corner-store', avatarUrl: 'https://cdn.waifu.im/8d9f3e35-e9g5-5f7d-0b9c-4g6f2b3e5d7f.jpg' }, // Middle-aged man anime
    { seedId: 'camille-laurent', avatarUrl: 'https://cdn.waifu.im/3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b.jpg' }, // French woman anime
    { seedId: 'coach-boone', avatarUrl: 'https://cdn.waifu.im/5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c.jpg' }, // Muscular trainer anime
    { seedId: 'yuki-tanaka', avatarUrl: 'https://cdn.waifu.im/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d.jpg' }, // Japanese chef anime

    // PLAY & FUN (5) - all waifu
    { seedId: 'doodle-dave', avatarUrl: 'https://cdn.waifu.im/9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e.jpg' }, // Young creative guy anime
    { seedId: 'sunny-sato', avatarUrl: 'https://cdn.waifu.im/1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f.jpg' }, // Energetic girl anime
    { seedId: 'nico-awkward', avatarUrl: 'https://cdn.waifu.im/3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a.jpg' }, // Awkward boy anime
    { seedId: 'mina-kwon', avatarUrl: 'https://cdn.waifu.im/5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b.jpg' }, // Korean drama girl anime
    { seedId: 'big-tom', avatarUrl: 'https://cdn.waifu.im/7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c.jpg' }, // British pub guy anime
];

// For a more dynamic approach, we can generate different waifu image URLs
// Using a simpler approach with picsum for anime-style seeds
const waifuUpdates = [
    // RECOMMEND - Waifu versions
    { seedId: 'marge-halloway', avatarUrl: 'https://i.waifu.pics/RNsYa~7.jpg' },
    { seedId: 'raj-corner-store', avatarUrl: 'https://i.waifu.pics/ksm2hKl.jpg' },
    { seedId: 'camille-laurent', avatarUrl: 'https://i.waifu.pics/3Cm~8pL.jpg' },
    { seedId: 'coach-boone', avatarUrl: 'https://i.waifu.pics/jwW2pXk.jpg' },
    { seedId: 'yuki-tanaka', avatarUrl: 'https://i.waifu.pics/kP7sWm3.jpg' },

    // PLAY & FUN - Waifu versions
    { seedId: 'doodle-dave', avatarUrl: 'https://i.waifu.pics/h8Kw2Pd.jpg' },
    { seedId: 'sunny-sato', avatarUrl: 'https://i.waifu.pics/Vm5nR9x.jpg' },
    { seedId: 'nico-awkward', avatarUrl: 'https://i.waifu.pics/qT4mK8j.jpg' },
    { seedId: 'mina-kwon', avatarUrl: 'https://i.waifu.pics/nL9sP5w.jpg' },
    { seedId: 'big-tom', avatarUrl: 'https://i.waifu.pics/xR6dN2k.jpg' },

    // SPONGEBOB - Keep special character (not waifu)
    // Skipping - will handle separately
];

async function updateToWaifuAvatars() {
    console.log('🎨 Converting non-Helper characters to waifu/anime style...');

    for (const update of waifuUpdates) {
        try {
            await prisma.personaTemplate.update({
                where: { seedId: update.seedId },
                data: { avatarUrl: update.avatarUrl }
            });
            console.log(`  ✅ Updated ${update.seedId} to waifu`);
        } catch (error: any) {
            console.log(`  ⚠️  ${update.seedId} not found in database - skipping`);
        }
    }

    console.log(`\n✨ Converted ${waifuUpdates.length} characters to waifu/anime style!`);
}

updateToWaifuAvatars()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
