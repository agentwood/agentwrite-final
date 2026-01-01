import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Characters with UNIQUE Fish Audio cloned voice models.
 * These are the only characters that should be shown on the frontend.
 * 
 * Add more seedIds here as new unique voices are sourced from Fish Audio.
 */
const VOICE_READY_CHARACTERS = [
    // Characters with truly unique Fish Audio model IDs
    'spongebob',           // Unique cartoon voice - 54e3a85ac9594ffa83264b8a494b901b
    'trap-a-holics',       // Unique DJ hype voice - 0b2e96151d67433d93891f15efc25dbd
    'nico-awkward',        // Unique awkward Italian - 68dbf91dff844e8eab1bb90fcf427582
    'mina-kwon',           // Unique Korean drama voice - a86d9eac550d4814b9b4f6fc53661930
    'detective-jun',       // Unique detective voice - 5c71ab35290241ed842d036e4bb0e5da
    'hector-alvarez',      // Unique Mexican finance voice - b0de63ec40a241abb0ba4b4dc7b222d8
];

async function main() {
    console.log('🎙️  Marking characters with unique voices as ready...\n');

    // First, set all characters to voiceReady: false
    const resetResult = await prisma.personaTemplate.updateMany({
        data: { voiceReady: false },
    });
    console.log(`  ⚪ Reset ${resetResult.count} characters to voiceReady: false`);

    // Then, mark only unique-voice characters as ready
    let markedCount = 0;
    for (const seedId of VOICE_READY_CHARACTERS) {
        const result = await prisma.personaTemplate.updateMany({
            where: { seedId },
            data: { voiceReady: true },
        });
        if (result.count > 0) {
            console.log(`  ✅ ${seedId}`);
            markedCount++;
        } else {
            console.log(`  ⚠️  ${seedId} not found in database`);
        }
    }

    console.log(`\n✨ Marked ${markedCount} characters as voice-ready!`);
    console.log(`\n📝 To add more characters, edit VOICE_READY_CHARACTERS in this file.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
