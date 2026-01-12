
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function verify() {
    const kofi = await prisma.personaTemplate.findFirst({
        where: { name: 'Coach Kofi' },
        include: { voiceIdentity: true }
    });

    if (!kofi) {
        console.error('❌ Coach Kofi not found!');
        return;
    }

    if (!kofi.voiceIdentity) {
        console.error('❌ Coach Kofi has NO voice identity linked!');
        return;
    }

    console.log(`✅ Character: ${kofi.name}`);
    console.log(`   Voice ID: ${kofi.voiceIdentity.voiceId}`);
    console.log(`   DB Audio Path: ${kofi.voiceIdentity.referenceAudioPath}`);

    const absPath = path.resolve(process.cwd(), kofi.voiceIdentity.referenceAudioPath);
    if (fs.existsSync(absPath)) {
        console.log(`   ✅ Physical File Exists: ${absPath}`);
    } else {
        console.error(`   ❌ PHYSICAL FILE MISSING: ${absPath}`);
    }
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
