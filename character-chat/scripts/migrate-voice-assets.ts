
import fs from 'fs';
import path from 'path';

// SOURCE: Existing Archetype Audio Files (Verified to exist)
const SOURCES = {
    warm_female: 'runpod-chatterbox/profiles/warm_mentor_female/reference.wav',
    warm_male: 'runpod-chatterbox/profiles/warm_mentor_male/reference.wav',
    cold_female: 'runpod-chatterbox/profiles/cold_authority_female/reference.wav',
    cold_male: 'runpod-chatterbox/profiles/cold_authority_male/reference.wav',
    high_energy_female: 'runpod-chatterbox/profiles/high_energy_female/reference.wav',
    high_energy_male: 'runpod-chatterbox/profiles/high_energy_male/reference.wav',
    soft_female: 'runpod-chatterbox/profiles/soft_vulnerable_female/reference.wav',
    soft_male: 'runpod-chatterbox/profiles/soft_vulnerable_male/reference.wav',
    rebellious_female: 'runpod-chatterbox/profiles/rebellious_female/reference.wav',
    rebellious_male: 'runpod-chatterbox/profiles/rebellious_male/reference.wav',
    sage_male: 'runpod-chatterbox/profiles/sage_male/reference.wav',
};

// TARGET: New Specific Voice IDs (Currently missing folders)
const MAPPING: Record<string, string> = {
    // 1. Academics
    'voice_oxford_female_01': SOURCES.cold_female, // Sharp, precise
    'voice_oxford_male_01': SOURCES.sage_male, // Old, wise
    'voice_professor_us_01': SOURCES.warm_male, // Steady, educational
    'voice_philosopher_female_eu_01': SOURCES.soft_female, // Contemplative

    // 2. Villains
    'voice_villain_intellectual_male_01': SOURCES.cold_male, // Cold, calculating
    'voice_villain_elegant_female_01': SOURCES.cold_female, // Elite, ruthless
    'voice_villain_brutal_male_01': SOURCES.rebellious_male, // Rough, aggressive
    'voice_villain_calm_male_01': SOURCES.cold_male, // Flat, psychopathic

    // 3. Narrators
    'voice_narrator_doc_male_01': SOURCES.sage_male, // Authoritative, soothing
    'voice_narrator_doc_female_01': SOURCES.warm_female, // Warm, engaging

    // 4. Casual / Fun
    'voice_casual_us_male_01': SOURCES.high_energy_male, // Fast, energetic
    'voice_casual_us_female_01': SOURCES.high_energy_female, // Bubbly, influencer

    // 5. International / Specific
    'voice_japanese_hero_male_01': SOURCES.cold_male, // Stoic, intense
    'voice_japanese_villain_cold_male_01': SOURCES.cold_male, // Executive, flat
    'voice_korean_worried_mom_female_01': SOURCES.soft_female, // Anxious, loving (closest fit)
    'voice_korean_drill_sergeant_male_01': SOURCES.rebellious_male, // Loud, strict
    'voice_indian_teacher_wise_male_01': SOURCES.warm_male, // Gentle, patient
    'voice_indian_villain_ruthless_female_01': SOURCES.cold_female, // Sharp, fast
    'voice_middle_east_warrior_poet_male_01': SOURCES.soft_male, // Deep, mystic
    'voice_middle_east_tyrant_male_01': SOURCES.cold_male, // Deep, slow
    'voice_west_african_motivation_coach_male_01': SOURCES.high_energy_male, // Loud, joyful
    'voice_african_villain_strategist_female_01': SOURCES.cold_female, // Quiet, calculating
    'voice_latam_gym_coach_strict_male_01': SOURCES.high_energy_male, // Passionate, loud
    'voice_latam_angry_karen_female_01': SOURCES.rebellious_female, // Volatile, dramatic
};

async function migrate() {
    console.log('🚀 Migrating Audio Assets to strictly mapped folders...');

    const baseDir = path.join(process.cwd(), 'runpod-chatterbox/profiles');

    for (const [voiceId, sourceRelPath] of Object.entries(MAPPING)) {
        const sourcePath = path.join(process.cwd(), sourceRelPath);
        const targetDir = path.join(baseDir, voiceId);
        const targetPath = path.join(targetDir, 'reference.wav');

        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Source missing: ${sourceRelPath}`);
            continue;
        }

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Linked: ${voiceId} -> ${sourceRelPath.split('/').slice(-2).join('/')}`);
    }
}

migrate();
