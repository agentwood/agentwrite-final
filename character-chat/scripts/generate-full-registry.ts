
import fs from 'fs';
import path from 'path';

// Define the 24 voices based on seed-voice-characters.ts
// We map them to specific attributes
const CHARACTERS = [
    { id: 'eleanor_ashworth_01', gender: 'female', age: 'middle_aged', type: 'scholar', region: 'england_oxford' },
    { id: 'voice_oxford_male_01', gender: 'male', age: 'elderly', type: 'sage', region: 'england_oxford' },
    { id: 'voice_professor_us_01', gender: 'male', age: 'middle_aged', type: 'mentor', region: 'usa' },
    { id: 'voice_philosopher_female_eu_01', gender: 'female', age: 'adult', type: 'philosopher', region: 'france' },
    { id: 'voice_villain_intellectual_male_01', gender: 'male', age: 'adult', type: 'int_villain', region: 'uk' },
    { id: 'voice_villain_elegant_female_01', gender: 'female', age: 'adult', type: 'ruler_villain', region: 'italy' },
    { id: 'voice_villain_brutal_male_01', gender: 'male', age: 'adult', type: 'brute', region: 'usa' },
    { id: 'voice_villain_calm_male_01', gender: 'male', age: 'adult', type: 'psycho', region: 'intl' },
    { id: 'voice_narrator_doc_male_01', gender: 'male', age: 'elderly', type: 'narrator', region: 'uk' },
    { id: 'voice_narrator_doc_female_01', gender: 'female', age: 'adult', type: 'narrator', region: 'usa' },
    { id: 'voice_casual_us_male_01', gender: 'male', age: 'young', type: 'buddy', region: 'usa' },
    { id: 'voice_casual_us_female_01', gender: 'female', age: 'young', type: 'buddy', region: 'usa' },
    { id: 'voice_japanese_hero_male_01', gender: 'male', age: 'adult', type: 'hero', region: 'japan' },
    { id: 'voice_japanese_villain_cold_male_01', gender: 'male', age: 'adult', type: 'cold_villain', region: 'japan' },
    { id: 'voice_korean_worried_mom_female_01', gender: 'female', age: 'middle_aged', type: 'mom', region: 'korea' },
    { id: 'voice_korean_drill_sergeant_male_01', gender: 'male', age: 'adult', type: 'sergeant', region: 'korea' },
    { id: 'voice_indian_teacher_wise_male_01', gender: 'male', age: 'elderly', type: 'mentor', region: 'india' },
    { id: 'voice_indian_villain_ruthless_female_01', gender: 'female', age: 'adult', type: 'exec_villain', region: 'india' },
    { id: 'voice_middle_east_warrior_poet_male_01', gender: 'male', age: 'adult', type: 'mystic', region: 'mideast' },
    { id: 'voice_middle_east_tyrant_male_01', gender: 'male', age: 'middle_aged', type: 'ruler_villain', region: 'mideast' },
    { id: 'coach_kofi_01', gender: 'male', age: 'adult', type: 'coach', region: 'west_africa' },
    { id: 'voice_african_villain_strategist_female_01', gender: 'female', age: 'adult', type: 'int_villain', region: 'nigeria' },
    { id: 'voice_latam_gym_coach_strict_male_01', gender: 'male', age: 'adult', type: 'coach', region: 'mexico' },
    { id: 'voice_latam_angry_karen_female_01', gender: 'female', age: 'middle_aged', type: 'karen', region: 'brazil' },
];

function getLocks(type: string, gender: string, age: string) {
    const base = {
        pitch_min: 100, pitch_max: 150,
        speaking_rate_min: 90, speaking_rate_max: 110,
        energy_baseline: 50, aggression_baseline: 0,
        articulation_precision: 50, rhythm_variability: 50,
        warmth: 50, roughness: 0,
        accent_id: 1, // Default US
        gender_lock: gender === 'male' ? 1 : 0,
        age_lock: age === 'young' ? 0 : age === 'adult' ? 1 : age === 'middle_aged' ? 2 : 3
    };

    if (gender === 'female') { base.pitch_min += 40; base.pitch_max += 40; }
    if (age === 'elderly') { base.speaking_rate_min -= 10; base.speaking_rate_max -= 10; base.roughness += 20; }

    // Archetype tweaks
    if (type.includes('villain')) { base.warmth = 10; base.roughness += 20; base.articulation_precision += 20; }
    if (type.includes('coach') || type === 'sergeant') { base.energy_baseline = 90; base.aggression_baseline = 60; base.speaking_rate_min += 10; }
    if (type === 'sage' || type === 'mentor') { base.warmth = 80; base.speaking_rate_max -= 10; }
    if (type === 'buddy') { base.energy_baseline = 70; base.speaking_rate_min += 10; base.rhythm_variability = 80; }
    if (type === 'narrator') { base.articulation_precision = 95; base.speaking_rate_min = 90; base.speaking_rate_max = 100; base.rhythm_variability = 20; }
    if (type === 'psycho') { base.warmth = 0; base.energy_baseline = 40; base.articulation_precision = 100; base.rhythm_variability = 0; }
    if (type === 'karen') { base.energy_baseline = 90; base.aggression_baseline = 80; base.roughness = 40; }

    return base;
}

const registry: Record<string, any> = {};

CHARACTERS.forEach(char => {
    registry[char.id] = {
        identity: {
            gender: char.gender,
            age_band: char.age,
            origin_region: char.region,
            accent: 'standard', // Simplified
            ethnicity_anchor: 'diverse',
            authority_level: char.type.includes('villain') ? 'absolute' : 'standard'
        },
        lock: getLocks(char.type, char.gender, char.age),
        prohibitions: {
            forbidden_accents: [1, 2], // Block US/UK if not matching (simplified)
            forbidden_genders: [char.gender === 'male' ? 0 : 1],
            forbidden_age_locks: [0], // Block young
            forbidden_energy_ranges: [[0, 20]]
        }
    };
});

console.log(JSON.stringify(registry, null, 4));
