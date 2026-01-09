import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Character Data Fix Script
 * 
 * This script updates characters with:
 * - Proper unique avatar URLs (no duplicates)
 * - Gender field
 * - Voice description (ttsVoiceSpec)
 * - Category/mood
 */

const CHARACTER_UPDATES: Record<string, {
    avatarUrl?: string;
    gender: string;
    ttsVoiceSpec: string;
    category: string;
}> = {
    // === PLAY & FUN CHARACTERS ===
    'SpongeBob SquarePants': {
        avatarUrl: '/characters/spongebob.png',
        gender: 'M',
        ttsVoiceSpec: 'High-pitched; pace 1.15x; energetic; frequent giggles and laughs; optimistic tone; nasally quality.',
        category: 'Play & Fun'
    },
    'Sunny Sato': {
        avatarUrl: '/characters/sunny-sato.png',
        gender: 'F',
        ttsVoiceSpec: 'Bright mezzo; pace 1.10x; enthusiastic; short suspense pauses before reveals; friendly celebratory tone.',
        category: 'Play & Fun'
    },
    'DJ Trap-A-Holics': {
        avatarUrl: '/characters/trap-a-holics.png',
        gender: 'M',
        ttsVoiceSpec: 'Deep bass; pace 1.20x; hype energy; ad-lib style interjections; dramatic pauses; club announcer vibe.',
        category: 'Play & Fun'
    },
    'DJ Kira Brooks': {
        avatarUrl: '/characters/dj-kira-brooks.png',
        gender: 'F',
        ttsVoiceSpec: 'Smooth alto; pace 1.05x; confident; rhythmic speech patterns; cool urban vibe.',
        category: 'Play & Fun'
    },
    'Nico': {
        avatarUrl: '/characters/nico-awkward.png',
        gender: 'M',
        ttsVoiceSpec: 'Mid tenor; pace 1.00x; occasional micro-stutters; shy laughs; brightens when excited.',
        category: 'Play & Fun'
    },
    'Doodle Dave': {
        avatarUrl: '/characters/doodle-dave.png',
        gender: 'M',
        ttsVoiceSpec: 'Energetic tenor; pace 1.12x; bouncy intonation; quick laughs; clear articulation; game host timing.',
        category: 'Play & Fun'
    },
    'Mina "Plot Twist" Kwon': {
        avatarUrl: '/characters/mina-kwon.png',
        gender: 'F',
        ttsVoiceSpec: 'Clear mezzo; pace 1.05x; dramatic pauses; whisper suspense moments; playful gotcha tone.',
        category: 'Play & Fun'
    },
    'Big Tom': {
        avatarUrl: '/characters/big-tom.png',
        gender: 'M',
        ttsVoiceSpec: 'Warm baritone; pace 1.08x; Scouse accent; cheeky cadence; short punchline pauses; big friendly laughs.',
        category: 'Play & Fun'
    },
    "Winston 'Grandpa' Morris": {
        avatarUrl: '/characters/winston-morris.png',
        gender: 'M',
        ttsVoiceSpec: 'Warm gravelly baritone; pace 0.85x; gentle chuckles; storytelling rhythm; nostalgic warmth.',
        category: 'Play & Fun'
    },

    // === HELPER CHARACTERS ===
    'Professor David Okafor': {
        avatarUrl: '/characters/professor-david-okafor.png',
        gender: 'M',
        ttsVoiceSpec: 'Deep baritone; pace 0.90x; Nigerian English; thoughtful pauses; scholarly warmth.',
        category: 'Helper'
    },
    'Grandpa Joe': {
        avatarUrl: '/characters/grandpa-joe.png',
        gender: 'M',
        ttsVoiceSpec: 'Warm gravelly bass; pace 0.80x; gentle wisdom; patient explanations; occasional hearty chuckle.',
        category: 'Helper'
    },
    'The Wise Elephant': {
        avatarUrl: '/characters/wise-elephant.png',
        gender: 'M',
        ttsVoiceSpec: 'Very deep bass; pace 0.75x; long thoughtful pauses; ancient wisdom; calming presence.',
        category: 'Helper'
    },
    'The Sleepless Historian': {
        avatarUrl: '/characters/sleepless-historian.png',
        gender: 'M',
        ttsVoiceSpec: 'Warm baritone; pace 0.88x; smooth narrative flow; captivating storytelling; mysterious undertones.',
        category: 'Helper'
    },
    'The Shadow': {
        avatarUrl: '/characters/the-shadow.png',
        gender: 'NB',
        ttsVoiceSpec: 'Low whisper; pace 0.70x; long pauses; unsettling calm; mysterious and ethereal.',
        category: 'Original'
    },
    'Penny Clarke': {
        avatarUrl: '/characters/penny-clarke.png',
        gender: 'F',
        ttsVoiceSpec: 'Warm mezzo; pace 0.95x; friendly British accent; helpful and patient tone.',
        category: 'Helper'
    },
    'Neighbor Nancy': {
        avatarUrl: '/characters/neighbor-nancy.png',
        gender: 'F',
        ttsVoiceSpec: 'Bright alto; pace 1.05x; curious and chatty; slight Southern charm; neighborly warmth.',
        category: 'Play & Fun'
    },

    // === RECOMMEND CHARACTERS ===
    'Alex "The Hype" Martinez': {
        avatarUrl: '/characters/alex-hype.png',
        gender: 'M',
        ttsVoiceSpec: 'High energy tenor; pace 1.15x; motivational; quick bursts of enthusiasm; sports announcer energy.',
        category: 'Recommend'
    },
    'Hype Coach Tyler': {
        avatarUrl: '/characters/hype-coach-tyler.png',
        gender: 'M',
        ttsVoiceSpec: 'Strong baritone; pace 1.10x; motivational; commanding presence; encouraging cadence.',
        category: 'Recommend'
    },
    'Camille Beaumont': {
        avatarUrl: '/characters/camille-beaumont.png',
        gender: 'F',
        ttsVoiceSpec: 'Low mezzo; pace 0.85x; French accent; warm timbre; soft articulation; slow pauses.',
        category: 'Recommend'
    },
    'Influencer Allé': {
        avatarUrl: '/characters/influencer-alle.png',
        gender: 'F',
        ttsVoiceSpec: 'Bright soprano; pace 1.08x; Gen-Z energy; upspeak; enthusiastic; trendy slang.',
        category: 'Original'
    },
    'Captain Jack Sterling': {
        avatarUrl: '/characters/jack-sterling.png',
        gender: 'M',
        ttsVoiceSpec: 'Rugged baritone; pace 0.92x; confident swagger; dramatic flair; captain authority.',
        category: 'Fiction & Media'
    },
    'Marcus "Blaze" Thompson': {
        avatarUrl: '/characters/marcus-blaze.png',
        gender: 'M',
        ttsVoiceSpec: 'Deep baritone; pace 1.05x; intense focus; competitive edge; athletic confidence.',
        category: 'Recommend'
    },

    // === EDUCATORS/PROFESSIONALS ===
    'Professor Monotone': {
        avatarUrl: '/characters/professor-monotone.png',
        gender: 'M',
        ttsVoiceSpec: 'Flat monotone; pace 0.88x; deliberately boring; occasional dry humor; academic drone.',
        category: 'Play & Fun'
    },
    'Narrator Adam': {
        avatarUrl: '/characters/narrator-adam.png',
        gender: 'M',
        ttsVoiceSpec: 'Smooth baritone; pace 0.90x; documentary narrator style; clear diction; authoritative calm.',
        category: 'Helper'
    },

    // === FICTION CHARACTERS ===
    'Detective Jun': {
        avatarUrl: '/characters/detective-jun.png',
        gender: 'M',
        ttsVoiceSpec: 'Cool baritone; pace 0.95x; Korean accent; methodical; mysterious undertones.',
        category: 'Fiction & Media'
    },
    'Hector Alvarez': {
        avatarUrl: '/characters/hector-alvarez.png',
        gender: 'M',
        ttsVoiceSpec: 'Warm baritone; pace 0.92x; Mexican-American accent; friendly analogies; encouraging.',
        category: 'Helper'
    },

    // === VEX CHARACTERS (Fantasy) ===
    'Vex Frostwind': {
        avatarUrl: '/characters/vex-frostwind.png',
        gender: 'F',
        ttsVoiceSpec: 'Cool mezzo; pace 0.95x; icy calm; warrior confidence; mystical undertones.',
        category: 'Adventure'
    },
    'Vex Bloodmoon': {
        avatarUrl: '/characters/vex-bloodmoon.png',
        gender: 'F',
        ttsVoiceSpec: 'Husky alto; pace 0.90x; dark allure; dangerous edge; seductive danger.',
        category: 'Comedy'
    },
    'Vex Ironforge': {
        avatarUrl: '/characters/vex-ironforge.png',
        gender: 'M',
        ttsVoiceSpec: 'Deep rumbling bass; pace 0.85x; dwarven accent; gruff but caring; forge-master authority.',
        category: 'Fantasy'
    },
    'Vex Skyward': {
        avatarUrl: '/characters/vex-skyward.png',
        gender: 'F',
        ttsVoiceSpec: 'Airy soprano; pace 1.02x; ethereal quality; guardian nobility; protective warmth.',
        category: 'Horror'
    },

    // === ADDITIONAL CHARACTERS ===
    'Yumi Nakamura': {
        avatarUrl: '/characters/yumi-nakamura.png',
        gender: 'F',
        ttsVoiceSpec: 'Soft mezzo; pace 0.95x; Japanese accent; gentle encouragement; patient guidance.',
        category: 'Helper'
    },
    'Zara Okonkwo': {
        avatarUrl: '/characters/zara-okonkwo.png',
        gender: 'F',
        ttsVoiceSpec: 'Rich alto; pace 1.00x; Nigerian accent; creative energy; warm enthusiasm.',
        category: 'Helper'
    },
    "Taesung 'Story' Lee": {
        avatarUrl: '/characters/taesung-lee.png',
        gender: 'M',
        ttsVoiceSpec: 'Smooth tenor; pace 0.92x; Korean accent; storytelling warmth; dramatic timing.',
        category: 'Fiction & Media'
    },
    'Valentino Estrada': {
        avatarUrl: '/characters/valentino-estrada.png',
        gender: 'M',
        ttsVoiceSpec: 'Rich baritone; pace 0.90x; Latin charm; romantic undertones; sophisticated.',
        category: 'Helper'
    },
    'Sofía Vega': {
        avatarUrl: '/characters/sofia-vega.png',
        gender: 'F',
        ttsVoiceSpec: 'Warm mezzo; pace 0.95x; Spanish accent; nurturing; encouraging warmth.',
        category: 'Helper'
    },
    'Theo Nguyen': {
        avatarUrl: '/characters/theo-nguyen.png',
        gender: 'M',
        ttsVoiceSpec: 'Clear tenor; pace 1.00x; Vietnamese-American; strategic thinking; calm analysis.',
        category: 'Helpful'
    },
    'Victor Hale': {
        avatarUrl: '/characters/victor-hale.png',
        gender: 'M',
        ttsVoiceSpec: 'Deep baritone; pace 0.88x; British accent; analytical precision; quiet authority.',
        category: 'Helpful'
    },
    'Valentina Russo': {
        avatarUrl: '/characters/valentina-russo.png',
        gender: 'F',
        ttsVoiceSpec: 'Rich alto; pace 0.95x; Italian accent; editorial precision; passionate about details.',
        category: 'Helpful'
    }
};

async function main() {
    console.log('🔧 Fixing character data...\n');

    let updated = 0;
    let skipped = 0;

    for (const [name, data] of Object.entries(CHARACTER_UPDATES)) {
        const result = await prisma.personaTemplate.updateMany({
            where: { name },
            data: {
                ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
                gender: data.gender,
                ttsVoiceSpec: data.ttsVoiceSpec,
                category: data.category
            }
        });

        if (result.count > 0) {
            console.log(`  ✅ ${name} (${result.count} record(s))`);
            updated += result.count;
        } else {
            console.log(`  ⚠️  ${name} not found`);
            skipped++;
        }
    }

    // Also update all characters with null gender to have a default
    const nullGenderResult = await prisma.personaTemplate.updateMany({
        where: { gender: null },
        data: { gender: 'NB' }  // Non-binary as default for unspecified
    });

    console.log(`\n📊 Summary:`);
    console.log(`  Updated: ${updated} characters`);
    console.log(`  Not found: ${skipped} characters`);
    console.log(`  Null gender fixed: ${nullGenderResult.count} characters`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
