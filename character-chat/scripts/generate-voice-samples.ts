
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { FishSpeechClient } from '../lib/audio/fishSpeechClient';

// Load env vars
dotenv.config({ path: '.env.local' });

const fishSpeechClient = new FishSpeechClient();

// ==========================================
// COPY OF VOICE LOGIC FROM route.ts
// (Avoiding Next.js imports in standalone script)
// ==========================================

const ALL_EMOTIONS = [
    'angry', 'sad', 'excited', 'surprised', 'satisfied', 'delighted',
    'scared', 'worried', 'upset', 'nervous', 'frustrated', 'depressed',
    'empathetic', 'embarrassed', 'disgusted', 'moved', 'proud', 'relaxed',
    'grateful', 'confident', 'interested', 'curious', 'confused', 'joyful',
    'disdainful', 'unhappy', 'anxious', 'hysterical', 'indifferent',
    'impatient', 'guilty', 'scornful', 'panicked', 'furious', 'reluctant',
    'keen', 'disapproving', 'negative', 'denying', 'astonished', 'serious',
    'sarcastic', 'conciliative', 'comforting', 'sincere', 'sneering',
    'hesitating', 'yielding', 'painful', 'awkward', 'amused',
];

const ALL_TONES = [
    '', '', '', '', // Empty (no tone)
    'in a hurry tone', 'shouting', 'screaming', 'whispering', 'soft tone',
];

function getCharacterVoiceSignature(characterId: string, archetype: string, name: string = ''): string {
    const lowerName = name.toLowerCase();
    let forcedEmotions: string[] = [];
    let forcedTones: string[] = []; // Default empty

    // SPECIFIC FIXES (Mirroring route.ts v6)
    if (lowerName.includes('daily art')) {
        forcedEmotions = ['curious', 'delighted', 'excited'];
    } else if (lowerName.includes('detective jack') || lowerName.includes('donnelly')) {
        forcedEmotions = ['serious', 'suspicious', 'keen', 'interested'];
    } else if (lowerName.includes('thorin') || lowerName.includes('nova ironforge')) {
        forcedEmotions = ['serious', 'confident', 'proud', 'wise'];
    } else if (lowerName.includes('yuki') || lowerName.includes('hinata')) {
        forcedEmotions = ['gentle', 'soft tone', 'empathetic', 'sincere'];
        forcedTones = ['soft tone', 'whispering'];
    } else if (lowerName.includes('catherine') || lowerName.includes('jennifer white')) {
        forcedEmotions = ['sincere', 'empathetic', 'comforting', 'confident'];
    } else if (lowerName.includes('orion') || lowerName.includes('silverblade')) {
        forcedEmotions = ['confident', 'serious', 'proud'];
    } else if (lowerName.includes('luna') && lowerName.includes('stargazer')) {
        forcedEmotions = ['curious', 'gentle', 'soft tone', 'amused'];
        forcedTones = ['soft tone', 'whispering', ''];
    } else if (lowerName.includes('sarah wheeler')) {
        forcedEmotions = ['excited', 'joyful', 'confident', 'delighted']; // High Energy
        forcedTones = ['shouting', '']; // REMOVED 'neutral', fixed to shouting/empty
    }

    // FNV-1a Hashing
    const FNV_PRIME = 0x01000193;
    const FNV_OFFSET = 0x811c9dc5;
    let hash1 = FNV_OFFSET;
    let hash2 = FNV_OFFSET + 12345;
    let hash3 = FNV_OFFSET + 67890;

    const hashInput = `${characterId}:${name}:${archetype}`;
    for (let i = 0; i < hashInput.length; i++) {
        const byte = hashInput.charCodeAt(i);
        hash1 ^= byte;
        hash1 = Math.imul(hash1, FNV_PRIME) >>> 0;
        hash2 ^= byte + i;
        hash2 = Math.imul(hash2, FNV_PRIME) >>> 0;
        hash3 ^= byte * (i + 1);
        hash3 = Math.imul(hash3, FNV_PRIME) >>> 0;
    }

    let primaryEmotion = '';
    if (forcedEmotions.length > 0) {
        primaryEmotion = forcedEmotions[hash1 % forcedEmotions.length];
    } else {
        primaryEmotion = ALL_EMOTIONS[hash1 % ALL_EMOTIONS.length]; // Simplified fallback
    }

    let toneMarker = '';
    if (forcedTones.length > 0) {
        toneMarker = forcedTones[hash3 % forcedTones.length];
    } else {
        toneMarker = ALL_TONES[hash3 % ALL_TONES.length];
    }

    let signature = `(${primaryEmotion})`;
    if (toneMarker) {
        signature = `(${toneMarker}) ${signature}`;
    }
    return signature;
}

// ==========================================
// MAIN GENERATION SCRIPT
// ==========================================

const TARGET_CHARACTERS = [
    { id: 'sarah-wheeler', name: 'Sarah Wheeler', archetype: 'warm_mentor', sample: "Hey everyone! I'm so excited to be here today!" },
    { id: 'luna-stargazer', name: 'Luna the Stargazer', archetype: 'gentle_companion', sample: "Look at the stars... aren't they beautiful tonight?" },
    { id: 'thorin-lightbringer', name: 'Thorin Lightbringer', archetype: 'hero', sample: "Stand tall! We shall defeat this darkness together!" },
    { id: 'daily-art-snack', name: 'Daily Art Snack', archetype: 'playful_trickster', sample: "Ooh! What a fascinating color palette you've chosen!" }
];

async function run() {
    const artifactsDir = path.join(process.cwd(), 'artifacts_voice_samples');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir);
    }

    console.log("Generating audio samples for verified characters...\n");

    for (const char of TARGET_CHARACTERS) {
        const signature = getCharacterVoiceSignature(char.id, char.archetype, char.name);
        const textWithSig = `${signature} ${char.sample}`;

        console.log(`Generating: ${char.name}`);
        console.log(`  Signature: ${signature}`);
        console.log(`  Text: "${textWithSig}"`);

        try {
            if (!fishSpeechClient.isConfigured()) {
                console.warn("  Skipping: Fish Audio API Key not found in .env.local");
                continue;
            }

            const audioBuffer = await fishSpeechClient.synthesize({
                text: textWithSig,
                characterId: char.id,
                archetype: char.archetype,
                gender: char.name.includes('Thorin') ? 'male' : 'female', // Simple gender guess
            });

            const filename = `${char.id}_sample.mp3`;
            const filePath = path.join(artifactsDir, filename);
            fs.writeFileSync(filePath, audioBuffer);
            console.log(`  ✅ Saved to ${filePath}\n`);

        } catch (err: any) {
            console.error(`  ❌ Failed: ${err.message}\n`);
        }
    }
}

run();
