/**
 * TTS Sample Generation
 * Generates TTS audio samples for each character-voice-dialogue combination
 */

import { GoogleGenAI } from '@google/genai';
import { Modality } from '@google/genai';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { TestDialogue } from './generate-test-dialogues';
import type { CharacterData } from './extract-character-data';
import { getAllVoiceNames } from './voice-metadata';

export interface TTSSample {
  characterId: string;
  dialogueIndex: number;
  voiceName: string;
  audioBase64: string;
  sampleRate: number;
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Extract dialogue text from message (handles single quotes)
 */
function extractDialogueForTTS(text: string): string {
  const dialogueParts: string[] = [];
  const dialogueRegex = /'([^']+)'/g;
  
  let match;
  while ((match = dialogueRegex.exec(text)) !== null) {
    dialogueParts.push(match[1]);
  }
  
  if (dialogueParts.length === 0) {
    // If no quotes, use the text as-is
    return text;
  }
  
  return dialogueParts.join(', ');
}

/**
 * Generate TTS audio for a dialogue with a specific voice
 */
async function generateTTS(dialogueText: string, voiceName: string): Promise<{ audioBase64: string; sampleRate: number }> {
  const ai = getGeminiClient();

  // Extract dialogue if it has quotes
  const textForTTS = extractDialogueForTTS(dialogueText);

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: textForTTS }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: voiceName.toLowerCase()
            }
          }
        }
      }
    });

    const audioData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('audio')
    )?.inlineData?.data;

    if (!audioData) {
      throw new Error('No audio data returned');
    }

    return {
      audioBase64: audioData,
      sampleRate: 24000, // Gemini TTS default
    };
  } catch (error) {
    console.error(`Error generating TTS for voice ${voiceName}:`, error);
    throw error;
  }
}

/**
 * Generate TTS samples for evaluation
 * Optimized: Generate one dialogue sample per character-voice combination (not all 5 dialogues)
 */
export async function generateAllTTSSamples(): Promise<TTSSample[]> {
  // Load dialogues and characters
  const dialoguesPath = join(__dirname, 'test-dialogues.json');
  const charactersPath = join(__dirname, 'selected-characters.json');
  
  const dialoguesData = await readFile(dialoguesPath, 'utf-8');
  const charactersData = await readFile(charactersPath, 'utf-8');
  
  const dialogues: TestDialogue[] = JSON.parse(dialoguesData);
  const characters: CharacterData[] = JSON.parse(charactersData);

  // Get all voice names
  const voiceNames = getAllVoiceNames();

  // Group dialogues by character
  const dialoguesByCharacter = new Map<string, TestDialogue[]>();
  for (const dialogue of dialogues) {
    if (!dialoguesByCharacter.has(dialogue.characterId)) {
      dialoguesByCharacter.set(dialogue.characterId, []);
    }
    dialoguesByCharacter.get(dialogue.characterId)!.push(dialogue);
  }

  console.log(`Generating TTS samples for ${characters.length} characters × ${voiceNames.length} voices...`);
  console.log(`Using first dialogue from each character for evaluation`);
  console.log(`Total: ${characters.length * voiceNames.length} TTS generations`);

  // Try to load existing samples to resume
  let allSamples: TTSSample[] = [];
  const existingSamplesPath = join(__dirname, 'tts-samples.json');
  try {
    const existingData = await readFile(existingSamplesPath, 'utf-8');
    allSamples = JSON.parse(existingData);
    console.log(`Resuming: Found ${allSamples.length} existing TTS samples`);
  } catch {
    // No existing samples, start fresh
  }

  // Create set of already generated samples
  const existingSamples = new Set<string>();
  for (const sample of allSamples) {
    existingSamples.add(`${sample.characterId}-${sample.voiceName}`);
  }

  let completed = allSamples.length;
  const total = characters.length * voiceNames.length;

  // Generate one TTS sample per character-voice combination (using first dialogue)
  for (const character of characters) {
    const characterDialogues = dialoguesByCharacter.get(character.id) || [];
    const firstDialogue = characterDialogues[0];
    
    if (!firstDialogue) {
      console.warn(`No dialogues found for character ${character.name}, skipping`);
      continue;
    }

    for (const voiceName of voiceNames) {
      // Skip if already generated
      const sampleKey = `${character.id}-${voiceName}`;
      if (existingSamples.has(sampleKey)) {
        continue;
      }

      try {
        console.log(`[${completed + 1}/${total}] Generating: ${character.name} - ${voiceName}...`);

        const { audioBase64, sampleRate } = await generateTTS(firstDialogue.text, voiceName);

        allSamples.push({
          characterId: character.id,
          dialogueIndex: firstDialogue.dialogueIndex,
          voiceName,
          audioBase64,
          sampleRate,
        });

        completed++;

        // Save progress periodically (every 50 samples)
        if (completed % 50 === 0) {
          const progressPath = join(__dirname, 'tts-samples-progress.json');
          await writeFile(progressPath, JSON.stringify(allSamples, null, 2));
          console.log(`Progress saved: ${completed}/${total} (${Math.round(completed / total * 100)}%)`);
        }

        // Rate limiting delay - increased to avoid hitting limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate TTS for ${character.name} - ${voiceName}:`, error);
        // Continue with next sample
      }
    }
  }

  // Save final results
  const outputPath = join(__dirname, 'tts-samples.json');
  await writeFile(outputPath, JSON.stringify(allSamples, null, 2));

  console.log(`\nGenerated ${allSamples.length} TTS samples`);
  console.log(`Saved to ${outputPath}`);

  return allSamples;
}

/**
 * Main execution
 */
async function main() {
  try {
    await generateAllTTSSamples();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

