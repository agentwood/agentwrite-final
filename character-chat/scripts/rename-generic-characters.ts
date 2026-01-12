
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const RENAME_MAP = {
    // Homework Helpers
    'Emma Homework Helper': 'Emma KnowItAll',
    'Code Wizard': 'Dev Merlin',
    'Math Tutor': 'Professor Calculon',

    // Lifestyle
    'Marcus Fitness Coach': 'Coach Marcus',
    'Yoga Instructor': 'Zen Master Luna',
    'Chef Gordon': 'Chef Inferno',

    // Professional
    'Legal Advisor': 'Justice Sterling',
    'Financial Guru': 'Crypto Kingpin',

    // Creative
    'Storyteller': 'Bard Weaver',
    'Art Critic': 'Vicious V',
};

async function renameCharacters() {
    console.log('🔄 Starting Character Rebrand...');

    for (const [oldName, newName] of Object.entries(RENAME_MAP)) {
        const existing = await db.personaTemplate.findFirst({
            where: { name: { contains: oldName } }
        });

        if (existing) {
            console.log(`📝 Renaming "${existing.name}" -> "${newName}"`);
            await db.personaTemplate.update({
                where: { id: existing.id },
                data: {
                    name: newName,
                    // Add a tagline update if generic
                    tagline: existing.tagline?.replace('helper', 'expert').replace('Virtual', 'Elite')
                }
            });
        } else {
            console.log(`⚠️ Could not find "${oldName}"`);
        }
    }

    console.log('✅ Rebrand Complete!');
}

renameCharacters()
    .catch(console.error)
    .finally(() => db.$disconnect());
