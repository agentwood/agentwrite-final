/**
 * Clean Voice Audit Report - For User Review
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAudit() {
    console.log('📋 COMPLETE VOICE ASSIGNMENT REPORT\n');
    console.log('='.repeat(100));
    console.log('');

    const allCharacters = await prisma.personaTemplate.findMany({
        include: { voiceIdentity: true },
        orderBy: { name: 'asc' }
    });

    for (const char of allCharacters) {
        const voice = char.voiceIdentity;

        if (!voice) {
            console.log(`❌ ${char.name.padEnd(25)} | NO VOICE ASSIGNED`);
            continue;
        }

        const emoji = voice.gender === 'female' ? '👩' : '👨';
        const accentEmoji = getAccentEmoji(voice.accent || '');

        console.log(`${emoji} ${char.name.padEnd(25)} | ${accentEmoji} ${voice.accent?.padEnd(15)} | ${voice.voiceId}`);
        console.log(`   Voice Desc: ${voice.voiceDescription || 'NOT SET'}`);
        console.log('');
    }

    console.log('='.repeat(100));
    console.log(`\nTotal: ${allCharacters.length} characters`);

    await prisma.$disconnect();
}

function getAccentEmoji(accent: string): string {
    if (accent.includes('african')) return '🇬🇭';
    if (accent.includes('british')) return '🇬🇧';
    if (accent.includes('american')) return '🇺🇸';
    if (accent.includes('european')) return '🇪🇺';
    if (accent.includes('asian')) return '🌏';
    if (accent.includes('middle')) return '🌍';
    if (accent.includes('latin')) return '🌎';
    if (accent.includes('south-asian')) return '🇮🇳';
    return '🌐';
}

cleanAudit();
