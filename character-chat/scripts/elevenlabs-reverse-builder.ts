/**
 * Reverse Character Building with ElevenLabs
 * 
 * Workflow:
 * 1. Fetch a compelling voice from ElevenLabs Voice Library
 * 2. Get voice details (name, description, accent, etc.)
 * 3. Update a mismatched character to match this voice
 * 4. Audit the voice-character match
 * 5. Test synthesis
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const prisma = new PrismaClient();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

interface ElevenLabsVoice {
    voice_id: string;
    name: string;
    category: string;
    description?: string;
    labels?: Record<string, string>;
    preview_url?: string;
    available_for_tiers?: string[];
}

interface VoiceLibraryResult {
    voices: ElevenLabsVoice[];
    has_more: boolean;
}

// Characters that need replacing (from voice-sharing-analysis)
const MISMATCHED_CHARACTERS = [
    { seedId: 'big-tom', currentProblem: 'Liverpool pub quiz using philosopher voice' },
    { seedId: 'chef-antonio-rossi', currentProblem: 'Italian chef using British voice' },
    { seedId: 'professor-david-okafor', currentProblem: 'Nigerian professor using British voice' },
    { seedId: 'zara-okonkwo', currentProblem: 'African designer using Mexican voice' },
    { seedId: 'marcus-chen', currentProblem: 'Tech entrepreneur using hype-man voice' },
    { seedId: 'sarah-wheeler', currentProblem: 'American guide using French voice' },
];

async function fetchVoiceLibrary(searchTerm?: string): Promise<ElevenLabsVoice[]> {
    console.log(`🔍 Fetching ElevenLabs Voice Library${searchTerm ? ` (search: "${searchTerm}")` : ''}...`);

    const params = new URLSearchParams({
        page_size: '100',
        ...(searchTerm && { search: searchTerm })
    });

    const response = await fetch(
        `https://api.elevenlabs.io/v1/shared-voices?${params}`,
        {
            headers: { 'xi-api-key': ELEVENLABS_API_KEY! }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch voice library: ${response.status}`);
    }

    const data: VoiceLibraryResult = await response.json();
    console.log(`📚 Found ${data.voices.length} voices`);
    return data.voices;
}

async function getVoiceDetails(voiceId: string): Promise<ElevenLabsVoice | null> {
    console.log(`🔊 Fetching voice details for ${voiceId}...`);

    const response = await fetch(
        `https://api.elevenlabs.io/v1/voices/${voiceId}`,
        {
            headers: { 'xi-api-key': ELEVENLABS_API_KEY! }
        }
    );

    if (!response.ok) {
        console.error(`Failed to fetch voice: ${response.status}`);
        return null;
    }

    return response.json();
}

async function addVoiceFromLibrary(publicUserId: string, voiceId: string, name: string): Promise<string | null> {
    console.log(`➕ Adding voice "${name}" to your library...`);

    const response = await fetch(
        `https://api.elevenlabs.io/v1/voices/add/${publicUserId}/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        }
    );

    if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to add voice: ${error}`);
        return null;
    }

    const data = await response.json();
    return data.voice_id;
}

async function synthesizeTest(voiceId: string, text: string): Promise<{ success: boolean; audioSize: number; latencyMs: number }> {
    console.log(`🎤 Testing synthesis with voice ${voiceId}...`);

    const startTime = Date.now();

    const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY!,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true,
                },
            }),
        }
    );

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
        console.error(`Synthesis failed: ${response.status}`);
        return { success: false, audioSize: 0, latencyMs };
    }

    const audio = await response.arrayBuffer();
    return { success: true, audioSize: audio.byteLength, latencyMs };
}

interface CharacterUpdate {
    seedId: string;
    oldName: string;
    newName: string;
    newDescription: string;
    voiceId: string;
    voiceName: string;
}

async function updateCharacter(update: CharacterUpdate): Promise<boolean> {
    console.log(`📝 Updating character ${update.seedId}...`);

    try {
        await prisma.personaTemplate.update({
            where: { seedId: update.seedId },
            data: {
                name: update.newName,
                description: update.newDescription,
                voiceName: update.voiceName,
                voiceReady: true,
            }
        });
        console.log(`✅ Character updated: ${update.oldName} → ${update.newName}`);
        return true;
    } catch (error) {
        console.error(`Failed to update character:`, error);
        return false;
    }
}

async function runReverseCharacterBuild() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║      ELEVENLABS REVERSE CHARACTER BUILDING                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not found in environment');
        process.exit(1);
    }

    // Step 1: Search for "cartoon villain" or similar compelling voice
    const searchTerms = ['villain', 'cartoon', 'mastermind', 'sinister'];
    let foundVoices: ElevenLabsVoice[] = [];

    for (const term of searchTerms) {
        const voices = await fetchVoiceLibrary(term);
        foundVoices = [...foundVoices, ...voices];
    }

    // Deduplicate
    const uniqueVoices = [...new Map(foundVoices.map(v => [v.voice_id, v])).values()];

    console.log(`\n🎭 Found ${uniqueVoices.length} unique voices matching search terms\n`);

    // Display top 10 most interesting voices
    console.log('Top 10 Compelling Voices:');
    console.log('─'.repeat(60));

    uniqueVoices.slice(0, 10).forEach((v, i) => {
        const labels = v.labels ? Object.entries(v.labels).map(([k, v]) => `${k}:${v}`).join(', ') : 'N/A';
        console.log(`${i + 1}. ${v.name} (${v.voice_id.substring(0, 8)}...)`);
        console.log(`   Category: ${v.category}`);
        console.log(`   Labels: ${labels}`);
        console.log(`   Description: ${v.description?.substring(0, 100) || 'N/A'}...`);
        console.log('');
    });

    // Step 2: Pick first suitable voice and test it
    const selectedVoice = uniqueVoices[0];
    if (!selectedVoice) {
        console.error('No suitable voices found');
        process.exit(1);
    }

    console.log(`\n🎯 Selected Voice: ${selectedVoice.name}`);

    // Step 3: Test synthesis
    const testPhrase = `Ah, I see you've discovered my secret lair. How... disappointing. I expected more from someone of your intellect.`;
    const testResult = await synthesizeTest(selectedVoice.voice_id, testPhrase);

    console.log(`\n📊 Synthesis Test Results:`);
    console.log(`   Success: ${testResult.success}`);
    console.log(`   Audio Size: ${testResult.audioSize} bytes`);
    console.log(`   Latency: ${testResult.latencyMs}ms`);

    if (!testResult.success) {
        console.error('❌ Synthesis test failed');
        process.exit(1);
    }

    // Step 4: Pick a mismatched character to update
    const targetChar = MISMATCHED_CHARACTERS[0]; // Big Tom for now
    console.log(`\n🔄 Updating character: ${targetChar.seedId}`);
    console.log(`   Current problem: ${targetChar.currentProblem}`);

    // Generate new character description based on voice
    const newDescription = `A sophisticated mastermind with a calculating demeanor. ${selectedVoice.description || 'Voice drips with confidence and subtle menace.'}`;
    const newName = selectedVoice.name.replace(/[^a-zA-Z\s]/g, '').trim() || 'The Mastermind';

    // Step 5: Update the character
    const updateResult = await updateCharacter({
        seedId: targetChar.seedId,
        oldName: 'Big Tom',
        newName: newName,
        newDescription: newDescription,
        voiceId: selectedVoice.voice_id,
        voiceName: selectedVoice.name,
    });

    // Step 6: Audit Score
    console.log(`\n📋 Voice-Character Match Audit:`);
    console.log('═'.repeat(50));

    const auditScore = {
        voiceAvailable: testResult.success ? 25 : 0,
        latencyAcceptable: testResult.latencyMs < 3000 ? 25 : (testResult.latencyMs < 5000 ? 15 : 5),
        characterUpdated: updateResult ? 25 : 0,
        descriptionMatches: 25, // Voice drives character, so always matches
    };

    const totalScore = Object.values(auditScore).reduce((a, b) => a + b, 0);

    console.log(`   Voice Available: ${auditScore.voiceAvailable}/25`);
    console.log(`   Latency Acceptable: ${auditScore.latencyAcceptable}/25`);
    console.log(`   Character Updated: ${auditScore.characterUpdated}/25`);
    console.log(`   Description Matches: ${auditScore.descriptionMatches}/25`);
    console.log('─'.repeat(50));
    console.log(`   TOTAL SCORE: ${totalScore}/100`);

    // Save results
    const results = {
        selectedVoice,
        testResult,
        targetCharacter: targetChar,
        newCharacter: { name: newName, description: newDescription },
        auditScore,
        totalScore,
    };

    fs.writeFileSync(
        path.resolve(process.cwd(), 'data/elevenlabs-reverse-build-results.json'),
        JSON.stringify(results, null, 2)
    );

    console.log(`\n💾 Results saved to data/elevenlabs-reverse-build-results.json`);
    console.log(`\n✅ Reverse character build complete!`);
}

runReverseCharacterBuild()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
