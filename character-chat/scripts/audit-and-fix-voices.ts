#!/usr/bin/env tsx
/**
 * Comprehensive Voice Audit and Fix Script
 * 
 * This script:
 * 1. Scans all characters in the database
 * 2. Analyzes character descriptions, names, and attributes
 * 3. Detects gender and age from character data
 * 4. Compares current voice assignments with recommended voices
 * 5. Generates detailed mismatch report
 * 6. Optionally fixes mismatches automatically
 */

import { db } from '../lib/db';
import { matchVoiceToCharacter } from '../lib/voiceMatching/voiceMatcher';
import { GEMINI_VOICE_METADATA } from '../lib/audio/geminiVoiceMetadata';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AuditResult {
    characterId: string;
    name: string;
    currentVoice: string;
    currentVoiceGender: string;
    currentVoiceAge: string;
    detectedGender?: string;
    detectedAge?: string;
    recommendedVoice?: string;
    recommendedVoiceGender?: string;
    matchScore?: number;
    issues: string[];
    severity: 'critical' | 'warning' | 'good';
}

function extractGender(text: string): string | undefined {
    const lower = text.toLowerCase();

    // Strong male indicators
    const maleWords = /\b(he|his|him|himself|male|man|boy|guy|gentleman|father|dad|son|brother|husband|mr\.|mister|sir)\b/i;
    // Strong female indicators  
    const femaleWords = /\b(she|her|hers|herself|female|woman|girl|lady|mother|mom|daughter|sister|wife|mrs\.|miss|ms\.)\b/i;

    const hasMale = maleWords.test(text);
    const hasFemale = femaleWords.test(text);

    if (hasMale && !hasFemale) return 'male';
    if (hasFemale && !hasMale) return 'female';
    if (!hasMale && !hasFemale) return 'neutral';

    // Both found - try to determine which is stronger
    const maleCount = (text.match(maleWords) || []).length;
    const femaleCount = (text.match(femaleWords) || []).length;

    if (maleCount > femaleCount) return 'male';
    if (femaleCount > maleCount) return 'female';

    return 'neutral';
}

function extractAge(text: string): string | undefined {
    const lower = text.toLowerCase();

    // Young indicators
    if (lower.match(/\b(young|teen|child|kid|20s|early 20|college|student|youth)\b/)) {
        return 'young';
    }

    // Old/Elderly indicators
    if (lower.match(/\b(old|elderly|senior|aged|70s|80s|retired|veteran|grandfather|grandmother|granny|wise|ancient)\b/)) {
        return 'old';
    }

    // Middle age indicators
    if (lower.match(/\b(middle|40s|50s|mature|adult|professional|experienced)\b/)) {
        return 'middle';
    }

    // Extract numeric age
    const ageMatch = text.match(/\b(\d{1,2})\s*(?:years?\s*old|aged|age)\b/i);
    if (ageMatch) {
        const age = parseInt(ageMatch[1]);
        if (age < 30) return 'young';
        if (age < 60) return 'middle';
        return 'old';
    }

    return 'middle'; // Default to middle if unclear
}

function assessVoiceMatch(character: any, detectedGender?: string, detectedAge?: string): AuditResult {
    const currentVoice = character.voiceName.toLowerCase();
    const voiceMetadata = GEMINI_VOICE_METADATA[currentVoice];

    const issues: string[] = [];
    let severity: 'critical' | 'warning' | 'good' = 'good';

    if (!voiceMetadata) {
        issues.push(`Unknown voice: ${currentVoice}`);
        severity = 'critical';
        return {
            characterId: character.id,
            name: character.name,
            currentVoice,
            currentVoiceGender: 'unknown',
            currentVoiceAge: 'unknown',
            detectedGender,
            detectedAge,
            issues,
            severity,
        };
    }

    const currentVoiceGender = voiceMetadata.gender;
    const currentVoiceAge = voiceMetadata.age;

    // Critical: Gender mismatch
    if (detectedGender && detectedGender !== 'neutral') {
        if (currentVoiceGender !== detectedGender && currentVoiceGender !== 'neutral') {
            issues.push(`CRITICAL: Gender mismatch - Character is ${detectedGender} but voice is ${currentVoiceGender}`);
            severity = 'critical';
        }
    }

    // Warning: Age mismatch
    if (detectedAge && currentVoiceAge !== detectedAge) {
        issues.push(`Age mismatch - Character appears ${detectedAge} but voice is ${currentVoiceAge}`);
        if (severity === 'good') severity = 'warning';
    }

    return {
        characterId: character.id,
        name: character.name,
        currentVoice,
        currentVoiceGender,
        currentVoiceAge,
        detectedGender,
        detectedAge,
        issues,
        severity,
    };
}

