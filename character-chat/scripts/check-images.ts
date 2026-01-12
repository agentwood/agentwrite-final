
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking character image URLs...');

    const characters = await prisma.personaTemplate.findMany({
        select: {
            name: true,
            avatarUrl: true,
            category: true,
            gender: true
        },
        // Check some specific ones mentioned before + random sample
        where: {
            OR: [
                { name: { contains: 'Wendy' } },
                { name: { contains: 'Lucien' } },
                { name: { contains: 'Nancy' } },
                { name: { contains: 'Allé' } },
                { category: 'Fun' } // Check new "fun" characters
            ]
        }
    });

    console.log(`Found ${characters.length} characters to inspect:\n`);

    characters.forEach(c => {
        console.log(`Name: ${c.name}`);
        console.log(`Gender: ${c.gender}`);
        console.log(`Category: ${c.category}`);
        console.log(`Avatar: ${c.avatarUrl}`);
        console.log('---');
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
