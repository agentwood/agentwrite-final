/**
 * Seed Voice Pool - Populates the VoiceSeed table with 29 elite voice assets
 * 
 * Usage: npx tsx prisma/seed-voice-pool.ts
 */

import { PrismaClient } from '@prisma/client';
import voicePoolData from '../lib/voices/voice_pool.json';

import { GEMINI_VOICE_METADATA } from '../lib/audio/geminiVoiceMetadata';

const prisma = new PrismaClient();

async function main() {
    console.log('🎤 Seeding Elite Voice Pool (Now Extended)...\n');

    // 1. Process existing JSON data
    const entries = Object.entries(voicePoolData).map(([name, config]) => ({
        name,
        filePath: config.file,
        gender: config.gender,
        age: config.age,
        tone: config.tone,
        energyDescription: config.energy,
        energy: 0.7,
        accent: config.accent,
        category: config.category,
        tags: JSON.stringify(config.tags),
        suitableFor: JSON.stringify(config.suitable_for),
        description: config.description || null,
        referenceText: (config as any).ref_text || null,
    }));

    // 2. Process Gemini Metadata (New Voices)
    const geminiEntries = Object.values(GEMINI_VOICE_METADATA).map(meta => ({
        name: meta.voiceName, // e.g. 'kore'
        filePath: `/voices/gemini/${meta.voiceName}.mp3`, // Placeholder path
        gender: meta.gender,
        age: meta.age,
        tone: meta.characteristics.tone,
        energyDescription: meta.characteristics.energy,
        energy: 0.8,
        accent: 'neutral', // Default
        category: 'Gemini',
        tags: JSON.stringify(meta.keywords),
        suitableFor: JSON.stringify(['general interaction']),
        description: meta.description,
        referenceText: null,
    }));

    // Merge lists (avoid duplicates if any)
    const allVoices = [...entries];
    for (const g of geminiEntries) {
        if (!allVoices.find(v => v.name.toLowerCase() === g.name.toLowerCase())) {
            allVoices.push(g);
        }
    }

    let created = 0;
    let updated = 0;

    for (const data of allVoices) {
        const { name } = data;

        const existing = await prisma.voiceSeed.findUnique({
            where: { name },
        });

        if (existing) {
            await prisma.voiceSeed.update({
                where: { name },
                data: data as any, // Cast to any to bypass strict checks for null/undefined unions temporarily if needed, or precise type match
            });
            console.log(`  ♻️  Updated: ${name}`);
            updated++;
        } else {
            await prisma.voiceSeed.create({ data: data as any });
            console.log(`  ✅ Created: ${name}`);
            created++;
        }
    }

    console.log(`\n✨ Voice Pool Seeding Complete!`);
    console.log(`   Created: ${created} | Updated: ${updated} | Total: ${allVoices.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
