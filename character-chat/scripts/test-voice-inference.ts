/**
 * Test Voice Inference Service
 */

import { inferVoiceFromCharacter, matchVoiceIdentity } from '../lib/voices/voiceInferenceService';

async function testInference() {
    console.log('🧪 VOICE INFERENCE TEST\n');
    console.log('='.repeat(80));

    const testCharacters = [
        {
            name: 'Eleanor Ashworth',
            description: 'A meticulous historian at Oxford who specializes in obscure and lost civilizations. She speaks with dry wit.',
            archetype: 'Scholar',
        },
        {
            name: 'Coach Kofi',
            description: 'He believes in you more than you believe in yourself. High energy, infectious rhythm, booming laugh.',
            archetype: 'Coach',
            heritage: 'Ghana',
        },
        {
            name: 'DJ Trap-a-holics',
            description: 'Hype man and DJ. Underground hip hop legend who brings the energy.',
            tagline: 'REAL TRAP MUSIC',
            archetype: 'Entertainer',
        },
        {
            name: 'Countess Vestra',
            description: 'An elite European aristocrat who runs a global criminal empire. She orders assassinations.',
            archetype: 'Villain',
        },
        {
            name: 'Sergeant Park',
            description: 'Korean military drill sergeant. He will break you down and build you back up.',
            archetype: 'Coach',
            heritage: 'Korea',
        },
        {
            name: 'Priya Sharma',
            description: 'Ruthless Indian tech mogul. She controls half of Silicon Valley from the shadows.',
            archetype: 'Villain',
            heritage: 'India',
        },
    ];

    for (const char of testCharacters) {
        console.log(`\n${'─'.repeat(80)}`);
        const inferred = inferVoiceFromCharacter(char);

        console.log(`📌 CHARACTER: ${char.name}`);
        console.log(`   Description: ${char.description?.substring(0, 60)}...`);
        console.log(`\n   🎯 INFERRED VOICE:`);
        console.log(`      Gender: ${inferred.gender}`);
        console.log(`      Age: ${inferred.age}`);
        console.log(`      Accent: ${inferred.accent}`);
        console.log(`      Energy: ${inferred.energy}`);
        console.log(`      Confidence: ${inferred.confidence}%`);
        console.log(`\n   📝 REASONING:`);
        inferred.reasoning.forEach(r => console.log(`      • ${r}`));

        // Match to actual voice
        const match = await matchVoiceIdentity(char);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Test Complete');
    process.exit(0);
}

testInference();
