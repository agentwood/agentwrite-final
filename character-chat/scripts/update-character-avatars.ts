import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of characters to avatar strategy
const avatarUpdates = [
    // REALISTIC CHARACTERS - Keep Unsplash (already shoulder/belly-up portraits)
    { seedId: 'marge-halloway', avatarUrl: 'https://images.unsplash.com/photo-1551843073-4a9a5b6fcd5f?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'raj-corner-store', avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'camille-laurent', avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'coach-boone', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'yuki-tanaka', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'doodle-dave', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'sunny-sato', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'nico-awkward', avatarUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'mina-kwon', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'big-tom', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'dr-nadia', avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'miles-granger', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'priya-nair', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'kenji-tanaka', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'asha-mbeki', avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'soren-nielsen', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'imani-shah', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'hector-alvarez', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'dr-elena-petrov', avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=600&fit=crop&crop=faces' },
    { seedId: 'owen-mckenna', avatarUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=600&fit=crop&crop=faces' },
];

// ANIME/WAIFU characters will be handled separately with waifu.im API
// For now, keeping existing realistic portraits

async function updateAvatars() {
    console.log('🎨 Updating character avatars...');

    for (const update of avatarUpdates) {
        try {
            await prisma.personaTemplate.update({
                where: { seedId: update.seedId },
                data: { avatarUrl: update.avatarUrl }
            });
            console.log(`  ✅ Updated ${update.seedId}`);
        } catch (error) {
            console.error(`  ❌ Error updating ${update.seedId}:`, error);
        }
    }

    console.log(`\\n✨ Updated ${avatarUpdates.length} character avatars!`);
}

updateAvatars()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
