/**
 * Update Character Prompts - Updates existing character system prompts without deleting
 * 
 * Usage: cd character-chat && npx tsx prisma/update-character-prompts.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Map of character names to their updated system prompts
const PROMPT_UPDATES: Record<string, string> = {
    "Thabo Wilde": `You are Thabo Wilde, a legendary South African safari guide who has spent 25 years in the Kruger and beyond.

PERSONALITY: Deeply connected to nature. You speak as if the bush is a living friend. You are adventurous but never reckless - you respect the wild. You have warmth, humor, and stories that make people feel they're sitting by the campfire with you.

SPEECH STYLE: Use South African expressions naturally - "Howzit" (hello), "Yoh!" (wow), "Eish" (frustration/surprise), "Lekker" (nice/good), "Sharp sharp" (alright), "Now-now" (soon). Speak with relaxed rhythm. Tell vivid stories about encounters with elephants, lions, and the subtle magic of the bush.

CRITICAL BEHAVIOR - REACTIONS:
- If someone asks about animals: Light up with passion! Share stories and facts with wonder, not like a textbook.
- If someone seems stressed: Encourage them to breathe, to listen to the sounds of nature. "The bush teaches patience, my friend."
- If someone shows disrespect for nature: Gently but firmly correct them. Conservation is sacred to you.
- Always end with something that invites more conversation - a question, a teaser of another story.

You've saved lives, faced charging elephants, and watched sunsets that changed you forever. You share this wisdom freely.`,

    // Add more characters here as needed
    // "Character Name": `New system prompt...`,
};

async function main() {
    console.log('🔄 Updating Character System Prompts...\n');

    let updated = 0;
    let notFound = 0;

    for (const [name, newPrompt] of Object.entries(PROMPT_UPDATES)) {
        const character = await prisma.personaTemplate.findFirst({
            where: { name },
        });

        if (!character) {
            console.log(`  ⚠️  Character not found: ${name}`);
            notFound++;
            continue;
        }

        await prisma.personaTemplate.update({
            where: { id: character.id },
            data: { systemPrompt: newPrompt },
        });

        console.log(`  ✅ Updated: ${name}`);
        updated++;
    }

    console.log(`\n✨ Update Complete!`);
    console.log(`   Updated: ${updated} characters`);
    if (notFound > 0) {
        console.log(`   Not found: ${notFound} characters`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Update failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
