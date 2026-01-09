import { PrismaClient } from '@prisma/client';
import { COMPREHENSIVE_VOICE_MAP } from '../lib/audio/comprehensiveVoiceMapping';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';

// Try loading .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const prisma = new PrismaClient();
const FISH_SPEECH_API_KEY = process.env.FISH_SPEECH_API_KEY;

async function verifyAndArchive() {
    console.log('🔍 Starting Voice Verification and Archive Process...');

    if (!FISH_SPEECH_API_KEY) {
        console.error('❌ Missing FISH_SPEECH_API_KEY in environment variables.');
        process.exit(1);
    }

    // Fetch all characters
    const characters = await prisma.personaTemplate.findMany();
    console.log(`📋 Found ${characters.length} characters to verify.`);

    let passed = 0;
    let failed = 0;

    for (const char of characters) {
        const seedId = char.seedId;
        const name = char.name;

        console.log(`\nTesting: ${name} (${seedId})...`);

        // 1. Check if mapped in COMPREHENSIVE_VOICE_MAP
        if (!seedId || !COMPREHENSIVE_VOICE_MAP[seedId]) {
            console.log(`❌ FAIL: No mapping found for '${seedId}' in COMPREHENSIVE_VOICE_MAP.`);
            await archiveCharacter(char.id, 'No voice mapping');
            failed++;
            continue;
        }

        const mapping = COMPREHENSIVE_VOICE_MAP[seedId];
        const voiceId = mapping.voiceId;

        // 2. dry-run synthesis to check if Voice ID is valid on Fish Audio
        try {
            const isAlive = await testVoiceId(voiceId);
            if (isAlive) {
                console.log(`✅ PASS: Mapped to '${mapping.voiceName}' (${voiceId}). API Check passed.`);
                await activateCharacter(char.id);
                passed++;
            } else {
                console.log(`❌ FAIL: Voice ID '${voiceId}' for '${name}' is rejected by Fish Audio API.`);
                await archiveCharacter(char.id, 'Invalid Voice ID on API');
                failed++;
            }
        } catch (error: any) {
            console.log(`❌ FAIL: API check error: ${error.message}`);
            await archiveCharacter(char.id, `API Error: ${error.message}`);
            failed++;
        }
    }

    console.log('\n==========================================');
    console.log('🎉 Verification Complete');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Archived: ${failed}`);
    console.log('==========================================');
}

async function testVoiceId(voiceId: string): Promise<boolean> {
    const url = 'https://api.fish.audio/v1/tts';
    const body = {
        text: 'Hello.',
        reference_id: voiceId,
        format: 'mp3',
        normalize: true
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) return true;

        // If 404 or 400, strictly fail
        const errText = await response.text();
        console.log(`   [API Error ${response.status}]: ${errText}`);
        return false;
    } catch (e) {
        console.log('   [Network Error]', e);
        return false;
    }
}

async function archiveCharacter(id: string, reason: string) {
    // Set voiceReady = false to "archive" from voice features
    // We strictly turn it off.
    await prisma.personaTemplate.update({
        where: { id },
        data: { voiceReady: false }
    });
    console.log(`   -> Archived (voiceReady=false): ${reason}`);
}

async function activateCharacter(id: string) {
    // Set voiceReady = true
    await prisma.personaTemplate.update({
        where: { id },
        data: { voiceReady: true }
    });
}

verifyAndArchive()
    .catch((e) => {
        console.error('Script Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
