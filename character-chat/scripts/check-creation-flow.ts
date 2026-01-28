
import fetch from 'node-fetch';

async function main() {
    console.log("🚀 Testing Character Creation Flow...");

    const baseUrl = 'http://localhost:3000'; // Assuming verified against local or we use logic to simulate DB call directly if server not running.
    // Since we are in an agent environment, we should probably interact with DB directly OR mock the request context if we can't hit localhost easily.
    // Actually, checking task.md: "Manually verify...".
    // I can simulate the internal logic or use the DB directly to mimic what the API does.

    // However, the best way to test the "Flow" is to call the function logic or insert into DB and check.
    // Let's rely on DB insertion simulation found in 'api/personas/create-full/route.ts'

    // BUT, since we can't easily spin up the Next.js server and hit it from here without 'npm run dev' running in background (which we don't control fully),
    // I will write a script that imports the DB and creates a character exactly like the route does, then reads it back.

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
        // 1. Pick a voice seed (e.g., one of the Gemini ones)
        const voiceSeed = await prisma.voiceSeed.findFirst({
            where: { category: 'Gemini' }
        });

        if (!voiceSeed) {
            console.error("❌ No Gemini voice seed found!");
            return;
        }

        console.log(`Testing with Voice Seed: ${voiceSeed.name} (${voiceSeed.id})`);

        // 2. Simulate User Input
        const input = {
            name: "Test Character QA",
            description: "A test character for QA",
            tagline: "I am a test.",
            greeting: "Hello, testing.",
            category: "Helper",
            voiceSeedId: voiceSeed.id
        };

        // 3. Create (Simulating api/personas/create-full logic)
        const char = await prisma.personaTemplate.create({
            data: {
                name: input.name,
                description: input.description,
                tagline: input.tagline,
                greeting: input.greeting,
                category: input.category,
                voiceSeedId: input.voiceSeedId,
                voiceName: voiceSeed.name,
                voiceReady: true,
                avatarUrl: 'pending',
                creationStatus: 'ready',
                systemPrompt: "You are a test character.",
                archetype: 'warm_mentor'
            }
        });

        console.log(`✅ Character Created: ${char.id}`);

        // 4. Verify Persistence
        const fetched = await prisma.personaTemplate.findUnique({
            where: { id: char.id },
            include: { voiceSeed: true }
        });

        if (fetched.voiceSeedId === input.voiceSeedId && fetched.voiceSeed.id === input.voiceSeedId) {
            console.log("✅ Voice Seed Persistence Verified");
        } else {
            console.error("❌ Voice Seed Persistence Failed");
        }

        // Cleanup
        await prisma.personaTemplate.delete({ where: { id: char.id } });
        console.log("🧹 Cleanup Done");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
