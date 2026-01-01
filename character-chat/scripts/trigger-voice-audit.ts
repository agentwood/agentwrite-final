import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Trigger n8n voice audit for a character
 */
async function triggerVoiceAudit(characterIdOrSeedId: string) {
    // Try to find by id first, then by seedId
    let character = await prisma.personaTemplate.findUnique({
        where: { id: characterIdOrSeedId },
    });

    if (!character) {
        // Try seedId
        character = await prisma.personaTemplate.findFirst({
            where: { seedId: characterIdOrSeedId },
        });
    }

    if (!character) {
        throw new Error(`Character ${characterIdOrSeedId} not found (tried both id and seedId)`);
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/voice-audit-trigger';

    console.log(`🔍 Triggering voice audit for: ${character.name}`);
    console.log(`   Voice: ${character.voiceName}`);
    console.log(`   Category: ${character.category}`);
    console.log(`   Archetype: ${character.archetype || 'N/A'}\n`);

    const payload = {
        characterId: character.id,
        characterName: character.name,
        description: character.description || character.tagline || '',
        voiceName: character.voiceName,
        category: character.category,
        archetype: character.archetype || 'general',
    };

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook failed (${response.status}): ${errorText}`);
    }

    let result;
    const responseText = await response.text();

    try {
        result = responseText ? JSON.parse(responseText) : { success: true, message: 'Workflow executed (no response)' };
    } catch (e) {
        result = { success: true, message: 'Workflow executed', rawResponse: responseText };
    }

    console.log('✅ Audit triggered successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));

    return result;
}

/**
 * Audit all characters
 */
async function auditAllCharacters() {
    const characters = await prisma.personaTemplate.findMany({
        where: {
            voiceReady: true,
        },
        select: {
            id: true,
            name: true,
            voiceName: true,
        },
    });

    console.log(`Found ${characters.length} voice-ready characters to audit\n`);

    const results = [];
    for (const char of characters) {
        try {
            console.log(`[${results.length + 1}/${characters.length}] Auditing: ${char.name}...`);
            const result = await triggerVoiceAudit(char.id);
            results.push({ character: char.name, result });

            // Wait 2 seconds between audits to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
            console.error(`❌ Failed to audit ${char.name}:`, error.message);
            results.push({ character: char.name, error: error.message });
        }
    }

    console.log('\n=== Audit Summary ===');
    console.log(`Total characters: ${characters.length}`);
    console.log(`Successful: ${results.filter(r => r.result).length}`);
    console.log(`Failed: ${results.filter(r => r.error).length}`);

    return results;
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage:');
        console.log('  npx tsx scripts/trigger-voice-audit.ts <characterId>  # Audit single character');
        console.log('  npx tsx scripts/trigger-voice-audit.ts --all          # Audit all characters');
        process.exit(0);
    }

    if (args[0] === '--all') {
        await auditAllCharacters();
    } else {
        const characterId = args[0];
        await triggerVoiceAudit(characterId);
    }
}

if (require.main === module) {
    main()
        .then(() => {
            console.log('\n✨ Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

export { triggerVoiceAudit, auditAllCharacters };
