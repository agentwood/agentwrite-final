import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Full mapping from character name to the voiceSeed name defined in seed-elite-characters.ts
const characterToVoiceSeed: Record<string, string> = {
    // === AUTHORITY ===
    'The Narrator': 'Movetrailer',
    'Sergeant Stone': 'VeterenSoldier',
    'Velvet Noir': 'FemmeFatale',
    'Dame Victoria Sterling': 'Headmistress',
    'Lord Pemberton': 'Snob',
    'Mr. Zero': 'Villain',

    // === MENTOR ===
    'Grandfather Oak': 'WiseSage',
    'Dr. Grace Chen': 'Healer',
    'Dr. Alan Marcus': 'Professor',
    'Master Kai': 'Meditative',
    'Nana Rose': 'Grandma',

    // === ENERGETIC ===
    'Jake Blitz': 'Youtuber',
    'Sunny Day': 'Bubbly',
    'Danny Swift': 'Cockney',
    'Raven Black': 'Raspy',
    'Coach Thunder': 'Coach',

    // === TEXTURE ===
    'The Whisper': 'Intimate',
    'Dr. Calm': 'Male ASMR',
    'Aria-7': 'Etheral',
    'Nigel Wimple': 'Coward',
    'Milton Specs': 'Nasal',
    'Madison Star': 'Valley',

    // === GLOBAL ===
    'Max Outback': 'Australian',
    'Amélie Laurent': 'French',
    'Raj Sharma': 'Indian',
    'Ingrid Frost': 'Scandanavian',
    'Coach Kofi': 'WestAfrican',
    'Thabo Wilde': 'SouthAfrican',
    'Smooth Johnny': 'AfricanAmerican',
};

async function main() {
    // Load all voice seeds
    const voiceSeeds = await prisma.voiceSeed.findMany({
        select: { id: true, name: true },
    });
    const seedMap = new Map<string, string>();
    voiceSeeds.forEach(v => seedMap.set(v.name, v.id));

    let updated = 0;
    for (const [charName, voiceSeedName] of Object.entries(characterToVoiceSeed)) {
        const seedId = seedMap.get(voiceSeedName);
        if (!seedId) {
            console.warn(`⚠️ VoiceSeed not found for "${voiceSeedName}" (Character: ${charName})`);
            continue;
        }
        const character = await prisma.personaTemplate.findFirst({
            where: { name: charName },
            select: { id: true, seedId: true },
        });
        if (!character) {
            console.warn(`⚠️ Character not found: "${charName}"`);
            continue;
        }

        // Verify specifically for missing chars
        if (['Ingrid Frost', 'Coach Kofi', 'Thabo Wilde', 'Smooth Johnny'].includes(charName)) {
            console.log(`[DEBUG] Checking ${charName}...`);
            console.log(`[DEBUG] Expected VoiceSeed: ${voiceSeedName}`);
            console.log(`[DEBUG] Found VoiceSeed ID: ${seedId}`);
            console.log(`[DEBUG] Found Character: ${character ? character.id : 'NOT FOUND'}`);
        }

        // Always update to ensure consistency, even if it looks same (or check logic)
        if (character.seedId !== seedId) {
            await prisma.personaTemplate.update({
                where: { id: character.id },
                data: { seedId },
            });
            console.log(`✅ Linked ${charName} -> VoiceSeed: ${voiceSeedName} (ID: ${seedId})`);
            updated++;
        } else {
            // console.log(`   (Skip) ${charName} already linked correctly.`);
            if (['Ingrid Frost', 'Coach Kofi', 'Thabo Wilde', 'Smooth Johnny'].includes(charName)) {
                console.log(`[DEBUG] ${charName} already has correct seedId: ${character.seedId}`);
            }
        }
    }
    console.log(`\nTotal characters updated: ${updated}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
