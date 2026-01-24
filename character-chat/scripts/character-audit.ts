#!/usr/bin/env npx tsx
/**
 * Character Quality Audit Script
 * 
 * Validates newly created characters for:
 * - Archetype coherence (voice + appearance + personality)
 * - Mood category correctness
 * - Content quality (description length, greeting originality)
 * - Avatar presence
 * 
 * Run: npx tsx scripts/character-audit.ts
 * 
 * Can be integrated with n8n for automated auditing
 */

import { PrismaClient } from '@prisma/client';
import { ARCHETYPE_PROFILES, validateCoherence, suggestArchetype } from '../lib/character/archetype-profiles';

const db = new PrismaClient();

interface AuditResult {
    id: string;
    name: string;
    passed: boolean;
    score: number;
    issues: string[];
    warnings: string[];
    suggestions: string[];
}

// Quality thresholds
const THRESHOLDS = {
    minDescriptionLength: 100,
    maxDescriptionLength: 1000,
    minGreetingLength: 20,
    maxGreetingLength: 500,
    minTaglineLength: 10,
    maxTaglineLength: 100,
};

// Generic/low-quality greeting patterns
const BAD_GREETING_PATTERNS = [
    /^hello,?\s*i\s*am/i,
    /^hi,?\s*my\s*name\s*is/i,
    /^i\'m\s+\w+,?\s*nice\s*to\s*meet/i,
    /^greetings,?\s*human/i,
    /^how\s*can\s*i\s*help\s*you/i,
];

async function auditCharacter(character: any): Promise<AuditResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 1. Basic field validation
    if (!character.name) {
        issues.push('Missing name');
        score -= 20;
    }

    if (!character.description || character.description.length < THRESHOLDS.minDescriptionLength) {
        issues.push(`Description too short (${character.description?.length || 0} chars, min ${THRESHOLDS.minDescriptionLength})`);
        score -= 15;
    }

    if (!character.greeting || character.greeting.length < THRESHOLDS.minGreetingLength) {
        warnings.push(`Greeting too short (${character.greeting?.length || 0} chars)`);
        score -= 10;
    }

    // Check for generic/boring greetings
    if (character.greeting) {
        for (const pattern of BAD_GREETING_PATTERNS) {
            if (pattern.test(character.greeting)) {
                issues.push('Generic greeting detected - should be immersive and in-character');
                score -= 15;
                break;
            }
        }
    }

    // 2. Avatar check
    if (!character.avatarUrl || character.avatarUrl === 'pending') {
        issues.push('Missing avatar');
        score -= 20;
    }

    // 3. Voice/Archetype coherence
    if (character.archetype && ARCHETYPE_PROFILES[character.archetype]) {
        const coherence = validateCoherence(character.archetype, {
            gender: character.gender,
            description: character.description,
            personality: character.characterKeywords,
        });

        if (!coherence.valid) {
            issues.push(...coherence.issues.map((i: string) => `Coherence: ${i}`));
            score -= 10 * coherence.issues.length;
        }
    }

    // 4. Auto-suggest archetype if none set
    if (!character.archetype || character.archetype === 'warm_mentor') {
        const suggested = suggestArchetype(
            `${character.description || ''} ${character.characterKeywords || ''}`,
            character.gender
        );
        if (suggested) {
            suggestions.push(`Consider archetype: ${ARCHETYPE_PROFILES[suggested]?.displayName || suggested}`);
        }
    }

    // 5. Mood category check
    const validCategories = [
        'Helper', 'Original', 'Anime & Game', 'Fiction & Media', 'Roleplay',
        'History', 'Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn',
        'Wholesome', 'Adventurous'
    ];
    if (character.category && !validCategories.includes(character.category)) {
        warnings.push(`Invalid category: ${character.category}`);
        score -= 5;
    }

    // 6. Check if category matches archetype profile
    if (character.archetype && ARCHETYPE_PROFILES[character.archetype]) {
        const profile = ARCHETYPE_PROFILES[character.archetype];
        if (!profile.personality.moodCategories.includes(character.category)) {
            warnings.push(`Category "${character.category}" may not suit ${profile.displayName} archetype. Suggested: ${profile.personality.moodCategories.join(', ')}`);
        }
    }

    // 7. Voice seed check
    if (!character.voiceSeedId) {
        warnings.push('No voice seed selected');
        score -= 5;
    }

    return {
        id: character.id,
        name: character.name,
        passed: score >= 70 && issues.length === 0,
        score: Math.max(0, score),
        issues,
        warnings,
        suggestions,
    };
}

async function main() {
    console.log('🔍 Character Quality Audit\n');
    console.log('='.repeat(60));

    // Get recently created characters (last 24 hours) or all if flag passed
    const allFlag = process.argv.includes('--all');
    const since = allFlag ? undefined : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const characters = await db.personaTemplate.findMany({
        where: since ? { createdAt: { gte: since } } : undefined,
        orderBy: { createdAt: 'desc' },
        take: allFlag ? 100 : 50,
    });

    if (characters.length === 0) {
        console.log('No characters to audit');
        return;
    }

    console.log(`Auditing ${characters.length} characters...\n`);

    const results: AuditResult[] = [];
    let passCount = 0;

    for (const character of characters) {
        const result = await auditCharacter(character);
        results.push(result);

        const status = result.passed ? '✅' : '❌';
        console.log(`${status} ${result.name} (Score: ${result.score}/100)`);

        if (result.issues.length > 0) {
            console.log('   ❌ Issues:');
            result.issues.forEach(i => console.log(`      - ${i}`));
        }

        if (result.warnings.length > 0) {
            console.log('   ⚠️  Warnings:');
            result.warnings.forEach(w => console.log(`      - ${w}`));
        }

        if (result.suggestions.length > 0) {
            console.log('   💡 Suggestions:');
            result.suggestions.forEach(s => console.log(`      - ${s}`));
        }

        if (result.passed) passCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Summary: ${passCount}/${characters.length} passed (${Math.round(passCount / characters.length * 100)}%)`);
    console.log(`   Average Score: ${Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)}/100`);

    // Return exit code for CI/automation
    const failedCount = results.filter(r => !r.passed).length;
    if (failedCount > 0) {
        console.log(`\n❌ ${failedCount} character(s) failed audit`);
        process.exit(1);
    }
}

main().catch(console.error);
