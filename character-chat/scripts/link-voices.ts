
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔗 Linking Personas to Strict Voice Authority IDs...");

    // Link Coach Kofi
    const kofiLink = await prisma.personaTemplate.updateMany({
        where: {
            OR: [
                { name: { contains: 'Kofi' } },
                { id: 'coach-kofi' }
            ]
        },
        data: {
            voiceName: 'coach_kofi_01', // Update simple string pointer
            voiceIdentityId: undefined  // We need to resolve the ID first to link relation?
            // Actually, let's look up the ID first to be safe, though updateMany can't set relation easily 
            // without ID. But schema has 'voiceName' as a string field too? 
            // Let's check schema: voiceName String, voiceIdentityId String?
        }
    });

    // Real relation link requires finding the VoiceIdentity ID (which happens to be the same string 'coach_kofi_01' in our seed?)
    // In seed-voice-library.ts we set `voiceId` (unique) to 'coach_kofi_01'. 
    // But the PK `id` is a cuid.
    // The relation uses `voiceIdentityId` -> `VoiceIdentity.id` (cuid).

    // 1. Get Voice Identity Primary Keys
    const kofiVoice = await prisma.voiceIdentity.findUnique({ where: { voiceId: 'coach_kofi_01' } });
    const eleanorVoice = await prisma.voiceIdentity.findUnique({ where: { voiceId: 'eleanor_ashworth_01' } });

    if (kofiVoice) {
        await prisma.personaTemplate.updateMany({
            where: { name: { contains: 'Kofi' } },
            data: {
                voiceIdentityId: kofiVoice.id,
                voiceName: 'coach_kofi_01'
            }
        });
        console.log(`✅ Linked Coach Kofi to Voice Auth ID: ${kofiVoice.id}`);
    } else {
        console.error("❌ Failed to find Voice Identity for Coach Kofi!");
    }

    if (eleanorVoice) {
        await prisma.personaTemplate.updateMany({
            where: { name: { contains: 'Eleanor' } },
            data: {
                voiceIdentityId: eleanorVoice.id,
                voiceName: 'eleanor_ashworth_01'
            }
        });
        console.log(`✅ Linked Eleanor to Voice Auth ID: ${eleanorVoice.id}`);
    } else {
        console.error("❌ Failed to find Voice Identity for Eleanor!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
