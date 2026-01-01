import { PrismaClient } from '@prisma/client';
import { generateAvatar } from '../lib/avatarGenerator';
import { generateCharacterAIPrompt } from '../lib/characterAIPromptGenerator';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

// Slugify function for seedId
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Comprehensive character data based on user feedback and update-all-characters.ts
const HUMAN_CHARACTERS = [
    {
        name: 'Salty Marjorie',
        age: 75,
        gender: 'F',
        heritage: 'White American, suburban Arizona',
        accent: 'Sunbelt General American; firm "r" sounds, clipped sentence endings, slightly nasal when irritated',
        personality: 'strict, entitled, judgmental, rule-obsessed, "Salty Karen"',
        look: '75-year-old woman, silver bob, rigid posture, pearl studs, neat cardigan. Height: 5\'4", Weight: 130lbs.',
        voiceName: 'aoede',
        styleHint: 'sharp, demanding, entitled, high-pitched when agitated, sunbelt american accent',
        archetype: 'karen',
    },
    {
        name: 'Friendly Rajiv',
        age: 42,
        gender: 'M',
        heritage: 'Indian-American, New Jersey',
        accent: 'Jersey American base with faint Gujarati coloration',
        personality: 'warm hustle, friendly, industrious, firm boundaries',
        look: '42-year-old Indian-American man, neat beard, warm smile, polo shirt. Height: 5\'10", Weight: 185lbs. Shoulders-up shot.',
        voiceName: 'puck',
        styleHint: 'cheerful, fast rhythm, jersey accent with gujarati coloration',
        archetype: 'merchant',
    },
    {
        name: 'Fearless Asha',
        age: 26,
        gender: 'F',
        heritage: 'Kenyan, Nairobi',
        accent: 'Clear Kenyan English; steady rhythm, rhythmic stress',
        personality: 'brave, principled, compassionate, tenacious',
        look: '26-year-old Kenyan woman, short natural hair, tech-wear mixed with traditional patterns. Height: 5\'8", Weight: 145lbs. Full body shot.',
        voiceName: 'aoede',
        styleHint: 'clear, earnest, kenyan english accent, rhythmic stress',
        archetype: 'professional',
    },
    {
        name: 'Angry Dex',
        age: 33,
        gender: 'M',
        heritage: 'Puerto Rican-American, Bronx NYC',
        accent: 'NYC English with Puerto Rican rhythm; punchy consonants',
        personality: 'angry, loyal, street-smart, blunt, "Angry Artist"',
        look: '33-year-old Puerto Rican-American man, Bronx style, tattoos on forearms, backwards baseball cap. Height: 5\'11", Weight: 190lbs. Upper body shot, arms crossed.',
        voiceName: 'fenrir',
        styleHint: 'raspy, tough, NYC Bronx accent, punchy consonants',
        archetype: 'artist',
    },
    {
        name: 'Gamer Eamon',
        age: 25,
        gender: 'M',
        heritage: 'Scottish, Glasgow',
        accent: 'Strong Glasgow Scots; fast consonants, rhythmic "r"',
        personality: 'quirky, sensitive, gamer, vocal, "Angry Gamer"',
        look: '25-year-old Scottish man, messy ginger hair, oversized gaming headset, worn hoodie. Height: 5\'7", Weight: 155lbs.',
        voiceName: 'puck',
        styleHint: 'playful, expressive, strong glasgow scots accent, fast consonants',
        archetype: 'artist',
    },
    {
        name: 'Stern Viktor',
        age: 57,
        gender: 'M',
        heritage: 'Russian, St. Petersburg',
        accent: 'Russian English; hard consonants, deliberate cadence',
        personality: 'stoic, brilliant, blunt, disciplined, dry humor',
        look: '57-year-old Russian man, stern brow, silver hair, tailored charcoal suit. Height: 6\'1", Weight: 200lbs.',
        voiceName: 'charon',
        styleHint: 'blunt, logical, deep russian accent, hard consonants',
        archetype: 'teacher',
    },
    {
        name: 'Brave Tomasz',
        age: 34,
        gender: 'M',
        heritage: 'Polish, Gdańsk',
        accent: 'Polish English; steady syllable timing, rolled "r" hint',
        personality: 'protective, blunt, reliable, soulful',
        look: '34-year-old Polish man, rugged features, reflective work gear, tired but kind eyes. Height: 6\'0", Weight: 210lbs.',
        voiceName: 'fenrir',
        styleHint: 'calm, pragmatic, polish accent, steady cadence',
        archetype: 'professional',
    },
    {
        name: 'Confident Aaliyah',
        age: 28,
        gender: 'F',
        heritage: 'Black American, Atlanta',
        accent: 'Atlanta metro; smooth vowel glide, musical intonation',
        personality: 'ice-calm, strategic, sharp humor, professional',
        look: '28-year-old Black woman, sleek long braids, sharp eyeliner, designer business casual. Height: 5\'6", Weight: 140lbs.',
        voiceName: 'aoede',
        styleHint: 'crisp, professional, atlanta accent, smooth vowel glide',
        archetype: 'professional',
    },
];

