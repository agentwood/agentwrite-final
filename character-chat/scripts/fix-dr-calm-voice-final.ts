
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const drCalm = await prisma.personaTemplate.findFirst({
        where: { name: 'Dr. Calm' }
    });

    if (!drCalm) {
        console.log('❌ Dr. Calm not found!');
        return;
    }

    console.log(`Found Dr. Calm (Voice: ${drCalm.voiceName}). Updating to 'WiseSage'...`);

    await prisma.personaTemplate.update({
        where: { id: drCalm.id },
        data: { voiceName: 'WiseSage' }
    });

    console.log('✅ Updated Dr. Calm to WiseSage');
}

// Check other doctors too?
// Dr. Grace Chen (Healer) -> Good for Healer.
// Dr. Alan Marcus (Professor) -> Good.

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
