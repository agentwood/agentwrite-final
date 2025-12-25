/**
 * Test Dialogue Generation
 * Generates 5 diverse dialogue pieces for each character using Gemini
 */

import { GoogleGenAI } from '@google/genai';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import type { CharacterData } from './extract-character-data';

export interface TestDialogue {
  characterId: string;
  dialogueIndex: number;
  text: string;
  context: string; // emotional state, scenario
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Generate 5 diverse dialogues for a character
 */
async function generateDialoguesForCharacter(character: CharacterData): Promise<TestDialogue[]> {
  const ai = getGeminiClient();

  const prompt = `You are ${character.name}. Generate 5 diverse dialogue pieces that this character would say. Each dialogue should be 10-30 words and represent different contexts:

1. Greeting/Introduction (neutral, friendly)
2. Explaining something (serious, informative)
3. Reacting to something (excited, emotional)
4. Asking a question (casual, curious)
5. Closing/Parting (formal or casual depending on character)

Character Details:
- Name: ${character.name}
- Description: ${character.description}
- Category: ${character.category}
- Archetype: ${character.archetype}
- Personality: ${character.systemPrompt.substring(0, 300)}

Return JSON array with this exact format:
[
  {"dialogueIndex": 1, "text": "dialogue text here", "context": "greeting, neutral"},
  {"dialogueIndex": 2, "text": "dialogue text here", "context": "explaining, serious"},
  {"dialogueIndex": 3, "text": "dialogue text here", "context": "reacting, excited"},
  {"dialogueIndex": 4, "text": "dialogue text here", "context": "questioning, curious"},
  {"dialogueIndex": 5, "text": "dialogue text here", "context": "closing, formal"}
]

Each dialogue should be in character and match their personality. Put dialogue in single quotes if needed for TTS extraction.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const dialogues = JSON.parse(result.text || '[]') as Array<{
      dialogueIndex: number;
      text: string;
      context: string;
    }>;

    return dialogues.map(d => ({
      characterId: character.id,
      dialogueIndex: d.dialogueIndex,
      text: d.text,
      context: d.context,
    }));
  } catch (error) {
    console.error(`Error generating dialogues for ${character.name}:`, error);
    // Return fallback dialogues
    return [
      {
        characterId: character.id,
        dialogueIndex: 1,
        text: `Hello, I'm ${character.name}.`,
        context: 'greeting, neutral',
      },
      {
        characterId: character.id,
        dialogueIndex: 2,
        text: `Let me explain this to you.`,
        context: 'explaining, serious',
      },
      {
        characterId: character.id,
        dialogueIndex: 3,
        text: `That's amazing!`,
        context: 'reacting, excited',
      },
      {
        characterId: character.id,
        dialogueIndex: 4,
        text: `What do you think about that?`,
        context: 'questioning, curious',
      },
      {
        characterId: character.id,
        dialogueIndex: 5,
        text: `Goodbye for now.`,
        context: 'closing, formal',
      },
    ];
  }
}

/**
 * Generate dialogues for all characters
 */
export async function generateAllDialogues(): Promise<TestDialogue[]> {
  // Load selected characters
  const charactersPath = join(__dirname, 'selected-characters.json');
  const charactersData = await readFile(charactersPath, 'utf-8');
  const characters: CharacterData[] = JSON.parse(charactersData);

  console.log(`Generating dialogues for ${characters.length} characters...`);

  const allDialogues: TestDialogue[] = [];

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    console.log(`[${i + 1}/${characters.length}] Generating dialogues for ${character.name}...`);

    const dialogues = await generateDialoguesForCharacter(character);
    allDialogues.push(...dialogues);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save dialogues to file
  const outputPath = join(__dirname, 'test-dialogues.json');
  await writeFile(outputPath, JSON.stringify(allDialogues, null, 2));

  console.log(`\nGenerated ${allDialogues.length} dialogues total`);
  console.log(`Saved to ${outputPath}`);

  return allDialogues;
}

/**
 * Main execution
 */
async function main() {
  try {
    await generateAllDialogues();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

