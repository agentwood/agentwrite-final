import { PrismaClient } from '@prisma/client';
import { GEMINI_VOICE_METADATA } from '../lib/audio/geminiVoiceMetadata';

const prisma = new PrismaClient();

async function diagnoseVoiceMatching() {
    console.log('=== Diagnosing Voice Matching ===\n');

    const characters = await prisma.personaTemplate.findMany({
        take: 5,
        select: {
            id: true,
            name: true,
            description: true,
            archetype: true,
            category: true,
            characterKeywords: true,
            voiceName: true
        }
    });

    for (const char of characters) {
        console.log(`\nCharacter: ${char.name}`);
        console.log(`Current Voice: ${char.voiceName}`);
        console.log(`Archetype: ${char.archetype}`);
        console.log(`Keywords: ${char.characterKeywords}`);

        // Simple manual score check for top voices
        const traits = (char.description || '').toLowerCase();
        const gender = traits.includes('she') || traits.includes('her') ? 'female' : 'male';

        console.log(`Detected Gender (Basic): ${gender}`);

        const candidates = Object.values(GEMINI_VOICE_METADATA)
            .filter(v => v.gender === gender || v.gender === 'neutral')
            .map(v => {
                const matches = (v.keywords || []).filter(kw => traits.includes(kw));
                return {
                    name: v.voiceName,
                    gender: v.gender,
                    matches: matches.length,
                    keywords: matches
                };
            })
            .sort((a, b) => b.matches - a.matches)
            .slice(0, 3);

        console.log('Top Potential Matches:');
        candidates.forEach(c => console.log(` - ${c.name} (${c.gender}): ${c.matches} keywords [${c.keywords.join(', ')}]`));
    }
}

diagnoseVoiceMatching()
    .then(() => prisma.$disconnect());
