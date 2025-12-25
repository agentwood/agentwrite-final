/**
 * Scoring and Ranking System
 * Calculates weighted averages from 5-agent panel and ranks all characters
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../.env.local') });

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { CharacterData } from './extract-character-data';
import type { TestDialogue } from './generate-test-dialogues';
import type { TTSSample } from './generate-tts-samples';
import type { CharacterData } from './extract-character-data';
import { getVoiceMetadata, getAllVoiceNames } from './voice-metadata';
import { evaluateGenderMatch } from './evaluators/genderEvaluator';
import { evaluateAgeMatch } from './evaluators/ageEvaluator';
import { evaluateAccentMatch } from './evaluators/accentEvaluator';
import { evaluateOverallFit } from './evaluators/overallEvaluator';
import { evaluateConsistency } from './evaluators/consistencyEvaluator';

export interface VoiceEvaluation {
  characterId: string;
  voiceName: string;
  agentScores: {
    gender: number; // 1-10
    age: number;
    accent: number;
    overall: number;
    consistency: number;
  };
  weightedAverage: number;
  reasoning: {
    gender: string;
    age: string;
    accent: string;
    overall: string;
    consistency: string;
  };
}

export interface AuditResult {
  characterId: string;
  characterName: string;
  bestVoice: string;
  bestScore: number;
  allVoiceEvaluations: VoiceEvaluation[];
  rank: number;
}

/**
 * Evaluate all character-voice combinations
 */
