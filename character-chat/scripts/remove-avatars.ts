import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Set all avatar URLs to empty/null to show clean gradient fallbacks
 */
async function removeAvatars() {
    console.log('🗑️  Removing all avatar URLs...\n');
    console.log('Characters will show clean gradient backgrounds with initials.\n');

    const result = await prisma.personaTemplate.updateMany({
        data: {
            avatarUrl: '', // Empty string will trigger fallback
        },
    });

    console.log(`✅ Removed avatars from ${result.count} characters`);
    console.log('\n📝 Characters now display:');
    console.log('   - Clean gradient background (indigo → purple)');
    console.log('   - Character\'s first letter in white');
    console.log('   - Professional look without broken images');
    console.log('\n🎨 You can now manually update avatars as needed!\n');
}

removeAvatars()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
