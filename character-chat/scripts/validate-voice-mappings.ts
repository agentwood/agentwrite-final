/**
 * Voice Mapping Validation Script
 * 
 * This script validates and generates correct voice mappings for all characters
 * by analyzing their database entries (name, gender, category, description).
 */

interface CharacterData {
    seedId: string;
    name: string;
    gender: string;  // M, F, or NB
    category: string;
    description: string;
}

// Available base archetypes (from RunPod profiles)
const ARCHETYPES = [
    'cold_authority',   // Stern, commanding, villain-like
    'warm_mentor',      // Friendly, supportive, nurturing
    'high_energy',      // Excited, enthusiastic, upbeat
    'soft_vulnerable',  // Shy, gentle, sensitive
    'sage',             // Wise, calm, knowledgeable
    'rebellious'        // Edgy, anti-establishment
] as const;

// Keywords to help determine archetype
const ARCHETYPE_KEYWORDS = {
    cold_authority: ['stern', 'commander', 'villain', 'detective', 'authority', 'captain', 'sergeant', 'professor', 'lord', 'strict', 'cold', 'intimidating', 'judge', 'vampire', 'demon', 'horror', 'shadow', 'menacing', 'dark'],
    warm_mentor: ['friendly', 'kind', 'mentor', 'guide', 'coach', 'teacher', 'helper', 'warm', 'supportive', 'gentle giant', 'grandpa', 'chef', 'advisor', 'therapist', 'healer', 'companion', 'partner', 'nurturing'],
    high_energy: ['energetic', 'enthusiastic', 'excited', 'hype', 'upbeat', 'DJ', 'entertainer', 'game', 'fun', 'random', 'spongebob', 'cheerful', 'bouncy', 'drama', 'party', 'disco'],
    soft_vulnerable: ['shy', 'quiet', 'introverted', 'awkward', 'gentle', 'soft', 'sensitive', 'vulnerable', 'romantic', 'dreamy', 'delicate', 'nervous', 'timid'],
    sage: ['wise', 'sage', 'philosopher', 'historian', 'scholar', 'ancient', 'knowledgeable', 'calm', 'professor', 'elder', 'wizard', 'elephant', 'intellectual'],
    rebellious: ['rebel', 'hacker', 'punk', 'edgy', 'anti', 'rogue', 'thief', 'pirate', 'outlaw', 'defiant']
};

// Keywords to help determine gender when marked as NB
const GENDER_KEYWORDS = {
    male: ['he', 'him', 'his', 'man', 'male', 'guy', 'gentleman', 'sir', 'mr', 'father', 'brother', 'king', 'lord', 'prince', 'grandpa', 'boy', 'son'],
    female: ['she', 'her', 'woman', 'female', 'lady', 'miss', 'mrs', 'mother', 'sister', 'queen', 'princess', 'grandma', 'girl', 'daughter']
};

function inferGender(char: CharacterData): 'male' | 'female' {
    // If explicitly M or F, use that
    if (char.gender === 'M') return 'male';
    if (char.gender === 'F') return 'female';

    // For NB, try to infer from name and description
    const text = `${char.name} ${char.description}`.toLowerCase();

    // Check for female indicators
    const femaleScore = GENDER_KEYWORDS.female.filter(kw => text.includes(kw)).length;
    const maleScore = GENDER_KEYWORDS.male.filter(kw => text.includes(kw)).length;

    // Default to male if unsure (more neutral-sounding fallback)
    return femaleScore > maleScore ? 'female' : 'male';
}

function inferArchetype(char: CharacterData): string {
    const text = `${char.name} ${char.description} ${char.category}`.toLowerCase();

    // Score each archetype
    const scores: Record<string, number> = {};

    for (const [archetype, keywords] of Object.entries(ARCHETYPE_KEYWORDS)) {
        scores[archetype] = keywords.filter(kw => text.includes(kw)).length;
    }

    // Find highest scoring archetype
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // If no clear winner, use defaults based on category
    if (sorted[0][1] === 0) {
        // Category-based defaults
        if (char.category.toLowerCase().includes('fun') || char.category.toLowerCase().includes('play')) {
            return 'high_energy';
        }
        if (char.category.toLowerCase().includes('help')) {
            return 'warm_mentor';
        }
        if (char.category.toLowerCase().includes('horror') || char.category.toLowerCase().includes('villain')) {
            return 'cold_authority';
        }
        if (char.category.toLowerCase().includes('romance')) {
            return 'soft_vulnerable';
        }
        if (char.category.toLowerCase().includes('education')) {
            return 'sage';
        }
        // Default fallback
        return 'warm_mentor';
    }

    return sorted[0][0];
}

// Parse the database output and generate mappings
const dbOutput = `
fighter-champion|Vex Frostwind|F|Adventure|Fighter champion
shaman-spirit|Vex Bloodmoon|F|Comedy|Shaman spirit
edmund-blackwell|Professor Edmund Blackwell|NB|Educational|Professor
forest-guardian|Vex Ironforge|M|Fantasy|Forest guardian
bernard-quinn|Bernard Quinn|NB|Fiction & Media|Fiction writer
jack_sterling|Captain Jack Sterling|M|Fiction & Media|Charming captain
detective-jun|Detective Jun Park|M|Fiction & Media|Sharp detective
taesung-lee|Taesung 'Story' Lee|M|Fiction & Media|Storyteller
alien-zorg|Alien Zorg|NB|Fun|Alien character
captain-bucky|Captain Bucky|NB|Fun|Fun captain
chippy-the-squirrel|Chippy the Squirrel|NB|Fun|Squirrel character
detective-mittens|Detective Mittens|NB|Fun|Cat detective
disco-dave|Disco Dave|NB|Fun|Disco dancer
dr_lucien_vale|Dr. Lucien Vale|NB|Fun|Villain character
grill-master-bob|Grill Master Bob|NB|Fun|BBQ expert
luna-the-stargazer|Luna the Stargazer|NB|Fun|Dreamy stargazer
sir-prance-a-lot|Sir Prance-a-Lot|NB|Fun|Dancing knight
time-traveler-tina|Time Traveler Tina|NB|Fun|Time traveler
zombie-pete|Zombie Pete|NB|Fun|Zombie
`;

console.log('// Generated voice mappings for all characters');
console.log('const CHARACTER_ARCHETYPE_MAP: Record<string, { archetype: string; gender: string }> = {');

// Process each line
const lines = dbOutput.trim().split('\n').filter(l => l.includes('|'));
for (const line of lines) {
    const parts = line.split('|');
    if (parts.length >= 4) {
        const char: CharacterData = {
            seedId: parts[0].trim(),
            name: parts[1].trim(),
            gender: parts[2].trim(),
            category: parts[3].trim(),
            description: parts[4]?.trim() || ''
        };

        const archetype = inferArchetype(char);
        const gender = inferGender(char);

        console.log(`  '${char.seedId}': { archetype: '${archetype}', gender: '${gender}' }, // ${char.name}`);
    }
}

console.log('};');
