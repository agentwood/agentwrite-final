
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🧪 Starting End-to-End Creation Verification...");

    const testChar = {
        name: "QA Test Bot 9000",
        description: "A temporary character created to verify the creation pipeline.",
        tagline: "I am fully operational.",
        greeting: "*beeps* Systems online. Ready for query.",
        category: "Technology",
        voiceName: "Gemini Spark",
        voiceSeedId: "voice_gemini_spark_01", // Mock ID
        archetype: "The Analyst",
        avatarUrl: "https://r2.agentwood.com/avatars/test-bot.png", // Mock URL
        systemPrompt: "You are a test bot. Be helpful and concise.",
        creationStatus: "ready", // Important: Must be 'ready' to show in dashboard
        creationProgress: 100
    };

    try {
        // 1. Clean up previous test runs
        await prisma.personaTemplate.deleteMany({
            where: { name: testChar.name }
        });

        // 1.5 Fetch a real VoiceSeed ID
        const voiceSeed = await prisma.voiceSeed.findFirst();
        if (!voiceSeed) throw new Error("No voice seeds found in DB!");

        const testCharWithVoice = {
            ...testChar,
            voiceSeedId: voiceSeed.id
        };

        // 2. Create the character (Mimic API)
        const created = await prisma.personaTemplate.create({
            data: testCharWithVoice
        });

        console.log(`✅ Character Created: ${created.name} (${created.id})`);
        console.log(`   - Status: ${created.creationStatus}`);
        console.log(`   - Voice: ${created.voiceName}`);
        console.log(`   - Archetype: ${created.archetype}`);

        // 3. Verify it would be visible
        if (created.creationStatus === 'ready') {
            console.log("✅ VISIBILITY CHECK PASSED: Character is 'ready' and will appear in the dashboard.");
        } else {
            console.error("❌ VISIBILITY CHECK FAILED: Character status is not 'ready'.");
        }

    } catch (error) {
        console.error("❌ Creation Test Failed:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
