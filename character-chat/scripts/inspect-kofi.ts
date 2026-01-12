
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Searching for Coach Kofi...");

    // Try to find by name - removing 'mode' to be safe, just simple contains
    // Using explicit queries instead of OR to avoid type issues

    let kofi: any = await prisma.personaTemplate.findFirst({
        where: { name: { contains: 'Kofi' } },
        include: { voiceIdentity: true }
    });

    if (!kofi) {
        kofi = await prisma.personaTemplate.findFirst({
            where: { name: { contains: 'Coach' } },
            include: { voiceIdentity: true }
        });
    }

    if (!kofi) {
        console.log("❌ Coach Kofi not found in database!");
        // List all names to be sure
        const all = await prisma.personaTemplate.findMany({ select: { name: true, id: true } });
        console.log("Available Characters:", all.map(c => `${c.name} (${c.id})`).join(", "));
        return;
    }

    console.log("✅ Found Character:", kofi.name);
    console.log("--------------------------------");
    console.log("ID:", kofi.id);
    console.log("Voice Name:", kofi.voiceName);

    if (kofi.voiceIdentity) {
        console.log("🔊 Voice Identity Linked:");
        console.log("   - ID:", kofi.voiceIdentity.voiceId);
        console.log("   - Gender:", kofi.voiceIdentity.gender);
        console.log("   - Accent:", kofi.voiceIdentity.accent);
        console.log("   - Description:", kofi.voiceIdentity.description);
        console.log("   - Voice Description (New Field):", kofi.voiceIdentity.voiceDescription);
        console.log("   - Ref Audio Path:", kofi.voiceIdentity.referenceAudioPath);

        // Check if ref audio exists
        try {
            const fs = require('fs');
            const path = require('path');
            const absPath = path.resolve(process.cwd(), kofi.voiceIdentity.referenceAudioPath);
            if (fs.existsSync(absPath)) {
                console.log("   - ✅ Reference Audio File Exists at:", absPath);
            } else {
                console.log("   - ❌ Reference Audio File MISSING at:", absPath);
            }
        } catch (e) {
            console.log("   - Error checking file:", e);
        }

    } else {
        console.log("❌ NO Voice Identity Linked!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
