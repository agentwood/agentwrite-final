/**
 * Generate accurate image prompts for character avatars using Gemini
 * Based on each character's persona, name, tagline, and description
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generate an image prompt for a character using Gemini
 */
async function generateImagePrompt(persona) {
  const prompt = `You are an expert at creating detailed image prompts for AI image generators.

Character Information:
- Name: ${persona.name}
- Tagline: ${persona.tagline || 'N/A'}
- Category: ${persona.category}
- Archetype: ${persona.archetype || 'N/A'}
- Persona Description: ${persona.system?.persona || 'N/A'}

Generate a detailed, specific image prompt for this character's avatar/portrait. The prompt should:
1. Accurately represent the character's appearance based on their name, tagline, and persona
2. Match the character's archetype and category (realistic for realistic characters, anime for fantasy/stylized)
3. Be suitable for a portrait/avatar (headshot or upper body)
4. Include specific details about age, appearance, expression, and style
5. Be appropriate for a "man or woman next door" casual style if the character is realistic
6. Use anime/waifu style if the character is fantasy/stylized

Return ONLY the image prompt text, nothing else. Make it detailed and specific.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const imagePrompt = result.text?.trim() || '';
    return imagePrompt;
  } catch (error) {
    console.error(`Error generating prompt for ${persona.name}:`, error.message);
    return null;
  }
}

/**
 * Main function to process all personas
 */
async function main() {
  console.log('🎨 Generating image prompts for all characters...\n');

  // Load persona templates
  const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
  const personas = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  console.log(`Found ${personas.length} personas\n`);

  const results = [];
  let processed = 0;

  for (const persona of personas) {
    processed++;
    console.log(`[${processed}/${personas.length}] Generating prompt for: ${persona.name}...`);

    const imagePrompt = await generateImagePrompt(persona);
    
    if (imagePrompt) {
      results.push({
        id: persona.id,
        name: persona.name,
        currentAvatarUrl: persona.avatarUrl,
        generatedImagePrompt: imagePrompt,
      });
      console.log(`  ✅ Generated: ${imagePrompt.substring(0, 80)}...\n`);
    } else {
      console.log(`  ❌ Failed to generate prompt\n`);
    }

    // Rate limiting - wait 1 second between requests
    if (processed < personas.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Save results
  const outputPath = path.join(__dirname, '../data/avatar-prompts.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Generated ${results.length} image prompts`);
  console.log(`📁 Saved to: ${outputPath}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Review the generated prompts in data/avatar-prompts.json');
  console.log('   2. Use these prompts with an image generation service (e.g., DALL-E, Midjourney, Stable Diffusion)');
  console.log('   3. Or use Gemini\'s image generation API to create the images directly');
}

main().catch(console.error);




