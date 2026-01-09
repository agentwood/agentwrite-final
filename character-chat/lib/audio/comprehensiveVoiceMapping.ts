/**
 * Comprehensive Fish Audio Voice Mapping for All Characters
 * 
 * This script updates the TTS route with unique voice IDs for each character
 * based on their age, gender, heritage, and personality.
 * 
 * Fish Audio Voice IDs from Discovery:
 * - Use these to match characters to appropriate voices
 */

// Curated Fish Audio Voice IDs matched to character profiles
export const COMPREHENSIVE_VOICE_MAP: Record<string, {
    voiceId: string;
    voiceName: string;
    description: string;
    matchReason: string;
}> = {
    // === RECOMMEND CHARACTERS ===
    'marge-halloway': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // ALLE - Elderly American Female
        voiceName: 'ALLE',
        description: 'Elderly American woman, sharp tone',
        matchReason: '75yo HOA enforcer, Sunbelt American, nasal when annoyed'
    },
    'raj-corner-store': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Energetic Male',
        description: 'Warm, friendly mid-range male',
        matchReason: '42yo Indian-American, Jersey accent, warm fast rhythm'
    },
    'camille-laurent': {
        voiceId: 'e58b0d7efca34eb38d5c4985e378abcf', // French Female - Soft
        voiceName: 'French Accent Female',
        description: 'Soft French-accented female',
        matchReason: '37yo French perfumer, soft articulation, intimate cadence'
    },
    'coach-boone': {
        voiceId: 'a1b2c3d4e5f6789012345678abcdef01', // Deep Male Command (Placeholder - kept for now pending real ID)
        voiceName: 'Commanding Male',
        description: 'Strong baritone, military cadence',
        matchReason: '36yo ex-Marine Texas, drill commands, firm voice'
    },
    'yumi-nakamura': {
        voiceId: 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Sleepless Historian
        voiceName: 'Sleepless Historian',
        description: 'Articulate, thoughtful delivery',
        matchReason: 'Japanese-American, warm with Tokyo vowel touches'
    },

    // === PLAY & FUN CHARACTERS ===
    'spongebob': {
        voiceId: '54e3a85ac9594ffa83264b8a494b901b', // SpongeBob SquarePants
        voiceName: 'Cheerful Male',
        description: 'High energy, enthusiastic',
        matchReason: 'SpongeBob SquarePants, extremely cheerful and optimistic'
    },
    'trap-a-holics': { // Corrected key from dj-trap-a-holics to match DB
        voiceId: '0b2e96151d67433d93891f15efc25dbd', // DJ Trap-A-Holics
        voiceName: 'Hype Man Voice',
        description: 'High energy DJ announcer',
        matchReason: 'DJ voice, Atlanta accent, energetic'
    },
    'nico-awkward': {
        voiceId: '68dbf91dff844e8eab1bb90fcf427582', // Nico Awkward
        voiceName: 'Shy Male',
        description: 'Quiet, hesitant delivery',
        matchReason: 'Awkward introvert, quiet, hesitant'
    },
    'doodle-dave': {
        voiceId: '52e0660e03fe4f9a8d2336f67cab5440', // Shares voice with Alex Hype
        voiceName: 'Game Host Dave',
        description: 'High energy West Coast host',
        matchReason: 'Shares voice with Alex Hype'
    },
    'sunny-sato': {
        voiceId: '5161d41404314212af1254556477c17d', // Shares voice with Yumi Nakamura
        voiceName: 'Sunny Sato',
        description: 'Bilingual randomizer character',
        matchReason: 'Shares voice with Yumi Nakamura'
    },

    // === HELPER CHARACTERS ===
    'dr-elena-vasquez': {
        voiceId: 'f742629937b64075a7e7d21f1bec3c64', // Dr. Elena Vasquez
        voiceName: 'Professional Female',
        description: 'Calm, authoritative woman',
        matchReason: '45yo psychiatrist, professional, calming'
    },
    'eloise-durand': {
        voiceId: 'e58b0d7efca34eb38d5c4985e378abcf', // French Female
        voiceName: 'French Instructor',
        description: 'Strict Parisian accent',
        matchReason: 'Strict French instructor, authoritative'
    },
    'cole-briggs': {
        voiceId: 'a1b2c3d4e5f6789012345678abcdef01', // Deep Male Command (Placeholder)
        voiceName: 'Drill Sergeant',
        description: 'Loud commanding military officer',
        matchReason: 'American military, uncompromising effort'
    },
    'oliver-finch': {
        voiceId: 'e5f6g7h8i9j0123456789012345678901', // Gentle Female (placeholder)
        voiceName: 'Gentle Tutor',
        description: 'Soft British delivery',
        matchReason: 'Easygoing Southern British, no rush'
    },
    'mina-kwon': { // Corrected key from mina-kwon-innovator
        voiceId: 'a86d9eac550d4814b9b4f6fc53661930', // Mina Kwon
        voiceName: 'Shy Innovator',
        description: 'Thoughtful, hesitant delivery',
        matchReason: 'Korean-American, modest innovator'
    },
    'harold-whitcombe': {
        voiceId: '0e73b5c5ff5740cd8d85571454ef28ae', // Old Wizard
        voiceName: 'Old Academic',
        description: 'Exacting British historical tone',
        matchReason: 'Old-school British academic, depth and context'
    },
    'valentina-russo': {
        voiceId: 'g7h8i9j0k1l2345678901234567890123', // Confident Female (Placeholder)
        voiceName: 'Tough Love Editor',
        description: 'Sharp Italian-American tone',
        matchReason: 'Direct, decisive writing editor'
    },
    'theo-nguyen': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Study Strategist',
        description: 'Fast, enthusiastic American',
        matchReason: 'Hyper-organized exam prep'
    },
    'rhea-stone': {
        voiceId: 'a9b8c7d6e5f4321098765432abcdef99', // Professional Female (Placeholder)
        voiceName: 'Crisis Leader',
        description: 'Steely international authority',
        matchReason: 'Minimal, prioritizing clarity, no drama'
    },
    'jasper-bloom': {
        voiceId: 'f5e4d3c2b1a098765432109876543210', // Shy Male (Placeholder)
        voiceName: 'Philosophy Guide',
        description: 'Soft contemplative Canadian',
        matchReason: 'Open-ended exploratory philosopher'
    },
    'nora-feld': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // ALLE (sharp)
        voiceName: 'Time Manager',
        description: 'Efficient German-accented',
        matchReason: 'Intolerant of waste, structured'
    },
    'samir-haddad': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Diplomatic Negotiator',
        description: 'Smooth Middle Eastern measured tone',
        matchReason: 'Strategic polite composure'
    },
    'penny-clarke': {
        voiceId: '26ff45fab722431c85eea2536e5c5197', // Shares voice with isabella-reyes
        voiceName: 'Beginner’s Guide',
        description: 'Upbeat Midwestern positivity',
        matchReason: 'Bright cheerful onboarding'
    },
    'victor-hale': {
        voiceId: 'd4e5f6g7h8i9012345678901234567890', // Cool Male (Placeholder)
        voiceName: 'Logic Analyst',
        description: 'Flat analytical objectivity',
        matchReason: 'Emotionally detached logic'
    },
    'elena-morales': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // Default Female
        voiceName: 'Empathetic Mediator',
        description: 'Warm Latin American steady voice',
        matchReason: 'Deeply compassionate mediator'
    },
    'rowan-pike': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Default Male
        voiceName: 'Reluctant Genius',
        description: 'Dry Irish sparse brilliance',
        matchReason: 'Slightly impatient deeply capable'
    },
    'chef-antonio-rossi': {
        voiceId: '30c0f62e3e6d45d88387d1b8f84e1685', // Chef Antonio Rossi
        voiceName: 'Italian Male',
        description: 'Warm Italian accent male',
        matchReason: '58yo Italian chef, warm baritone, musical vowels'
    },
    'professor-okafor': {
        voiceId: '65c0b8155c464a648161af8877404f11', // Professor David Okafor
        voiceName: 'Old Wizard',
        description: 'Deep, wise elderly male',
        matchReason: '62yo professor, Nigerian English, deep wise tone'
    },

    // === ANIME & GAME CHARACTERS ===
    'mikasa-storm': {
        voiceId: 'c1d2e3f4a5b6789012345678abcdef02', // Strong Female (Placeholder)
        voiceName: 'Fierce Female',
        description: 'Strong, determined woman',
        matchReason: 'Anime warrior, fierce, loyal'
    },
    'levi-steel-wind': {
        voiceId: 'd4e5f6g7h8i9012345678901234567890', // Cold Male (Placeholder)
        voiceName: 'Cool Male',
        description: 'Cold, calculated male',
        matchReason: 'Anime captain, cold exterior, sharp'
    },
    'hinata-moonlight': {
        voiceId: 'e5f6g7h8i9j0123456789012345678901', // Gentle Female (Placeholder)
        voiceName: 'Shy Sweet Female',
        description: 'Soft, gentle young woman',
        matchReason: 'Shy anime character, gentle, kind'
    },

    // === ORIGINAL CHARACTERS ===
    'marjorie': {
        voiceId: '59e9dc1cb20c452584788a2690c80970', // ALLE
        voiceName: 'Salty Marjorie',
        description: 'Elderly sharp American woman',
        matchReason: '75yo entitled Karen, sharp nasal tone'
    },
    'rajiv': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Friendly Rajiv',
        description: 'Warm Indian-American man',
        matchReason: '42yo warm hustle, Jersey with Gujarati hints'
    },
    'asha': {
        voiceId: 'f6g7h8i9j0k1234567890123456789012', // Clear Female (Placeholder)
        voiceName: 'Fearless Asha',
        description: 'Clear, determined young woman',
        matchReason: '26yo brave Kenyan, clear steady voice'
    },
    'dex': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic Male
        voiceName: 'Angry Dex',
        description: 'Raspy tough male',
        matchReason: '33yo NYC Bronx, raspy angry tone'
    },
    'aaliyah': {
        voiceId: 'g7h8i9j0k1l2345678901234567890123', // Confident Female (Placeholder)
        voiceName: 'Confident Aaliyah',
        description: 'Confident Atlanta woman',
        matchReason: '28yo Atlanta, confident decisive'
    },

    // === ICON/FICTION CHARACTERS ===
    'grandpa-joe': {
        voiceId: '5e79e8f5d2b345f98baa8c83c947532d', // Grandpa Joe
        voiceName: 'Old Wizard',
        description: 'Wise elderly grandfatherly voice',
        matchReason: '82yo gentle grandpa, wise storytelling'
    },
    'detective-jun': {
        voiceId: '5c71ab35290241ed842d036e4bb0e5da', // Detective Jun
        voiceName: 'Detective Jun',
        description: 'Sharp analytical male',
        matchReason: 'Korean detective, precise analytical'
    },
    'big-tom': {
        voiceId: '65c0b8155c464a648161af8877404f11', // Big Tom
        voiceName: 'Big Tom',
        description: 'Liverpool pub quiz master',
        matchReason: 'Shares voice with Bernard Quinn'
    },

    // Additional VALIDATED mappings from route.ts
    'hoshi-kim': {
        voiceId: '561686c0427b4656b34b960b05b33e56',
        voiceName: 'Hoshi Kim',
        description: 'K-pop trainee',
        matchReason: 'Bubbly girl, excited'
    },
    'alex-hype': {
        voiceId: '52e0660e03fe4f9a8d2336f67cab5440',
        voiceName: 'Alex Hype',
        description: 'WWE-style hype man',
        matchReason: 'Hype man, excited'
    },
    'rei-tanaka': {
        voiceId: '5161d41404314212af1254556477c17d',
        voiceName: 'Rei Tanaka',
        description: 'Game developer',
        matchReason: 'Shares voice with yumi-nakamura'
    },
    'dj-kira-brooks': {
        voiceId: '46745543e52548238593a3962be77e3a',
        voiceName: 'DJ Kira Brooks',
        description: 'Music producer',
        matchReason: 'Shares voice with fuka-shimizu'
    },
    'taesung-lee': {
        voiceId: '41fbe1068fab4c76aa51c8c16bbad2bd',
        voiceName: 'Taesung Lee',
        description: 'Korean storyteller',
        matchReason: 'Korean storyteller'
    },
    'jinwoo-park': {
        voiceId: 'a9574d6184714eac96a0a892b719289f',
        voiceName: 'Jin-woo Park',
        description: 'Korean drama writer',
        matchReason: 'Korean drama writer'
    },
    'hector-alvarez': {
        voiceId: 'b0de63ec40a241abb0ba4b4dc7b222d8',
        voiceName: 'Hector Alvarez',
        description: 'Mexican',
        matchReason: 'Mexican'
    },
    'isabella-reyes': {
        voiceId: '26ff45fab722431c85eea2536e5c5197',
        voiceName: 'Isabella Reyes',
        description: 'Poetic Mexican grandmother',
        matchReason: 'Poetic Mexican grandmother'
    },
    'sofia-vega': {
        voiceId: 'f742629937b64075a7e7d21f1bec3c64',
        voiceName: 'Sofía Vega',
        description: 'Latin American life coach',
        matchReason: 'Latin American life coach'
    },
    'valentino-estrada': {
        voiceId: 'a1fe2e1b6f324e27929d5088f2d09be3',
        voiceName: 'Valentino Estrada',
        description: 'Spanish fashion consultant',
        matchReason: 'Spanish fashion consultant'
    },
    'bernard-quinn': {
        voiceId: '65c0b8155c464a648161af8877404f11',
        voiceName: 'Bernard Quinn',
        description: 'British stoic philosopher',
        matchReason: 'British stoic philosopher'
    },
    'liam-ashford': {
        voiceId: '30c0f62e3e6d45d88387d1b8f84e1685',
        voiceName: 'Liam Ashford',
        description: 'Calm British art curator',
        matchReason: 'Calm British art curator'
    },
    'winston-morris': {
        voiceId: '5e79e8f5d2b345f98baa8c83c947532d',
        voiceName: 'Winston Morris',
        description: 'Warm British storyteller',
        matchReason: 'Warm British storyteller'
    },
    'edmund-blackwell': {
        voiceId: 'e5f3047b09ab468da84ca21e3f511680',
        voiceName: 'Edmund Blackwell',
        description: 'British history professor',
        matchReason: 'British history professor'
    },
    'mana-hayashi': {
        voiceId: 'fbea303b64374bffb8843569404b095e',
        voiceName: 'Mana Hayashi',
        description: 'Friendly hobby enthusiast',
        matchReason: 'Friendly hobby enthusiast'
    },
    'fuka-shimizu': {
        voiceId: '46745543e52548238593a3962be77e3a',
        voiceName: 'Fuka Shimizu',
        description: 'Japanese lifestyle influencer',
        matchReason: 'Japanese lifestyle influencer'
    },
    'adelie-moreau': {
        voiceId: '15799596f2c0443389c90607c7cb5414',
        voiceName: 'Adélie Moreau',
        description: 'French language tutor',
        matchReason: 'French language tutor'
    },
    'camille-beaumont': {
        voiceId: '39ea65c267be4bd6a3ed301520625bb7',
        voiceName: 'Camille Beaumont',
        description: 'French fashion stylist',
        matchReason: 'French fashion stylist'
    },
    'marcus-chen': {
        voiceId: '52e0660e03fe4f9a8d2336f67cab5440',
        voiceName: 'Marcus Chen',
        description: 'Tech entrepreneur',
        matchReason: 'Tech entrepreneur'
    },
    'zara-okonkwo': {
        voiceId: '26ff45fab722431c85eea2536e5c5197',
        voiceName: 'Zara Okonkwo',
        description: 'African fashion designer',
        matchReason: 'African fashion designer'
    },
    'maya-patel': {
        voiceId: 'fbea303b64374bffb8843569404b095e',
        voiceName: 'Maya Patel',
        description: 'Yoga instructor',
        matchReason: 'Yoga instructor'
    },
    'professor-david-okafor': {
        voiceId: '65c0b8155c464a648161af8877404f11',
        voiceName: 'Professor David Okafor',
        description: 'History professor',
        matchReason: 'History professor'
    },
    'sarah-wheeler': {
        voiceId: '15799596f2c0443389c90607c7cb5414',
        voiceName: 'Sarah Wheeler',
        description: 'Adventure guide',
        matchReason: 'Adventure guide'
    },

    // Default/Fallbacks
    '_default_male': {
        voiceId: '802e3bc2b27e49c2995d23ef70e6ac89',
        voiceName: 'Default Male',
        description: 'Generic friendly male voice',
        matchReason: 'Fallback for unmapped male characters'
    },
    '_default_female': {
        voiceId: '59e9dc1cb20c452584788a2690c80970',
        voiceName: 'Default Female',
        description: 'Generic American female voice',
        matchReason: 'Fallback for unmapped female characters'
    },
};

// Function to get voice ID for a character
export function getVoiceForCharacter(seedId: string, gender?: string): string {
    const mapping = COMPREHENSIVE_VOICE_MAP[seedId];
    if (mapping) {
        return mapping.voiceId;
    }

    // Fallback based on gender
    if (gender === 'F' || gender === 'female') {
        return COMPREHENSIVE_VOICE_MAP['_default_female'].voiceId;
    }
    return COMPREHENSIVE_VOICE_MAP['_default_male'].voiceId;
}

console.log('Comprehensive Voice Mapping Loaded');
console.log(`Total mapped characters: ${Object.keys(COMPREHENSIVE_VOICE_MAP).length - 2}`); // Exclude defaults
