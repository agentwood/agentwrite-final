import fs from 'fs';
import path from 'path';

async function main() {
    const url = 'http://localhost:3000/api/tts';
    // Test with a character NOT in ELEVENLABS_VOICE_MAP (should use Fish Speech)
    const payload = {
        text: "Hello! I am Salty Marjorie. I have been a resident of this community for THIRTY years!",
        personaId: "cmjssih2e0000pvcvz9g91y4m"  // Salty Marjorie's database ID
    };

    console.log(`🎙️ Testing TTS API for Salty Marjorie`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error (${response.status}):`, errorText);
            return;
        }

        const data: any = await response.json();

        if (data.audio) {
            const outputPath = path.join(process.cwd(), 'public', 'tts-test', 'marjorie-api-test.mp3');
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            fs.writeFileSync(outputPath, Buffer.from(data.audio, 'base64'));
            console.log(`✅ Success! Audio saved to: ${outputPath}`);
            console.log(`Engine used: ${data.engine}`);
            console.log(`Voice: ${data.voiceName}`);
        } else {
            console.error('❌ No audio returned');
        }
    } catch (error) {
        console.error('❌ Error:', (error as any).message);
    }
}

main().catch(console.error);
