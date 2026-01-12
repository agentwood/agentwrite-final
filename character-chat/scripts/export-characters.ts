import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    console.log('📊 Exporting all characters to CSV...');

    const characters = await prisma.personaTemplate.findMany({
        select: {
            id: true,
            seedId: true,
            name: true,
            handle: true,
            description: true,
            category: true,
            gender: true,
            age: true,
            archetype: true,
            voiceName: true,
            tagline: true,
            greeting: true,
            ttsVoiceSpec: true,
            heritage: true,
            accentProfile: true,
        },
        orderBy: { name: 'asc' }
    });

    // Create CSV header
    const headers = [
        'ID',
        'SeedID',
        'Name',
        'Handle',
        'Gender',
        'Age',
        'Category',
        'Archetype',
        'VoiceName',
        'Heritage',
        'Description',
        'Tagline',
        'TTS Voice Spec',
        'Accent Profile',
        'Greeting'
    ];

    // Escape CSV values
    const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str}"`
            : str;
    };

    // Create CSV rows
    const rows = characters.map(char => [
        escapeCSV(char.id),
        escapeCSV(char.seedId),
        escapeCSV(char.name),
        escapeCSV(char.handle),
        escapeCSV(char.gender),
        escapeCSV(char.age),
        escapeCSV(char.category),
        escapeCSV(char.archetype),
        escapeCSV(char.voiceName),
        escapeCSV(char.heritage),
        escapeCSV(char.description?.substring(0, 200)),
        escapeCSV(char.tagline?.substring(0, 200)),
        escapeCSV(char.ttsVoiceSpec?.substring(0, 200)),
        escapeCSV(char.accentProfile?.substring(0, 200)),
        escapeCSV(char.greeting?.substring(0, 200))
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    // Write to file
    const outputPath = './characters-export.csv';
    fs.writeFileSync(outputPath, csv);

    console.log(`\n✅ Exported ${characters.length} characters to ${outputPath}`);

    // Also show some stats
    const genderStats = {
        M: characters.filter(c => c.gender === 'M').length,
        F: characters.filter(c => c.gender === 'F').length,
        NB: characters.filter(c => c.gender === 'NB').length,
        undefined: characters.filter(c => !c.gender).length,
    };

    console.log('\n📈 Gender Distribution:');
    console.log(`   Male (M): ${genderStats.M}`);
    console.log(`   Female (F): ${genderStats.F}`);
    console.log(`   Non-Binary (NB): ${genderStats.NB}`);
    console.log(`   Undefined: ${genderStats.undefined}`);

    // Find potential mismatches (name suggests one gender, field says another)
    const potentialMismatches: any[] = [];

    const maleNames = ['james', 'john', 'michael', 'david', 'robert', 'william', 'richard', 'thomas', 'mark', 'adam', 'kevin', 'bob', 'pete', 'zorg', 'viktor', 'dex', 'tomasz'];
    const femaleNames = ['wendy', 'julia', 'elena', 'sarah', 'jennifer', 'maria', 'sophia', 'emma', 'olivia', 'ava', 'isabella', 'mia', 'luna', 'tina', 'nancy', 'marjorie'];

    characters.forEach(char => {
        const nameLower = char.name.toLowerCase();
        const descLower = (char.description || '').toLowerCase();

        // Check if name suggests female but gender is M
        if (femaleNames.some(n => nameLower.includes(n)) && char.gender === 'M') {
            potentialMismatches.push({ name: char.name, gender: char.gender, issue: 'Name suggests female, gender is M' });
        }

        // Check if name suggests male but gender is F
        if (maleNames.some(n => nameLower.includes(n)) && char.gender === 'F') {
            potentialMismatches.push({ name: char.name, gender: char.gender, issue: 'Name suggests male, gender is F' });
        }

        // Check if description mentions "old man" or "woman" but gender doesn't match
        if (descLower.includes('old man') && char.gender === 'F') {
            potentialMismatches.push({ name: char.name, gender: char.gender, issue: 'Description says "old man", gender is F' });
        }
        if (descLower.includes('woman') && char.gender === 'M') {
            potentialMismatches.push({ name: char.name, gender: char.gender, issue: 'Description says "woman", gender is M' });
        }
    });

    if (potentialMismatches.length > 0) {
        console.log('\n⚠️  Potential Gender Mismatches Found:');
        potentialMismatches.forEach(m => {
            console.log(`   ${m.name} (${m.gender}): ${m.issue}`);
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
