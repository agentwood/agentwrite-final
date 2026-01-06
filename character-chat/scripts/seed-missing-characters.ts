import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function seedMissing() {
    const excelPath = '/Users/akeemojuko/Downloads/comprehensive-character-data.xlsx';
    const missingSeeds = ['doodle-dave', 'sunny-sato', 'big-tom'];

    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    console.log('Seeding missing characters...');

    for (const seedId of missingSeeds) {
        const char = data.find(d => d['Seed ID'] === seedId);
        if (!char) {
            console.warn(`⚠️  Could not find ${seedId} in Excel`);
            continue;
        }

        const name = char['Name'];
        const description = char['Description'];
        const category = char['Category'] || 'Fun';
        const voiceName = char['Voice Name'] || 'puck';
        const systemPrompt = char['System Prompt'] || `You are ${name}. ${description}`;

        try {
            await prisma.personaTemplate.create({
                data: {
                    seedId: seedId,
                    name: name,
                    description: description,
                    category: category,
                    avatarUrl: `/characters/${seedId}.png`,
                    voiceName: voiceName,
                    systemPrompt: systemPrompt,
                    archetype: char['Archetype'] || 'unknown',
                    viewCount: Math.floor(Math.random() * (9000 - 2000 + 1)) + 2000,
                    tagline: char['Tagline'] || '',
                    handle: char['Handle'] || '',
                }
            });
            console.log(`✅ Seeded "${name}" (${seedId})`);
        } catch (e) {
            console.error(`❌ Failed to seed "${name}":`, e);
        }
    }

    await prisma.$disconnect();
}

seedMissing();
