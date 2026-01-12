
import fs from 'fs';
import path from 'path';

async function testLocalAPI() {
    console.log("🧪 Testing Local TTS API (Integration Test)");
    console.log("==========================================");

    const characters = [
        { name: 'Sarah Wheeler', text: "Hey! I'm energetic and loud! Let's go party!", desc: "Should be loud/energetic" },
        { name: 'Luna the Stargazer', text: "The stars are whispering to me tonight...", desc: "Should be soft/dreamy" },
        { name: 'Thorin Lightbringer', text: "I stand ready to defend the realm with my life!", desc: "Should be confident/heroic" }
    ];

    for (const char of characters) {
        console.log(`\nTesting: ${char.name} (${char.desc})`);

        try {
            const response = await fetch('http://localhost:3000/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: char.text,
                    characterName: char.name,
                    personaId: 'test-id', // Mock ID
                    // The server handles the mapping from name -> ID -> Voice Params
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`API Error ${response.status}: ${err}`);
            }

            const data = await response.json();

            console.log(`✅ Success!`);
            console.log(`   Engine: ${data.engine}`);
            console.log(`   Voice: ${data.voiceName}`);
            console.log(`   Duration: ${(data.audio.length / 1024).toFixed(1)} KB`);

            // Check if it returned a Fish Audio voice
            if (data.engine === 'fish-audio-cloud') {
                console.log(`   Backend: Fish Audio Cloud (Correct)`);
            } else {
                console.warn(`   ⚠️  Backend: ${data.engine} (Fallback used?)`);
            }

            // Save for manual inspection if needed
            const buffer = Buffer.from(data.audio, 'base64');
            const artifactsDir = path.join(process.cwd(), 'artifacts_api_test');
            if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

            fs.writeFileSync(path.join(artifactsDir, `${char.name.replace(/\s+/g, '_')}_api.mp3`), buffer);
            console.log(`   Saved to artifacts_api_test/${char.name.replace(/\s+/g, '_')}_api.mp3`);

        } catch (error: any) {
            console.error(`❌ Failed: ${error.message}`);
            if (error.cause) console.error(error.cause);
        }
    }
}

testLocalAPI();
