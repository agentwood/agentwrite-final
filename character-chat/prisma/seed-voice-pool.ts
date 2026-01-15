/**
 * Seed Voice Pool - Populates the VoiceSeed table with 29 elite voice assets
 * 
 * Usage: npx tsx prisma/seed-voice-pool.ts
 */

import { PrismaClient } from '@prisma/client';
import voicePoolData from '../lib/voices/voice_pool.json';

const prisma = new PrismaClient();

async function main() {
    console.log('🎤 Seeding Elite Voice Pool (29 Seeds)...\n');

    const entries = Object.entries(voicePoolData);
    let created = 0;
    let updated = 0;

    for (const [name, config] of entries) {
        const data = {
            name,
            filePath: config.file,
            gender: config.gender,
            age: config.age,
            tone: config.tone,
            energyDescription: config.energy,
            energy: 0.7, // Default high energy for Elite voices
            accent: config.accent,
            category: config.category,
            tags: JSON.stringify(config.tags),
            suitableFor: JSON.stringify(config.suitable_for),
            description: config.description || null,
            referenceText: (config as any).ref_text || null,
        };

        const existing = await prisma.voiceSeed.findUnique({
            where: { name },
        });

        if (existing) {
            await prisma.voiceSeed.update({
                where: { name },
                data,
            });
            console.log(`  ♻️  Updated: ${name}`);
            updated++;
        } else {
            await prisma.voiceSeed.create({ data });
            console.log(`  ✅ Created: ${name}`);
            created++;
        }
    }

    console.log(`\n✨ Voice Pool Seeding Complete!`);
    console.log(`   Created: ${created} | Updated: ${updated} | Total: ${entries.length}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
