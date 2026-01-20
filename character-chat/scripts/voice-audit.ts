#!/usr/bin/env npx tsx
/**
 * Voice Audit Script
 * 
 * Audits all voices to ensure they:
 * 1. Match character personalities
 * 2. Are accessible/working
 * 3. Have proper VoiceSeed connections
 * 
 * Run: npx tsx scripts/voice-audit.ts
 * Schedule via n8n every 3 days
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AuditResult {
    totalCharacters: number;
    withVoice: number;
    withoutVoice: number;
    missingFiles: string[];
    voiceMismatches: string[];
    errors: string[];
    timestamp: string;
}

async function auditVoices(): Promise<AuditResult> {
    console.log('🔍 Starting Voice Audit...\n');

    const result: AuditResult = {
        totalCharacters: 0,
        withVoice: 0,
        withoutVoice: 0,
        missingFiles: [],
        voiceMismatches: [],
        errors: [],
        timestamp: new Date().toISOString()
    };

    try {
        // 1. Get all characters with their voice seeds
        const characters = await prisma.personaTemplate.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                gender: true,
                voiceSeedId: true,
                voiceSeed: {
                    select: {
                        id: true,
                        name: true,
                        filePath: true,
                        gender: true,
                        category: true,
                    }
                }
            }
        });

        result.totalCharacters = characters.length;
        console.log(`📊 Total Characters: ${characters.length}`);

        // 2. Check each character
        for (const char of characters) {
            if (!char.voiceSeed) {
                result.withoutVoice++;
                result.errors.push(`${char.name}: No voice assigned`);
                continue;
            }

            result.withVoice++;

            // 3. Check if voice file exists
            const filePath = path.join(process.cwd(), 'public', char.voiceSeed.filePath);
            if (!fs.existsSync(filePath)) {
                result.missingFiles.push(`${char.name}: File missing - ${char.voiceSeed.filePath}`);
            }

            // 4. Check gender match (basic personality matching)
            if (char.gender && char.voiceSeed.gender) {
                const charGender = char.gender.toLowerCase();
                const voiceGender = char.voiceSeed.gender.toLowerCase();
                if (charGender !== 'neutral' && voiceGender !== 'neutral' && charGender !== voiceGender) {
                    result.voiceMismatches.push(`${char.name}: Gender mismatch (char: ${charGender}, voice: ${voiceGender})`);
                }
            }
        }

        // 5. Summary
        console.log(`\n✅ With Voice: ${result.withVoice}`);
        console.log(`❌ Without Voice: ${result.withoutVoice}`);
        console.log(`📁 Missing Files: ${result.missingFiles.length}`);
        console.log(`⚠️  Voice Mismatches: ${result.voiceMismatches.length}`);

        if (result.missingFiles.length > 0) {
            console.log('\n🔴 Missing Files:');
            result.missingFiles.forEach(f => console.log(`  - ${f}`));
        }

        if (result.voiceMismatches.length > 0) {
            console.log('\n🟡 Voice Mismatches:');
            result.voiceMismatches.forEach(m => console.log(`  - ${m}`));
        }

        // 6. Save audit report
        const reportPath = path.join(process.cwd(), 'reports', `voice-audit-${Date.now()}.json`);
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
        console.log(`\n📝 Report saved: ${reportPath}`);

    } catch (error) {
        console.error('Audit error:', error);
        result.errors.push(String(error));
    } finally {
        await prisma.$disconnect();
    }

    return result;
}

// Run audit
auditVoices().then(result => {
    console.log('\n✨ Voice Audit Complete!');
    process.exit(result.errors.length > 5 ? 1 : 0);
});
