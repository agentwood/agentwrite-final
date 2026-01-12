import fs from 'fs';
import path from 'path';

// Mapping of Archetype+Gender to local fallback audio files
const ARCHETYPE_FALLBACKS: Record<string, string> = {
    'cold_authority_male': 'runpod-chatterbox/profiles/cold_authority_male/reference.wav',
    'cold_authority_female': 'runpod-chatterbox/profiles/cold_authority_female/reference.wav',
    'warm_mentor_male': 'runpod-chatterbox/profiles/warm_mentor_male/reference.wav',
    'warm_mentor_female': 'runpod-chatterbox/profiles/warm_mentor_female/reference.wav',
    'high_energy_male': 'runpod-chatterbox/profiles/high_energy_male/reference.wav',
    'high_energy_female': 'runpod-chatterbox/profiles/high_energy_female/reference.wav',
    'soft_vulnerable_male': 'runpod-chatterbox/profiles/soft_vulnerable_male/reference.wav',
    'soft_vulnerable_female': 'runpod-chatterbox/profiles/soft_vulnerable_female/reference.wav',
    'sage_male': 'runpod-chatterbox/profiles/sage_male/reference.wav',
    'rebellious_male': 'runpod-chatterbox/profiles/rebellious_male/reference.wav',
    'rebellious_female': 'runpod-chatterbox/profiles/rebellious_female/reference.wav',

    // MISSING ARCHETYPE MAPPINGS (Fix for duplicate voices)
    'caregiver_female': 'runpod-chatterbox/profiles/warm_mentor_female/reference.wav',
    'caregiver_male': 'runpod-chatterbox/profiles/warm_mentor_male/reference.wav',
    'entertainer_male': 'runpod-chatterbox/profiles/high_energy_male/reference.wav',
    'entertainer_female': 'runpod-chatterbox/profiles/high_energy_female/reference.wav',
    'motivator_male': 'runpod-chatterbox/profiles/high_energy_male/reference.wav',
    'motivator_female': 'runpod-chatterbox/profiles/high_energy_female/reference.wav',
    'hype-man_male': 'runpod-chatterbox/profiles/rebellious_male/reference.wav', // Trap-a-holics
    'narrator_male': 'runpod-chatterbox/profiles/sage_male/reference.wav',
};

// KNOWN CHARACTER FOLDERS (From runpod-fishspeech/profiles)
// These contain rich, character-specific audio samples (e.g. sample_1.wav, sample_2.wav)
// We prioritize these for "Custom/Cultural/Mood" matching.
const KNOWN_CHARACTER_FOLDERS = [
    'alle-influencer', 'angry-karen', 'asha-mbeki', 'auntie-saffy', 'big-tom',
    'boring-history-sleep', 'camille-laurent', 'captain-mireya', 'coach-boone',
    'convenience-store', 'council-estate', 'detective-jun', 'doodle-dave',
    'dr-elena-petrov', 'dr-nadia', 'elevenlabs-adam', 'energetic-male', 'friendly-women',
    'hector-alvarez', 'horror-shadow', 'hush', 'imani-shah', 'jon-debater',
    'juno-gearwhistle', 'kael-drakesunder', 'kenji-tanaka', 'kira-neonfox',
    'marge-halloway', 'miles-granger', 'mina-kwon', 'mr-receipt', 'nico-awkward',
    'orion-riftwalker', 'owen-mckenna', 'passive-aggressive', 'priya-nair',
    'prof-basil', 'queue-manager', 'raj-corner-store', 'seraphina-vale',
    'sleepless-historian', 'soren-nielsen', 'spongebob', 'sunny-sato',
    'sweet-cs-rep', 'the-elephant', 'trap-a-holics', 'unshakeable-optimist',
    'wendy-hughes', 'yuki-tanaka'
];

const GENERIC_REF_TEXT = "I am speaking in a clear and consistent voice for reference.";

