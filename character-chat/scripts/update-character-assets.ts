/**
 * Update Character Assets Script
 * 
 * Updates all characters with:
 * 1. Accurate images using prompt: "do an image depicting a character named [Name] [Description]"
 * 2. Matching voices using the same prompt style
 * 3. Updated talking styles to match character
 * 
 * Fantasy characters use a different prompt style.
 */

import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

// Check if character is fantasy
function isFantasyCharacter(category: string, description?: string | null): boolean {
  const fantasyCategories = ['fantasy', 'fiction', 'adventure', 'horror', 'sci-fi', 'anime', 'manga'];
  const lowerCategory = category.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  
  return fantasyCategories.some(fc => lowerCategory.includes(fc)) ||
         lowerDesc.includes('fantasy') ||
         lowerDesc.includes('magic') ||
         lowerDesc.includes('dragon') ||
         lowerDesc.includes('anime') ||
         lowerDesc.includes('waifu');
}

// Generate image using Gemini
async function generateCharacterImage(
  ai: any,
  characterName: string,
  description: string,
  isFantasy: boolean
): Promise<{ imageData: string; mimeType: string }> {
  let imagePrompt: string;
  
  if (isFantasy) {
    // Fantasy characters use a different prompt style
    imagePrompt = `do an image depicting a fantasy character named ${characterName}. ${description}. The image should be in anime/manga style, vibrant colors, upper body shot, suitable for a character avatar.`;
  } else {
    // Realistic characters use the exact prompt style requested by user
    imagePrompt = `do an image depicting a character named ${characterName}. ${description}`;
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        parts: [{ text: imagePrompt }]
      }],
      config: {
        responseMimeType: 'image/png',
      },
    });

    // Extract image data
    const imageData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('image')
    )?.inlineData?.data;

    if (!imageData) {
      throw new Error('No image data returned from Gemini');
    }

    const mimeType = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('image')
    )?.inlineData?.mimeType || 'image/png';

    return { imageData, mimeType };
  } catch (error: any) {
    console.error(`Error generating image for ${characterName}:`, error.message);
    throw error;
  }
}

// Save image to public/avatars directory
async function saveImageToFile(imageData: string, characterId: string, mimeType: string): Promise<string> {
  const avatarsDir = path.join(process.cwd(), 'public', 'avatars');
  
  // Ensure directory exists
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
  }

  const extension = mimeType.includes('png') ? 'png' : 'jpg';
  const filename = `${characterId}.${extension}`;
  const filepath = path.join(avatarsDir, filename);

  // Convert base64 to buffer and save
  const buffer = Buffer.from(imageData, 'base64');
  fs.writeFileSync(filepath, buffer);

  // Return relative URL
  return `/avatars/${filename}`;
}

// Generate voice configuration using Gemini - using same prompt style as image
async function generateVoiceConfig(
  ai: any,
  characterName: string,
  description: string,
  isFantasy: boolean
): Promise<{ voiceName: string; styleHint: string }> {
  // Use the same prompt style as image generation
  const prompt = isFantasy
    ? `do a voice configuration for a fantasy character named ${characterName}. ${description}. Return JSON with voiceName (one of: achernar, achird, algenib, algieba, alnilam, aoede, autonoe, callirrhoe, charon, despina, enceladus, erinome, fenrir, gacrux, iapetus, kore, laomedeia, leda, orus, puck, pulcherrima, rasalgethi, sadachbia, sadaltager, schedar, sulafat, umbriel, vindemiatrix, zephyr, zubenelgenubi) and styleHint (brief description of how they should sound).`
    : `do a voice configuration for a character named ${characterName}. ${description}. Return JSON with voiceName (one of: achernar, achird, algenib, algieba, alnilam, aoede, autonoe, callirrhoe, charon, despina, enceladus, erinome, fenrir, gacrux, iapetus, kore, laomedeia, leda, orus, puck, pulcherrima, rasalgethi, sadachbia, sadaltager, schedar, sulafat, umbriel, vindemiatrix, zephyr, zubenelgenubi) and styleHint (brief description of how they should sound).`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            voiceName: { type: Type.STRING },
            styleHint: { type: Type.STRING }
          },
          required: ['voiceName', 'styleHint']
        }
      }
    });

    const config = JSON.parse(result.text || '{}');
    
    // Validate voice name
    const validVoices = ['achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe', 
      'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir', 'gacrux', 'iapetus', 
      'kore', 'laomedeia', 'leda', 'orus', 'puck', 'pulcherrima', 'rasalgethi', 'sadachbia', 
      'sadaltager', 'schedar', 'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];
    
    if (!validVoices.includes(config.voiceName?.toLowerCase())) {
      // Default to a safe voice
      config.voiceName = 'kore';
    } else {
      config.voiceName = config.voiceName.toLowerCase();
    }

    return {
      voiceName: config.voiceName,
      styleHint: config.styleHint || 'natural, conversational'
    };
  } catch (error: any) {
    console.error(`Error generating voice config for ${characterName}:`, error.message);
    // Return default
    return {
      voiceName: 'kore',
      styleHint: 'natural, conversational'
    };
  }
}

