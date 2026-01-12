/**
 * MIGRATE ALL CHARACTERS TO FORMAL SCHEMA
 * 
 * This script:
 * 1. Loads all existing characters from database
 * 2. Infers proper M/F gender from name + description
 * 3. Generates VoiceProfile based on archetype/category
 * 4. Generates tts_spec_string deterministically
 * 5. Validates uniqueness (no pitch+pace+cadence collisions)
 * 6. Updates characters with new schema-compliant data
 */

import { PrismaClient } from '@prisma/client';
import {
    Gender,
    PitchRange,
    AggressionLevel,
    DictionStyle,
    CadenceStyle,
    VoiceProfile,
    generateTTSSpecString,
    generateVoiceHash
} from '../lib/character/schema';

const prisma = new PrismaClient();

// ============================================
// GENDER INFERENCE ENGINE
// ============================================

// Comprehensive name lists for gender detection
const FEMALE_NAMES = new Set([
    'elena', 'maria', 'sarah', 'jennifer', 'emma', 'olivia', 'sophia', 'isabella',
    'mia', 'ava', 'luna', 'julia', 'wendy', 'nancy', 'marjorie', 'camille', 'yuki',
    'priya', 'asha', 'imani', 'nadia', 'victoria', 'catherine', 'alle', 'sunny',
    'mina', 'penny', 'nora', 'valentine', 'rhea', 'adelie', 'maya', 'zara', 'sofia',
    'hinata', 'erza', 'mikasa', 'lisa', 'emily', 'anna', 'rose', 'lily', 'grace',
    'hannah', 'chloe', 'sophie', 'kira', 'valentina', 'elara', 'celeste', 'nova',
    'iris', 'raven', 'fuka', 'scarlett', 'aurora', 'ivy', 'hazel', 'violet',
    'eleanor', 'madeline', 'allison', 'aaliyah', 'aeliana', 'vex', 'nyx'
]);

const MALE_NAMES = new Set([
    'james', 'john', 'michael', 'david', 'robert', 'william', 'richard', 'thomas',
    'mark', 'adam', 'kevin', 'bob', 'pete', 'jack', 'carlos', 'marcus', 'alex',
    'viktor', 'dex', 'tomasz', 'raj', 'kenji', 'nico', 'hector', 'owen', 'soren',
    'miles', 'liam', 'bernard', 'edmund', 'antonio', 'samir', 'victor', 'rowan',
    'jasper', 'theo', 'oliver', 'cole', 'harold', 'joe', 'tony', 'plato', 'tyler',
    'lucien', 'sterling', 'jin', 'taesung', 'hoshi', 'mana', 'valentino', 'winston',
    'eamon', 'draven', 'kael', 'fenrir', 'orion', 'thorin', 'sylas', 'cyrus',
    'zephyr', 'ryuk', 'levi', 'chippy', 'bucky', 'disco', 'zombie', 'alien', 'zorg'
]);

