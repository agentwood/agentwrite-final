import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing SpongeBob Visibility (Update Only)...');

    const update = await prisma.personaTemplate.updateMany({
        where: { seedId: 'spongebob' },
        data: {
            featured: true,       // Force enable
            category: 'Play & Fun' // Ensure category
        }
    });

    if (update.count === 0) {
        console.error('❌ SpongeBob STILL NOT FOUND to update. He must have been deleted.');
    } else {
        console.log(`✅ SpongeBob updated: featured=true. (Count: ${update.count})`);
    }

    // Double check the count
    const count = await prisma.personaTemplate.count();
    console.log(`Total Characters: ${count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
