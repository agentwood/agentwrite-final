/**
 * Complete Voice Inference Analysis - ALL Characters
 */

import { PrismaClient } from '@prisma/client';
import { inferVoiceFromCharacter, matchVoiceIdentity } from '../lib/voices/voiceInferenceService';

const prisma = new PrismaClient();

async function fullInferenceAudit() {
    console.log('📋 COMPLETE VOICE INFERENCE ANALYSIS - ALL CHARACTERS\n');
    console.log('='.repeat(120));

    const allCharacters = await prisma.personaTemplate.findMany({
        include: { voiceIdentity: true },
        orderBy: { name: 'asc' }
    });

    console.log(`\n| Character | Gender | Age | Accent | Energy | Matched Voice | Score | Correct? |`);
    console.log(`|:---|:---|:---|:---|:---|:---|:---|:---|`);

    let correct = 0;
    let incorrect = 0;

    for (const char of allCharacters) {
        const inferred = inferVoiceFromCharacter({
            name: char.name,
            description: char.description || undefined,
            tagline: char.tagline || undefined,
            archetype: char.archetype,
            heritage: char.heritage || undefined,
        });

        // Find best match
        const voices = await prisma.voiceIdentity.findMany();
        let bestMatch: any = null;
        let bestScore = 0;

        for (const voice of voices) {
            let score = 0;
            if (voice.gender === inferred.gender) score += 40;
            if (voice.ageBand === inferred.age) score += 20;
            if (voice.accent === inferred.accent) score += 30;
            else if (voice.accent?.includes(inferred.accent.split('-')[0])) score += 15;
            if (voice.energyLevel === inferred.energy) score += 10;

            if (score > bestScore) {
                bestScore = score;
                bestMatch = voice;
            }
        }

        // Check if inference matches actual assignment
        const actualVoice = char.voiceIdentity;
        const isCorrect = actualVoice && bestMatch && actualVoice.voiceId === bestMatch.voiceId;

        if (isCorrect) correct++;
        else incorrect++;

        const checkmark = isCorrect ? '✅' : (actualVoice ? '⚠️' : '❌');
        const matchedName = bestMatch?.displayName?.substring(0, 25) || 'NO MATCH';

        console.log(`| ${char.name.substring(0, 20).padEnd(20)} | ${inferred.gender.padEnd(6)} | ${inferred.age.padEnd(12)} | ${inferred.accent.padEnd(16)} | ${inferred.energy.padEnd(6)} | ${matchedName.padEnd(25)} | ${bestScore.toString().padEnd(3)} | ${checkmark} |`);
    }

    console.log(`\n${'='.repeat(120)}`);
    console.log(`\n📊 SUMMARY`);
    console.log(`   Total Characters: ${allCharacters.length}`);
    console.log(`   ✅ Inference matches actual: ${correct}`);
    console.log(`   ⚠️  Inference differs from actual: ${incorrect}`);

    await prisma.$disconnect();
}

fullInferenceAudit();
