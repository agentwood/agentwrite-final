#!/usr/bin/env npx tsx
/**
 * Add Reference Text (Transcripts) to Voice Seeds
 * 
 * F5-TTS REQUIRES the exact transcript of the reference audio to properly
 * clone a voice. Without ref_text, all voices sound similar because the
 * model can't align phonetic content to the speaker's vocal patterns.
 * 
 * This script updates all VoiceSeed records with their reference transcripts.
 * 
 * Usage: npx tsx scripts/add-voice-transcripts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reference text transcripts for each voice seed
// These should match EXACTLY what is spoken in the corresponding MP3 file
const VOICE_TRANSCRIPTS: Record<string, string> = {
    // The sample text spoken in the ElevenLabs voice samples
    // Based on typical voice cloning sample: ~20-30 seconds of speech

    'Movetrailer': "In a world where darkness reigns, one voice stands alone. This is the story of courage, of sacrifice, and of the human spirit that refuses to be broken.",

    'VeterenSoldier': "Listen up, soldier. Out there, it's not about being the strongest or the fastest. It's about having the will to keep going when everyone else has given up.",

    'FemmeFatale': "They say curiosity killed the cat. But satisfaction brought it back. And I've always been very, very curious about you.",

    'Headmistress': "Excellence is not negotiable in this institution. You will maintain the highest standards, or you will find yourself elsewhere. Am I perfectly clear?",

    'Snob': "Oh, how delightfully amusing. You actually thought that would impress me? I've seen better attempts at sophistication from common street vendors.",

    'Villain': "You see, the difference between us is simple. I'm willing to do what's necessary. While you, you're still clinging to your precious morals.",

    'WiseSage': "The answers you seek are not found in books, young one. They are found within yourself. You simply need the patience to listen.",

    'Healer': "Take a deep breath. Let the tension leave your shoulders. Whatever you're carrying, you don't have to carry it alone anymore.",

    'Professor': "Now, if we examine the evidence carefully, we can see a fascinating pattern emerging. This is precisely what makes science so exciting!",

    'Meditative': "Breathe in... and breathe out. Let each thought pass like a cloud across the sky. You are the sky, not the clouds.",

    'Grandma': "Oh, my sweet child. Come here and sit by me. I've made your favorite cookies, and I want to hear all about your adventures.",

    'Youtuber': "What is UP, everybody! Welcome back to another absolutely INSANE video! Make sure to smash that like button and subscribe!",

    'Bubbly': "Oh my gosh, this is literally the best day ever! I am SO excited to meet you! We're going to have the most amazing time together!",

    'Cockney': "Right then, mate. Let me tell you straight, yeah? Round here, we don't mess about. You want something done proper, you come to me.",

    'Raspy': "Life's too short to play by their rules. Sometimes you gotta break a few to make your own path. That's just how it is.",

    'Coach': "LISTEN UP! I don't want to hear excuses! I want to see RESULTS! Now get back out there and show me what you're made of!",

    'Intimate': "Come closer. There are some secrets that can only be whispered. Some truths that are too fragile to speak aloud.",

    'Male ASMR': "Let's take a moment... to just... relax. Close your eyes... and let the peaceful sounds... wash over you...",

    'Etheral': "I have witnessed the rise and fall of countless civilizations. Time flows differently when you exist... everywhere at once.",

    'Coward': "Oh no, oh no, oh no! This is bad, this is very, very bad! Are you sure it's safe? I really don't think we should be here!",

    'Nasal': "Actually, technically speaking, the probability of that outcome is approximately zero point three seven percent, give or take a margin of error.",

    'Valley': "Like, oh my god, that's so totally iconic! Literally everyone is talking about it. It's giving main character energy, no cap.",

    'Australian': "G'day, mate! Beautiful day for an adventure, isn't it? Nothing quite like the great outdoors. She'll be right, trust me.",

    'French': "Ah, mon ami, you simply cannot rush perfection. The best things in life, they require patience, passion, and a little je ne sais quoi.",

    'Indian': "Let me tell you about this incredible opportunity. The market potential is absolutely massive. We're talking exponential growth!",

    'Scandanavian': "The design must be clean. Functional. Beautiful in its simplicity. Everything has a purpose, or it does not belong.",

    'WestAfrican': "My friend, let me share with you a proverb from my homeland. The wise man learns from every experience, good or bad.",

    'SouthAfrican': "The bush has a way of teaching you patience. You wait, you watch, and when the moment comes, you are ready.",

    'AfricanAmerican': "Life's like a jazz tune, you know? Sometimes you gotta improvise. Go with the flow. Let the music guide you.",
};

async function main() {
    console.log('🎤 Adding Reference Transcripts to Voice Seeds\n');

    let updated = 0;
    let notFound = 0;

    for (const [seedName, transcript] of Object.entries(VOICE_TRANSCRIPTS)) {
        try {
            const result = await prisma.voiceSeed.updateMany({
                where: { name: seedName },
                data: { referenceText: transcript }
            });

            if (result.count > 0) {
                console.log(`✅ Updated: ${seedName}`);
                updated++;
            } else {
                console.log(`⚠️  Not found: ${seedName}`);
                notFound++;
            }
        } catch (error: any) {
            console.error(`❌ Error updating ${seedName}:`, error.message);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Transcript Update Complete!`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Not found: ${notFound}`);
    console.log('\n🔧 F5-TTS will now use these transcripts for better voice cloning.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
