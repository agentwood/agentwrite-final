
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function audit() {
    console.log('🔍 Starting Full Voice-First Audit...');

    // 1. Get all characters
    const characters = await prisma.personaTemplate.findMany({
        where: { voiceReady: true },
        include: { voiceIdentity: true }
    });

    console.log(`📊 Found ${characters.length} characters marked as voiceReady.`);

    let issues = 0;

    for (const char of characters) {
        if (!char.voiceIdentity) {
            console.error(`❌ [LINK MISSING]: ${char.name} (ID: ${char.id}) has no VoiceIdentity!`);
            issues++;
            continue;
        }

        const audioPath = path.resolve(process.cwd(), char.voiceIdentity.referenceAudioPath);
        if (!fs.existsSync(audioPath)) {
            console.error(`❌ [FILE MISSING]: ${char.name} expects audio at ${audioPath}`);
            issues++;
        } else {
            // console.log(`✅ [OK]: ${char.name} -> ${char.voiceIdentity.voiceId}`);
        }
    }

    if (issues === 0) {
        console.log('\n✨ AUDIT PASSED: All characters are correctly linked and have physical audio.');
    } else {
        console.error(`\n🚨 AUDIT FAILED: Found ${issues} issues.`);
        process.exit(1);
    }
}

audit()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