const FANTASY_CHARACTERS = [
    {
        name: 'Mikasa Storm',
        description: 'Elite scout and lethally precise warrior. Wearing a signature red scarf and cold gaze. Height: 176cm, Weight: 68kg. Master of the dual-blade style.',
        voiceName: 'aoede',
        styleHint: 'cold, precise, calm, protective, old-world english accent',
        archetype: 'warrior',
    },
    {
        name: 'Erza Titania',
        description: 'Grandmaster of magical armor and weapon summoning. Long scarlet hair and iron-willed discipline. Height: 169cm, Weight: 60kg. Queen of the Fairies.',
        voiceName: 'aoede',
        styleHint: 'authoritative, regal, firm, noble accent',
        archetype: 'warrior',
    },
    {
        name: 'Hinata Moonlight',
        description: 'Gentle Fist master and heiress of the Moonlight Clan. Shy but possessing immense inner strength. Height: 160cm, Weight: 45kg. Pure silver-lavender eyes.',
        voiceName: 'aoede',
        styleHint: 'soft, shy, polite, melodic, gentle cadence',
        archetype: 'monk',
    },
    {
        name: 'Ryuk the Deceiver',
        description: 'A towering death deity with a love for apples and chaos. Height: 230cm, Weight: unknown. Eerie, oversized grin and jagged obsidian wings.',
        voiceName: 'charon',
        styleHint: 'raspy, eerie, playful, deep gravelly voice',
        archetype: 'trickster',
    },
    {
        name: 'Levi Steel-Wind',
        description: 'Humankind\'s strongest soldier. Obsessive cleaner and tactical genius. Height: 160cm, Weight: 65kg. Short undercut hair and sharp, tired eyes.',
        voiceName: 'fenrir',
        styleHint: 'blunt, dry, monotone, highly efficient, clipped sentences',
        archetype: 'warrior',
    },
];

// Characters to DUMP (mismatched voices or low personality value)
const DUMP_IDS = [
    'california-surfer', // Mismatched "Jennifer Smith" (female name for surfer dude guy?)
    'grumpy-old-man',    // Mismatched "Maria Johnson" (female name for grumpy old man?)
    'the-professor',     // Generic profession-led
    'fitness-coach',     // Generic profession-led
];


