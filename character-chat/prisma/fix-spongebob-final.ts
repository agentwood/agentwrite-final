import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Linking VoiceSeed to SpongeBob...');

    // 1. Create or Find VoiceSeed
    const voiceSeed = await prisma.voiceSeed.upsert({
        where: { name: 'spongebob_voice' },
        update: {},
        create: {
            name: 'spongebob_voice',
            filePath: '/voices/seeds/SpongeBob.wav',
            description: 'High pitched joyful voice',
            tone: 'High', // String in schema
            energy: 0.9,  // Float in schema
            accent: 'American Cartoon',
            gender: 'M',
            age: '25',
            category: 'Cartoon',
            tags: 'cartoon,energetic',
            suitableFor: 'comedy'
        }
    });

    // 2. Link to SpongeBob and Set VoiceReady=true
    const update = await prisma.personaTemplate.update({
        where: { seedId: 'spongebob' },
        data: {
            voiceSeedId: voiceSeed.id,
            voiceReady: true, // CRITICAL
            featured: true,
            category: 'Play & Fun'
        }
    });

    console.log(`✅ SpongeBob Fixed: VoiceReady=${update.voiceReady}, VoiceSeedID=${update.voiceSeedId}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