async function auditAllCharacters(dryRun: boolean = true): Promise<AuditResult[]> {
    console.log('🔍 Starting comprehensive voice audit...\n');

    const characters = await db.personaTemplate.findMany({
        select: {
            id: true,
            name: true,
            voiceName: true,
            description: true,
            tagline: true,
            archetype: true,
            category: true,
        },
    });

    console.log(`Found ${characters.length} characters to audit\n`);

    const results: AuditResult[] = [];
    let fixCount = 0;

    for (const character of characters) {
        const fullText = [character.description, character.tagline, character.name].filter(Boolean).join(' ');

        const detectedGender = extractGender(fullText);
        const detectedAge = extractAge(fullText);

        const auditResult = assessVoiceMatch(character, detectedGender, detectedAge);

        // Try to get recommended voice using the matcher
        if (auditResult.severity !== 'good') {
            try {
                const matchResult = await matchVoiceToCharacter(character.id, 0.7);
                if (matchResult.success && matchResult.voiceName) {
                    const recommendedMeta = GEMINI_VOICE_METADATA[matchResult.voiceName.toLowerCase()];
                    auditResult.recommendedVoice = matchResult.voiceName;
                    auditResult.recommendedVoiceGender = recommendedMeta?.gender;
                    auditResult.matchScore = matchResult.matchScore;
                }
            } catch (error) {
                console.error(`Error matching voice for ${character.name}:`, error);
            }
        }

        results.push(auditResult);

        // Auto-fix critical issues if not dry run
        if (!dryRun && auditResult.severity === 'critical' && auditResult.recommendedVoice) {
            try {
                await db.personaTemplate.update({
                    where: { id: character.id },
                    data: { voiceName: auditResult.recommendedVoice },
                });
                fixCount++;
                console.log(`✅ Fixed: ${character.name} -> ${auditResult.recommendedVoice}`);
            } catch (error) {
                console.error(`❌ Failed to fix ${character.name}:`, error);
            }
        }
    }

    if (!dryRun && fixCount > 0) {
        console.log(`\n✅ Fixed ${fixCount} critical mismatches\n`);
    }

    return results;
}

function generateReport(results: AuditResult[]): string {
    const critical = results.filter(r => r.severity === 'critical');
    const warnings = results.filter(r => r.severity === 'warning');
    const good = results.filter(r => r.severity === 'good');

    let report = `# Voice Audit Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Summary\n\n`;
    report += `- **Total Characters**: ${results.length}\n`;
    report += `- **✅ Good Matches**: ${good.length} (${(good.length / results.length * 100).toFixed(1)}%)\n`;
    report += `- **⚠️ Warnings**: ${warnings.length} (${(warnings.length / results.length * 100).toFixed(1)}%)\n`;
    report += `- **❌ Critical Issues**: ${critical.length} (${(critical.length / results.length * 100).toFixed(1)}%)\n\n`;

    if (critical.length > 0) {
        report += `## 🚨 Critical Issues (Gender Mismatches)\n\n`;
        report += `These characters have gender mismatches and should be fixed immediately:\n\n`;

        for (const result of critical) {
            report += `### ${result.name}\n`;
            report += `- **Current Voice**: ${result.currentVoice} (${result.currentVoiceGender})\n`;
            report += `- **Detected Gender**: ${result.detectedGender}\n`;
            if (result.recommendedVoice) {
                report += `- **Recommended**: ${result.recommendedVoice} (${result.recommendedVoiceGender})`;
                if (result.matchScore) {
                    report += ` - Score: ${(result.matchScore * 100).toFixed(1)}%`;
                }
                report += `\n`;
            }
            report += `- **Issues**: ${result.issues.join(', ')}\n\n`;
        }
    }

    if (warnings.length > 0) {
        report += `## ⚠️ Warnings (Age Mismatches)\n\n`;

        for (const result of warnings) {
            report += `### ${result.name}\n`;
            report += `- **Current Voice**: ${result.currentVoice} (${result.currentVoiceGender}, ${result.currentVoiceAge})\n`;
            report += `- **Detected**: ${result.detectedGender || 'unknown'} gender, ${result.detectedAge || 'unknown'} age\n`;
            if (result.recommendedVoice) {
                report += `- **Recommended**: ${result.recommendedVoice}`;
                if (result.matchScore) {
                    report += ` - Score: ${(result.matchScore * 100).toFixed(1)}%`;
                }
                report += `\n`;
            }
            report += `- **Issues**: ${result.issues.join(', ')}\n\n`;
        }
    }

    return report;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = !args.includes('--fix');

    console.log('════════════════════════════════════════════════');
    console.log('   Voice-Character Audit & Fix Tool');
    console.log('════════════════════════════════════════════════\n');

    if (dryRun) {
        console.log('🔬 Running in DRY RUN mode (no changes will be made)');
        console.log('   Use --fix flag to apply fixes automatically\n');
    } else {
        console.log('⚠️  FIX MODE: Critical issues will be corrected\n');
    }

    const results = await auditAllCharacters(dryRun);

    // Generate markdown report
    const report = generateReport(results);
    const reportPath = path.join(__dirname, '../voice-audit-report.md');
    fs.writeFileSync(reportPath, report);

    // Console summary
    const critical = results.filter(r => r.severity === 'critical');
    const warnings = results.filter(r => r.severity === 'warning');
    const good = results.filter(r => r.severity === 'good');

    console.log('\n════════════════════════════════════════════════');
    console.log('   Audit Complete');
    console.log('════════════════════════════════════════════════\n');
    console.log(`✅ Good: ${good.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}`);
    console.log(`❌ Critical: ${critical.length}`);
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);

    if (critical.length > 0 && dryRun) {
        console.log('💡 Tip: Run with --fix flag to automatically fix critical issues\n');
    }

    await db.$disconnect();
}

main().catch((error) => {
    console.error('Error running audit:', error);
    process.exit(1);
});
