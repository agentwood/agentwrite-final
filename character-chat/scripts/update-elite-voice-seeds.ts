import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Load all voice seeds
    const voiceSeeds = await prisma.voiceSeed.findMany({
        select: { id: true, name: true },
    });
    const seedMap = new Map<string, string>();
    voiceSeeds.forEach(v => seedMap.set(v.name, v.id));

    // Load elite characters (we assume they have a non-null voiceSeedName in the seed script)
    const eliteCharacters = await prisma.personaTemplate.findMany({
        where: { seedId: null }, // currently missing seedId
        select: { id: true, name: true, voiceSeed: true },
    });

    let updated = 0;
    for (const char of eliteCharacters) {
        // Attempt to infer voice seed name from character name mapping (you may adjust this logic)
        // For simplicity, we match by character name to a known voice seed name list.
        const possibleNames = [
            'The Narrator',
            'Sergeant Stone',
            'Velvet Noir',
            'Dame Victoria Sterling',
            'Lord Pemberton',
            'Mr. Zero',
            'Grandfather Oak',
            'Dr. Grace Chen',
            'Jake Blitz',
            'Danny Swift',
            'Master Kai',
            'Dr. Alan Marcus',
            'Sunny Day',
            // add any other elite names as needed
        ];
        if (!possibleNames.includes(char.name)) continue;
        // Derive expected voice seed name (same as in seed-elite-characters.ts)
        const voiceSeedName = char.name.replace(/[^a-zA-Z]/g, ''); // crude fallback
        const seedId = seedMap.get(voiceSeedName);
        if (seedId) {
            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: { seedId },
            });
            console.log(`Updated ${char.name} with seedId ${seedId}`);
            updated++;
        }
    }
    console.log(`Total characters updated: ${updated}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
