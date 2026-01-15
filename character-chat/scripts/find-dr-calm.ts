
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const chars = await prisma.personaTemplate.findMany({
        where: {
            OR: [
                { name: { contains: 'Calm', mode: 'insensitive' } },
                { name: { contains: 'Doctor', mode: 'insensitive' } },
                { name: { contains: 'Dr.', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            name: true,
            voiceName: true
        }
    });

    console.log('Found characters:', JSON.stringify(chars, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
