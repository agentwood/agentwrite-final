/**
 * Generate Audit Report
 * Creates comprehensive report with all 30 characters, voice assignments, statistics, and recommendations
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { AuditResult } from './score-and-rank';
import type { CharacterData } from './extract-character-data';
import { getVoiceMetadata } from './voice-metadata';

/**
 * Generate markdown report
 */
export async function generateAuditReport(): Promise<string> {
  // Load data
  const resultsPath = join(__dirname, 'audit-results.json');
  const charactersPath = join(__dirname, 'selected-characters.json');

  const resultsData = await readFile(resultsPath, 'utf-8');
  const charactersData = await readFile(charactersPath, 'utf-8');

  const results: AuditResult[] = JSON.parse(resultsData);
  const characters: CharacterData[] = JSON.parse(charactersData);

  const characterMap = new Map(characters.map(c => [c.id, c]));

  // Calculate statistics
  const scores = results.map(r => r.bestScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Voice coverage
  const assignedVoices = new Set(results.map(r => r.bestVoice));
  const allVoices = new Set(characters.map(c => c.currentVoiceName));
  const voiceCoverage = (assignedVoices.size / 30) * 100;

  // Build report
  let report = `# Voice Audit Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Characters Audited**: ${results.length}\n`;
  report += `- **Average Score**: ${avgScore.toFixed(2)}/10\n`;
  report += `- **Score Range**: ${minScore.toFixed(2)} - ${maxScore.toFixed(2)}\n`;
  report += `- **Voice Coverage**: ${assignedVoices.size}/30 voices (${voiceCoverage.toFixed(1)}%)\n\n`;

  report += `## Character-Voice Assignments\n\n`;
  report += `| Rank | Character | Voice | Score | Gender Match | Age Match | Accent Match | Overall | Consistency |\n`;
  report += `|------|-----------|-------|-------|--------------|-----------|--------------|---------|-------------|\n`;

  for (const result of results) {
    const character = characterMap.get(result.characterId);
    const bestEval = result.allVoiceEvaluations.find(e => e.voiceName === result.bestVoice);
    
    if (!bestEval) continue;

    report += `| ${result.rank} | ${result.characterName} | ${result.bestVoice} | ${result.bestScore.toFixed(2)} | `;
    report += `${bestEval.agentScores.gender.toFixed(1)} | ${bestEval.agentScores.age.toFixed(1)} | `;
    report += `${bestEval.agentScores.accent.toFixed(1)} | ${bestEval.agentScores.overall.toFixed(1)} | `;
    report += `${bestEval.agentScores.consistency.toFixed(1)} |\n`;
  }

  report += `\n## Top 10 Characters\n\n`;
  for (const result of results.slice(0, 10)) {
    const character = characterMap.get(result.characterId);
    const bestEval = result.allVoiceEvaluations.find(e => e.voiceName === result.bestVoice);
    const voiceMeta = getVoiceMetadata(result.bestVoice);

    report += `### ${result.rank}. ${result.characterName}\n\n`;
    report += `- **Voice**: ${result.bestVoice} (${voiceMeta?.gender}, ${voiceMeta?.age})\n`;
    report += `- **Score**: ${result.bestScore.toFixed(2)}/10\n`;
    report += `- **Category**: ${character?.category || 'Unknown'}\n`;
    report += `- **Archetype**: ${character?.archetype || 'Unknown'}\n`;
    
    if (bestEval) {
      report += `- **Scores**: Gender ${bestEval.agentScores.gender.toFixed(1)}, Age ${bestEval.agentScores.age.toFixed(1)}, `;
      report += `Accent ${bestEval.agentScores.accent.toFixed(1)}, Overall ${bestEval.agentScores.overall.toFixed(1)}, `;
      report += `Consistency ${bestEval.agentScores.consistency.toFixed(1)}\n`;
    }
    
    report += `\n`;
  }

  report += `## Voice Distribution\n\n`;
  const voiceCounts = new Map<string, number>();
  for (const result of results) {
    voiceCounts.set(result.bestVoice, (voiceCounts.get(result.bestVoice) || 0) + 1);
  }

  report += `| Voice | Assigned Count |\n`;
  report += `|-------|----------------|\n`;
  for (const [voice, count] of Array.from(voiceCounts.entries()).sort((a, b) => b[1] - a[1])) {
    report += `| ${voice} | ${count} |\n`;
  }

  report += `\n## Recommendations\n\n`;
  report += `1. **Voice Quality**: All characters have been matched with optimal voices based on 5-agent evaluation.\n`;
  report += `2. **Consistency**: Monitor voice consistency in production to ensure quality.\n`;
  report += `3. **Future Characters**: Use this audit system for new character voice assignments.\n`;
  report += `4. **Testing**: Test all 30 characters in production to verify voice matches.\n\n`;

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    const report = await generateAuditReport();
    
    const outputPath = join(__dirname, '..', 'docs', 'voice-audit-report.md');
    await writeFile(outputPath, report);
    
    console.log(`\nAudit report generated: ${outputPath}`);
    console.log(report);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

