
import { PrismaClient } from '@prisma/client';
import voiceRegistryData from '../lib/voices/voice_registry.json';

const prisma = new PrismaClient();

// Cast registry to any to iterate
const registry = voiceRegistryData as Record<string, any>;

// =============================================
// VOICE METADATA (Layer 1: Identity)
// Manually mapped for Rich Descriptions
// =============================================

const VOICE_METADATA: Record<string, {
    displayName: string;
    description: string;
    voiceDescription: string;
    referenceAudioPath: string;
    referenceText?: string;
    // Fields below are overrideable defaults
    gender: string;
    ageBand: string;
    originRegion: string;
    accent: string;
    ethnicityAnchor: string;
    authorityLevel: string;
    language: string;
}> = {
    // 1. Eleanor
    'eleanor_ashworth_01': {
        displayName: 'Eleanor Ashworth',
        description: 'Oxford Historian. Dry, deliberate, British academic.',
        voiceDescription: 'Female, middle-aged, elite British academic with a dry, deliberate, and highly educated Received Pronunciation accent.',
        referenceAudioPath: 'voice-samples/sleepless-historian/sample_1.wav', // Keeping her sample
        referenceText: 'The past is not dead, it is merely waiting to be catalogued.',
        gender: 'female', ageBand: 'middle-aged', originRegion: 'england_oxford', accent: 'british_rp',
        ethnicityAnchor: 'white', authorityLevel: 'reserved',
        language: 'en-gb'
    },
    // 2. Arthur Sterling
    'voice_oxford_male_01': {
        displayName: 'Professor Arthur Sterling',
        description: 'The University Archivist. Values silence and primary sources.',
        voiceDescription: 'Elderly, raspy, slow, extremely polite British academic.',
        referenceAudioPath: 'reference_audio/regional/voice_oxford_male_01.mp3', // Placeholder path
        gender: 'male', ageBand: 'elderly', originRegion: 'england_oxford', accent: 'british_rp',
        ethnicityAnchor: 'white', authorityLevel: 'sage', language: 'en-gb'
    },
    // 3. Marcus Thorne
    'voice_professor_us_01': {
        displayName: 'Dr. Marcus Thorne',
        description: 'Particle Physics Professor. Steady, informative, calm.',
        voiceDescription: 'Middle-aged American male, very steady pitch, soothing but intellectual.',
        referenceAudioPath: 'reference_audio/regional/voice_professor_us_01.mp3',
        gender: 'male', ageBand: 'middle-aged', originRegion: 'usa', accent: 'american',
        ethnicityAnchor: 'white', authorityLevel: 'expert', language: 'en-us'
    },
    // 4. Elara Vance
    'voice_philosopher_female_eu_01': {
        displayName: 'Elara Vance',
        description: 'Existential Philosopher. Brooding, heavy pauses.',
        voiceDescription: 'Female, slight French accent, deep, contemplative, melancholic.',
        referenceAudioPath: 'reference_audio/regional/voice_philosopher_female_eu_01.mp3',
        gender: 'female', ageBand: 'adult', originRegion: 'france', accent: 'french_english',
        ethnicityAnchor: 'white', authorityLevel: 'expert', language: 'en'
    },
    // 5. Lucien Vale (Villain)
    'voice_villain_intellectual_male_01': {
        displayName: 'Dr. Lucien Vale',
        description: 'Unethical Neuroscientist. Soft, scary, calculating.',
        voiceDescription: 'Male, smooth, very quiet, zero emotion, terrifyingly polite.',
        referenceAudioPath: 'reference_audio/regional/voice_villain_intellectual_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'uk', accent: 'british_posh',
        ethnicityAnchor: 'white', authorityLevel: 'villain', language: 'en-gb'
    },
    // 6. Countess Vestra
    'voice_villain_elegant_female_01': {
        displayName: 'Countess Vestra',
        description: 'International Crime Lord. Elite, ruthless, bored.',
        voiceDescription: 'Female, Italian accent, languid, high-status, mocking.',
        referenceAudioPath: 'reference_audio/regional/voice_villain_elegant_female_01.mp3',
        gender: 'female', ageBand: 'adult', originRegion: 'italy', accent: 'italian_english',
        ethnicityAnchor: 'white', authorityLevel: 'villain', language: 'en'
    },
    // 7. Kane "The Sledge"
    'voice_villain_brutal_male_01': {
        displayName: 'Kane "The Sledge"',
        description: 'Underworld Enforcer. Gravel, threat, violence.',
        voiceDescription: 'Male, deep raspy growl, rough American accent, aggressive.',
        referenceAudioPath: 'reference_audio/regional/voice_villain_brutal_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'usa', accent: 'american_rough',
        ethnicityAnchor: 'white', authorityLevel: 'brute', language: 'en-us'
    },
    // 8. Silas Vane
    'voice_villain_calm_male_01': {
        displayName: 'Silas Vane',
        description: 'The Corporate Cleaner. Zero empathy.',
        voiceDescription: 'Male, perfectly flat monotone, robotic but human, unsettling.',
        referenceAudioPath: 'reference_audio/regional/voice_villain_calm_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'intl', accent: 'mid_atlantic',
        ethnicityAnchor: 'white', authorityLevel: 'psycho', language: 'en'
    },
    // 9. Sir David
    'voice_narrator_doc_male_01': {
        displayName: 'Sir David W.',
        description: 'Nature Documentarian. Soothing, whispery.',
        voiceDescription: 'Elderly British male, breathy, hushed awe, very precise articulation.',
        referenceAudioPath: 'reference_audio/regional/voice_narrator_doc_male_01.mp3',
        gender: 'male', ageBand: 'elderly', originRegion: 'uk', accent: 'british_rp',
        ethnicityAnchor: 'white', authorityLevel: 'narrator', language: 'en-gb'
    },
    // 10. Sarah Nature
    'voice_narrator_doc_female_01': {
        displayName: 'Sarah Nature',
        description: 'Wildlife Voice. Warm, American, enthusiastic.',
        voiceDescription: 'Female, American, warm, educational, clear projection.',
        referenceAudioPath: 'reference_audio/regional/voice_narrator_doc_female_01.mp3',
        gender: 'female', ageBand: 'adult', originRegion: 'usa', accent: 'american',
        ethnicityAnchor: 'white', authorityLevel: 'narrator', language: 'en-us'
    },
    // 11. Mikey T
    'voice_casual_us_male_01': {
        displayName: 'Mikey T.',
        description: 'Tech Reviewer. Fast, hyper, casual.',
        voiceDescription: 'Young American male, fast speaking rate, pitch varies wildly, energetic.',
        referenceAudioPath: 'reference_audio/regional/voice_casual_us_male_01.mp3',
        gender: 'male', ageBand: 'young', originRegion: 'usa', accent: 'american_cali',
        ethnicityAnchor: 'white', authorityLevel: 'buddy', language: 'en-us'
    },
    // 12. Jessica J-Pop
    'voice_casual_us_female_01': {
        displayName: 'Jessica "J-Pop"',
        description: 'Lifestyle Influencer. Upspeak, vocal fry.',
        voiceDescription: 'Young American female, vocal fry, high upspeak, bubbily.',
        referenceAudioPath: 'reference_audio/regional/voice_casual_us_female_01.mp3',
        gender: 'female', ageBand: 'young', originRegion: 'usa', accent: 'american_valley',
        ethnicityAnchor: 'white', authorityLevel: 'buddy', language: 'en-us'
    },
    // 13. Kenji Sato
    'voice_japanese_hero_male_01': {
        displayName: 'Kenji Sato',
        description: 'Ronin Detective. Stoic, deep.',
        voiceDescription: 'Male, Japanese accent, low pitch, clipped sentences, serious.',
        referenceAudioPath: 'reference_audio/regional/voice_japanese_hero_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'japan', accent: 'japanese_english',
        ethnicityAnchor: 'asian', authorityLevel: 'hero', language: 'en'
    },
    // 14. Director Tanaka
    'voice_japanese_villain_cold_male_01': {
        displayName: 'Director Tanaka',
        description: 'Megacorp CEO. Cold, efficient.',
        voiceDescription: 'Male, Japanese accent, flat affect, precise, ruthless.',
        referenceAudioPath: 'reference_audio/regional/voice_japanese_villain_cold_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'japan', accent: 'japanese_english',
        ethnicityAnchor: 'asian', authorityLevel: 'villain', language: 'en'
    },
    // 15. Mrs. Park
    'voice_korean_worried_mom_female_01': {
        displayName: 'Mrs. Park',
        description: 'Overprotective Mother. Anxious, caring.',
        voiceDescription: 'Female, Korean accent, high emotional variance, fluctuates pitch.',
        referenceAudioPath: 'reference_audio/regional/voice_korean_worried_mom_female_01.mp3',
        gender: 'female', ageBand: 'middle-aged', originRegion: 'korea', accent: 'korean_english',
        ethnicityAnchor: 'asian', authorityLevel: 'mom', language: 'en'
    },
    // 16. Sergeant Choi
    'voice_korean_drill_sergeant_male_01': {
        displayName: 'Sergeant Choi',
        description: 'Special Forces Instructor. Loud, barking.',
        voiceDescription: 'Male, Korean accent, shouting, max volume, sharp attacks.',
        referenceAudioPath: 'reference_audio/regional/voice_korean_drill_sergeant_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'korea', accent: 'korean_english',
        ethnicityAnchor: 'asian', authorityLevel: 'sergeant', language: 'en'
    },
    // 17. Prof Rao
    'voice_indian_teacher_wise_male_01': {
        displayName: 'Professor Rao',
        description: 'Mathematics Mentor. Kindly, musical.',
        voiceDescription: 'Male, Indian accent, melodic rhythm, soft, patient.',
        referenceAudioPath: 'reference_audio/regional/voice_indian_teacher_wise_male_01.mp3',
        gender: 'male', ageBand: 'elderly', originRegion: 'india', accent: 'indian_english',
        ethnicityAnchor: 'asian', authorityLevel: 'mentor', language: 'en'
    },
    // 18. Priya
    'voice_indian_villain_ruthless_female_01': {
        displayName: 'Priya "The Shark"',
        description: 'Tech Baroness. Fast, sharp, cutting.',
        voiceDescription: 'Female, Indian accent, fast speaking rate, clipped, aggressive.',
        referenceAudioPath: 'reference_audio/regional/voice_indian_villain_ruthless_female_01.mp3',
        gender: 'female', ageBand: 'adult', originRegion: 'india', accent: 'indian_english',
        ethnicityAnchor: 'asian', authorityLevel: 'villain', language: 'en'
    },
    // 19. Zayn
    'voice_middle_east_warrior_poet_male_01': {
        displayName: 'Zayn Al-Din',
        description: 'Desert Nomad. Poetic, deep.',
        voiceDescription: 'Male, Middle Eastern accent, deep resonance, slow rhythm.',
        referenceAudioPath: 'reference_audio/regional/voice_middle_east_warrior_poet_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'mideast', accent: 'arabic_english',
        ethnicityAnchor: 'mideast', authorityLevel: 'mystic', language: 'en'
    },
    // 20. General Hakim
    'voice_middle_east_tyrant_male_01': {
        displayName: 'General Hakim',
        description: 'Iron Fist Ruler. Terrifyingly calm.',
        voiceDescription: 'Male, Middle Eastern accent, heavy bass, intimidatingly slow.',
        referenceAudioPath: 'reference_audio/regional/voice_middle_east_tyrant_male_01.mp3',
        gender: 'male', ageBand: 'middle-aged', originRegion: 'mideast', accent: 'arabic_english',
        ethnicityAnchor: 'mideast', authorityLevel: 'villain', language: 'en'
    },
    // 21. Kofi
    'coach_kofi_01': {
        displayName: 'Coach Kofi',
        description: 'Motivational Coach from Ghana. Inspires and uplifts.',
        voiceDescription: 'Male, commanding Ghanaian coach, high-energy, rhythmic.',
        referenceAudioPath: 'reference_audio/regional/voice_west_african_motivation_coach_male_01.mp3',
        referenceText: 'My brother! Today is the day we conquer the mountain together! Are you ready to shine? The strength is in your spirit!',
        gender: 'male', ageBand: 'adult', originRegion: 'west_africa', accent: 'african_english',
        ethnicityAnchor: 'black', authorityLevel: 'commanding', language: 'en'
    },
    // 22. Adaze
    'voice_african_villain_strategist_female_01': {
        displayName: 'Adaze The Architect',
        description: 'Shadow Broker. Quiet, dangerous.',
        voiceDescription: 'Female, Nigerian accent, soft but menacing, deliberate.',
        referenceAudioPath: 'reference_audio/regional/voice_african_villain_strategist_female_01.mp3',
        gender: 'female', ageBand: 'adult', originRegion: 'nigeria', accent: 'african_english',
        ethnicityAnchor: 'black', authorityLevel: 'villain', language: 'en'
    },
    // 23. Carlos
    'voice_latam_gym_coach_strict_male_01': {
        displayName: 'Carlos "El Toro"',
        description: 'Boxing Trainer. Gritty, loud.',
        voiceDescription: 'Male, Latino accent, raspy, loud, aggressive coaching style.',
        referenceAudioPath: 'reference_audio/regional/voice_latam_gym_coach_strict_male_01.mp3',
        gender: 'male', ageBand: 'adult', originRegion: 'mexico', accent: 'mexican_english',
        ethnicityAnchor: 'latino', authorityLevel: 'coach', language: 'en'
    },
    // 24. Sofia
    'voice_latam_angry_karen_female_01': {
        displayName: 'Sofia The Storm',
        description: 'Professional Complainant. High drama.',
        voiceDescription: 'Female, Latino accent, high pitch screech capability, volatile.',
        referenceAudioPath: 'reference_audio/regional/voice_latam_angry_karen_female_01.mp3',
        gender: 'female', ageBand: 'middle-aged', originRegion: 'brazil', accent: 'latino_english',
        ethnicityAnchor: 'latino', authorityLevel: 'karen', language: 'en'
    }
};

