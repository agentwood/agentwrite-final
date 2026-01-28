import { db } from '@/lib/db';
import { FALLBACK_CHARACTERS } from '@/lib/master/geminiService';

async function syncCharacters() {
    console.log('Starting character sync...');

    for (const char of FALLBACK_CHARACTERS) {
        console.log(`Syncing ${char.name}...`);

        // Upsert the character
        // We match by name because IDs might be different in DB or we want to preserve DB IDs if they match
        // Actually, FALLBACK_CHARACTERS have 'id'. We should use that if possible, but existing DB entries might use UUIDs.
        // Let's try to match by 'name' first, if uniqueness is guaranteed there. 
        // Or we use the hardcoded IDs from the file if we want to enforce them.

        // Strategy: Search by Name. If found, update. If not, create with the ID from the file (if Prisma allows string CUID override, which it usually does).

        const existing = await db.personaTemplate.findFirst({
            where: { name: char.name }
        });

        const data = {
            name: char.name,
            handle: char.handle,
            tagline: char.tagline,
            description: char.description,
            avatarUrl: char.avatarUrl,
            category: char.category,
            voiceName: char.voiceName,
            // Ensure defaults for others
            featured: true, // Map isOfficial to featured
        };

        if (existing) {
            await db.personaTemplate.update({
                where: { id: existing.id },
                data
            });
            console.log(`Updated ${char.name}`);
        } else {
            await db.personaTemplate.create({
                data: {
                    ...data,
                    id: char.id, // Try to force the ID
                    prompts: JSON.stringify(char.chatStarters || []),
                    systemPrompt: `You are ${char.name}, a ${char.category} character. ${char.description || ''} ${char.tagline || ''}`,
                    archetype: char.category, // Default archetype to category
                }
            });
            console.log(`Created ${char.name}`);
        }
    }

    console.log('Sync complete!');
}

syncCharacters()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
