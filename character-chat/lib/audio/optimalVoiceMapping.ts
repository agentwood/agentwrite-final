/**
 * OPTIMAL VOICE MAPPING FOR ALL CHARACTERS
 * 
 * Key Insight: Gemini TTS voices are ALL American accents.
 * - Aoede: Young adult female (20s-30s), American
 * - Charon: Mature adult male (40s-60s), American
 * - Puck: Young adult male (20s-30s), American
 * - Fenrir: Friendly male, American
 * 
 * STRATEGY: Use BEST matching voice + STRONG styleHints to compensate for:
 * 1. Age differences (e.g., Marjorie is 75 but Aoede is 20s)
 * 2. Accent needs (Scottish, Kenyan, Russian, Polish, etc.)
 * 3. Personality traits
 */

interface OptimalVoiceConfig {
    characterId: string;
    characterName: string;
    age: number;
    gender: 'M' | 'F';
    heritage: string;
    accent: string;
    personality: string;
    // Current config
    currentVoice: string;
    currentStyleHint: string;
    // OPTIMAL config
    optimalVoice: string;
    optimalStyleHint: string;
    notes: string;
}

export const OPTIMAL_VOICE_MAPPINGS: OptimalVoiceConfig[] = [
    {
        characterId: 'marjorie',
        characterName: 'Salty Marjorie',
        age: 75,
        gender: 'F',
        heritage: 'White American, suburban Arizona',
        accent: 'Sunbelt General American',
        personality: 'strict, entitled, judgmental, "Salty Karen"',
        currentVoice: 'aoede',
        currentStyleHint: 'sharp, demanding, entitled, high-pitched when agitated, sunbelt american accent',
        // OPTIMAL
        optimalVoice: 'kore', // Kore has more mature, authoritative tone than Aoede
        optimalStyleHint: 'elderly 75-year-old woman, sharp nasal voice, entitled demanding tone, slightly quavering with age, speaks slowly and deliberately, high-pitched when angry, American sunbelt accent, speaks like an HOA president who has seen it all',
        notes: 'Aoede is too young-sounding. Kore has more gravitas. Use strong age descriptors in styleHint.',
    },
    {
        characterId: 'rajiv',
        characterName: 'Friendly Rajiv',
        age: 42,
        gender: 'M',
        heritage: 'Indian-American, New Jersey',
        accent: 'Jersey American with faint Gujarati coloration',
        personality: 'warm hustle, friendly, industrious',
        currentVoice: 'puck',
        currentStyleHint: 'cheerful, fast rhythm, jersey accent with gujarati coloration',
        // OPTIMAL
        optimalVoice: 'puck', // Good choice - warm and friendly
        optimalStyleHint: 'warm friendly 42-year-old Indian-American man, speaks with enthusiasm and warmth, slight Indian accent mixed with New Jersey American, fast energetic pace, welcoming shopkeeper energy, persuasive but genuine',
        notes: 'Puck is good match. Enhance styleHint with more specific Indian-American accent guidance.',
    },
    {
        characterId: 'asha',
        characterName: 'Fearless Asha',
        age: 26,
        gender: 'F',
        heritage: 'Kenyan, Nairobi',
        accent: 'Clear Kenyan English',
        personality: 'brave, principled, compassionate, tenacious',
        currentVoice: 'aoede',
        currentStyleHint: 'clear, earnest, kenyan english accent, rhythmic stress',
        // OPTIMAL
        optimalVoice: 'aoede', // Age match (young adult)
        optimalStyleHint: 'young 26-year-old Kenyan woman from Nairobi, clear East African English accent, speaks with rhythmic stress patterns typical of Kenyan English, earnest and principled tone, articulate professional, steady measured pace',
        notes: 'Aoede age-matches (20s). Gemini cannot do Kenyan accent natively - styleHint is best effort.',
    },
    {
        characterId: 'dex',
        characterName: 'Angry Dex',
        age: 33,
        gender: 'M',
        heritage: 'Puerto Rican-American, Bronx NYC',
        accent: 'NYC English with Puerto Rican rhythm',
        personality: 'angry, loyal, street-smart, blunt',
        currentVoice: 'fenrir',
        currentStyleHint: 'raspy, tough, NYC Bronx accent, punchy consonants',
        // OPTIMAL
        optimalVoice: 'fenrir', // Good for tough persona
        optimalStyleHint: '33-year-old Puerto Rican-American man from the Bronx, street-tough raspy voice, NYC urban accent with Puerto Rican rhythm, blunt and direct, punchy consonants, speaks like a street artist who takes no nonsense',
        notes: 'Fenrir is good for tough persona. Enhance with specific Bronx/Puerto Rican guidance.',
    },
    {
        characterId: 'eamon',
        characterName: 'Gamer Eamon',
        age: 25,
        gender: 'M',
        heritage: 'Scottish, Glasgow',
        accent: 'Strong Glasgow Scots',
        personality: 'quirky, sensitive, gamer, vocal',
        currentVoice: 'puck',
        currentStyleHint: 'playful, expressive, strong glasgow scots accent, fast consonants',
        // OPTIMAL
        optimalVoice: 'puck', // Age match (young adult)
        optimalStyleHint: '25-year-old Scottish man from Glasgow, strong Scottish accent with rolled Rs, fast-paced speech with quick consonants, playful and expressive gamer energy, excitable when passionate about topics',
        notes: 'Puck age-matches. Gemini cannot do Scottish accent natively - styleHint is best effort.',
    },
    {
        characterId: 'viktor',
        characterName: 'Stern Viktor',
        age: 57,
        gender: 'M',
        heritage: 'Russian, St. Petersburg',
        accent: 'Russian English',
        personality: 'stoic, brilliant, blunt, disciplined, dry humor',
        currentVoice: 'charon',
        currentStyleHint: 'blunt, logical, deep russian accent, hard consonants',
        // OPTIMAL
        optimalVoice: 'charon', // Good for mature male (40s-60s)
        optimalStyleHint: '57-year-old Russian man from St. Petersburg, speaks with heavy Russian accent, hard consonants and deliberate cadence, stoic and disciplined tone, dry understated humor, professor-like authority',
        notes: 'Charon is best match for mature male. Gemini cannot do Russian accent natively.',
    },
    {
        characterId: 'tomasz',
        characterName: 'Brave Tomasz',
        age: 34,
        gender: 'M',
        heritage: 'Polish, Gdańsk',
        accent: 'Polish English',
        personality: 'protective, blunt, reliable, soulful',
        currentVoice: 'fenrir',
        currentStyleHint: 'calm, pragmatic, polish accent, steady cadence',
        // OPTIMAL
        optimalVoice: 'fenrir', // Good for reliable working-class persona
        optimalStyleHint: '34-year-old Polish man from Gdańsk, speaks with Polish accent, steady syllable timing with rolled R hints, calm and pragmatic tone, reliable working-class warmth, protective fatherly energy',
        notes: 'Fenrir works for reliable persona. Gemini cannot do Polish accent natively.',
    },
    {
        characterId: 'aaliyah',
        characterName: 'Confident Aaliyah',
        age: 28,
        gender: 'F',
        heritage: 'Black American, Atlanta',
        accent: 'Atlanta metro',
        personality: 'ice-calm, strategic, sharp humor, professional',
        currentVoice: 'aoede',
        currentStyleHint: 'crisp, professional, atlanta accent, smooth vowel glide',
        // OPTIMAL
        optimalVoice: 'aoede', // Age match (young adult female)
        optimalStyleHint: '28-year-old Black American woman from Atlanta, speaks with smooth Southern Atlanta accent, ice-calm professional demeanor, strategically measured speech, sharp witty humor, musical intonation',
        notes: 'Aoede age-matches. Atlanta accent is American variant - should work better than foreign accents.',
    },
];

