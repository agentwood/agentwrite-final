import 'dotenv/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Character Voice Matching Strategy for Fish Speech
 * 
 * Goal: Beat Character.AI on character matching (priority #1) and emotional expression
 * 
 * Strategy:
 * 1. CUSTOM VOICE CLONING for key characters (Marjorie, Rajiv, Asha)
 * 2. Emotion tagging for all characters
 * 3. Pre-made voice selection as fallback
 */

interface CharacterProfile {
    seedId: string;
    name: string;
    age: number;
    gender: 'M' | 'F';
    personality: string;
    archetype: string;
    emotionalRange: string[];
    voiceRequirements: {
        ageSound: string;
        tone: string;
        energy: string;
        accent?: string;
    };
    fishVoiceStrategy: 'clone' | 'premade' | 'generate';
    fishVoiceId?: string;
    cloneAudioUrl?: string;
}

// Character profiles with Fish Speech matching strategy
const CHARACTER_PROFILES: CharacterProfile[] = [
    {
        seedId: 'marjorie',
        name: 'Salty Marjorie',
        age: 75,
        gender: 'F',
        personality: 'strict, entitled, judgmental, rule-obsessed, "Salty Karen"',
        archetype: 'karen',
        emotionalRange: ['irritated', 'condescending', 'indignant', 'sharp', 'entitled'],
        voiceRequirements: {
            ageSound: 'elderly woman (70-80)',
            tone: 'sharp, nasal, demanding',
            energy: 'high-pitched when agitated',
            accent: 'Sunbelt American'
        },
        fishVoiceStrategy: 'clone', // MUST clone - no pre-made voice fits
        cloneAudioUrl: 'https://example.com/karen-sample.mp3', // TODO: Find or generate
    },
    {
        seedId: 'rajiv',
        name: 'Friendly Rajiv',
        age: 42,
        gender: 'M',
        personality: 'warm hustle, friendly, industrious',
        archetype: 'merchant',
        emotionalRange: ['cheerful', 'welcoming', 'persuasive', 'warm', 'energetic'],
        voiceRequirements: {
            ageSound: 'middle-aged man (40-50)',
            tone: 'warm, friendly, fast-paced',
            energy: 'medium-high',
            accent: 'Jersey American with Gujarati hints'
        },
        fishVoiceStrategy: 'clone', // Specific accent mix
    },
    {
        seedId: 'asha',
        name: 'Fearless Asha',
        age: 26,
        gender: 'F',
        personality: 'brave, principled, compassionate',
        archetype: 'professional',
        emotionalRange: ['earnest', 'determined', 'compassionate', 'clear', 'principled'],
        voiceRequirements: {
            ageSound: 'young woman (25-30)',
            tone: 'clear, steady, professional',
            energy: 'medium',
            accent: 'Kenyan English'
        },
        fishVoiceStrategy: 'clone', // Specific Kenyan accent
    },
    {
        seedId: 'dex',
        name: 'Angry Dex',
        age: 33,
        gender: 'M',
        personality: 'angry, loyal, street-smart, blunt',
        archetype: 'artist',
        emotionalRange: ['angry', 'raspy', 'tough', 'blunt', 'street'],
        voiceRequirements: {
            ageSound: 'young man (30-35)',
            tone: 'raspy, tough, blunt',
            energy: 'medium',
            accent: 'NYC Bronx'
        },
        fishVoiceStrategy: 'premade', // Might find energetic male voice
        fishVoiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male (test)
    },
];

/**
 * Emotion Tag Generator
 * Maps character personality + context to Fish Speech emotion tags
 */
function generateEmotionTags(
    characterId: string,
    text: string,
    context?: { lastMessageWasUser?: boolean; userTone?: string }
): string {
    const profile = CHARACTER_PROFILES.find(p => p.seedId === characterId);
    if (!profile) return '';

    // Sentiment analysis (basic)
    const hasExclamation = text.includes('!');
    const hasQuestion = text.includes('?');
    const hasAllCaps = /[A-Z]{3,}/.test(text);
    const hasNegative = /\b(not|no|never|don't|won't|can't)\b/i.test(text);

    // Character-specific emotion mapping
    const emotionMap: Record<string, string[]> = {
        'marjorie': hasAllCaps ? ['indignant', 'sharp'] : hasExclamation ? ['demanding', 'entitled'] : ['irritated'],
        'rajiv': hasExclamation ? ['cheerful', 'energetic'] : hasQuestion ? ['welcoming'] : ['warm'],
        'asha': hasExclamation ? ['determined'] : hasNegative ? ['concerned'] : ['earnest'],
        'dex': hasAllCaps ? ['angry'] : hasExclamation ? ['tough'] : ['blunt'],
    };

    const emotions = emotionMap[characterId] || [];
    return emotions.length > 0 ? `[${emotions[0]}] ` : '';
}

/**
 * Voice Cloning Instructions for Fish Speech
 */
const VOICE_CLONING_GUIDE = `
# Voice Cloning Strategy for Perfect Character Match

## For Salty Marjorie (Priority #1):
**Target:** 75-year-old entitled woman, sharp tone, "Karen" archetype

**Option 1: Generate Sample Audio** guitar (Use AI voice generator to create):
- Prompt: "75-year-old American woman, elderly, sharp tone, entitled, nasal, high-pitched when agitated"
- Service: https://elevenlabs.io (create sample, download, upload to Fish Speech)
- Duration: 15-30 seconds

**Option 2: Find Royalty-Free Audio**:
- Search: "elderly woman complaining audio" on freesound.org
- Filter: Female, American accent, age 60+
- License: Public domain or Creative Commons

**Option 3: Record Custom** (Best quality):
- Hire voice actress on Fiverr/Upwork ($20-50)
- Script: "Excuse me, I've lived here for THIRTY years. This is absolutely unacceptable. Do you have any idea who you're talking to? I will be calling the manager!"
- Upload to Fish Speech → Clone voice

## For Rajiv & Asha:
Same strategy - find/generate 15-30s sample matching profile

## Fish Speech Cloning Steps:
1. Go to https://fish.audio/app/voice-cloning/
2. Upload 10-30 second audio sample
3. Name it (e.g., "Marjorie-Salty-Karen-75yo")
4. Wait for processing (~5 minutes)
5. Get voice ID
6. Update FISH_VOICE_MAP in /app/api/tts/route.ts

## Emotion Tagging:
Prepend text with: [emotion] before sending to Fish Speech
Example: "[irritated] Excuse me, I've been a resident..."
`;

// Export for use
export { CHARACTER_PROFILES, generateEmotionTags, VOICE_CLONING_GUIDE };

console.log('Character Voice Matching Strategy Loaded');
console.log('='.repeat(60));
console.log(VOICE_CLONING_GUIDE);
