
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔓 Enabling Voice-Ready Characters...");

    // 1. Find all personas with a linked Voice Identity
    const personasWithVoice = await prisma.personaTemplate.findMany({
        where: {
            voiceIdentityId: { not: null }
        }
    });

    console.log(`Found ${personasWithVoice.length} characters with linked voices.`);

    // 2. Update them to be voiceReady = true
    // specifically targeting Kofi and Eleanor first to be sure

    const result = await prisma.personaTemplate.updateMany({
        where: {
            voiceIdentityId: { not: null }
        },
        data: {
            voiceReady: true
        }
    });

    console.log(`✅ Enabled ${result.count} characters (voiceReady = true).`);

    // Verify Kofi specifically
    const kofi = await prisma.personaTemplate.findFirst({
        where: { name: { contains: 'Kofi' } },
        select: { name: true, voiceReady: true, voiceIdentityId: true }
    });
    console.log(`Status Check - Kofi:`, kofi);

    const eleanor = await prisma.personaTemplate.findFirst({
        where: { name: { contains: 'Eleanor' } },
        select: { name: true, voiceReady: true, voiceIdentityId: true }
    });
    console.log(`Status Check - Eleanor:`, eleanor);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
