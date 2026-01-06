import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import XLSX from 'xlsx';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function applyUpdates() {
    const resultsPath = path.join(process.cwd(), 'scripts/image-generation-results.json');
    const excelPath = '/Users/akeemojuko/Downloads/comprehensive-character-data.xlsx';

    if (!fs.existsSync(resultsPath)) {
        console.error(`Results file not found at ${resultsPath}`);
        return;
    }

    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const generatedImages = results.generatedImages;

    // Load Excel for Name -> SeedID mapping
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData: any[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`Starting update of ${Object.keys(generatedImages).length} characters...`);

    const personas = await prisma.personaTemplate.findMany();
    console.log('Names in DB:', personas.map(p => p.name));

    for (const seedId in generatedImages) {
        const relativePath = `/characters/${seedId}.png`;

        // Find the character in Excel to get the Name
        const excelChar = excelData.find(d => d['Seed ID'] === seedId);
        if (!excelChar) {
            console.error(`❌ Could not find ${seedId} in Excel`);
            continue;
        }
        const name = excelChar['Name'];

        // Try to find in DB by seedId first, then by name
        let dbChar = personas.find(p => p.seedId === seedId);
        if (!dbChar) {
            dbChar = personas.find(p => p.name.toLowerCase() === name.toLowerCase());
        }

        if (dbChar) {
            try {
                await prisma.personaTemplate.update({
                    where: { id: dbChar.id },
                    data: {
                        avatarUrl: relativePath,
                        seedId: seedId // Also populate seedId while we are at it
                    }
                });
                console.log(`✅ Updated "${name}" (${seedId}) -> ${relativePath}`);
            } catch (e) {
                console.error(`❌ Failed to update "${name}":`, e);
            }
        } else {
            console.warn(`⚠️  Could not find "${name}" (${seedId}) in database`);
        }
    }

    console.log('Database updates complete.');
    await prisma.$disconnect();
}

applyUpdates();