function extractFirstName(fullName: string): string {
    // Remove common titles AND descriptive prefixes
    const withoutTitles = fullName
        .replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?|miss|professor|captain|sergeant|detective|chef|coach|sir|madame|lady|neighbor|influencer|narrator|hype|grill|alien|zombie|time|comfort|daily|real|big|salty|friendly|fearless|angry|gamer|stern|brave|confident|disco|doodle|master)\s*/gi, '')
        .trim();

    // Get first word (the actual first name)
    const firstName = withoutTitles.split(/[\s'"]/)[0].toLowerCase();
    return firstName;
}

function inferGender(name: string, description: string, currentGender: string | null): Gender {
    // ALWAYS re-evaluate using first name priority (don't trust existing gender)
    // This fixes previously misgendered characters like "Dr. Elena" → "Elena" → female
    const firstName = extractFirstName(name);

    if (FEMALE_NAMES.has(firstName)) {
        return 'female';
    }
    if (MALE_NAMES.has(firstName)) {
        return 'male';
    }

    // PRIORITY 2: Check description for gender pronouns
    const descLower = (description || '').toLowerCase();
    if (descLower.includes('she ') || descLower.includes('her ') || descLower.includes(' woman')) {
        return 'female';
    }
    if (descLower.includes('he ') || descLower.includes('his ') || descLower.includes(' man')) {
        return 'male';
    }

    // PRIORITY 3: Check full name for additional female/male indicators
    const nameLower = name.toLowerCase();

    // Female name endings
    if (nameLower.endsWith('a') || nameLower.endsWith('ie') || nameLower.endsWith('ina') || nameLower.endsWith('ella')) {
        return 'female';
    }

    // Default to male for truly ambiguous cases (can be reviewed)
    return 'male';
}

// ============================================
// VOICE PROFILE GENERATION ENGINE
// ============================================

// Map archetypes to base voice profiles
const ARCHETYPE_VOICE_MAP: Record<string, Partial<VoiceProfile>> = {
    // Authority & Power
    'cold_authority': { pitch_range: 'low', speaking_pace: 0.90, aggression_level: 'medium', diction_style: 'crisp', cadence_style: 'controlled' },
    'dark_manipulator': { pitch_range: 'low', speaking_pace: 0.85, aggression_level: 'medium-low', diction_style: 'polished', cadence_style: 'restrained' },
    'ruthless_operator': { pitch_range: 'low', speaking_pace: 0.95, aggression_level: 'medium', diction_style: 'crisp', cadence_style: 'controlled' },

    // Mentorship & Support
    'warm_mentor': { pitch_range: 'mid', speaking_pace: 0.95, aggression_level: 'low', diction_style: 'neutral', cadence_style: 'steady' },
    'gentle_companion': { pitch_range: 'mid-high', speaking_pace: 0.90, aggression_level: 'none', diction_style: 'casual', cadence_style: 'steady' },
    'mentor': { pitch_range: 'mid', speaking_pace: 0.95, aggression_level: 'low', diction_style: 'neutral', cadence_style: 'steady' },
    'helper': { pitch_range: 'mid', speaking_pace: 1.00, aggression_level: 'none', diction_style: 'neutral', cadence_style: 'steady' },

    // Intelligence & Analysis
    'analytical_observer': { pitch_range: 'mid-low', speaking_pace: 0.95, aggression_level: 'very-low', diction_style: 'formal', cadence_style: 'consistent' },
    'ancient_scholar': { pitch_range: 'low', speaking_pace: 0.85, aggression_level: 'very-low', diction_style: 'formal', cadence_style: 'steady' },
    'sage': { pitch_range: 'low', speaking_pace: 0.85, aggression_level: 'very-low', diction_style: 'formal', cadence_style: 'steady' },

    // Energy & Chaos
    'playful_trickster': { pitch_range: 'mid-high', speaking_pace: 1.15, aggression_level: 'low', diction_style: 'expressive', cadence_style: 'uneven' },
    'energetic_motivator': { pitch_range: 'mid-high', speaking_pace: 1.10, aggression_level: 'low', diction_style: 'expressive', cadence_style: 'dramatic' },
    'chaotic_genius': { pitch_range: 'mid', speaking_pace: 1.15, aggression_level: 'medium-low', diction_style: 'expressive', cadence_style: 'uneven' },
    'trickster': { pitch_range: 'mid-high', speaking_pace: 1.10, aggression_level: 'low', diction_style: 'expressive', cadence_style: 'uneven' },
    'entertainer': { pitch_range: 'mid-high', speaking_pace: 1.10, aggression_level: 'low', diction_style: 'expressive', cadence_style: 'dramatic' },

    // Stoicism & Protection
    'stoic_guardian': { pitch_range: 'low', speaking_pace: 0.90, aggression_level: 'low', diction_style: 'crisp', cadence_style: 'controlled' },
    'guardian': { pitch_range: 'mid-low', speaking_pace: 0.95, aggression_level: 'low', diction_style: 'crisp', cadence_style: 'controlled' },
    'reluctant_hero': { pitch_range: 'mid', speaking_pace: 0.95, aggression_level: 'very-low', diction_style: 'casual', cadence_style: 'uneven' },

    // Diplomacy
    'noble_diplomat': { pitch_range: 'mid', speaking_pace: 1.00, aggression_level: 'very-low', diction_style: 'polished', cadence_style: 'balanced' },

    // Cynicism
    'cynical_realist': { pitch_range: 'mid-low', speaking_pace: 0.95, aggression_level: 'medium-low', diction_style: 'casual', cadence_style: 'uneven' },

    // Art/Creativity
    'artist': { pitch_range: 'mid', speaking_pace: 0.90, aggression_level: 'none', diction_style: 'expressive', cadence_style: 'uneven' },

    // Innocent
    'innocent': { pitch_range: 'mid-high', speaking_pace: 1.05, aggression_level: 'none', diction_style: 'casual', cadence_style: 'uneven' },

    // Default
    'default': { pitch_range: 'mid', speaking_pace: 1.00, aggression_level: 'low', diction_style: 'neutral', cadence_style: 'steady' }
};

// Generate unique speaking_pace to avoid collisions
// Uses a simple counter to ensure uniqueness
let characterIndex = 0;

function getUniquePace(basePace: number): number {
    // Use character index to create unique pace
    // Spread across range [0.80, 1.20] in 0.01 increments
    const offset = (characterIndex * 0.01) % 0.40;
    let pace = 0.80 + offset;
    characterIndex++;
    return Number(pace.toFixed(2));
}

function generateVoiceProfile(
    gender: Gender,
    archetype: string | null,
    description: string | null
): VoiceProfile {
    const archetypeLower = (archetype || 'default').toLowerCase().replace(/\s+/g, '_');
    const baseProfile = ARCHETYPE_VOICE_MAP[archetypeLower] || ARCHETYPE_VOICE_MAP['default'];

    // Adjust pitch based on gender
    let pitch: PitchRange = baseProfile.pitch_range || 'mid';
    if (gender === 'female' && (pitch === 'low' || pitch === 'mid-low')) {
        pitch = 'mid'; // Shift up for female voices
    }
    if (gender === 'male' && (pitch === 'high' || pitch === 'mid-high')) {
        pitch = 'mid'; // Shift down for male voices
    }

    // Get unique pace
    const basePace = baseProfile.speaking_pace || 1.00;
    const uniquePace = getUniquePace(basePace);

    // Infer tone style from description
    let toneStyle = 'neutral';
    const descLower = (description || '').toLowerCase();
    if (descLower.includes('warm') || descLower.includes('friendly')) toneStyle = 'warm, friendly';
    else if (descLower.includes('gruff') || descLower.includes('grumpy')) toneStyle = 'gruff, irritable';
    else if (descLower.includes('calm') || descLower.includes('soothing')) toneStyle = 'calm, soothing';
    else if (descLower.includes('energetic') || descLower.includes('enthusiastic')) toneStyle = 'energetic, enthusiastic';
    else if (descLower.includes('mysterious') || descLower.includes('dark')) toneStyle = 'mysterious, ominous';
    else if (descLower.includes('professional') || descLower.includes('clinical')) toneStyle = 'professional, clinical';
    else if (descLower.includes('playful') || descLower.includes('fun')) toneStyle = 'playful, lighthearted';

    const voiceProfile: VoiceProfile = {
        voice_gender: gender,
        pitch_range: pitch,
        tone_style: toneStyle,
        speaking_pace: uniquePace,
        aggression_level: baseProfile.aggression_level || 'low',
        diction_style: baseProfile.diction_style || 'neutral',
        cadence_style: baseProfile.cadence_style || 'steady',
        tts_spec_string: '' // Will be generated
    };

    // Generate TTS spec string
    voiceProfile.tts_spec_string = generateTTSSpecString(voiceProfile);

    return voiceProfile;
}

// ============================================
// MAIN MIGRATION
// ============================================

async function main() {
    console.log('🔄 Migrating all characters to formal schema...\n');

    // Load all existing characters
    const characters = await prisma.personaTemplate.findMany();
    console.log(`📊 Found ${characters.length} characters to migrate\n`);

    const updates: { id: string; name: string; gender: Gender; pace: number; errors: string[] }[] = [];
    const collisions: { char1: string; char2: string; hash: string }[] = [];
    const voiceHashes = new Map<string, string>();

    for (const char of characters) {
        // Skip canonical characters (already properly formatted)
        if (char.seedId?.startsWith('doctor_') ||
            char.seedId?.startsWith('detective_') ||
            char.seedId?.startsWith('inspector_') ||
            char.seedId?.startsWith('villain_') ||
            char.seedId?.startsWith('professor_male_us') ||
            char.seedId?.startsWith('professor_female') ||
            char.seedId?.startsWith('news_anchor') ||
            char.seedId?.startsWith('taxi_driver') ||
            char.seedId?.startsWith('shopkeeper_female')) {
            console.log(`  ⏭️  Skipping canonical: ${char.name}`);
            continue;
        }

        // Infer gender
        const inferredGender = inferGender(char.name, char.description || '', char.gender);
        const dbGender = inferredGender === 'male' ? 'M' : 'F';

        // Generate voice profile
        const voiceProfile = generateVoiceProfile(
            inferredGender,
            char.archetype,
            char.description
        );

        // Check for collisions
        const hash = generateVoiceHash(voiceProfile);
        if (voiceHashes.has(hash)) {
            collisions.push({
                char1: char.name,
                char2: voiceHashes.get(hash)!,
                hash
            });
        } else {
            voiceHashes.set(hash, char.name);
        }

        // Update character
        try {
            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: {
                    gender: dbGender,
                    ttsVoiceSpec: voiceProfile.tts_spec_string,
                }
            });

            updates.push({
                id: char.id,
                name: char.name,
                gender: inferredGender,
                pace: voiceProfile.speaking_pace,
                errors: []
            });

            console.log(`  ✅ ${char.name} → ${inferredGender.toUpperCase()} | ${voiceProfile.speaking_pace}x`);

        } catch (error: any) {
            updates.push({
                id: char.id,
                name: char.name,
                gender: inferredGender,
                pace: voiceProfile.speaking_pace,
                errors: [error.message]
            });
            console.log(`  ❌ ${char.name} → Error: ${error.message}`);
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));

    const successful = updates.filter(u => u.errors.length === 0);
    const failed = updates.filter(u => u.errors.length > 0);

    console.log(`\n✅ Successfully migrated: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log(`⚠️  Collisions detected: ${collisions.length}`);

    // Gender breakdown
    const males = successful.filter(u => u.gender === 'male');
    const females = successful.filter(u => u.gender === 'female');
    console.log(`\n👤 Gender distribution:`);
    console.log(`   Male: ${males.length}`);
    console.log(`   Female: ${females.length}`);

    if (collisions.length > 0) {
        console.log('\n⚠️  Voice Profile Collisions (need manual review):');
        for (const c of collisions.slice(0, 10)) {
            console.log(`   ${c.char1} ↔ ${c.char2}`);
        }
        if (collisions.length > 10) {
            console.log(`   ... and ${collisions.length - 10} more`);
        }
    }

    if (failed.length > 0) {
        console.log('\n❌ Failed migrations:');
        for (const f of failed) {
            console.log(`   ${f.name}: ${f.errors.join(', ')}`);
        }
    }

    console.log('\n✨ Migration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
