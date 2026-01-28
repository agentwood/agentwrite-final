
import 'dotenv/config';
import { db } from '../lib/db';
import { pocketTtsClient } from '../lib/audio/pocketTtsClient';

async function auditVoices() {
    console.log('🎙️ STARTING VOICE SYSTEM AUDIT...\n');

    // 1. Connectivity Check
    console.log('--- 1. TTS Engine Status ---');
    try {
        const isHealthy = await pocketTtsClient.checkHealth();
        console.log(`Pocket TTS URL: ${process.env.POCKET_TTS_URL || '(Using Hardcoded Fallback)'}`);
        console.log(`Status: ${isHealthy ? '✅ ONLINE' : '❌ OFFLINE'}`);
    } catch (e) {
        console.log(`❌ Error checking Pocket TTS: ${e.message}`);
    }

    // 2. Database Integrity
    console.log('\n--- 2. Database Integrity ---');

    const totalChars = await db.personaTemplate.count();
    const totalSeeds = await db.voiceSeed.count();

    console.log(`Total Characters: ${totalChars}`);
    console.log(`Total Voice Seeds: ${totalSeeds}`);

    if (totalSeeds === 0) {
        console.log('⚠️ WARNING: No Voice Seeds found in database. Characters might be using legacy strings.');
    }

    // 3. Character Voice Linking
    console.log('\n--- 3. Character Voice Configuration ---');

    const charsWithSeed = await db.personaTemplate.count({
        where: { voiceSeedId: { not: null } }
    });

    const legacyCandidates = await db.personaTemplate.findMany({
        where: { voiceSeedId: null },
        select: { voiceName: true }
    });

    const charsLegacyOnly = legacyCandidates.filter(c => c.voiceName !== null && c.voiceName !== '').length;
    const charsNoVoice = legacyCandidates.filter(c => c.voiceName === null || c.voiceName === '').length;


    console.log(`✅ Modern Config (VoiceSeed Linked): ${charsWithSeed}`);
    console.log(`⚠️ Legacy Config (String Name Only): ${charsLegacyOnly}`);
    console.log(`❌ Missing Voice Config:            ${charsNoVoice}`);

    // 4. Sample Check
    if (charsWithSeed > 0) {
        const sample = await db.personaTemplate.findFirst({
            where: { voiceSeedId: { not: null } },
            include: { voiceSeed: true }
        });
        console.log(`\nSample Linked Character: "${sample?.name}" -> Voice: "${sample?.voiceSeed?.name}" (${sample?.voiceSeed?.filePath})`);
    }

    console.log('\n-----------------------------------');
    console.log('AUDIT COMPLETE');
}

auditVoices()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
