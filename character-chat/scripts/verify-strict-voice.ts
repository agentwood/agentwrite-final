
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api/tts';

async function testVoice(name: string, characterId: string, voiceId: string, text: string, shouldFail: boolean = false) {
    console.log(`\n🧪 Testing ${name} (Voice: ${voiceId})...`);
    console.log(`   Text: "${text}"`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                characterId,
                voiceId,
                userId: 'test-user'
            })
        });

        const status = response.status;
        let responseText = await response.text();

        // Try to parse JSON error if text
        try {
            const json = JSON.parse(responseText);
            // Print full response for debugging
            responseText = `Response: ${JSON.stringify(json, null, 2)}`;
        } catch (e) { }

        if (response.ok) {
            if (shouldFail) {
                console.error(`❌ FAILED: Expected request to fail, but it succeeded (Status: ${status}).`);
            } else {
                console.log(`✅ SUCCESS: Request succeeded (Status: ${status}). Length: ${responseText.length} bytes.`);
            }
        } else {
            if (shouldFail) {
                console.log(`✅ SUCCESS: Request failed as expected (Status: ${status}).`);
                console.log(`   ${responseText}`);
            } else {
                console.error(`❌ FAILED: Request failed unexpectedly (Status: ${status}).`);
                console.log(`   ${responseText}`);
            }
        }

    } catch (error: any) {
        console.error(`❌ NETWORK/CODE ERROR: ${error.message}`);
    }
}

async function main() {
    console.log('🔒 Starting Strict Voice Authority Transformation Verification');

    // 1. Get Coach Kofi ID
    const kofi = await prisma.personaTemplate.findFirst({ where: { name: { contains: 'Kofi' } } });
    if (!kofi) {
        console.error('❌ Could not find Coach Kofi in DB. Seeding checking required.');
        return;
    }

    // 2. Test Valid Request (Coach Kofi)
    await testVoice('Coach Kofi', kofi.id, 'coach_kofi_01', 'This is a strict voice authority test. We do not fallback.');

    // 3. Test Valid Request (Eleanor)
    const eleanor = await prisma.personaTemplate.findFirst({ where: { name: { contains: 'Eleanor' } } });
    if (eleanor) {
        await testVoice('Eleanor Ashworth', eleanor.id, 'eleanor_ashworth_01', 'History is strictly recorded.');
    }

    // 4. Test INVALID Voice ID (Should HARD FAIL)
    await testVoice('Drift Attempt', kofi.id, 'random_drift_voice_01', 'This request should fail immediately.', true);

    console.log('\n✨ Verification Complete.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
