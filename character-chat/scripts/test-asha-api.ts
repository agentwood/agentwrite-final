import fs from 'fs';
import path from 'path';

async function main() {
    const url = 'http://localhost:3000/api/tts';
    // Use personaId (db ID) to properly link to seedId
    const payload = {
        text: "Hello, I am Asha. I am testing the ElevenLabs integration.",
        personaId: "cmjssih2l0002pvcvz6ij76uh"  // This is Fearless Asha's database ID
    };

    console.log(`🎙️ Testing TTS API for Asha (personaId: ${payload.personaId})`);

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
            const outputPath = path.join(process.cwd(), 'public', 'tts-test', 'asha-api-test.mp3');
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
