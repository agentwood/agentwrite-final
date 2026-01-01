import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Removing old featured characters...\n');

    // Delete the old Trump, Musk, Santa and generic assistants
    const deleted = await prisma.personaTemplate.deleteMany({
        where: {
            seedId: {
                in: ['santa', 'donald-trump', 'elon-musk', 'learn-french', 'pick-song', 'meal-plan']
            }
        }
    });

    console.log(`✅ Deleted ${deleted.count} old characters`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
