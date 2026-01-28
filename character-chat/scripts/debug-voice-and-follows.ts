import { db } from '@/lib/db';

async function main() {
    console.log('--- Checking Voice Seeds ---');
    const seeds = await db.voiceSeed.findMany();
    if (seeds.length === 0) {
        console.log('NO VOICE SEEDS FOUND!');
    } else {
        seeds.forEach(s => {
            console.log(`Voice: ${s.name}, Path: ${s.filePath ? s.filePath : 'MISSING'}`);
        });
    }

    console.log('\n--- Checking Personas (Top 5) ---');
    const personas = await db.personaTemplate.findMany({
        take: 5,
        orderBy: { viewCount: 'desc' },
        select: {
            name: true,
            followerCount: true,
            voiceName: true
        }
    });

    personas.forEach(p => {
        console.log(`Persona: ${p.name}, Followers: ${p.followerCount}, Voice: ${p.voiceName}`);
    });

    console.log('\n--- Checking Specific "Content Architect" ---');
    const specific = await db.personaTemplate.findFirst({
        where: { name: 'Content Architect' },
        include: { voiceSeed: true }
    });

    if (specific) {
        console.log('Found Content Architect:');
        console.log('Follower Count:', specific.followerCount);
        console.log('Voice Name:', specific.voiceName);
        console.log('Linked VoiceSeed:', specific.voiceSeed?.name);
        console.log('Linked VoiceSeed Path:', specific.voiceSeed?.filePath);
    } else {
        console.log('Content Architect not found');
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
