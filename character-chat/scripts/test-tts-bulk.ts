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

    try {
        const response = await fetch('http://localhost:3005/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: "This is a test to verify my voice engine.",
                characterId: char.id
            })
        });

        if (response.status === 200) {
            const data = await response.json();
            const engine = data.engine;
            const debugInfo = data.debugInfo;
            const statusIcon = engine.includes('f5-tts') ? '✅' : '❌';

            let errorMsg = '';
            if (debugInfo?.primaryError) {
                errorMsg = ` | ⚠️ Error: ${debugInfo.primaryError}`;
            } else if (engine.includes('fish-audio') && !debugInfo?.primaryError) {
                errorMsg = ` | (Generic Fallback Triggered without logged error?)`;
            }

            console.log(`${statusIcon} ${name}: ${engine}${errorMsg}`);
        } else {
            console.error(`❌ ${name}: API Error ${response.status}`);
        }
    } catch (e: any) {
        console.error(`❌ ${name}: Network Error`, e.message);
    }
}

async function main() {
    const characters = await prisma.personaTemplate.findMany({
        where: { seedId: { not: null } },
        select: { name: true },
        orderBy: { name: 'asc' }
    });

    console.log(`Testing ${characters.length} verified elite characters...`);
    console.log('--- ENGINE REPORT (WITH ERRORS) ---');

    for (const char of characters) {
        await testCharacter(char.name);
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
