import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not defined in the .env file.');
    process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
    const personas = await prisma.personaTemplate.findMany();

    console.log(`Found ${personas.length} personas. Randomizing view counts...`);

    for (const persona of personas) {
        // Random value between 200 and 9,000
        const randomViewCount = Math.floor(Math.random() * (9000 - 200 + 1)) + 200;

        await prisma.personaTemplate.update({
            where: { id: persona.id },
            data: { viewCount: randomViewCount },
        });

        console.log(`Updated ${persona.name}: ${randomViewCount} views`);
    }

    console.log('Update complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