export function getF5ReferenceAudio(characterId: string, archetype: string, gender: string): { audioBase64: string; text: string } | null {
    const CWD = process.cwd();
    const SAMPLE_DIR = path.join(CWD, 'artifacts_voice_samples');

    let filePath = '';
    let refText = GENERIC_REF_TEXT;

    const lowerId = characterId.toLowerCase();

    // 1. CHECK SPECIFIC CHARACTER OVERRIDES (Artifact Samples)
    if (lowerId.includes('sarah') && lowerId.includes('wheeler')) {
        filePath = path.join(SAMPLE_DIR, 'sarah-wheeler_sample.mp3');
        refText = "I am so excited to be here! This is going to be amazing!";
    } else if (lowerId.includes('luna') && lowerId.includes('stargazer')) {
        filePath = path.join(SAMPLE_DIR, 'luna-stargazer_sample.mp3');
        refText = "The stars are whispering ancient secrets tonight.";
    } else if (lowerId.includes('daily') && lowerId.includes('art')) {
        filePath = path.join(SAMPLE_DIR, 'daily-art-snack_sample.mp3');
        refText = "Here is your daily dose of creative inspiration!";
        const testPath = path.join(CWD, 'artifacts_api_test/Thorin_Lightbringer_api.mp3');
        if (fs.existsSync(testPath)) {
            filePath = testPath;
            refText = "I stand ready to defend the realm.";
        }
    } else if (lowerId.includes('nancy') || lowerId.includes('friendly-women')) {
        // Force Nancy to use Warm Mentor Female
        // (Bypass the potentially corrupted 'friendly-women' folder)
        const fbParams = ARCHETYPE_FALLBACKS['warm_mentor_female'];
        if (fbParams) {
            filePath = path.join(CWD, fbParams);
            refText = "I am Neighbor Nancy, always here with cookies and advice.";
            console.log('[VoiceRegistry] Forced Nancy override to Warm Mentor Female');
        }
    }

    // 2. CHECK KNOWN CHARACTER FOLDERS (Dynamic Personalities)
    // We look for a directory match in KNOWN_CHARACTER_FOLDERS that is part of the characterId
    if (!filePath) {
        const matchingFolder = KNOWN_CHARACTER_FOLDERS.find(folder => lowerId.includes(folder));
        if (matchingFolder) {
            // Found a match! Look for the best sample in that folder.
            // Priority: sample_1.wav > reference.wav > sample_1.mp3
            const folderPath = path.join(CWD, 'runpod-fishspeech/profiles', matchingFolder);

            const candidates = [
                'sample_1.wav', 'reference.wav', 'sample_1.mp3',
                'sample_2.wav', 'sample_3.wav'
            ];

            for (const c of candidates) {
                const p = path.join(folderPath, c);
                if (fs.existsSync(p)) {
                    filePath = p;
                    console.log(`[VoiceRegistry] Found specific asset for ${characterId}: ${matchingFolder}/${c}`);
                    break;
                }
            }
        }
    }

    // 3. CHECK ARCHETYPE FALLBACKS (If no specific sample)
    if (!filePath || !fs.existsSync(filePath)) {
        const key = `${archetype}_${gender}`;
        // Try exact match
        let fallbackRelative = ARCHETYPE_FALLBACKS[key];

        // Try partial match if no exact key
        if (!fallbackRelative) {
            // Default to something reasonable based on gender
            if (gender === 'female') {
                fallbackRelative = ARCHETYPE_FALLBACKS['warm_mentor_female'];
            } else {
                fallbackRelative = ARCHETYPE_FALLBACKS['warm_mentor_male'];
            }
        }

        if (fallbackRelative) {
            filePath = path.join(CWD, fallbackRelative);
        }
    }

    // 4. READ AND RETURN
    if (filePath && fs.existsSync(filePath)) {
        try {
            const buffer = fs.readFileSync(filePath);
            return {
                audioBase64: buffer.toString('base64'),
                text: refText
            };
        } catch (e) {
            console.error(`[VoiceRegistry] Error reading file ${filePath}:`, e);
        }
    } else {
        console.warn(`[VoiceRegistry] No reference audio found for ${characterId} (${archetype}/${gender})`);
    }

    return null;
}
