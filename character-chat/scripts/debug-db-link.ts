
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Debugging DB Link...');

    const kofi = await prisma.personaTemplate.findFirst({
        where: { name: { contains: 'Kofi' } },
        include: {
            voiceIdentity: true
        }
    });

    if (!kofi) {
        console.log('❌ Kofi not found');
    } else {
        console.log('✅ Kofi found:', kofi.id);
        console.log('   voiceIdentityId:', kofi.voiceIdentityId);
        console.log('   voiceName (legacy):', kofi.voiceName);

        if (kofi.voiceIdentity) {
            console.log('✅ Voice Identity Linked:', kofi.voiceIdentity.voiceId);
            console.log('   referenceAudioPath:', kofi.voiceIdentity.referenceAudioPath);
        } else {
            console.log('❌ Voice Identity NOT Linked (Relation is null)');
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