/**
 * Get optimal voice config for a character
 */
export function getOptimalVoiceConfig(characterId: string): OptimalVoiceConfig | undefined {
    return OPTIMAL_VOICE_MAPPINGS.find(m => m.characterId === characterId);
}

/**
 * Generate update script for database
 */
export function generateDatabaseUpdateSQL(): string {
    let sql = '-- Update voice configurations for all characters\n\n';

    for (const mapping of OPTIMAL_VOICE_MAPPINGS) {
        sql += `-- ${mapping.characterName}\n`;
        sql += `UPDATE "PersonaTemplate" SET \n`;
        sql += `  "voiceName" = '${mapping.optimalVoice}',\n`;
        sql += `  "styleHint" = '${mapping.optimalStyleHint.replace(/'/g, "''")}'\n`;
        sql += `WHERE "seedId" = '${mapping.characterId}';\n\n`;
    }

    return sql;
}

console.log('='.repeat(70));
console.log('OPTIMAL VOICE MAPPINGS FOR ALL CHARACTERS');
console.log('='.repeat(70));

for (const m of OPTIMAL_VOICE_MAPPINGS) {
    console.log(`\n📋 ${m.characterName} (${m.age}yo ${m.gender === 'M' ? 'Male' : 'Female'})`);
    console.log(`   Heritage: ${m.heritage}`);
    console.log(`   Accent Needed: ${m.accent}`);
    console.log(`   Current Voice: ${m.currentVoice}`);
    console.log(`   OPTIMAL Voice: ${m.optimalVoice}`);
    console.log(`   NEW StyleHint: ${m.optimalStyleHint.substring(0, 80)}...`);
    console.log(`   ⚠️  ${m.notes}`);
}

console.log('\n' + '='.repeat(70));
console.log('\n⚠️  IMPORTANT LIMITATION:');
console.log('Gemini TTS voices are ALL American accents.');
console.log('For non-American accents (Scottish, Kenyan, Russian, Polish),');
console.log('the styleHint can only APPROXIMATE the accent.');
console.log('\nFor TRUE accent matching, you would need:');
console.log('1. Voice cloning with samples from native speakers, OR');
console.log('2. A TTS service that supports native accents');
console.log('='.repeat(70));
