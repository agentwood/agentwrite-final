import { db } from '../lib/db';

/**
 * Script to update character metrics:
 * 1. Boost views by 300-900%
 * 2. Add proportional likes (saveCount) between 25-500
 */
async function updateCharacterMetrics() {
    console.log('🚀 Starting character metrics update...\n');

    // Get all characters
    const characters = await db.personaTemplate.findMany({
        select: {
            id: true,
            name: true,
            viewCount: true,
            saveCount: true,
        },
    });

    console.log(`Found ${characters.length} characters to update.\n`);

    let updated = 0;

    for (const char of characters) {
        // Calculate boost factor (3x to 9x, i.e., 300%-900%)
        const boostFactor = 3 + Math.random() * 6; // 3-9

        // Current views (default to random 50-200 if null/0)
        const currentViews = char.viewCount && char.viewCount > 0
            ? char.viewCount
            : Math.floor(50 + Math.random() * 150);

        // New views with boost
        const newViews = Math.floor(currentViews * boostFactor);

        // Calculate likes (25-500, proportional to views but never exceed views)
        // Base: 5-15% of views, clamped to 25-500
        const likeRatio = 0.05 + Math.random() * 0.10; // 5-15%
        let newLikes = Math.floor(newViews * likeRatio);
        newLikes = Math.max(25, Math.min(500, newLikes)); // Clamp to 25-500
        newLikes = Math.min(newLikes, newViews); // Never exceed views

        await db.personaTemplate.update({
            where: { id: char.id },
            data: {
                viewCount: newViews,
                saveCount: newLikes,
            },
        });

        console.log(`✅ ${char.name}: views ${currentViews} → ${newViews} (${boostFactor.toFixed(1)}x), likes: ${newLikes}`);
        updated++;
    }

    console.log(`\n✨ Updated ${updated} characters successfully!`);
}

// Run the script
updateCharacterMetrics()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
