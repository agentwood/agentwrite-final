/**
 * Generate accurate avatar image prompts using Gemini
 * and update persona templates with better matching images
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generate an accurate image prompt for a character
 */
async function generateImagePrompt(persona) {
  // Determine if character should be realistic or anime based on category/archetype
  const isAnime = persona.category === 'fiction' && 
                  (persona.archetype?.includes('anime') || 
                   persona.name.toLowerCase().includes('anime') ||
                   persona.scenarioSkin === 'fantasy');

  const prompt = `You are an expert at creating detailed, accurate image prompts for character portraits.

Character Details:
- Name: ${persona.name}
- Tagline: ${persona.tagline || 'N/A'}
- Category: ${persona.category}
- Archetype: ${persona.archetype || 'N/A'}
- Persona: ${persona.system?.persona || 'N/A'}

Generate a detailed image prompt for this character's portrait/avatar. The prompt must:
1. Accurately match the character's name and description (e.g., "Grumpy Old Man" should look like an old grumpy man, "Mafia" should look like a mafia member, "Zombie" should look zombie-like)
2. Style: ${isAnime ? 'Anime/waifu style, stylized, colorful' : 'Realistic portrait, casual "person next door" style, natural lighting'}
3. Format: Professional headshot/portrait, upper body or close-up face
4. Expression: Match the character's personality (grumpy = frowning, mafia = serious/intimidating, etc.)
5. Age and appearance: Match what the character name/description implies
6. Clothing/style: Match the character's archetype and persona

Return ONLY the image prompt text (no markdown, no explanations). Make it specific and detailed.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return result.text?.trim() || null;
  } catch (error) {
    console.error(`Error for ${persona.name}:`, error.message);
    return null;
  }
}

/**
 * Generate a search query for Unsplash based on the prompt
 */
async function generateUnsplashQuery(imagePrompt) {
  const queryPrompt = `Convert this detailed image prompt into a simple, effective Unsplash photo search query (2-4 words max):

Image Prompt: "${imagePrompt}"

Return ONLY the search query words, nothing else.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: queryPrompt,
    });

    return result.text?.trim() || null;
  } catch (error) {
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 Generating accurate avatar prompts for all characters...\n');

  const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
  const personas = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  console.log(`Found ${personas.length} personas\n`);

  const results = [];
  let processed = 0;

  for (const persona of personas) {
    processed++;
    console.log(`[${processed}/${personas.length}] Processing: ${persona.name}...`);

    const imagePrompt = await generateImagePrompt(persona);
    
    if (imagePrompt) {
      const unsplashQuery = await generateUnsplashQuery(imagePrompt);
      
      results.push({
        id: persona.id,
        name: persona.name,
        currentAvatarUrl: persona.avatarUrl,
        generatedImagePrompt: imagePrompt,
        unsplashSearchQuery: unsplashQuery,
      });
      
      console.log(`  ✅ Prompt: ${imagePrompt.substring(0, 100)}...`);
      console.log(`  🔍 Search: ${unsplashQuery || 'N/A'}\n`);
    } else {
      console.log(`  ❌ Failed\n`);
    }

    // Rate limiting
    if (processed < personas.length) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Save results
  const outputPath = path.join(__dirname, '../data/avatar-prompts-generated.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Generated ${results.length} image prompts`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log('\n📋 Review the prompts and update avatar URLs manually, or use an image generation API.');
  console.log('   The prompts are detailed and accurate to each character\'s description.');
}

main().catch(console.error);




