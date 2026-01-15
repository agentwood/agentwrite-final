import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Auditing Voice Files...\n');
    
    const characters = await prisma.personaTemplate.findMany({
        select: { name: true, voiceSeed: true }
    });

    const seedsDir = path.join(process.cwd(), 'public/voices/seeds');
    const existingFiles = fs.readdirSync(seedsDir);

    console.log(`📂 Found ${existingFiles.length} files in ${seedsDir}`);
    existingFiles.forEach(f => console.log(`   - ${f}`));

    console.log('\n👤 Checking Characters:');
    
    for (const char of characters) {
        if (!char.voiceSeed) {
            console.log(`❌ ${char.name}: No Voice Seed linked!`);
            continue;
        }

        // The logic in RunPod client uses voiceSeed.filePath
        // We need to verify if that path actually exists
        const filePath = char.voiceSeed.filePath; 
        const absolutePath = path.join(process.cwd(), 'public', filePath);
        
        if (fs.existsSync(absolutePath)) {
            console.log(`✅ ${char.name} -> ${filePath} (Found)`);
        } else {
             console.log(`❌ ${char.name} -> ${filePath} (MISSING!)`);
             // Try to suggest a fix
             const expectedName = char.voiceSeed.name + '.mp3';
             if (existingFiles.includes(expectedName)) {
                 console.log(`   💡 Found matching file "${expectedName}" - Path might be wrong in DB?`);
             }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
