import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
    // Set SpongeBob to 24,000 views (highest)
    await prisma.personaTemplate.update({
        where: { seedId: 'spongebob' },
        data: { viewCount: 24000 }
    });
    console.log('✓ SpongeBob updated to 24,000 views');

    // Verify
    const spongebob = await prisma.personaTemplate.findUnique({
        where: { seedId: 'spongebob' },
        select: { name: true, viewCount: true }
    });
    console.log(`  Verified: ${spongebob?.name} now has ${spongebob?.viewCount?.toLocaleString()} views`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
