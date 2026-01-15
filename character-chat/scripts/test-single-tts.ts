import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const name = 'Lord Pemberton';
    const char = await prisma.personaTemplate.findFirst({
        where: { name },
        select: { id: true, seedId: true, voiceSeed: { select: { name: true } } }
    });

    if (!char) {
        console.error(`❌ Character not found: ${name}`);
        return;
    }

    console.log(`Testing ${name} (ID: ${char.id}, Voice: ${char.voiceSeed?.name})...`);
    const startTime = Date.now();

    try {
        const response = await fetch('http://localhost:3005/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "This is a test to verify if the button is broken.",
                characterId: char.id
            })
        });

        const elapsed = (Date.now() - startTime) / 1000;
        console.log(`Response time: ${elapsed.toFixed(2)}s`);

        if (response.status === 200) {
            const data = await response.json();
            const engine = data.engine;
            console.log(`✅ Success! Engine: ${engine} | Size: ${data.audio?.length}`);
        } else {
            console.error(`❌ API Error ${response.status}`, await response.text());
        }
    } catch (e: any) {
        console.error(`❌ Network Error:`, e.message);
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
