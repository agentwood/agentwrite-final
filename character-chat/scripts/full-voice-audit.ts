/**
 * FULL Audit of ALL Character Voice Mappings
 * Ensures every character has the correct voice based on their persona
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullAudit() {
    console.log('🔍 FULL CHARACTER VOICE AUDIT\n');
    console.log('='.repeat(80));

    // Get ALL characters with voice identities
    const allCharacters = await prisma.personaTemplate.findMany({
        include: { voiceIdentity: true },
        orderBy: { name: 'asc' }
    });

    let correct = 0;
    let incorrect = 0;
    let missing = 0;
    const issues: string[] = [];

    for (const char of allCharacters) {
        const voice = char.voiceIdentity;

        if (!voice) {
            console.log(`❌ ${char.name}: NO VOICE LINKED`);
            issues.push(`${char.name}: Missing voice identity`);
            missing++;
            continue;
        }

        // Infer expected gender/accent from character description
        const charDesc = (char.description || '').toLowerCase();
        const charName = char.name.toLowerCase();

        // Check for obvious mismatches
        let isCorrect = true;
        let issue = '';

        // GENDER CHECK
        const charIsFemale = charDesc.includes('she ') || charDesc.includes('her ') ||
            charName.includes('countess') || charName.includes('professor eleanor') ||
            charName.includes('elena') || charName.includes('yuki') ||
            charName.includes('dr. priya') || charName.includes('adaze') ||
            charName.includes('alma') || charName.includes('isabella') ||
            charName.includes('soo-min') || charName.includes('elara');

        const charIsMale = charDesc.includes('he ') || charDesc.includes('his ') ||
            charName.includes('coach kofi') || charName.includes('dr. lucien') ||
            charName.includes('professor arthur') || charName.includes('carlos') ||
            charName.includes('kenji') || charName.includes('ryu') ||
            charName.includes('sergeant park') || charName.includes('hakim') ||
            charName.includes('omar');

        if (charIsFemale && voice.gender === 'male') {
            isCorrect = false;
            issue = `GENDER MISMATCH: Character appears female but voice is male`;
        }
        if (charIsMale && voice.gender === 'female') {
            isCorrect = false;
            issue = `GENDER MISMATCH: Character appears male but voice is female`;
        }

        // ACCENT CHECK FOR KEY CHARACTERS
        if (charName.includes('kofi') && !voice.accent?.includes('african')) {
            isCorrect = false;
            issue = `ACCENT MISMATCH: Coach Kofi should have African accent, got ${voice.accent}`;
        }
        if (charName.includes('eleanor') && !voice.accent?.includes('british')) {
            isCorrect = false;
            issue = `ACCENT MISMATCH: Eleanor should have British accent, got ${voice.accent}`;
        }
        if (charName.includes('kenji') && !voice.accent?.includes('asian')) {
            isCorrect = false;
            issue = `ACCENT MISMATCH: Kenji should have East Asian accent, got ${voice.accent}`;
        }
        if (charName.includes('carlos') && !voice.accent?.includes('latin')) {
            isCorrect = false;
            issue = `ACCENT MISMATCH: Carlos should have Latin American accent, got ${voice.accent}`;
        }
        if ((charName.includes('hakim') || charName.includes('omar')) && !voice.accent?.includes('middle')) {
            isCorrect = false;
            issue = `ACCENT MISMATCH: ${char.name} should have Middle Eastern accent, got ${voice.accent}`;
        }

        if (isCorrect) {
            console.log(`✅ ${char.name}`);
            console.log(`   Voice: ${voice.voiceId} | Gender: ${voice.gender} | Accent: ${voice.accent}`);
            correct++;
        } else {
            console.log(`⚠️  ${char.name}`);
            console.log(`   Voice: ${voice.voiceId} | Gender: ${voice.gender} | Accent: ${voice.accent}`);
            console.log(`   ISSUE: ${issue}`);
            issues.push(`${char.name}: ${issue}`);
            incorrect++;
        }
        console.log('');
    }

    console.log('='.repeat(80));
    console.log(`\n📊 AUDIT SUMMARY`);
    console.log(`   Total Characters: ${allCharacters.length}`);
    console.log(`   ✅ Correct: ${correct}`);
    console.log(`   ⚠️  Potential Issues: ${incorrect}`);
    console.log(`   ❌ Missing Voice: ${missing}`);

    if (issues.length > 0) {
        console.log(`\n🚨 ISSUES TO REVIEW:`);
        issues.forEach((issue, i) => console.log(`   ${i + 1}. ${issue}`));
    }

    await prisma.$disconnect();
}

fullAudit();