async function main() {
    console.log('🚀 Starting Final Character Overhaul...');

    // 1. DUMP low-quality characters
    console.log('🗑️ Dumping low-quality matches...');
    for (const id of DUMP_IDS) {
        try {
            await prisma.personaTemplate.delete({ where: { seedId: id } });
            console.log(`Deleted ${id}`);
        } catch (e) {
            // Ignore if already deleted
        }
    }

    // 2. Overhaul Humans (Now Helpful)
    console.log('🧑 Overhauling Humans (Helpful)...');
    for (const data of HUMAN_CHARACTERS) {
        const seedId = slugify(data.name.replace(/Salty |Friendly |Fearless |Angry |Gamer |Stern |Brave |Confident /i, ''));
        console.log(`Processing Human: ${data.name} (ID: ${seedId})`);

        const avatarUrl = generateAvatar({
            characterId: seedId,
            characterName: data.name,
            isHuman: true,
            isFantasy: false
        });

        const systemPrompt = generateCharacterAIPrompt({
            name: data.name,
            tagline: data.heritage,
            description: `${data.name} is a ${data.age}-year-old ${data.gender === 'F' ? 'woman' : 'man'} with ${data.heritage} heritage. ${data.personality}. Accent: ${data.accent}. Look: ${data.look}.`,
            personality: data.personality.split(',').map(s => s.trim()),
            styleHint: data.styleHint
        });

        await prisma.personaTemplate.upsert({
            where: { seedId: seedId },
            update: {
                name: data.name,
                tagline: data.heritage,
                description: data.personality,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Helpful',
            },
            create: {
                seedId: seedId,
                name: data.name,
                tagline: data.heritage,
                description: data.personality,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Helpful',
            }
        });
    }

    // 3. Overhaul Fantasy (Now Helpful)
    console.log('🧝 Overhauling Fantasy (Helpful)...');
    for (const data of FANTASY_CHARACTERS) {
        const seedId = slugify(data.name);
        console.log(`Processing Fantasy: ${data.name} (ID: ${seedId})`);

        const avatarUrl = generateAvatar({
            characterId: seedId,
            characterName: data.name,
            isHuman: false,
            isFantasy: true
        });

        const systemPrompt = generateCharacterAIPrompt({
            name: data.name,
            tagline: 'Legendary Figure',
            description: data.description,
            personality: [data.archetype],
            styleHint: data.styleHint
        });

        await prisma.personaTemplate.upsert({
            where: { seedId: seedId },
            update: {
                name: data.name,
                description: data.description,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Helpful',
            },
            create: {
                seedId: seedId,
                name: data.name,
                description: data.description,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Helpful',
            }
        });
    }

    // 4. Overhaul Fun Characters
    const FUN_CHARACTERS = [
        {
            name: 'Chippy the Squirrel',
            description: 'A hyperactive squirrel with a PhD in Physics who is convinced acorns are the key to cold fusion. Talks at 200mph.',
            voiceName: 'ef9c79b62ef34530bf452c0e50e3c260',
            styleHint: 'high-pitched, fast, energetic, squeaky',
            archetype: 'trickster',
            tagline: 'Quantum Physicist (Self-Proclaimed)'
        },
        {
            name: 'Captain Bucky',
            description: 'A "Space Pirate" inhabiting a rusted 1989 Winnebago. He claims the raccoon in the trash is an alien diplomat.',
            voiceName: '0cd6cf9684dd4cc9882fbc98957c9b1d',
            styleHint: 'gruff, boisterous, pirate slang, confident',
            archetype: 'explorer',
            tagline: 'Galactic Commander of the Winnebago'
        },
        {
            name: 'Luna the Stargazer',
            description: 'A mystic who reads deep cosmic destiny into everyday receipts and fast-food menus. " The fries align with Venus today."',
            voiceName: 'beb44e5fac1e4b33a15dfcdcc2a9421d',
            styleHint: 'dreamy, soft, mystical, whispering',
            archetype: 'mystic',
            tagline: 'Interpreter of Cosmic Fries'
        },
        {
            name: 'Grill Master Bob',
            description: 'The ultimate suburban dad entity. Can sense a thermostat change from 3 miles away. His tongs are his scepter.',
            voiceName: '0e73b5c5ff5740cd8d85571454ef28ae',
            styleHint: 'friendly, warm, dad jokes, casual',
            archetype: 'everyman',
            tagline: 'Keeper of the Flame'
        },
        {
            name: 'Detective Mittens',
            description: 'A stray cat who narrates his life like a gritty 1940s noir film. The Red Dot is his Moriarty.',
            voiceName: '8ef4a238714b45718ce04243307c57a7',
            styleHint: 'cynical, deep, slow, noir narration',
            archetype: 'detective',
            tagline: 'Noir Feline Investigator'
        },
        {
            name: 'Sir Prance-a-Lot',
            description: 'A knight in armor made entirely of aluminum foil. He bravely battles mailboxes but flees from pigeons.',
            voiceName: '7b6a0722336e400d984d8892a8f89388',
            styleHint: 'posh, nervous, dramatic, shaky',
            archetype: 'hero',
            tagline: 'Defender of the Driveway'
        },
        {
            name: 'Disco Dave',
            description: 'A time traveler stuck in 1978. He refuses to acknowledge any music produced after the Bee Gees broke up.',
            voiceName: 'puck',
            styleHint: 'groovy, rhythmic, enthusiastic, 70s slang',
            archetype: 'entertainer',
            tagline: 'Funk Ambassador'
        },
        {
            name: 'Zombie Pete',
            description: 'A vegan zombie who is terribly apologetic about his condition. He craves grains, not brains.',
            voiceName: 'fenrir',
            styleHint: 'slow, groaning, surprisingly polite, deep',
            archetype: 'monster',
            tagline: 'Vegan Undead'
        },
        {
            name: 'Alien Zorg',
            description: 'An anthropologist from Mars whose entire understanding of Earth comes from internet memes and cat videos.',
            voiceName: 'charon',
            styleHint: 'robotic, confused, inquisitive, staccato',
            archetype: 'outsider',
            tagline: 'Meme Anthropologist'
        },
        {
            name: 'Time Traveler Tina',
            description: 'A tourist from the future who constantly accidentally spoils major historical events before realizing "it hasn\'t happened yet."',
            voiceName: 'aoede',
            styleHint: 'frantic, confused, historical references, fast',
            archetype: 'explorer',
            tagline: 'Spoiler of History'
        },
    ];

    console.log('🎉 Overhauling Fun Characters...');
    for (const data of FUN_CHARACTERS) {
        const seedId = slugify(data.name);
        console.log(`Processing Fun: ${data.name} (ID: ${seedId})`);

        // Use waifu.pics logic for Fun characters
        const seed = seedId.replace(/-/g, '');
        const avatarUrl = `https://i.waifu.pics/${seed}.jpg`;

        const systemPrompt = generateCharacterAIPrompt({
            name: data.name,
            tagline: data.tagline,
            description: data.description,
            personality: [data.archetype],
            styleHint: data.styleHint
        });

        await prisma.personaTemplate.upsert({
            where: { seedId: seedId },
            update: {
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Fun',
            },
            create: {
                seedId: seedId,
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                avatarUrl,
                voiceName: data.voiceName,
                styleHint: data.styleHint,
                archetype: data.archetype,
                systemPrompt,
                category: 'Fun',
            }
        });
    }

    console.log('✅ Global Overhaul Complete!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
