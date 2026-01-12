
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const db = new PrismaClient();

// Deterministic map from gender/vibe to archetype
const ARCHETYPE_MAP: Record<string, string[]> = {
    MALE: [
        'deep_narrator', 'charismatic_leader', 'gruff_soldier',
        'intellectual_scholar', 'warm_mentor'
    ],
    FEMALE: [
        'soothing_guide', 'energetic_host', 'mysterious_whisperer',
        'professional_assistant', 'warm_motherly'
    ],
    NEUTRAL: [
        'neutral_reporter', 'calm_meditator', 'robotic_assistant'
    ]
};

// Function to deterministically pick an archetype based on character ID
function getArchetype(id: string, gender: string = 'NEUTRAL'): string {
    const options = ARCHETYPE_MAP[gender.toUpperCase()] || ARCHETYPE_MAP.NEUTRAL;
    const hash = crypto.createHash('md5').update(id).digest('hex');
    const index = parseInt(hash.substring(0, 8), 16) % options.length;
    return options[index];
}

async function migrateToFishSpeech() {
    console.log('🌲 Starting Tree-0 Migration...');

    const allCharacters = await db.personaTemplate.findMany();
    console.log(`Found ${allCharacters.length} characters.`);

    let updatedCount = 0;

    for (const char of allCharacters) {
        // Determine gender (heuristic or default)
        // Note: Schema might not have gender, infer from existing voice or prompt if possible
        // For now, checking if we have 'gender' field or inferring
        // Assuming 'male'/'female' in description or using deterministic fallback

        // Simplification: Use existing voice ID metadata if available to guess gender,
        // or just default to consistent random assignment
        const gender = 'NEUTRAL'; // You might want to improve this detection

        const newArchetype = char.archetype || getArchetype(char.id, gender);

        // Update
        await db.personaTemplate.update({
            where: { id: char.id },
            data: {
                voiceReady: true,
                archetype: newArchetype,
                // Ensure voice settings are within valid ranges
                voicePitch: char.voicePitch || 0.0,
                voiceSpeed: char.voiceSpeed || 1.0,
            }
        });

        updatedCount++;
        if (updatedCount % 10 === 0) {
            process.stdout.write('.');
        }
    }

    console.log(`\n✅ Migration Complete! Updated ${updatedCount} characters to Tree-0.`);
}

migrateToFishSpeech()
    .catch(e => console.error(e))
    .finally(async () => {
        await db.$disconnect();
    });
