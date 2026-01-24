import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function main() {
    console.log('🎭 Generating unique, persona-driven greetings...');

    const characters = await prisma.personaTemplate.findMany();
    let updateCount = 0;

    for (const char of characters) {
        // Skip if already has a good, non-generic greeting
        if (char.greeting &&
            !char.greeting.startsWith("Hi! I'm") &&
            !char.greeting.startsWith("Hello! I'm") &&
            char.greeting.length > 50) { // Assume longer greetings are already custom
            console.log(`  ✓ ${char.name} - already has custom greeting`);
            continue;
        }

        console.log(`  Generating for ${char.name}...`);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
        You are a creative writer. Write a short, engaging, in-character greeting for a fictional character.
        
        Character Name: ${char.name}
        Tagline: ${char.tagline || 'N/A'}
        Description: ${char.description || 'N/A'}
        Archetype: ${char.archetype || 'N/A'}
        Category: ${char.category}
        System Prompt (Brief): ${char.systemPrompt?.substring(0, 300)}...
        
        Requirements:
        1. MUST be written in the first person ("I").
        2. MUST reflect the character's unique voice, tone, and mannerisms.
        3. MUST include a small action or expression in *asterisks* (e.g., *smiles warmly*, *looks up*, *grins*).
        4. MUST NOT start with "Hello! I'm..." or "Hi! I'm..." - make it unique!
        5. Keep it short (1-2 sentences).
        6. Do NOT include quotation marks.
        
        Example (Grumpy Vet): *grunts and keeps cleaning his rifle* Make it quick. I don't have all day.
        Example (Friendly Nurse): *adjusts her glasses and smiles* Oh, you're awake! How are we feeling today?
        
        Greeting:
      `;

            const result = await model.generateContent(prompt);
            const newGreeting = result.response.text().trim().replace(/^["'](.+)["']$/g, '$1'); // Remove quotes if present

            if (newGreeting) {
                await prisma.personaTemplate.update({
                    where: { id: char.id },
                    data: { greeting: newGreeting }
                });
                console.log(`  ✅ ${char.name} -> "${newGreeting}"`);
                updateCount++;
            }

            // Rate limit pause
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`  ❌ Failed to generate for ${char.name}:`, error);
        }
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
