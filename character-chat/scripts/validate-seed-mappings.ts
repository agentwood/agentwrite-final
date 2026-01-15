import { PrismaClient } from '@prisma/client';
import { COMPREHENSIVE_VOICE_MAP } from '../lib/audio/comprehensiveVoiceMapping';

const prisma = new PrismaClient();

async function main() {
    console.log("Validating Personnel Seed IDs against Comprehensive Voice Map...");
    
    const personas = await prisma.personaTemplate.findMany({
        select: { name: true, seedId: true }
    });

    let mappedCount = 0;
    let missingCount = 0;

    for (const p of personas) {
        if (!p.seedId) {
            console.log(`⚠️  ${p.name}: No seedId set`);
            missingCount++;
            continue;
        }

        if (COMPREHENSIVE_VOICE_MAP[p.seedId]) {
            console.log(`✅ ${p.name}: Mapped to ${COMPREHENSIVE_VOICE_MAP[p.seedId].voiceName}`);
            mappedCount++;
        } else {
            console.log(`❌ ${p.name}: seedId '${p.seedId}' NOT FOUND in map`);
            missingCount++;
        }
    }
    
    console.log(`\nSummary: ${mappedCount} mapped, ${missingCount} missing/failed.`);
}

main()
    .finally(async () => { await prisma.$disconnect(); });
