
import { db } from '../lib/db';
import path from 'path';
import fs from 'fs';

async function main() {
    console.log('--- Debugging Voice Seed Paths ---');

    // 1. Get a character with a voice seed
    const char = await db.personaTemplate.findFirst({
        where: {
            voiceSeedId: { not: null }
        },
        include: {
            voiceSeed: true
        }
    });

    if (!char || !char.voiceSeed) {
        console.log('No character with voice seed found.');
        return;
    }

    console.log(`Character: ${char.name} (${char.id})`);
    console.log(`Voice Seed: ${char.voiceSeed.name}`);
    console.log(`DB File Path: ${char.voiceSeed.filePath}`);

    // 2. Simulate runpodF5Client logic
    const input = char.voiceSeed.filePath;
    let fullPath: string;

    if (input.startsWith('/voices/') || input.startsWith('/avatars/') || input.startsWith('/audio/')) {
        fullPath = path.join(process.cwd(), 'public', input.slice(1));
    } else if (path.isAbsolute(input)) {
        fullPath = input;
    } else {
        fullPath = path.join(process.cwd(), 'public', input);
    }

    console.log(`Resolved Full Path: ${fullPath}`);

    // 3. Check if file exists
    if (fs.existsSync(fullPath)) {
        console.log('✅ File EXISTS on disk.');
        const stats = fs.statSync(fullPath);
        console.log(`Size: ${stats.size} bytes`);
    } else {
        console.log('❌ File does NOT exist.');

        // List directory to see what's there
        const dir = path.dirname(fullPath);
        if (fs.existsSync(dir)) {
            console.log(`Directory ${dir} exists. Contents:`);
            console.log(fs.readdirSync(dir));
        } else {
            console.log(`Directory ${dir} does NOT exist.`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
