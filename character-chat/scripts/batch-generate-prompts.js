/**
 * Batch generate image prompts with proper rate limiting
 * Processes characters in small batches with delays
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

async function generateImagePrompt(persona) {
  const isAnime = persona.category === 'fiction' && 
                  (persona.archetype?.toLowerCase().includes('anime') || 
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
1. Accurately match the character's name and description
2. Style: ${isAnime ? 'Anime/waifu style, stylized, colorful' : 'Realistic portrait, casual "person next door" style, natural lighting'}
3. Format: Professional headshot/portrait, upper body or close-up face
4. Expression: Match the character's personality
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
    if (error.error?.code === 429) {
      const retryAfter = error.error.details?.[0]?.retryDelay || 60;
      console.log(`  ⏳ Rate limited. Waiting ${retryAfter}s...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return generateImagePrompt(persona); // Retry
    }
    throw error;
  }
}

async function main() {
  console.log('🎨 Batch generating accurate avatar prompts...\n');

  const seedPath = path.join(__dirname, '../data/persona-templates.seed.json');
  const personas = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

  // Check for existing results
  const resultsPath = path.join(__dirname, '../data/avatar-prompts-generated.json');
  let existingResults = [];
  if (fs.existsSync(resultsPath)) {
    existingResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    console.log(`📂 Found ${existingResults.length} existing prompts\n`);
  }

  const existingIds = new Set(existingResults.map(r => r.id));
  const toProcess = personas.filter(p => !existingIds.has(p.id));

  console.log(`Processing ${toProcess.length} new personas (${existingResults.length} already done)\n`);

  const results = [...existingResults];
  let processed = 0;
  const BATCH_SIZE = 3; // Process 3 at a time
  const DELAY_BETWEEN_BATCHES = 65000; // 65 seconds between batches (to avoid rate limits)

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}: Processing ${batch.length} characters...\n`);

    for (const persona of batch) {
      processed++;
      console.log(`[${processed}/${toProcess.length}] ${persona.name}...`);

      try {
        const imagePrompt = await generateImagePrompt(persona);
        
        if (imagePrompt) {
          results.push({
            id: persona.id,
            name: persona.name,
            currentAvatarUrl: persona.avatarUrl,
            generatedImagePrompt: imagePrompt,
          });
          console.log(`  ✅ ${imagePrompt.substring(0, 80)}...`);
        } else {
          console.log(`  ❌ Failed to generate`);
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }

      // Small delay between items in batch
      if (batch.indexOf(persona) < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Longer delay between batches
    if (i + BATCH_SIZE < toProcess.length) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...\n`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // Save results
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Generated ${results.length} total image prompts`);
  console.log(`📁 Saved to: ${resultsPath}`);
}

main().catch(console.error);



