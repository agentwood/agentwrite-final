/**
 * Voice Audit Script
 * Comprehensive audit of all character voices with validation and recommendations
 */

import { PrismaClient } from '@prisma/client';
import { validateVoiceForCharacter, validateAllCharacters, CharacterMetadata } from '../lib/audio/voiceValidator';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface AuditResult {
  total: number;
  valid: number;
  invalid: number;
  needsReview: number;
  issues: Array<{
    characterId: string;
    characterName: string;
    currentVoice: string;
    issues: string[];
    score: number;
    recommendation?: {
      suggestedVoice: string;
      reason: string;
      confidence: number;
    };
  }>;
}

async function auditAllVoices(): Promise<AuditResult> {
  console.log('🔍 Starting comprehensive voice audit...\n');
  
  // Fetch all characters
  const allCharacters = await prisma.personaTemplate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tagline: true,
      category: true,
      archetype: true,
      voiceName: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Found ${allCharacters.length} characters to audit\n`);
  
  // Convert to metadata format
  const characterMetadata: CharacterMetadata[] = allCharacters.map(char => ({
    name: char.name,
    description: char.description,
    tagline: char.tagline,
    category: char.category,
    archetype: char.archetype,
    voiceName: char.voiceName,
  }));
  
  // Validate all
  const validationResults = await validateAllCharacters(characterMetadata);
  
  // Build issues report
  const issues: AuditResult['issues'] = [];
  
  for (const { character, validation } of [...validationResults.invalid, ...validationResults.needsReview]) {
    const dbChar = allCharacters.find(c => c.name === character.name);
    if (dbChar) {
      issues.push({
        characterId: dbChar.id,
        characterName: character.name,
        currentVoice: character.voiceName,
        issues: validation.issues,
        score: validation.score,
        recommendation: validation.recommendations || undefined,
      });
    }
  }
  
  const result: AuditResult = {
    total: allCharacters.length,
    valid: validationResults.valid.length,
    invalid: validationResults.invalid.length,
    needsReview: validationResults.needsReview.length,
    issues,
  };
  
  // Generate report
  console.log('📊 Audit Results:');
  console.log(`   Total Characters: ${result.total}`);
  console.log(`   ✅ Valid: ${result.valid} (${((result.valid / result.total) * 100).toFixed(1)}%)`);
  console.log(`   ❌ Invalid: ${result.invalid} (${((result.invalid / result.total) * 100).toFixed(1)}%)`);
  console.log(`   ⚠️  Needs Review: ${result.needsReview} (${((result.needsReview / result.total) * 100).toFixed(1)}%)\n`);
  
  // Save detailed report
  const reportPath = path.join(process.cwd(), 'voice-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  
  // Print top issues
  if (issues.length > 0) {
    console.log('🔴 Top Issues:');
    issues
      .sort((a, b) => a.score - b.score)
      .slice(0, 20)
      .forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.characterName} (Score: ${issue.score}/100)`);
        console.log(`   Current Voice: ${issue.currentVoice}`);
        if (issue.recommendation) {
          console.log(`   Recommended: ${issue.recommendation.suggestedVoice} (${(issue.recommendation.confidence * 100).toFixed(0)}% confidence)`);
          console.log(`   Reason: ${issue.recommendation.reason}`);
        }
        issue.issues.forEach(i => console.log(`   ⚠️  ${i}`));
      });
  }
  
  return result;
}

// Run audit
auditAllVoices()
  .then(() => {
    console.log('\n✅ Audit complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });



