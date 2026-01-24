
import { saveCogneeMemory, searchCogneeMemory, isCogneeAvailable } from '../lib/cogneeClient';

async function testCognee() {
    console.log("--- 🧪 Testing Cognee Memory System ---");

    // 1. Check Health
    const isUp = await isCogneeAvailable();
    console.log(`1. Health Check: ${isUp ? '✅ ONLINE' : '❌ OFFLINE'}`);
    if (!isUp) {
        console.error("Service is down. Aborting test.");
        return;
    }

    const testUserId = "test-user-walkthrough";
    const testCharId = "char-walkthrough";
    const fact = "My favorite color is neon-purple and I own a cyber-cat named Glitch.";

    // 2. Save Memory
    console.log("\n2. Saving Memory...");
    console.log(`   Input: "${fact}"`);
    try {
        await saveCogneeMemory(testUserId, testCharId, fact, 'user');
        console.log("   ✅ Save call successful.");
    } catch (e) {
        console.error("   ❌ Save failed:", e);
    }

    // 3. Search Memory
    console.log("\n3. Searching Memory...");
    const query = "What is my cat's name?";
    console.log(`   Query: "${query}"`);
    try {
        const result = await searchCogneeMemory(testUserId, testCharId, query);
        console.log("   ✅ Search result received.");
        console.log("   ----------------------------------------");
        console.log(`   Raw Context Prompt:\n${result.context_prompt}`);
        console.log("   ----------------------------------------");

        if (result.context_prompt.includes("Glitch")) {
            console.log("   ✨ SUCCESS: Memory retrieved correctly!");
        } else {
            console.log("   ⚠️ WARNING: 'Glitch' not found in context. Indexing might be slow or failed.");
        }
    } catch (e) {
        console.error("   ❌ Search failed:", e);
    }
}

testCognee();
