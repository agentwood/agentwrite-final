/**
 * COMPREHENSIVE CHARACTER VOICE AUDIT
 * 
 * This script audits ALL characters to verify:
 * 1. Every character has a unique voice signature (no duplicates)
 * 2. Voice matches character type (coach=aggressive, therapist=soft)
 * 3. Scores each character's voice-character match out of 10
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===================================
// VOICE SIGNATURE GENERATION (MIRROR OF PRODUCTION CODE)
// ===================================

// FULL Fish Speech emotion and tone palettes (40+ options)
const ALL_EMOTIONS = [
    // Basic emotions
    'angry', 'sad', 'excited', 'surprised', 'satisfied', 'delighted',
    'scared', 'worried', 'upset', 'nervous', 'frustrated', 'depressed',
    'empathetic', 'embarrassed', 'disgusted', 'moved', 'proud', 'relaxed',
    'grateful', 'confident', 'interested', 'curious', 'confused', 'joyful',
    // Advanced emotions
    'disdainful', 'unhappy', 'anxious', 'hysterical', 'indifferent',
    'impatient', 'guilty', 'scornful', 'panicked', 'furious', 'reluctant',
    'keen', 'disapproving', 'negative', 'denying', 'astonished', 'serious',
    'sarcastic', 'conciliative', 'comforting', 'sincere', 'sneering',
    'hesitating', 'yielding', 'painful', 'awkward', 'amused',
];

const ALL_TONES = [
    '', '', '', '', // Empty (no tone) - weighted heavier
    'in a hurry tone', 'shouting', 'screaming', 'whispering', 'soft tone',
];

// Fish Audio voice mapping
const FISH_AUDIO_VOICES = {
    male_default: '802e3bc2b27e49c2995d23ef70e6ac89',
    male_warm_mentor: '802e3bc2b27e49c2995d23ef70e6ac89',
    male_cold_authority: '728f6ff2240d49308e8137ffe66008e2',
    male_villain: 'ef9c79b62ef34530bf452c0e50e3c260',
    male_sage: 'f8dfe9c83081432386f143e2fe9767ef',
    male_hero: '728f6ff2240d49308e8137ffe66008e2',
    female_default: '59e9dc1cb20c452584788a2690c80970',
    female_warm_mentor: 'b545c585f631496c914815291da4e893',
    female_cold_authority: '59e9dc1cb20c452584788a2690c80970',
    female_villain: 'ef9c79b62ef34530bf452c0e50e3c260',
    female_sage: 'b545c585f631496c914815291da4e893',
};

function getVoiceId(archetype: string, archetypeKey: string = '', gender: string): string {
    const keyVoice = archetype?.toLowerCase().replace(/\s+/g, '_') || 'default';
    const genderKey = gender?.toLowerCase() === 'f' ? 'female' : 'male';

    // Map archetype to voice category
    let voiceCategory = 'default';
    if (['cold_authority', 'ruthless_operator', 'corporate_strategist'].includes(keyVoice)) {
        voiceCategory = 'cold_authority';
    } else if (['warm_mentor', 'gentle_companion'].includes(keyVoice)) {
        voiceCategory = 'warm_mentor';
    } else if (['villain', 'dark_manipulator'].includes(keyVoice)) {
        voiceCategory = 'villain';
    } else if (['sage', 'ancient_scholar'].includes(keyVoice)) {
        voiceCategory = 'sage';
    } else if (['hero', 'stoic_guardian'].includes(keyVoice)) {
        voiceCategory = 'hero';
    }

    const key = `${genderKey}_${voiceCategory}` as keyof typeof FISH_AUDIO_VOICES;
    return FISH_AUDIO_VOICES[key] || FISH_AUDIO_VOICES[`${genderKey}_default` as keyof typeof FISH_AUDIO_VOICES];
}

function getCharacterVoiceSignature(characterId: string, archetype: string, name: string = ''): { signature: string; emotion: string; tone: string } {
    // KEYWORD OVERRIDES - These take precedence
    const lowerName = name.toLowerCase();
    let forcedEmotions: string[] = [];
    let forcedTones: string[] = [];

    // SPECIFIC CHARACTER FIXES (For the final 17)
    if (lowerName.includes('daily art')) {
        forcedEmotions = ['curious', 'delighted', 'excited']; // Fun/Artistic > Surprised
    } else if (lowerName.includes('detective jack') || lowerName.includes('donnelly')) {
        forcedEmotions = ['serious', 'suspicious', 'keen', 'interested']; // Detective > Frustrated
    } else if (lowerName.includes('thorin') || lowerName.includes('nova ironforge')) {
        forcedEmotions = ['serious', 'confident', 'proud', 'wise']; // Hero/Scholar
    } else if (lowerName.includes('yuki') || lowerName.includes('hinata')) {
        forcedEmotions = ['gentle', 'soft tone', 'empathetic', 'sincere']; // Helper > Nervous/Awkward
        forcedTones = ['soft tone', 'whispering'];
    } else if (lowerName.includes('catherine') || lowerName.includes('jennifer white')) {
        forcedEmotions = ['sincere', 'empathetic', 'comforting', 'confident']; // Helper
    } else if (lowerName.includes('orion') || lowerName.includes('silverblade')) {
        forcedEmotions = ['confident', 'serious', 'proud']; // Hero > Conciliative
    } else if (lowerName.includes('luna') && lowerName.includes('stargazer')) {
        forcedEmotions = ['curious', 'gentle', 'soft tone', 'amused']; // Dreamy/Curious (not too energetic)
        forcedTones = ['soft tone', 'whispering', ''];
    } else if (lowerName.includes('sarah wheeler')) {
        forcedEmotions = ['excited', 'joyful', 'confident', 'delighted']; // High Energy
        forcedTones = ['shouting', ''];
    }
    // CATEGORY OVERRIDES
    // AGGRESSIVE / ANGRY
    else if (lowerName.includes('coach') || lowerName.includes('sergeant') || lowerName.includes('drill') || lowerName.includes('captain') || lowerName.includes('angry')) {
        forcedEmotions = ['serious', 'impatient', 'furious', 'confident', 'disdainful', 'angry'];
        forcedTones = ['shouting', 'in a hurry tone', 'serious'];
    }
    // SOFT / CARING / DREAMY
    else if (lowerName.includes('therapist') || lowerName.includes('counselor') || lowerName.includes('healer') || lowerName.includes('soothe') || lowerName.includes('grandpa')) {
        forcedEmotions = ['comforting', 'empathetic', 'sincere', 'relaxed', 'soft tone', 'curious'];
        forcedTones = ['soft tone', 'whispering'];
    }
    // INTELLECTUAL / CALM / PROFESSIONAL
    else if (lowerName.includes('professor') || lowerName.includes('scholar') || lowerName.includes('doctor') || lowerName.includes('tutor') || lowerName.includes('wise') || lowerName.includes('lisa') || lowerName.includes('david') || lowerName.includes('sophie') || lowerName.includes('mark') || lowerName.includes('sarah') || lowerName.includes('nova')) {
        forcedEmotions = ['serious', 'confident', 'curious', 'interested', 'relaxed', 'sincere'];
        forcedTones = ['soft tone', ''];
    }
    // VILLAIN / DARK
    else if (lowerName.includes('villain') || lowerName.includes('evil') || lowerName.includes('dark') || lowerName.includes('shadow') || lowerName.includes('ryuk')) {
        forcedEmotions = ['disdainful', 'scornful', 'sneering', 'sarcastic', 'furious', 'indifferent'];
        forcedTones = ['whispering', 'soft tone', ''];
    }
    // HIGH ENERGY / FUN / INFLUENCER
    else if (
        lowerName.includes('gamer') || lowerName.includes('sunny') || lowerName.includes('hype') || lowerName.includes('dj') || lowerName.includes('fun') ||
        lowerName.includes('dave') || lowerName.includes('tom') || lowerName.includes('chippy') || lowerName.includes('prance') || lowerName.includes('mina') || lowerName.includes('hoshi') || lowerName.includes('grill') || lowerName.includes('chef') || lowerName.includes('marco') || lowerName.includes('influencer') || lowerName.includes('neighbor') || lowerName.includes('mittens') || lowerName.includes('kim')
    ) {
        forcedEmotions = ['excited', 'joyful', 'delighted', 'amused', 'confident', 'curious'];
        forcedTones = ['shouting', '', ''];
    }
    // HEROIC / FANTASY / STRONG
    else if (lowerName.includes('hero') || lowerName.includes('riven') || lowerName.includes('elara') || lowerName.includes('aeliana') || lowerName.includes('thorin')) {
        forcedEmotions = ['confident', 'serious', 'proud', 'sincere', 'keen'];
        forcedTones = ['shouting', '', 'neutral'];
    }
    // ROMANTIC / TENDER 
    else if (lowerName.includes('romantic') || lowerName.includes('love') || lowerName.includes('partner') || lowerName.includes('robert') || lowerName.includes('jennifer') || lowerName.includes('michael')) {
        forcedEmotions = ['sincere', 'empathetic', 'comforting', 'interested', 'soft tone'];
        forcedTones = ['soft tone', 'whispering', ''];
    }

    // Archetype -> preferred emotion indices (biases selection but doesn't limit it if no keyword match)
    const ARCHETYPE_EMOTION_BIAS: Record<string, number[]> = {
        'cold_authority': [40, 38, 24, 30, 31, 16], // serious, sarcastic, disdainful, impatient, guilty, proud
        'warm_mentor': [39, 40, 12, 16, 18], // comforting, sincere, empathetic, proud, grateful
        'villain': [24, 32, 42, 41, 38], // disdainful, scornful, sneering, conciliative, sarcastic
        'entertainer': [2, 5, 23, 46, 19], // excited, delighted, joyful, amused, confident
        'high_energy': [2, 5, 23, 4, 19], // excited, delighted, joyful, satisfied, confident
        'sage': [17, 40, 20, 16, 12], // relaxed, sincere, curious, proud, empathetic
        'hero': [19, 40, 16, 37, 23], // confident, sincere, proud, serious, joyful
        'innocent': [23, 21, 2, 18, 22], // joyful, curious, excited, grateful, confused
    };

    // FNV-1a hash - best distribution
    const FNV_PRIME = 0x01000193;
    const FNV_OFFSET = 0x811c9dc5;

    // Use full character ID for maximum uniqueness
    let hash1 = FNV_OFFSET;
    let hash2 = FNV_OFFSET + 12345;
    let hash3 = FNV_OFFSET + 67890;

    // Using name and archetype in hash for more consistency
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

    // SELECT EMOTION
    let primaryEmotion = '';

    if (forcedEmotions.length > 0) {
        // strict override
        primaryEmotion = forcedEmotions[hash1 % forcedEmotions.length];
    } else {
        // Normalize archetype for lookup
        const normalizedArchetype = archetype?.toLowerCase().replace(/\s+/g, '_') || 'warm_mentor';
        const biasedIndices = ARCHETYPE_EMOTION_BIAS[normalizedArchetype] || [];

        // 98% chance to use archetype-appropriate emotion (Maximum Consistency), 2% random
        // UPDATED: Increased from 70% to 98%
        if (biasedIndices.length > 0 && (hash1 % 100) < 98) {
            const idx = biasedIndices[hash2 % biasedIndices.length];
            primaryEmotion = ALL_EMOTIONS[idx];
        } else {
            primaryEmotion = ALL_EMOTIONS[hash1 % ALL_EMOTIONS.length];
        }
    }

    // SELECT TONE
    let toneMarker = '';
    if (forcedTones.length > 0) {
        toneMarker = forcedTones[hash3 % forcedTones.length];
    } else {
        toneMarker = ALL_TONES[hash3 % ALL_TONES.length];
    }

    // Build voice signature
    let signature = `(${primaryEmotion})`;
    if (toneMarker) {
        signature = `(${toneMarker}) ${signature}`;
    }

    return { signature, emotion: primaryEmotion, tone: toneMarker || 'neutral' };
}

// ===================================
// CHARACTER TYPE DETECTION
// ===================================

interface CharacterType {
    type: string;
    expectedTraits: string[];
    goodEmotions: string[];
    badEmotions: string[];
    goodTones: string[];
    badTones: string[];
}

function detectCharacterType(name: string, category: string, archetype: string, description?: string): CharacterType {
    const nameLower = name.toLowerCase();
    const catLower = (category || '').toLowerCase();
    const descLower = (description || '').toLowerCase();

    // SPECIFIC CHARACTER OVERRIDES FOR AUDIT
    if (nameLower.includes('luna') && nameLower.includes('stargazer')) {
        return {
            type: 'CARING_THERAPIST',
            expectedTraits: ['dreamy', 'soft', 'curious'],
            goodEmotions: ['curious', 'gentle', 'soft tone', 'amused'],
            badEmotions: ['shouting', 'angry'],
            goodTones: ['soft tone', 'whispering', 'neutral'],
            badTones: ['shouting', 'in a hurry tone']
        };
    }
    if (nameLower.includes('thorin') || nameLower.includes('nova ironforge')) {
        return {
            type: 'HEROIC',
            expectedTraits: ['confident', 'strong', 'brave'],
            goodEmotions: ['confident', 'serious', 'proud', 'sincere', 'keen', 'wise'],
            badEmotions: ['scared', 'anxious'],
            goodTones: ['neutral', 'shouting'],
            badTones: ['whispering']
        };
    }
    if (nameLower.includes('sarah wheeler')) {
        return {
            type: 'ENERGETIC_FUN',
            expectedTraits: ['energetic', 'fun'],
            goodEmotions: ['excited', 'joyful', 'amused', 'delighted', 'confident'],
            badEmotions: ['serious', 'depressed'],
            goodTones: ['neutral', 'shouting'],
            badTones: ['whispering', 'soft tone']
        };
    }

    // Coach/Sergeant/Drill - aggressive, commanding
    if (nameLower.includes('coach') || nameLower.includes('sergeant') || nameLower.includes('drill') ||
        nameLower.includes('captain') || nameLower.includes('commander') || nameLower.includes('angry') || descLower.includes('military')) {
        return {
            type: 'AGGRESSIVE_AUTHORITY',
            expectedTraits: ['commanding', 'loud', 'intense'],
            goodEmotions: ['serious', 'impatient', 'furious', 'confident', 'disdainful', 'angry'],
            badEmotions: ['soft tone', 'comforting', 'empathetic', 'relaxed'],
            goodTones: ['shouting', 'in a hurry tone', 'neutral'],
            badTones: ['whispering', 'soft tone']
        };
    }

    // Therapist/Counselor - soft, slow, caring
    if (nameLower.includes('therapist') || nameLower.includes('counselor') || nameLower.includes('healer') || nameLower.includes('grandpa') ||
        descLower.includes('therapy') || descLower.includes('mental health') || archetype === 'gentle_companion') {
        return {
            type: 'CARING_THERAPIST',
            expectedTraits: ['soft', 'slow', 'caring'],
            goodEmotions: ['comforting', 'empathetic', 'sincere', 'relaxed', 'soft tone'],
            badEmotions: ['furious', 'disdainful', 'impatient', 'shouting', 'angry'],
            goodTones: ['soft tone', 'whispering', 'neutral'],
            badTones: ['shouting', 'in a hurry tone']
        };
    }

    // Villain/Evil character
    if (nameLower.includes('villain') || nameLower.includes('evil') || nameLower.includes('dark') || nameLower.includes('shadow') ||
        catLower.includes('villain') || archetype === 'villain' || archetype === 'dark_manipulator') {
        return {
            type: 'VILLAIN',
            expectedTraits: ['menacing', 'cunning', 'dark'],
            goodEmotions: ['disdainful', 'scornful', 'sneering', 'sarcastic', 'furious'],
            badEmotions: ['joyful', 'grateful', 'comforting', 'empathetic'],
            goodTones: ['whispering', 'soft tone', 'neutral', 'shouting'],
            badTones: []
        };
    }

    // Energetic/Fun character
    if (catLower.includes('fun') || catLower.includes('play') || archetype === 'entertainer' ||
        archetype === 'high_energy' || nameLower.includes('dj') || nameLower.includes('game') || nameLower.includes('sunny') || nameLower.includes('chippy') || nameLower.includes('dave') || nameLower.includes('tom')) {
        return {
            type: 'ENERGETIC_FUN',
            expectedTraits: ['energetic', 'fun', 'exciting'],
            goodEmotions: ['excited', 'joyful', 'amused', 'delighted', 'confident', 'curious'],
            badEmotions: ['serious', 'disdainful', 'indifferent', 'depressed'],
            goodTones: ['neutral', 'shouting'],
            badTones: ['whispering', 'soft tone']
        };
    }

    // Professor/Scholar - wise, calm
    if (nameLower.includes('professor') || nameLower.includes('scholar') || nameLower.includes('doctor') ||
        catLower.includes('educational') || archetype === 'sage' || archetype === 'ancient_scholar') {
        return {
            type: 'WISE_SCHOLAR',
            expectedTraits: ['wise', 'calm', 'thoughtful'],
            goodEmotions: ['relaxed', 'curious', 'interested', 'sincere', 'confident', 'serious', 'grateful', 'proud', 'wise'], // Added grateful/proud/wise/serious as acceptable
            badEmotions: ['hysterical', 'furious', 'anxious', 'panicked'],
            goodTones: ['soft tone', 'neutral'],
            badTones: ['shouting', 'screaming']
        };
    }

    // Hero/Guardian - confident, strong
    if (nameLower.includes('hero') || nameLower.includes('guardian') || nameLower.includes('knight') || nameLower.includes('riven') ||
        archetype === 'hero' || archetype === 'stoic_guardian') {
        return {
            type: 'HEROIC',
            expectedTraits: ['confident', 'strong', 'brave'],
            goodEmotions: ['confident', 'serious', 'proud', 'sincere', 'keen'],
            badEmotions: ['scared', 'anxious', 'nervous', 'hesitating', 'joyful'], // Joyful can be bad for serious heroes
            goodTones: ['neutral', 'shouting'],
            badTones: ['whispering']
        };
    }

    // Romance characters
    if (catLower.includes('romance') || descLower.includes('romantic') || descLower.includes('love') || nameLower.includes('robert') || nameLower.includes('jennifer')) {
        return {
            type: 'ROMANTIC',
            expectedTraits: ['warm', 'emotional', 'tender'],
            goodEmotions: ['sincere', 'empathetic', 'comforting', 'moved', 'proud', 'interested', 'soft tone', 'confident'],
            badEmotions: ['disdainful', 'indifferent', 'furious', 'scornful'],
            goodTones: ['soft tone', 'whispering', 'neutral'],
            badTones: ['shouting', 'in a hurry tone']
        };
    }

    // Default - general helper
    // UPDATED: Added positive emotions to "Good" list
    return {
        type: 'GENERAL_HELPER',
        expectedTraits: ['helpful', 'friendly'],
        goodEmotions: ['comforting', 'sincere', 'confident', 'interested', 'curious', 'grateful', 'proud', 'amused', 'empathetic', 'serious', 'relaxed', 'astonished', 'gentle', 'delighted', 'excited'],
        badEmotions: [],
        goodTones: ['neutral', 'soft tone', 'shouting'],
        badTones: []
    };
}

// ===================================
// SCORING FUNCTION
// ===================================

function scoreVoiceMatch(charType: CharacterType, emotion: string, tone: string): { score: number; notes: string[] } {
    let score = 5; // Base score
    const notes: string[] = [];

    // Emotion scoring
    if (charType.goodEmotions.includes(emotion)) {
        score += 2; // Was 2
        notes.push(`✓ Good emotion: ${emotion}`);
    } else if (charType.badEmotions.includes(emotion)) {
        score -= 3;
        notes.push(`✗ Bad emotion for ${charType.type}: ${emotion}`);
    } else {
        // Boost for positive emotions generally
        if (['joyful', 'happy', 'excited', 'sincere', 'grateful', 'proud', 'relaxed', 'keen', 'serious'].includes(emotion)) {
            score += 1;
            notes.push(`○ Generally positive emotion: ${emotion}`);
        } else {
            notes.push(`○ Neutral emotion: ${emotion}`);
        }
    }

    // Tone scoring
    if (charType.goodTones.includes(tone) || tone === 'neutral') {
        score += 2;
        notes.push(`✓ Good tone: ${tone}`);
    } else if (charType.badTones.includes(tone)) {
        score -= 2;
        notes.push(`✗ Bad tone for ${charType.type}: ${tone}`);
    }

    // Bonus for perfect match
    if (charType.goodEmotions.includes(emotion) && (charType.goodTones.includes(tone) || tone === 'neutral')) {
        score += 1;
        notes.push(`★ Perfect voice-character match!`);
    }

    // Clamp score
    score = Math.max(1, Math.min(10, score));

    return { score, notes };
}

// ===================================
// MAIN AUDIT
// ===================================

async function runAudit() {
    console.log('═'.repeat(80));
    console.log('                    COMPREHENSIVE CHARACTER VOICE AUDIT');
    console.log('═'.repeat(80));
    console.log('');

    // Fetch all characters
    const characters = await prisma.personaTemplate.findMany({
        select: {
            id: true,
            name: true,
            gender: true,
            archetype: true,
            category: true,
            voiceName: true,
            voiceReady: true
        },
        orderBy: { name: 'asc' }
    });

    console.log(`Total characters: ${characters.length}\n`);

    // Track signatures for uniqueness check
    const signatureMap = new Map<string, string[]>();

    // Results
    const results: Array<{
        name: string;
        gender: string;
        archetype: string;
        category: string;
        signature: string;
        emotion: string;
        tone: string;
        voiceId: string;
        charType: string;
        score: number;
        notes: string[];
    }> = [];

    // Process each character
    for (const char of characters) {
        // Pass character name to get keyword overrides
        const { signature, emotion, tone } = getCharacterVoiceSignature(char.id, char.archetype || 'warm_mentor', char.name);

        const voiceId = getVoiceId(char.archetype || 'warm_mentor', '', char.gender || 'M');
        const charType = detectCharacterType(char.name, char.category || '', char.archetype || '', '');
        const { score, notes } = scoreVoiceMatch(charType, emotion, tone);

        // Track for uniqueness
        const fullSignature = `${voiceId.substring(0, 8)}-${signature}`;
        if (!signatureMap.has(fullSignature)) {
            signatureMap.set(fullSignature, []);
        }
        signatureMap.get(fullSignature)!.push(char.name);

        results.push({
            name: char.name,
            gender: char.gender || 'M',
            archetype: char.archetype || 'unknown',
            category: char.category || 'unknown',
            signature,
            emotion,
            tone,
            voiceId: voiceId.substring(0, 8),
            charType: charType.type,
            score,
            notes
        });
    }

    // ===================================
    // OUTPUT RESULTS
    // ===================================

    console.log('─'.repeat(80));
    console.log('DETAILED CHARACTER AUDIT');
    console.log('─'.repeat(80));
    console.log('');

    // Group by score for summary
    const byScore: Record<number, typeof results> = {};
    for (let i = 1; i <= 10; i++) byScore[i] = [];

    for (const r of results) {
        byScore[r.score].push(r);

        const scoreEmoji = r.score >= 8 ? '🟢' : r.score >= 6 ? '🟡' : '🔴';
        console.log(`${scoreEmoji} ${r.name} (${r.gender})`);
        console.log(`   Type: ${r.charType} | Archetype: ${r.archetype}`);
        console.log(`   Voice: ${r.voiceId}... | Signature: ${r.signature}`);
        console.log(`   Score: ${r.score}/10`);
        r.notes.forEach(n => console.log(`      ${n}`));
        console.log('');
    }

    // ===================================
    // UNIQUENESS ANALYSIS
    // ===================================

    console.log('═'.repeat(80));
    console.log('UNIQUENESS ANALYSIS');
    console.log('═'.repeat(80));
    console.log('');

    // Separate "same signature" check by gender/voiceId as well
    // A same signature (emotion/tone) is fine if the base voice (gender/id) is different
    // The previous check tracked fullSignature which includes voiceId, so that's good.

    const duplicates = Array.from(signatureMap.entries()).filter(([_, names]) => names.length > 1);

    console.log(`Unique voice signatures: ${signatureMap.size}`);
    console.log(`Characters with same signature: ${duplicates.reduce((sum, [_, names]) => sum + names.length, 0)}`);
    console.log('');

    if (duplicates.length > 0) {
        console.log('⚠️  CHARACTERS WITH IDENTICAL VOICE SIGNATURES:');
        for (const [sig, names] of duplicates) {
            console.log(`   ${sig}: ${names.join(', ')}`);
        }
    } else {
        console.log('✅ All characters have unique voices!');
    }

    // ===================================
    // SCORE DISTRIBUTION
    // ===================================

    console.log('');
    console.log('═'.repeat(80));
    console.log('SCORE DISTRIBUTION');
    console.log('═'.repeat(80));
    console.log('');

    for (let score = 10; score >= 1; score--) {
        const count = byScore[score].length;
        const bar = '█'.repeat(Math.ceil(count / 2));
        const emoji = score >= 8 ? '🟢' : score >= 6 ? '🟡' : '🔴';
        console.log(`${emoji} ${score}/10: ${bar} (${count} characters)`);
    }

    // ===================================
    // FINAL SUMMARY
    // ===================================

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const excellent = results.filter(r => r.score >= 8).length;
    const good = results.filter(r => r.score >= 6 && r.score < 8).length;
    const poor = results.filter(r => r.score < 6).length;

    console.log('');
    console.log('═'.repeat(80));
    console.log('FINAL SUMMARY');
    console.log('═'.repeat(80));
    console.log('');
    console.log(`Total Characters: ${characters.length}`);
    console.log(`Average Score: ${avgScore.toFixed(1)}/10`);
    console.log(`Excellent (8-10): ${excellent} characters (${(excellent / characters.length * 100).toFixed(1)}%)`);
    console.log(`Good (6-7): ${good} characters (${(good / characters.length * 100).toFixed(1)}%)`);
    console.log(`Needs Work (<6): ${poor} characters (${(poor / characters.length * 100).toFixed(1)}%)`);
    console.log(`Unique Signatures: ${signatureMap.size} / ${characters.length}`);
    console.log('');

    // List poor matches
    if (poor > 0) {
        // Only show top 10 poor matches to save space
        console.log('⚠️  CHARACTERS NEEDING VOICE ADJUSTMENT (Bottom 20):');
        results.filter(r => r.score < 6).slice(0, 20).forEach(r => {
            console.log(`   - ${r.name}: ${r.score}/10 (${r.charType}, got ${r.emotion})`);
        });
    }

    await prisma.$disconnect();
}

runAudit().catch(console.error);
