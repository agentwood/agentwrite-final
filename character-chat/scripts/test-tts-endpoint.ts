import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCharacter(name: string) {
    const char = await prisma.personaTemplate.findFirst({
        where: { name },
        select: { id: true, seedId: true, voiceSeed: { select: { name: true } } }
    });

    if (!char) {
        console.error(`❌ Character not found: ${name}`);
        return;
    }

    console.log(`Testing ${name} (ID: ${char.id}, Seed: ${char.seedId}, Voice: ${char.voiceSeed?.name})...`);

    try {
        const response = await fetch('http://localhost:3005/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "Hello, this is a test of my unique voice.",
                characterId: char.id
            })
        });

        if (response.status === 200) {
            const data = await response.json();
            const audioBuffer = Buffer.from(data.audio, 'base64');
            const engine = data.engine;
            console.log(`✅ Success! Engine: ${engine}, Size: ${audioBuffer.length} bytes`);

            if (engine.includes('f5-tts') && audioBuffer.length > 1000) {
                console.log(`   Verified F5-TTS usage.`);
            } else if (engine.includes('fish-audio')) {
                console.warn(`   ⚠️ Used Fish Audio fallback (Expected F5-TTS?)`);
            } else {
                console.error(`   ❌ Unexpected engine or size: ${engine}, ${audioBuffer.length}`);
            }

        } else {
            console.error(`❌ API Error: ${response.status}`, await response.text());
        }
    } catch (e) {
        console.error(`❌ Network Error:`, e);
    }
}

async function main() {
    // Test a few representative characters
    const testNames = [
        'The Narrator',
        'Sergeant Stone',
        'Velvet Noir',
        'Grandfather Oak',
        'Jake Blitz',
        'Sunny Day',
        'Coach Kofi'
    ];

    console.log('--- TTS Endpoint Verification ---');
    for (const name of testNames) {
        await testCharacter(name);
        // Short delay
        await new Promise(r => setTimeout(r, 1000));
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
