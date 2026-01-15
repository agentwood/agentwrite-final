import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('--- 1. Checking for Duplicate Mappings ---');
    const characters = await prisma.personaTemplate.findMany({
        where: { seedId: { not: null } },
        select: { name: true, seedId: true, voiceSeed: { select: { name: true, filePath: true } } }
    });

    const seedUsage = new Map<string, string[]>();
    characters.forEach(c => {
        if (!c.seedId) return;
        if (!seedUsage.has(c.seedId)) seedUsage.set(c.seedId, []);
        seedUsage.get(c.seedId)!.push(c.name);
    });

    let duplicateFound = false;
    for (const [seedId, charNames] of seedUsage.entries()) {
        if (charNames.length > 1) {
            console.warn(`⚠️ DUPLICATE: Seed ${seedId} used by multiple characters: ${charNames.join(', ')}`);
            duplicateFound = true;
        }
    }
    if (!duplicateFound) console.log('✅ All elite characters utilize unique Seed IDs.');

    console.log('\n--- 2. Checking Reference Audio Uniqueness ---');
    const distinctFiles = new Set<string>();
    const fileHashes = new Map<string, string>(); // hash -> filename

    for (const char of characters) {
        if (!char.voiceSeed?.filePath) {
            console.error(`❌ ${char.name} has no filePath in VoiceSeed`);
            continue;
        }

        // Adjust path to be absolute for checking
        let localPath = char.voiceSeed.filePath;
        if (localPath.startsWith('/')) localPath = localPath.substring(1); // remove leading slash
        const absolutePath = path.join(process.cwd(), 'public', localPath);

        if (!fs.existsSync(absolutePath)) {
            console.error(`❌ File missing: ${absolutePath} (for ${char.name})`);
            continue;
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

        if (fileHashes.has(hash)) {
            console.warn(`⚠️ IDENTICAL AUDIO FILE: "${char.name}" (${char.voiceSeed.name}) is byte-for-byte identical to "${fileHashes.get(hash)}"`);
        } else {
            fileHashes.set(hash, char.name);
        }
        distinctFiles.add(char.voiceSeed.filePath);
    }
    console.log(`Checked ${characters.length} characters. Found ${fileHashes.size} unique audio files.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
