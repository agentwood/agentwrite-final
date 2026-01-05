/**
 * Character Image Sync Script
 * 
 * This script:
 * 1. Fetches avatar images from Fish Audio model pages for mapped characters
 * 2. Generates images for non-Fish Audio characters using Gemini in the Agentwood art style
 * 
 * Usage: npx ts-node scripts/sync-character-images.ts
 */

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

// Fish Audio character to model ID mapping (from fishAudioClient.ts)
const CHARACTER_VOICE_MAP: Record<string, string> = {
    // ORIGINAL UNIQUE-VOICE CHARACTERS (6)
    'spongebob': '54e3a85ac9594ffa83264b8a494b901b',
    'trap-a-holics': '0b2e96151d67433d93891f15efc25dbd',
    'nico-awkward': '68dbf91dff844e8eab1bb90fcf427582',
    'mina-kwon': 'a86d9eac550d4814b9b4f6fc53661930',
    'detective-jun': '5c71ab35290241ed842d036e4bb0e5da',
    'hector-alvarez': 'b0de63ec40a241abb0ba4b4dc7b222d8',
    // VOICE-FIRST CHARACTERS (16 NEW)
    'isabella-reyes': '26ff45fab722431c85eea2536e5c5197',
    'sofia-vega': 'f742629937b64075a7e7d21f1bec3c64',
    'valentino-estrada': 'a1fe2e1b6f324e27929d5088f2d09be3',
    'bernard-quinn': '65c0b8155c464a648161af8877404f11',
    'liam-ashford': '30c0f62e3e6d45d88387d1b8f84e1685',
    'winston-morris': '5e79e8f5d2b345f98baa8c83c947532d',
    'edmund-blackwell': 'e5f3047b09ab468da84ca21e3f511680',
    'yumi-nakamura': '5161d41404314212af1254556477c17d',
    'mana-hayashi': 'fbea303b64374bffb8843569404b095e',
    'fuka-shimizu': '46745543e52548238593a3962be77e3a',
    'hoshi-kim': '561686c0427b4656b34b960b05b33e56',
    'taesung-lee': '41fbe1068fab4c76aa51c8c16bbad2bd',
    'jinwoo-park': 'a9574d6184714eac96a0a892b719289f',
    'adelie-moreau': '15799596f2c0443389c90607c7cb5414',
    'camille-beaumont': '39ea65c267be4bd6a3ed301520625bb7',
    'alex-hype': '52e0660e03fe4f9a8d2336f67cab5440',
    // NEW DETAILED CHARACTERS (10)
    'marcus-chen': '52e0660e03fe4f9a8d2336f67cab5440',
    'zara-okonkwo': '26ff45fab722431c85eea2536e5c5197',
    'dr-elena-vasquez': 'f742629937b64075a7e7d21f1bec3c64',
    'chef-antonio-rossi': '30c0f62e3e6d45d88387d1b8f84e1685',
    'rei-tanaka': '5161d41404314212af1254556477c17d',
    'maya-patel': 'fbea303b64374bffb8843569404b095e',
    'dj-kira-brooks': '46745543e52548238593a3962be77e3a',
    'professor-david-okafor': '65c0b8155c464a648161af8877404f11',
    'sarah-wheeler': '15799596f2c0443389c90607c7cb5414',
    'grandpa-joe': '5e79e8f5d2b345f98baa8c83c947532d',
    // FUN CATEGORY CHARACTERS (3)
    'doodle-dave': '52e0660e03fe4f9a8d2336f67cab5440',
    'sunny-sato': '5161d41404314212af1254556477c17d',
    'big-tom': '65c0b8155c464a648161af8877404f11',
};

// Get unique model IDs (some characters share voices)
const UNIQUE_VOICE_IDS = new Set(Object.values(CHARACTER_VOICE_MAP));

/**
 * Fetch avatar URL from Fish Audio model page
 */
async function fetchFishAudioAvatar(modelId: string): Promise<string | null> {
    try {
        // Fish Audio model API endpoint
        const apiUrl = `https://api.fish.audio/v1/models/${modelId}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch model ${modelId}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        // Fish Audio model response typically includes avatar_url or cover_image
        return data.avatar_url || data.cover_image || null;
    } catch (error) {
        console.error(`Error fetching Fish Audio model ${modelId}:`, error);
        return null;
    }
}

/**
 * Generate character avatar using Gemini in the Agentwood art style
 */
async function generateGeminiAvatar(characterName: string, description: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not set');
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // Agentwood art style prompt based on uploaded examples
        const prompt = `Stylized digital illustration portrait of ${characterName}. ${description}. 
Art style: Bold vibrant colors with magenta/purple/teal/orange palette. Dramatic lighting. 
Semi-realistic with illustrative quality. Atmospheric background with soft bokeh lights.
Editorial fashion illustration aesthetic. High contrast. Character in profile or 3/4 view.
Clean line work. Confident expression. Professional quality digital art.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseModalities: ['image'],
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    // Return base64 data URL
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }

        return null;
    } catch (error) {
        console.error(`Error generating Gemini avatar for ${characterName}:`, error);
        return null;
    }
}

/**
 * Main sync function
 */
async function syncCharacterImages() {
    console.log('🎨 Starting Character Image Sync...\n');

    const results: Record<string, { seedId: string; avatarUrl: string | null; source: string }> = {};

    // 1. Fetch Fish Audio model avatars
    console.log('📥 Fetching Fish Audio model avatars...');
    const fishAudioAvatars: Record<string, string> = {};

    for (const modelId of UNIQUE_VOICE_IDS) {
        console.log(`  Fetching model ${modelId}...`);
        const avatarUrl = await fetchFishAudioAvatar(modelId);
        if (avatarUrl) {
            fishAudioAvatars[modelId] = avatarUrl;
            console.log(`    ✅ Found avatar`);
        } else {
            console.log(`    ❌ No avatar found`);
        }
        // Rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    // 2. Map Fish Audio avatars to characters
    console.log('\n🔗 Mapping Fish Audio avatars to characters...');
    for (const [seedId, modelId] of Object.entries(CHARACTER_VOICE_MAP)) {
        const avatarUrl = fishAudioAvatars[modelId];
        if (avatarUrl) {
            results[seedId] = { seedId, avatarUrl, source: 'fish-audio' };
            console.log(`  ✅ ${seedId} -> Fish Audio`);
        } else {
            results[seedId] = { seedId, avatarUrl: null, source: 'needs-generation' };
            console.log(`  ⚠️ ${seedId} needs Gemini generation`);
        }
    }

    // 3. Save results to JSON
    const outputPath = path.join(__dirname, 'character-image-sync-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);

    // Summary
    const fishAudioCount = Object.values(results).filter(r => r.source === 'fish-audio' && r.avatarUrl).length;
    const needsGenCount = Object.values(results).filter(r => r.source === 'needs-generation').length;

    console.log(`\n📊 Summary:`);
    console.log(`  Fish Audio avatars: ${fishAudioCount}`);
    console.log(`  Needs Gemini generation: ${needsGenCount}`);
    console.log(`  Total characters: ${Object.keys(results).length}`);
}

// Run if executed directly
syncCharacterImages().catch(console.error);