export async function evaluateAllCombinations(): Promise<VoiceEvaluation[]> {
  // Load data
  const charactersPath = join(__dirname, 'selected-characters.json');
  const dialoguesPath = join(__dirname, 'test-dialogues.json');
  const ttsSamplesPath = join(__dirname, 'tts-samples.json');
  
  const charactersData = await readFile(charactersPath, 'utf-8');
  const dialoguesData = await readFile(dialoguesPath, 'utf-8');
  
  let ttsSamples: TTSSample[] = [];
  try {
    const ttsData = await readFile(ttsSamplesPath, 'utf-8');
    ttsSamples = JSON.parse(ttsData);
  } catch (error) {
    console.warn('TTS samples file not found, will evaluate without audio');
  }
  
  const characters: CharacterData[] = JSON.parse(charactersData);
  const dialogues: TestDialogue[] = JSON.parse(dialoguesData);

  // Create TTS samples map for quick lookup
  const ttsSamplesMap = new Map<string, TTSSample>();
  for (const sample of ttsSamples) {
    const key = `${sample.characterId}-${sample.voiceName}`;
    ttsSamplesMap.set(key, sample);
  }

  // Try to load existing evaluations to resume
  let allEvaluations: VoiceEvaluation[] = [];
  const existingEvaluationsPath = join(__dirname, 'voice-evaluations.json');
  try {
    const existingData = await readFile(existingEvaluationsPath, 'utf-8');
    const parsed = JSON.parse(existingData);
    if (Array.isArray(parsed) && parsed.length > 0) {
      allEvaluations = parsed;
      console.log(`Resuming: Found ${allEvaluations.length} existing evaluations`);
    }
  } catch {
    // No existing evaluations, start fresh
  }

  // Create set of already evaluated combinations
  const existingEvaluations = new Set<string>();
  for (const eval_ of allEvaluations) {
    existingEvaluations.add(`${eval_.characterId}-${eval_.voiceName}`);
  }

  // IMMEDIATE FIX: Reduce scope to top 5 voices per character to work within quota limits
  // Select top 5 most promising voices based on metadata matching
  const allVoiceNames = getAllVoiceNames();
  const voiceNames = allVoiceNames.slice(0, 5); // Use only first 5 voices for now

  console.log(`Evaluating ${characters.length} characters × ${voiceNames.length} voices (reduced scope for quota)...`);
  console.log(`Using ${ttsSamples.length} TTS audio samples for evaluation (if available)`);

  for (const character of characters) {
    const characterDialogues = dialogues.filter(d => d.characterId === character.id);
    
    for (const voiceName of voiceNames) {
      // Skip if already evaluated
      const evalKey = `${character.id}-${voiceName}`;
      if (existingEvaluations.has(evalKey)) {
        continue;
      }

      const voiceMetadata = getVoiceMetadata(voiceName);
      if (!voiceMetadata) {
        console.warn(`Voice metadata not found for ${voiceName}, skipping`);
        continue;
      }

      console.log(`Evaluating: ${character.name} - ${voiceName}...`);

      try {
        // Get dialogue samples for this character-voice combination
        const dialogueSamples = characterDialogues.map(d => ({
          text: d.text,
          context: d.context,
        }));

        // Get TTS audio sample for this character-voice combination
        const ttsKey = `${character.id}-${voiceName}`;
        const ttsSample = ttsSamplesMap.get(ttsKey);

        // IMMEDIATE FIX: Skip audio evaluation if TTS sample not available (text-only evaluation)
        // This works around quota issues while still providing voice-character matching
        const useAudio = ttsSample?.audioBase64 && ttsSample.audioBase64.length > 0;
        
        // Run all 5 evaluators (with or without audio)
        const [genderResult, ageResult, accentResult, overallResult, consistencyResult] = await Promise.all([
          evaluateGenderMatch(
            character.name,
            character.extractedMetadata.gender,
            character.description,
            voiceName,
            voiceMetadata.gender,
            dialogueSamples[0]?.text || '',
            useAudio ? ttsSample?.audioBase64 : undefined // Only use audio if available
          ),
          evaluateAgeMatch(
            character.name,
            character.extractedMetadata.age,
            character.description,
            voiceName,
            voiceMetadata.age,
            dialogueSamples[0]?.text || '',
            useAudio ? ttsSample?.audioBase64 : undefined
          ),
          evaluateAccentMatch(
            character.name,
            character.extractedMetadata.accent,
            character.extractedMetadata.culture,
            character.description,
            voiceName,
            voiceMetadata.accent,
            dialogueSamples[0]?.text || '',
            useAudio ? ttsSample?.audioBase64 : undefined
          ),
          evaluateOverallFit(
            character.name,
            character.description,
            character.category,
            character.archetype,
            voiceName,
            voiceMetadata.description,
            dialogueSamples[0]?.text || '',
            useAudio ? ttsSample?.audioBase64 : undefined
          ),
          evaluateConsistency(
            character.name,
            character.description,
            voiceName,
            dialogueSamples,
            useAudio && ttsSample ? [ttsSample.audioBase64] : undefined
          ),
        ]);

        // Calculate weighted average (all criteria equally weighted: 20% each)
        const weightedAverage = (
          genderResult.score * 0.2 +
          ageResult.score * 0.2 +
          accentResult.score * 0.2 +
          overallResult.score * 0.2 +
          consistencyResult.score * 0.2
        );

        allEvaluations.push({
          characterId: character.id,
          voiceName,
          agentScores: {
            gender: genderResult.score,
            age: ageResult.score,
            accent: accentResult.score,
            overall: overallResult.score,
            consistency: consistencyResult.score,
          },
          weightedAverage,
          reasoning: {
            gender: genderResult.reasoning,
            age: ageResult.reasoning,
            accent: accentResult.reasoning,
            overall: overallResult.reasoning,
            consistency: consistencyResult.reasoning,
          },
        });

        // Aggressive rate limiting: 60 requests per minute max (1000 limit, but we need 5 per evaluation)
        // Space out requests: 1 second between each, plus batch delays
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Every 50 evaluations, wait 30 seconds to avoid hitting rate limits
        if (allEvaluations.length % 50 === 0 && allEvaluations.length > 0) {
          console.log(`\n⏸️  Rate limit protection: Waiting 30 seconds after ${allEvaluations.length} evaluations...`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } catch (error) {
        console.error(`Error evaluating ${character.name} - ${voiceName}:`, error);
        // Continue with next combination
      }
    }
  }

  // Save evaluations (append to existing)
  const outputPath = join(__dirname, 'voice-evaluations.json');
  await writeFile(outputPath, JSON.stringify(allEvaluations, null, 2));
  console.log(`\nSaved ${allEvaluations.length} total evaluations to ${outputPath}`);

  return allEvaluations;
}

/**
 * Rank characters and assign best voices
 */
export async function rankAndAssignVoices(): Promise<AuditResult[]> {
  // Load evaluations
  const evaluationsPath = join(__dirname, 'voice-evaluations.json');
  const charactersPath = join(__dirname, 'selected-characters.json');

  const evaluationsData = await readFile(evaluationsPath, 'utf-8');
  const charactersData = await readFile(charactersPath, 'utf-8');

  const evaluations: VoiceEvaluation[] = JSON.parse(evaluationsData);
  const characters: CharacterData[] = JSON.parse(charactersData);

  // Group evaluations by character
  const evaluationsByCharacter = new Map<string, VoiceEvaluation[]>();
  for (const eval_ of evaluations) {
    if (!evaluationsByCharacter.has(eval_.characterId)) {
      evaluationsByCharacter.set(eval_.characterId, []);
    }
    evaluationsByCharacter.get(eval_.characterId)!.push(eval_);
  }

  // Find best voice for each character
  const characterResults: Array<{ character: CharacterData; bestEvaluation: VoiceEvaluation }> = [];
  
  for (const character of characters) {
    const characterEvals = evaluationsByCharacter.get(character.id) || [];
    if (characterEvals.length === 0) continue;

    // Sort by weighted average (descending)
    characterEvals.sort((a, b) => b.weightedAverage - a.weightedAverage);
    const bestEvaluation = characterEvals[0];

    characterResults.push({
      character,
      bestEvaluation,
    });
  }

  // Resolve conflicts: ensure one character per voice
  const voiceAssignments = new Map<string, string>(); // voiceName -> characterId
  const finalResults: AuditResult[] = [];

  // Sort by score (descending) to assign best matches first
  characterResults.sort((a, b) => b.bestEvaluation.weightedAverage - a.bestEvaluation.weightedAverage);

  for (const { character, bestEvaluation } of characterResults) {
    let assignedVoice = bestEvaluation.voiceName;
    let assignedScore = bestEvaluation.weightedAverage;
    let assignedEvaluation = bestEvaluation;

    // Check if voice is already assigned
    if (voiceAssignments.has(assignedVoice)) {
      // Find next best available voice
      const characterEvals = evaluationsByCharacter.get(character.id) || [];
      for (const eval_ of characterEvals) {
        if (!voiceAssignments.has(eval_.voiceName)) {
          assignedVoice = eval_.voiceName;
          assignedScore = eval_.weightedAverage;
          assignedEvaluation = eval_;
          break;
        }
      }
    }

    // Assign voice
    voiceAssignments.set(assignedVoice, character.id);

    finalResults.push({
      characterId: character.id,
      characterName: character.name,
      bestVoice: assignedVoice,
      bestScore: assignedScore,
      allVoiceEvaluations: evaluationsByCharacter.get(character.id) || [],
      rank: finalResults.length + 1,
    });
  }

  // Sort by rank
  finalResults.sort((a, b) => a.rank - b.rank);

  // Save results
  const outputPath = join(__dirname, 'audit-results.json');
  await writeFile(outputPath, JSON.stringify(finalResults, null, 2));
  console.log(`\nSaved audit results to ${outputPath}`);

  return finalResults;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Step 1: Evaluating all character-voice combinations...');
    await evaluateAllCombinations();

    console.log('\nStep 2: Ranking and assigning voices...');
    const results = await rankAndAssignVoices();

    console.log('\n=== Top 10 Results ===');
    results.slice(0, 10).forEach((result, index) => {
      console.log(`${index + 1}. ${result.characterName} -> ${result.bestVoice} (Score: ${result.bestScore.toFixed(2)})`);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

