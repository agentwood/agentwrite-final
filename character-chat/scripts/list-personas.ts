import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    const personas = await prisma.personaTemplate.findMany({
        select: {
            id: true,
            name: true,
            voiceName: true,
            description: true,
            tagline: true,
            category: true,
        }
    });

    console.log(JSON.stringify(personas, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