async function seedVoiceLibrary() {
    console.log('🎤 Seeding Voice Authority Registry (From JSON)...\n');

    let seeded = 0;

    // Iterate over JSON Registry keys
    for (const voiceId of Object.keys(registry)) {
        const strictDef = registry[voiceId];
        const meta = VOICE_METADATA[voiceId];

        if (!meta) {
            console.warn(`⚠️  No metadata for ${voiceId}, skipping...`);
            continue;
        }

        console.log(`Processing ${voiceId}...`);

        await prisma.voiceIdentity.upsert({
            where: { voiceId: voiceId },
            update: {
                // Layer 1
                displayName: meta.displayName,
                description: meta.description,
                voiceDescription: meta.voiceDescription,
                referenceAudioPath: meta.referenceAudioPath,
                referenceText: meta.referenceText,
                gender: meta.gender,
                ageBand: meta.ageBand,
                originRegion: meta.originRegion,
                accent: meta.accent,
                ethnicityAnchor: meta.ethnicityAnchor,
                authorityLevel: meta.authorityLevel,
                language: meta.language,

                // Layer 2 (From Registry JSON)
                pitchMin: strictDef.lock.pitch_min,
                pitchMax: strictDef.lock.pitch_max,
                speakingRateMin: strictDef.lock.speaking_rate_min,
                speakingRateMax: strictDef.lock.speaking_rate_max,
                energyBaseline: strictDef.lock.energy_baseline,
                aggressionBaseline: strictDef.lock.aggression_baseline,
                articulationPrecision: strictDef.lock.articulation_precision,
                rhythmVariability: strictDef.lock.rhythm_variability,
                warmth: strictDef.lock.warmth,
                roughness: strictDef.lock.roughness,
                accentId: strictDef.lock.accent_id,
                genderLock: strictDef.lock.gender_lock,
                ageLock: strictDef.lock.age_lock,

                // Layer 3 (From Registry JSON)
                voiceProhibitions: JSON.stringify(strictDef.prohibitions),
            },
            create: {
                voiceId: voiceId,
                // Layer 1
                displayName: meta.displayName,
                description: meta.description,
                voiceDescription: meta.voiceDescription,
                referenceAudioPath: meta.referenceAudioPath,
                referenceText: meta.referenceText,
                gender: meta.gender,
                ageBand: meta.ageBand,
                originRegion: meta.originRegion,
                accent: meta.accent,
                ethnicityAnchor: meta.ethnicityAnchor,
                authorityLevel: meta.authorityLevel,
                language: meta.language,

                // Layer 2
                pitchMin: strictDef.lock.pitch_min,
                pitchMax: strictDef.lock.pitch_max,
                speakingRateMin: strictDef.lock.speaking_rate_min,
                speakingRateMax: strictDef.lock.speaking_rate_max,
                energyBaseline: strictDef.lock.energy_baseline,
                aggressionBaseline: strictDef.lock.aggression_baseline,
                articulationPrecision: strictDef.lock.articulation_precision,
                rhythmVariability: strictDef.lock.rhythm_variability,
                warmth: strictDef.lock.warmth,
                roughness: strictDef.lock.roughness,
                accentId: strictDef.lock.accent_id,
                genderLock: strictDef.lock.gender_lock,
                ageLock: strictDef.lock.age_lock,

                // Layer 3
                voiceProhibitions: JSON.stringify(strictDef.prohibitions),
            }
        });

        console.log(`  ✅ LOCKED: ${meta.displayName} (${voiceId})`);
        seeded++;
    }

    console.log(`\n✨ Seeded ${seeded} strict voice identities!`);
}

// Run if executed directly
if (require.main === module) {
    seedVoiceLibrary()
        .catch((e) => {
            console.error('❌ Seed failed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { seedVoiceLibrary };
