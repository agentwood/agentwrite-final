#!/usr/bin/env node
/**
 * Avatar Generation Script
 * Generates Gemini AI avatars for all characters
 * Run with: npx ts-node scripts/generate-avatars.ts
 * 
 * This script uses the Gemini API to generate photorealistic/anime avatars
 * for all 40 characters in the database.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Character definitions with their avatar prompts
const CHARACTER_AVATARS = [
    // RECOMMEND (5)
    { seedId: 'marge-halloway', filename: 'marge-halloway.png', prompt: 'Photorealistic portrait of a 75 year old American woman, silver bob haircut, pearl stud earrings, sharp eyebrows, neat cardigan sweater, pursed lips, judging but composed expression, warm lighting, professional headshot style, high quality' },
    { seedId: 'raj-corner-store', filename: 'raj.png', prompt: 'Photorealistic portrait of a 42 year old Indian-American man, warm brown eyes, trimmed beard, tired smile lines, polo shirt, alert friendly gaze, warm lighting, professional headshot style, high quality' },
    { seedId: 'camille-laurent', filename: 'camille-laurent.png', prompt: 'Photorealistic portrait of a 37 year old French woman perfumer, dark bob haircut, catlike eyes, minimal elegant black outfit, subtle confident half-smile, mysterious sensory vibe, soft studio lighting, professional headshot style, high quality' },
    { seedId: 'coach-boone', filename: 'coach-boone.png', prompt: 'Photorealistic portrait of a 36 year old muscular Black American man, ex-Marine fitness trainer, buzz cut, square jaw, stern eyes, stopwatch around neck, upright posture, military discipline look, professional headshot style, high quality' },
    { seedId: 'yuki-tanaka', filename: 'yuki-tanaka.png', prompt: 'Anime style portrait of a 31 year old Japanese woman pastry chef, short tidy dark hair, bright expressive eyes, white apron with flour dust, quick grin, focused determined gaze, warm bakery lighting, high quality anime art style' },

    // PLAY & FUN (5)
    { seedId: 'doodle-dave', filename: 'doodle-dave.png', prompt: 'Photorealistic portrait of a 28 year old Californian man, messy hair, bright friendly eyes, paint-smudged hoodie, wide grin, creative artist vibe, warm lighting, professional headshot style, high quality' },
    { seedId: 'sunny-sato', filename: 'sunny-sato.png', prompt: 'Photorealistic portrait of a 24 year old Japanese-American woman, big warm smile, glossy hair in ponytail, colorful jacket, expressive eyes, game show host energy, bright lighting, professional headshot style, high quality' },
    { seedId: 'nico-awkward', filename: 'nico-awkward.png', prompt: 'Photorealistic portrait of a 21 year old Italian man, soft curly hair, warm brown eyes, slightly crooked grin, casual streetwear, charming shy vibe, warm lighting, professional headshot style, high quality' },
    { seedId: 'mina-kwon', filename: 'mina-kwon.png', prompt: 'Photorealistic portrait of a 22 year old Korean woman, sharp eyeliner, confident smirk, sleek black hair, dramatic fashion style, K-drama energy, studio lighting, professional headshot style, high quality' },
    { seedId: 'big-tom', filename: 'big-tom.png', prompt: 'Photorealistic portrait of a 39 year old British man from Liverpool, broad shoulders, trimmed beard, amused eyes, polo shirt, folded arms, pub quiz host vibe, warm lighting, professional headshot style, high quality' },

    // HELPER (10)
    { seedId: 'dr-nadia', filename: 'dr-nadia.png', prompt: 'Photorealistic portrait of a 45 year old Lebanese-Canadian woman doctor, kind eyes, tidy professional hair, professional white blouse, gentle smile, calm posture, warm medical office lighting, professional headshot style, high quality' },
    { seedId: 'miles-granger', filename: 'miles-granger.png', prompt: 'Photorealistic portrait of a 38 year old American mechanic, stubble, friendly tired eyes, work shirt, small grease smudge on cheek, confident hands, Midwest practical vibe, warm garage lighting, professional headshot style, high quality' },
    { seedId: 'priya-nair', filename: 'priya-nair.png', prompt: 'Photorealistic portrait of a 34 year old Indian woman sleep coach, gentle calm eyes, serene expression, soft professional attire, warm soothing presence, calming lighting, professional headshot style, high quality' },
    { seedId: 'marcus-wells', filename: 'marcus-wells.png', prompt: 'Photorealistic portrait of a 48 year old Black American financial advisor, distinguished grey temples, warm trustworthy eyes, professional suit, approachable smile, office lighting, professional headshot style, high quality' },
    { seedId: 'tina-cho', filename: 'tina-cho.png', prompt: 'Photorealistic portrait of a 29 year old Korean-American woman career coach, confident smile, modern professional attire, laptop visible, energetic positive vibe, bright office lighting, professional headshot style, high quality' },
    { seedId: 'elena-petrov', filename: 'elena-petrov.png', prompt: 'Photorealistic portrait of a 41 year old Russian woman therapist, compassionate eyes, warm professional sweater, calm reassuring expression, soft office lighting, professional headshot style, high quality' },
    { seedId: 'jamal-bryant', filename: 'jamal-bryant.png', prompt: 'Photorealistic portrait of a 33 year old Black American fitness coach, athletic build, bright encouraging smile, workout gear, motivational energy, gym lighting, professional headshot style, high quality' },
    { seedId: 'lisa-chen', filename: 'lisa-chen.png', prompt: 'Photorealistic portrait of a 36 year old Chinese-American woman nutritionist, friendly warm expression, professional casual attire, healthy glow, kitchen background hints, professional headshot style, high quality' },
    { seedId: 'roberto-silva', filename: 'roberto-silva.png', prompt: 'Photorealistic portrait of a 44 year old Brazilian man life coach, warm genuine smile, casual professional attire, inspiring presence, natural lighting, professional headshot style, high quality' },
    { seedId: 'sarah-martinez', filename: 'sarah-martinez.png', prompt: 'Photorealistic portrait of a 31 year old Latina woman study buddy, friendly intelligent eyes, casual college attire, books nearby, welcoming smile, library lighting, professional headshot style, high quality' },

    // ORIGINAL (5)
    { seedId: 'council-estate', filename: 'council-estate.png', prompt: 'Artistic humanized portrait representing a British apartment building, stoic weathered face, tired knowing eyes, concrete-grey palette, seen it all expression, urban background, artistic style, high quality' },
    { seedId: 'queue-manager', filename: 'queue-manager.png', prompt: 'Photorealistic portrait of a 33 year old Singaporean man, clean haircut, sharp efficient eyes, neat shirt, tablet in hand, tiny organized smile, professional headshot style, high quality' },
    { seedId: 'auntie-saffy', filename: 'auntie-saffy.png', prompt: 'Photorealistic portrait of a 58 year old South African Cape Malay woman, warm eyes with smile lines, colorful traditional headscarf, vibrant blouse, welcoming expression, grandmother vibes, warm lighting, professional headshot style, high quality' },
    { seedId: 'mr-receipt', filename: 'mr-receipt.png', prompt: 'Photorealistic portrait of a 49 year old New York businessman, thin glasses, sharp jaw, neat hair, suit, suspiciously observant eyes, remembers everything vibe, office lighting, professional headshot style, high quality' },
    { seedId: 'hush', filename: 'hush.png', prompt: 'Photorealistic portrait of a 26 year old Icelandic woman, pale blue eyes, short dark hair, oversized cozy sweater, calm serene expression, soft quiet presence, soft lighting, professional headshot style, high quality' },

    // ANIME & GAME (5)
    { seedId: 'kira-neonfox', filename: 'kira-neonfox.png', prompt: 'Anime style portrait of a 21 year old virtual idol gamer girl, huge sparkling eyes, neon pink and blue twin-tails hair, cute fox-ear gaming headset, glowing LED accessories, colorful cyberpunk streetwear, vibrant neon lighting, high quality anime art style' },
    { seedId: 'kael-drakesunder', filename: 'kael-drakesunder.png', prompt: 'Anime style portrait of a tall heroic dragon knight, scarred cheek, silver eyes, long black hair tied back, massive sword visible, flowing cloak, stoic warrior expression, dramatic fantasy lighting, high quality anime art style' },
    { seedId: 'juno-gearwhistle', filename: 'juno-gearwhistle.png', prompt: 'Anime style portrait of a 19 year old steampunk inventor girl, big goggles on forehead, freckles, grease smudges, tool belt, bright excited grin, mechanical bird on shoulder, warm workshop lighting, high quality anime art style' },
    { seedId: 'seraphina-vale', filename: 'seraphina-vale.png', prompt: 'Anime style portrait of a 24 year old celestial duelist lady, platinum hair, violet eyes, elegant white-gold armor, feathered cape, poised aristocratic stance, ethereal lighting, high quality anime art style' },
    { seedId: 'orion-riftwalker', filename: 'orion-riftwalker.png', prompt: 'Anime style portrait of a 24 year old dimension courier, glowing rune tattoos, messy adventurer hair, satchel, portal sparks around, friendly goofy grin, magical lighting, high quality anime art style' },

    // FICTION & MEDIA (5)
    { seedId: 'wendy-hughes', filename: 'wendy-hughes.png', prompt: 'Photorealistic portrait of a 44 year old American woman commander, professional bob, steady authoritative eyes, minimal jewelry, composed command posture, DC professional vibe, office lighting, professional headshot style, high quality' },
    { seedId: 'detective-jun', filename: 'detective-jun.png', prompt: 'Photorealistic portrait of a 41 year old Korean-American man detective, slight stubble, tired observant eyes, trench coat vibe, calm intense stare, noir lighting, professional headshot style, high quality' },
    { seedId: 'captain-mireya', filename: 'captain-mireya.png', prompt: 'Photorealistic portrait of a 36 year old Chilean woman space captain, dark hair in practical bun, strong brows, uniform collar visible, confident determined eyes, spacecraft lighting, professional headshot style, high quality' },
    { seedId: 'prof-basil', filename: 'prof-basil.png', prompt: 'Photorealistic portrait of a 52 year old British professor, round glasses, wild grey hair, tweed jacket, delighted scholarly eyes, Oxford academic vibe, library lighting, professional headshot style, high quality' },
    { seedId: 'convenience-store', filename: 'convenience-store.png', prompt: 'Artistic humanized portrait representing a friendly convenience store, kind welcoming eyes, store apron, slightly tired warm smile, always open 24hr vibe, fluorescent lighting hints, artistic style, high quality' },

    // ICON (5)
    { seedId: 'angry-karen', filename: 'angry-karen.png', prompt: 'Photorealistic portrait of a 58 year old American woman, perfect blowout hair, thin controlled smile, intense analyzing eyes, actually posture, Florida suburban vibe, bright lighting, professional headshot style, high quality' },
    { seedId: 'jon-debater', filename: 'jon-debater.png', prompt: 'Photorealistic portrait of a 34 year old British man debater, clean haircut, sharp jaw, suit, confident calm eyes, Oxford debate champion vibe, professional lighting, professional headshot style, high quality' },
    { seedId: 'sweet-cs-rep', filename: 'sweet-cs-rep.png', prompt: 'Photorealistic portrait of a 27 year old Filipino woman customer service rep, friendly warm eyes, headset, neat professional hair, reassuring genuine smile, call center lighting, professional headshot style, high quality' },
    { seedId: 'passive-aggressive', filename: 'passive-aggressive.png', prompt: 'Photorealistic portrait of a 52 year old Canadian man neighbor, neat hair, tight controlled smile, raised eyebrow, folded arms, pleasant menace vibe, suburban lighting, professional headshot style, high quality' },
    { seedId: 'unshakeable-optimist', filename: 'unshakeable-optimist.png', prompt: 'Photorealistic portrait of a 29 year old Brazilian woman, big warm infectious smile, bright sparkling eyes, curly hair, colorful outfit, Rio sunshine energy, bright warm lighting, professional headshot style, high quality' },
];

const AVATARS_DIR = path.join(__dirname, '..', 'public', 'avatars');
const DELAY_BETWEEN_IMAGES_MS = 45000; // 45 seconds between images to avoid rate limits

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateAvatar(genAI: GoogleGenerativeAI, char: typeof CHARACTER_AVATARS[0]): Promise<boolean> {
    const outputPath = path.join(AVATARS_DIR, char.filename);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
        console.log(`  ⏭️  ${char.seedId} - already exists, skipping`);
        return true;
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `Generate this image: ${char.prompt}` }]
            }],
            generationConfig: {
                responseModalities: ['image', 'text'],
            } as any,
        });

        const response = result.response;

        for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
                if ((part as any).inlineData) {
                    const imageData = (part as any).inlineData.data;
                    const buffer = Buffer.from(imageData, 'base64');
                    fs.writeFileSync(outputPath, buffer);
                    console.log(`  ✅ ${char.seedId} - generated successfully`);
                    return true;
                }
            }
        }

        console.log(`  ⚠️  ${char.seedId} - no image in response`);
        return false;

    } catch (error: any) {
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            console.log(`  ⏳ ${char.seedId} - rate limited, will retry later`);
            return false;
        }
        console.error(`  ❌ ${char.seedId} - error: ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🎨 Avatar Generation Script');
    console.log('===========================\n');

    // Ensure avatars directory exists
    if (!fs.existsSync(AVATARS_DIR)) {
        fs.mkdirSync(AVATARS_DIR, { recursive: true });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ Error: GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY environment variable not set');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    console.log(`📊 Processing ${CHARACTER_AVATARS.length} characters...\n`);

    for (let i = 0; i < CHARACTER_AVATARS.length; i++) {
        const char = CHARACTER_AVATARS[i];
        console.log(`[${i + 1}/${CHARACTER_AVATARS.length}] ${char.seedId}`);

        const success = await generateAvatar(genAI, char);

        if (success) {
            if (fs.existsSync(path.join(AVATARS_DIR, char.filename))) {
                // Check if it was pre-existing
                const stats = fs.statSync(path.join(AVATARS_DIR, char.filename));
                const ageMs = Date.now() - stats.mtimeMs;
                if (ageMs > 60000) { // Older than 1 minute = pre-existing
                    skipped++;
                } else {
                    generated++;
                }
            }
        } else {
            failed++;
        }

        // Wait between requests to avoid rate limiting
        if (i < CHARACTER_AVATARS.length - 1) {
            console.log(`  ⏱️  Waiting ${DELAY_BETWEEN_IMAGES_MS / 1000}s before next request...\n`);
            await sleep(DELAY_BETWEEN_IMAGES_MS);
        }
    }

    console.log('\n===========================');
    console.log('📊 Summary:');
    console.log(`   ✅ Generated: ${generated}`);
    console.log(`   ⏭️  Skipped (existing): ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('===========================\n');

    if (failed > 0) {
        console.log('💡 Tip: Re-run this script to retry failed avatars.');
    }
}

main().catch(console.error);
