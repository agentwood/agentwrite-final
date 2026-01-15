
import { db } from '../lib/db';
import path from 'path';
import fs from 'fs';

async function main() {
    console.log('--- Checking ALL Voice Seed Paths ---');

    const seeds = await db.voiceSeed.findMany();
    console.log(`Found ${seeds.length} voice seeds.`);

    let errorCount = 0;

    for (const seed of seeds) {
        const input = seed.filePath;
        let fullPath: string;

        if (input.startsWith('/voices/') || input.startsWith('/avatars/') || input.startsWith('/audio/')) {
            fullPath = path.join(process.cwd(), 'public', input.slice(1));
        } else if (path.isAbsolute(input)) {
            fullPath = input;
        } else {
            fullPath = path.join(process.cwd(), 'public', input);
        }

        if (!fs.existsSync(fullPath)) {
            console.error(`❌ MISSING: ${seed.name} -> ${input}`);
            console.error(`   Resolved to: ${fullPath}`);
            errorCount++;
        } else {
            // console.log(`✅ OK: ${seed.name}`);
        }
    }

    if (errorCount === 0) {
        console.log('✅ All voice seed files exist.');
    } else {
        console.log(`❌ Found ${errorCount} missing files.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
