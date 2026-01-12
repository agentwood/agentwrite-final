/**
 * Verify Voice Mappings for Key Characters
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying Voice Mappings...\n');

    const characters = ['Coach Kofi', 'Eleanor Ashworth', 'Dr. Lucien Vale', 'Professor Eleanor Ashworth'];

    for (const name of characters) {
        const persona = await prisma.personaTemplate.findFirst({
            where: { name: { contains: name.split(' ')[0] } },
            include: { voiceIdentity: true },
        });

        if (!persona) {
            console.log(`❌ ${name}: NOT FOUND`);
            continue;
        }

        if (!persona.voiceIdentity) {
            console.log(`⚠️  ${name}: NO VOICE LINKED`);
            continue;
        }

        const voice = persona.voiceIdentity;
        console.log(`✅ ${persona.name}`);
        console.log(`   Voice ID: ${voice.voiceId}`);
        console.log(`   Gender: ${voice.gender}`);
        console.log(`   Accent: ${voice.accent}`);
        console.log(`   Description: ${voice.voiceDescription || 'NOT SET'}`);
        console.log('');
    }

    await prisma.$disconnect();
}

verify();