// Generate updated talking style/system prompt
async function generateTalkingStyle(
  ai: any,
  characterName: string,
  description: string,
  currentSystemPrompt?: string
): Promise<string> {
  const prompt = `Update the talking style and system prompt for this character to match their description accurately:

Character Name: ${characterName}
Description: ${description}
${currentSystemPrompt ? `Current System Prompt: ${currentSystemPrompt.substring(0, 500)}` : ''}

Generate an updated system prompt that:
1. Accurately reflects the character's personality based on their description
2. Includes appropriate talking style (formal, casual, professional, etc.)
3. Matches the character's role and expertise
4. Maintains appropriate boundaries

Return the complete system prompt as a string.`;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });

    return result.text || currentSystemPrompt || '';
  } catch (error: any) {
    console.error(`Error generating talking style for ${characterName}:`, error.message);
    return currentSystemPrompt || '';
  }
}

// Main update function
async function updateCharacterAssets() {
  const ai = getGeminiClient();
  
  console.log('Starting character asset update...');
  
  // Fetch all characters
  const characters = await prisma.personaTemplate.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${characters.length} characters to update`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ name: string; error: string }> = [];

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    console.log(`\n[${i + 1}/${characters.length}] Processing: ${character.name}`);

    try {
      const isFantasy = isFantasyCharacter(character.category, character.description);
      const description = character.description || character.tagline || character.name;

      // 1. Generate new image
      console.log('  → Generating image...');
      const { imageData, mimeType } = await generateCharacterImage(
        ai,
        character.name,
        description,
        isFantasy
      );

      // 2. Save image
      console.log('  → Saving image...');
      const avatarUrl = await saveImageToFile(imageData, character.id, mimeType);

      // 3. Generate voice config
      console.log('  → Generating voice configuration...');
      const voiceConfig = await generateVoiceConfig(
        ai,
        character.name,
        description,
        isFantasy
      );

      // 4. Generate talking style
      console.log('  → Generating talking style...');
      const updatedSystemPrompt = await generateTalkingStyle(
        ai,
        character.name,
        description,
        character.systemPrompt
      );

      // 5. Update database
      console.log('  → Updating database...');
      await prisma.personaTemplate.update({
        where: { id: character.id },
        data: {
          avatarUrl,
          voiceName: voiceConfig.voiceName,
          styleHint: voiceConfig.styleHint,
          systemPrompt: updatedSystemPrompt,
          updatedAt: new Date()
        }
      });

      console.log(`  ✓ Successfully updated ${character.name}`);
      successCount++;

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`  ✗ Error updating ${character.name}:`, error.message);
      errors.push({ name: character.name, error: error.message });
      errorCount++;
    }
  }

  console.log('\n=== Update Complete ===');
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`);
    });
  }
}

// Run the script
updateCharacterAssets()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

