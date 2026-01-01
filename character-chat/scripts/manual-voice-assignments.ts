#!/usr/bin/env tsx
/**
 * Manual Voice Assignment Script
 * For characters that couldn't auto-match, manually assign appropriate voices
 * based on gender detection
 */

import { db } from '../lib/db';
import { GEMINI_VOICE_METADATA } from '../lib/audio/geminiVoiceMetadata';

// Characters with critical mismatches (no auto-match found)
const MANUAL_ASSIGNMENTS: Record<string, string> = {
    // Female characters currently with male voices - assign female voices
    'David Martinez': 'aoede', // Professional female
    'Elena Rodriguez': 'schedar', // Warm female (old)
    'Layla Sharif': 'erinome', // Mature female (old)
    'Chloe Baptiste': 'laomedeia', // Sweet female (young)
    'Li Mei Ling': 'erinome', // Mature female (old)
    'Chloe Davies': 'erinome', // Mature female (old)
    'Ana Leilani': 'schedar', // Warm female (old)
    'Malia Fatu': 'schedar', // Warm female (old)
    'Maya Singh-Chavez': 'erinome', // Mature female (old)
    'Leilani Tua': 'schedar', // Warm female (old)
    'Zola Nkosi': 'laomedeia', // Sweet female (young)
    'Lena Baptiste': 'aoede', // Professional female
    'Maria Rodriguez': 'erinome', // Mature female (old)
    'Chiamaka Eze': 'schedar', // Warm female (old)
    'Leilani Kim-Patel': 'aoede', // Professional female
    'Aiyana Begay': 'schedar', // Warm female (old)
    'Min-seo Kim': 'laomedeia', // Sweet female (young)
    'Mia Jensen': 'erinome', // Mature female (old)
    'Elena Ramirez': 'schedar', // Warm female (old)
    'Amina Adewale': 'schedar', // Warm female (old)
    'Sonia Williams': 'schedar', // Warm female (old)
    'Li Na': 'laomedeia', // Sweet female (young)
    'Isabella Ruiz': 'erinome', // Mature female (old)
    'Lee Mei Lin': 'erinome', // Mature female (old)
    'Winona Blackwood': 'schedar', // Warm female (old)
    'Anika Patel': 'laomedeia', // Sweet female (young)
    'Mio Kaminari': 'aoede', // Anime-style female
    'Mio Kitsune': 'aoede', // Anime-style female
    'Aurelia Seraphina': 'pulcherrima', // Sophisticated female (old)
    'Aerilyn Silvanus': 'pulcherrima', // Sophisticated female (old)
    'Akane': 'aoede', // Anime-style female
    'Akari Kageyama': 'aoede', // Anime-style female
    'Kaelen': 'sadachbia', // Elegant female (old)
    'Seraphina Celeste': 'pulcherrima', // Sophisticated female (old)
    'Anya Aetheria': 'pulcherrima', // Sophisticated female (old)
    'Amina': 'schedar', // Warm female (old)
    'Yuzu Shirayuki': 'aoede', // Anime-style female
    'Aria Lumiere': 'sadachbia', // Elegant female
    'Kiko': 'laomedeia', // Sweet female (old - adjust)
    'Mio Hoshikawa': 'aoede', // Anime-style female (old)
    'Yuki Hoshina': 'aoede', // Anime-style female
    'Kaito Neko': 'aoede', // Anime-style female
    'Reika': 'aoede', // Anime-style female
    'Layla Al-Amira': 'schedar', // Warm female
    'Lyraena': 'sadachbia', // Elegant female (old)
    'Hoshikawa Akari': 'aoede', // Anime-style female (old)
    'Ren Kitsunebi': 'aoede', // Anime-style female (old)
    'Elara Seraphina': 'pulcherrima', // Sophisticated female (old)
    'Akari Fuyumi': 'aoede', // Anime-style female
    'Mizuki Yami': 'sadachbia', // Mysterious female
    'Kaelen Moonshadow': 'sadachbia', // Elegant female (old)
    'Mio Seraphina': 'pulcherrima', // Sophisticated female (old)
};

async function applyManualAssignments() {
    console.log('🔧 Applying manual voice assignments...\n');

    let fixedCount = 0;
    let notFoundCount = 0;

    for (const [characterName, newVoice] of Object.entries(MANUAL_ASSIGNMENTS)) {
        try {
            // Find character by name
            const character = await db.personaTemplate.findFirst({
                where: { name: characterName },
            });

            if (!character) {
                console.log(`⚠️  Character not found: ${characterName}`);
                notFoundCount++;
                continue;
            }

            // Update voice
            await db.personaTemplate.update({
                where: { id: character.id },
                data: { voiceName: newVoice },
            });

            fixedCount++;
            console.log(`✅ Fixed: ${characterName} -> ${newVoice}`);
        } catch (error) {
            console.error(`❌ Error fixing ${characterName}:`, error);
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Fixed: ${fixedCount}`);
    console.log(`  ⚠️  Not found: ${notFoundCount}`);
    console.log(`  📝 Total in list: ${Object.keys(MANUAL_ASSIGNMENTS).length}`);
}

async function main() {
    await applyManualAssignments();
}

main().catch(console.error);
