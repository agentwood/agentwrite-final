
/**
 * Verify Virtual Archetype Logic
 * 
 * Simulates the logic in route.ts to ensure virtual archetypes
 * resolve to the correct base profile and parameters.
 */

// Virtual Profiles Definition (Copied from route.ts for verification)
const VIRTUAL_PROFILES: Record<string, { base: string, gender: string, pitch: number, speed: number, exaggeration: number }> = {
    // === MALE VARIANTS ===
    'deep_commander': { base: 'cold_authority', gender: 'male', pitch: -2.0, speed: 0.9, exaggeration: 0.5 },
    'gruff_veteran': { base: 'cold_authority', gender: 'male', pitch: -1.0, speed: 0.9, exaggeration: 0.3 },
    'cheerful_youth': { base: 'high_energy', gender: 'male', pitch: 1.5, speed: 1.15, exaggeration: 0.6 },
    'nervous_wreck': { base: 'soft_vulnerable', gender: 'male', pitch: 0.5, speed: 1.1, exaggeration: 0.8 },
    'ancient_being': { base: 'sage', gender: 'male', pitch: -3.0, speed: 0.75, exaggeration: 0.4 },
    'smooth_operator': { base: 'warm_mentor', gender: 'male', pitch: -0.5, speed: 0.95, exaggeration: 0.4 },
    'manic_inventor': { base: 'high_energy', gender: 'male', pitch: 0.5, speed: 1.3, exaggeration: 0.7 },
    'stoic_guardian': { base: 'sage', gender: 'male', pitch: -1.0, speed: 0.9, exaggeration: 0.2 },

    // === FEMALE VARIANTS ===
    'ethereal_spirit': { base: 'soft_vulnerable', gender: 'female', pitch: 1.0, speed: 0.9, exaggeration: 0.5 },
    'matriarch': { base: 'cold_authority', gender: 'female', pitch: -1.5, speed: 0.85, exaggeration: 0.6 },
    'genki_girl': { base: 'high_energy', gender: 'female', pitch: 2.0, speed: 1.2, exaggeration: 0.8 },
    'haughty_noble': { base: 'cold_authority', gender: 'female', pitch: 0.5, speed: 0.95, exaggeration: 0.7 },
    'kind_grandmother': { base: 'warm_mentor', gender: 'female', pitch: -0.5, speed: 0.85, exaggeration: 0.4 },
    'brisk_professional': { base: 'cold_authority', gender: 'female', pitch: 0.0, speed: 1.1, exaggeration: 0.4 },
    'dreamy_waif': { base: 'soft_vulnerable', gender: 'female', pitch: 0.5, speed: 0.8, exaggeration: 0.7 },
    'battle_maiden': { base: 'high_energy', gender: 'female', pitch: -0.5, speed: 1.1, exaggeration: 0.6 }
};

// Simplified Character Map (Sample)
const CHARACTER_ARCHETYPE_MAP: Record<string, { archetype: string; gender: string }> = {
    'nico-awkward': { archetype: 'nervous_wreck', gender: 'male' },
    'dr_lucien_vale': { archetype: 'cold_authority', gender: 'male' }, // Base
    'doodle-dave': { archetype: 'manic_inventor', gender: 'male' },
    'the-elephant': { archetype: 'ancient_being', gender: 'male' },
    'luna-the-stargazer': { archetype: 'dreamy_waif', gender: 'female' },
    'fighter-champion': { archetype: 'battle_maiden', gender: 'female' }
};

function resolveProfile(characterId: string) {
    const eliteConfig = CHARACTER_ARCHETYPE_MAP[characterId];
    if (!eliteConfig) return null;

    const virtualConfig = VIRTUAL_PROFILES[eliteConfig.archetype];
    const finalArchetype = virtualConfig ? virtualConfig.base : eliteConfig.archetype;
    const pitch = virtualConfig ? virtualConfig.pitch : 0.0;
    const speed = virtualConfig ? virtualConfig.speed : 1.0;
    const exaggeration = virtualConfig ? virtualConfig.exaggeration : 0.5;

    return {
        originalArchetype: eliteConfig.archetype,
        finalArchetype,
        pitch,
        speed,
        exaggeration
    };
}

console.log('Verifying Virtual Archetype Resolution:');
console.log('---------------------------------------');

const testCases = [
    'nico-awkward',
    'dr_lucien_vale',
    'doodle-dave',
    'the-elephant',
    'luna-the-stargazer',
    'fighter-champion'
];

testCases.forEach(id => {
    const result = resolveProfile(id);
    console.log(`Character: ${id}`);
    console.log(`  Input Archetype: ${result?.originalArchetype}`);
    console.log(`  Resolved Base:   ${result?.finalArchetype}`);
    console.log(`  Pitch:           ${result?.pitch}`);
    console.log(`  Speed:           ${result?.speed}`);
    console.log('---------------------------------------');
});
