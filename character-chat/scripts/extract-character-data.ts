/**
 * Character Data Extraction
 * Selects 30 diverse characters from database and extracts metadata
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const db = new PrismaClient();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  category: string;
  archetype: string;
  systemPrompt: string;
  currentVoiceName: string;
  currentStyleHint?: string;
  extractedMetadata: {
    gender: 'male' | 'female' | 'neutral' | 'unknown';
    age: 'young' | 'middle' | 'old' | 'unknown';
    accent?: string;
    culture?: string;
  };
}

/**
 * Extract gender from character description using AI
 */
async function extractGender(name: string, description: string, systemPrompt: string): Promise<'male' | 'female' | 'neutral' | 'unknown'> {
  const ai = getGeminiClient();
  
  const prompt = `Analyze this character and determine their gender. Return ONLY one word: "male", "female", "neutral", or "unknown".

Character Name: ${name}
Description: ${description}
System Prompt: ${systemPrompt.substring(0, 500)}

Return only the gender word, nothing else.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
    });

    const response = result.text?.trim().toLowerCase() || 'unknown';
    if (['male', 'female', 'neutral'].includes(response)) {
      return response as 'male' | 'female' | 'neutral';
    }
    return 'unknown';
  } catch (error) {
    console.error(`Error extracting gender for ${name}:`, error);
    return 'unknown';
  }
}

/**
 * Extract age from character description using AI
 */
async function extractAge(name: string, description: string, systemPrompt: string): Promise<'young' | 'middle' | 'old' | 'unknown'> {
  const ai = getGeminiClient();
  
  const prompt = `Analyze this character and determine their age category. Return ONLY one word: "young", "middle", "old", or "unknown".

Character Name: ${name}
Description: ${description}
System Prompt: ${systemPrompt.substring(0, 500)}

Return only the age category word, nothing else.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
    });

    const response = result.text?.trim().toLowerCase() || 'unknown';
    if (['young', 'middle', 'old'].includes(response)) {
      return response as 'young' | 'middle' | 'old';
    }
    return 'unknown';
  } catch (error) {
    console.error(`Error extracting age for ${name}:`, error);
    return 'unknown';
  }
}

/**
 * Extract accent/culture from character description using AI
 */
async function extractAccent(name: string, description: string, systemPrompt: string): Promise<{ accent?: string; culture?: string }> {
  const ai = getGeminiClient();
  
  const prompt = `Analyze this character and determine their accent and cultural background. Return JSON with "accent" and "culture" fields. If unknown, use "unknown".

Character Name: ${name}
Description: ${description}
System Prompt: ${systemPrompt.substring(0, 500)}

Return JSON only: {"accent": "...", "culture": "..."}`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(result.text || '{}');
    return {
      accent: parsed.accent && parsed.accent !== 'unknown' ? parsed.accent : undefined,
      culture: parsed.culture && parsed.culture !== 'unknown' ? parsed.culture : undefined,
    };
  } catch (error) {
    console.error(`Error extracting accent for ${name}:`, error);
    return {};
  }
}

/**
 * Select 30 diverse characters from database
 * Prioritizes diversity across categories, genders, ages, and backgrounds
 */
export async function selectDiverseCharacters(): Promise<CharacterData[]> {
  // Get all characters
  const allCharacters = await db.personaTemplate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      tagline: true,
      category: true,
      archetype: true,
      systemPrompt: true,
      voiceName: true,
      styleHint: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${allCharacters.length} total characters`);

  // Group by category for diversity
  const byCategory = {
    Human: allCharacters.filter(c => c.category === 'Human' || c.category === 'human'),
    Fantasy: allCharacters.filter(c => c.category === 'Fantasy' || c.category === 'fantasy'),
    Other: allCharacters.filter(c => c.category !== 'Human' && c.category !== 'human' && c.category !== 'Fantasy' && c.category !== 'fantasy'),
  };

  // Select diverse characters (aim for ~15 Human, ~15 Fantasy)
  const selected: typeof allCharacters = [];
  
  // Take from each category
  const humanCount = Math.min(15, byCategory.Human.length);
  const fantasyCount = Math.min(15, byCategory.Fantasy.length);
  const otherCount = 30 - humanCount - fantasyCount;

  // Select from Human category
  for (let i = 0; i < humanCount && i < byCategory.Human.length; i++) {
    selected.push(byCategory.Human[i]);
  }

  // Select from Fantasy category
  for (let i = 0; i < fantasyCount && i < byCategory.Fantasy.length; i++) {
    selected.push(byCategory.Fantasy[i]);
  }

  // Fill remaining slots from any category
  const remaining = allCharacters.filter(c => !selected.find(s => s.id === c.id));
  for (let i = 0; i < otherCount && i < remaining.length && selected.length < 30; i++) {
    selected.push(remaining[i]);
  }

  // If we still don't have 30, fill from any remaining
  while (selected.length < 30 && remaining.length > selected.length) {
    const next = remaining.find(c => !selected.find(s => s.id === c.id));
    if (next) {
      selected.push(next);
    } else {
      break;
    }
  }

  console.log(`Selected ${selected.length} characters for audit`);

  // Extract metadata for each character
  const charactersWithMetadata: CharacterData[] = [];

  for (const char of selected) {
    console.log(`Extracting metadata for ${char.name}...`);

    const [gender, age, accentData] = await Promise.all([
      extractGender(char.name, char.description || '', char.systemPrompt),
      extractAge(char.name, char.description || '', char.systemPrompt),
      extractAccent(char.name, char.description || '', char.systemPrompt),
    ]);

    charactersWithMetadata.push({
      id: char.id,
      name: char.name,
      description: char.description || '',
      tagline: char.tagline || undefined,
      category: char.category,
      archetype: char.archetype,
      systemPrompt: char.systemPrompt,
      currentVoiceName: char.voiceName,
      currentStyleHint: char.styleHint || undefined,
      extractedMetadata: {
        gender,
        age,
        accent: accentData.accent,
        culture: accentData.culture,
      },
    });

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return charactersWithMetadata;
}

/**
 * Main execution
 */
async function main() {
  try {
    const characters = await selectDiverseCharacters();
    
    console.log('\n=== Selected Characters ===');
    characters.forEach((char, index) => {
      console.log(`${index + 1}. ${char.name} (${char.category}) - ${char.extractedMetadata.gender}, ${char.extractedMetadata.age}`);
    });

    console.log(`\nTotal: ${characters.length} characters selected`);
    
    // Save to JSON file for use by other scripts
    const outputPath = join(__dirname, 'selected-characters.json');
    await writeFile(
      outputPath,
      JSON.stringify(characters, null, 2)
    );
    
    console.log('\nSaved to character-chat/scripts/selected-characters.json');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

