import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Auditing VoiceSeed Acoustic Profiles...');

    const seeds = await prisma.voiceSeed.findMany({
        select: {
            name: true,
            pitch: true,
            speed: true,
            energy: true,
            timbre: true,
            energyDescription: true
        }
    });

    console.log(`Found ${seeds.length} Voice Seeds.`);

    let atDefaultCount = 0;

    // Check first 5 for sample
    seeds.slice(0, 5).forEach(s => {
        console.log(`- [${s.name}] Pitch: ${s.pitch}, Speed: ${s.speed}, Energy: ${s.energy}, Desc: ${s.energyDescription || 'N/A'}`);
        if (s.pitch === 0 && s.speed === 1.0 && s.energy === 0.5) {
            atDefaultCount++;
        }
    });

    if (atDefaultCount > 0) {
        console.log(`\n⚠️ WARNING: ${atDefaultCount} (sampled) voices are using DEFAULT parameters.`);
        console.log("This means they will lack unique acoustic traits (Tree-0 violation).");
        console.log("You need to run a seeding script to populate these new fields.");
    } else {
        console.log("\n✅ Acoustic profiles appear populated.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
