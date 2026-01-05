/**
 * Character Image Generation Script using Gemini API
 * 
 * Generates character avatars in the Agentwood art style based on data from
 * comprehensive-character-data.xlsx
 * 
 * Art Style: Stylized digital illustration portraits with bold vibrant colors,
 * dramatic lighting, atmospheric backgrounds, semi-realistic with illustrative quality.
 * 
 * Usage: npx ts-node scripts/generate-character-images.ts
 */

import dotenv from 'dotenv';
import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ES Module compatibility - get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config();

// Constants
const EXCEL_PATH = '/Users/akeemojuko/Downloads/comprehensive-character-data.xlsx';
const OUTPUT_DIR = path.join(__dirname, '../public/characters');

// GEMINI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// --- STYLE RECIPE (Updated to match user's reference images) ---
// User examples: Detailed digital illustrations with painterly brush strokes, 
// rich atmospheric backgrounds, warm/cool color palettes, semi-realistic faces
const STYLE_BLOCK = "detailed digital illustration, painterly brush strokes, semi-realistic portrait, rich atmospheric background, cinematic composition, warm and cool color contrast, dramatic lighting with rim lights and soft fill, detailed facial features, expressive eyes, textured clothing, environmental storytelling, moody atmosphere, vibrant color palette, professional concept art quality, artstation trending, 4k ultra detailed";

const NEGATIVE_CONSTRAINTS = "cartoon, anime, chibi, pixar style, 3d render, photorealistic photograph, blurry, low quality, deformed face, extra fingers, text overlay, watermark, signature, logo, plain background, flat colors, amateur art";

interface CharacterData {
    'Character ID': string;
    'Seed ID': string;
    'Name': string;
    'Category': string;
    'Description': string;
    'Face Description': string;
    'Image Generation Prompt': string;
    'Age': number;
    'Gender': string;
    'Heritage': string;
}

/**
 * Use Gemini to transform character data into a detailed image generation recipe
 */
async function craftDetailedPrompt(char: CharacterData): Promise<string> {
    const prompt = `
    Transform the following character into a detailed image generation description following this format:
    Character: [age, body type, skin tone (MUST BE REALISTIC - e.g. brown, white, tan, NOT neo-shaded), hair, outfit, signature accessory]
    Environment: [a concise, atmospheric scene that fits this character - make it DETAILED and COLORFUL]
    Lighting: [BRIGHT and well-lit: warm practical lights, cinematic rim lighting, colorful accents, avoid dark muddy shadows]
    Framing: [waist-up portrait or three-quarter view]

    Character Name: ${char['Name']}
    Description: ${char['Description']}
    Metadata: Age ${char['Age']}, Gender ${char['Gender']}, Heritage ${char['Heritage']}
    
    Keep it concise but vivid. Focus on visual details. 
    Ensure the character's appearance is detailed and the scene is brightly lit with realistic colors.
    Return ONLY the four lines (Character, Environment, Lighting, Framing).
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    } catch (e) {
        console.error(`  ⚠️ Gemini prompt crafting failed for ${char['Name']}, using fallback.`);
        return `Character: ${char['Name']}, ${char['Heritage']}\nEnvironment: Atmospheric background\nLighting: Neon backlight\nFraming: Waist-up portrait`;
    }
}

/**
 * Generate image using Pollinations.ai (using the crafted recipe)
 */
async function generateImage(recipe: string, characterId: string): Promise<{ success: boolean; imagePath?: string; error?: string }> {
    // Combine for final prompt
    const finalPrompt = `“${STYLE_BLOCK}”\n\n${recipe}\n\nNegative: ${NEGATIVE_CONSTRAINTS}`;

    try {
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=1000&height=1000&nologo=true&seed=${characterId}&model=flux`;

        console.log(`  Generating via Pollinations.ai...`);

        const response = await fetch(pollinationsUrl);

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }

        const imageBuffer = await response.arrayBuffer();

        // Save image
        const imagePath = path.join(OUTPUT_DIR, `${characterId}.png`);
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));

        return { success: true, imagePath };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Update character data with new avatar URLs
 */
async function updateCharacterAvatars(characters: CharacterData[], generatedImages: Map<string, string>): Promise<void> {
    console.log('\n📝 Generating avatar URL update SQL...');

    const sqlStatements: string[] = [];

    for (const [seedId, imagePath] of generatedImages) {
        const relativePath = `/characters/${seedId}.png`;
        sqlStatements.push(`UPDATE personas SET avatar_url = '${relativePath}' WHERE seed_id = '${seedId}';`);
    }

    const sqlPath = path.join(__dirname, 'update-character-avatars.sql');
    fs.writeFileSync(sqlPath, sqlStatements.join('\n'));
    console.log(`  Saved SQL to: ${sqlPath}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
    console.log('🎨 Character Image Generation Script');
    console.log('=====================================\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        console.log(`Created output directory: ${OUTPUT_DIR}`);
    }

    // Read Excel file
    console.log(`📖 Reading Excel file: ${EXCEL_PATH}\n`);
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const characters: CharacterData[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${characters.length} characters\n`);

    // Generate images
    const generatedImages = new Map<string, string>();
    const errors: Array<{ seedId: string; error: string }> = [];

    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const seedId = char['Seed ID'];
        const name = char['Name'];

        console.log(`[${i + 1}/${characters.length}] Crafting recipe for: ${name} (${seedId})`);

        // Craft recipe using Gemini
        const recipe = await craftDetailedPrompt(char);
        console.log(`  Recipe:\n${recipe.split('\n').map(l => '    ' + l).join('\n')}`);

        // Generate image
        const result = await generateImage(recipe, seedId);

        if (result.success) {
            console.log(`  ✅ Saved to: ${result.imagePath}`);
            generatedImages.set(seedId, result.imagePath!);
        } else {
            console.log(`  ❌ Error: ${result.error}`);
            errors.push({ seedId, error: result.error! });
        }

        // Rate limiting - wait between requests
        await new Promise(r => setTimeout(r, 2000));
    }

    // Generate SQL update script
    await updateCharacterAvatars(characters, generatedImages);

    // Summary
    console.log('\n=====================================');
    console.log('📊 Generation Summary');
    console.log('=====================================');
    console.log(`✅ Successfully generated: ${generatedImages.size}/${characters.length}`);
    console.log(`❌ Failed: ${errors.length}/${characters.length}`);

    if (errors.length > 0) {
        console.log('\n🔴 Failed Characters:');
        for (const err of errors) {
            console.log(`   - ${err.seedId}: ${err.error}`);
        }
    }

    // Save results
    const resultsPath = path.join(__dirname, 'image-generation-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        total: characters.length,
        generated: generatedImages.size,
        failed: errors.length,
        generatedImages: Object.fromEntries(generatedImages),
        errors
    }, null, 2));

    console.log(`\n💾 Results saved to: ${resultsPath}`);
}

// Run
main().catch(console.error);
