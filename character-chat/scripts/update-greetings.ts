
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Updates character greetings to be character-specific
 * Uses the first prompt from their `prompts` array if available
 * Otherwise generates a greeting based on their description and personality
 */
async function main() {
    console.log('🎭 Updating character greetings to be character-specific...');

    const characters = await prisma.personaTemplate.findMany();
    let updateCount = 0;

    for (const char of characters) {
        // Skip if already has a good greeting (not generic)
        if (char.greeting && !char.greeting.startsWith("Hi! I'm") && !char.greeting.startsWith("Hello! I'm")) {
            console.log(`  ✓ ${char.name} - already has custom greeting`);
            continue;
        }

        let newGreeting = '';

        // Use first prompt if available - these are character-specific conversation starters
        if (char.prompts) {
            try {
                const prompts = JSON.parse(char.prompts);
                if (Array.isArray(prompts) && prompts.length > 0) {
                    newGreeting = prompts[0];
                }
            } catch (e) {
                // Invalid JSON, fallback to generation
            }
        }

        // If no prompts, generate based on archetype/description
        if (!newGreeting) {
            const name = char.name;
            const archetype = char.archetype || 'helper';

            // Template based on archetype
            switch (archetype) {
                case 'mentor':
                case 'helper':
                    newGreeting = `*settles in* Welcome. I'm ${name}. What would you like to work on today?`;
                    break;
                case 'entertainer':
                case 'trickster':
                    newGreeting = `*grins* Hey there! ${name} here. Ready to have some fun?`;
                    break;
                case 'guardian':
                    newGreeting = `*nods* ${name}. I've been expecting you. How can I help?`;
                    break;
                case 'artist':
                    newGreeting = `*looks up thoughtfully* Ah, a visitor. I'm ${name}. Tell me, what inspires you?`;
                    break;
                case 'innocent':
                    newGreeting = `*waves excitedly* Hi! Oh wow, I'm so glad you're here! I'm ${name}!`;
                    break;
                default:
                    newGreeting = `*smiles warmly* Hello. I'm ${name}. What brings you to me today?`;
            }
        }

        // Update the character
        await prisma.personaTemplate.update({
            where: { id: char.id },
            data: { greeting: newGreeting }
        });

        console.log(`  ✅ ${char.name} - greeting updated`);
        updateCount++;
    }

    console.log(`\n✨ Updated ${updateCount} character greetings!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
