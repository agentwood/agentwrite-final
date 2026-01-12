
import { PrismaClient } from '@prisma/client';
import { matchArchetype, generateTTSVoiceSpec } from '../lib/characterCreation/archetypeMapper';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting gender enforcement and cleanup...');

    // 1. Delete characters with undefined/null gender
    console.log('Deleting characters with undefined gender...');
    const deleteResult = await prisma.personaTemplate.deleteMany({
        where: {
            OR: [
                { gender: null },
                { gender: { equals: 'undefined' } }, // Check for string "undefined" if it crept in
                { gender: { equals: '' } }
            ]
        }
    });
    console.log(`Deleted ${deleteResult.count} characters with missing gender.`);

    // 2. Update remaining characters to ensure voice matches gender/archetype
    console.log('Validating and updating voice profiles for remaining characters...');

    const characters = await prisma.personaTemplate.findMany();
    let updateCount = 0;

    for (const char of characters) {
        let gender = char.gender as 'M' | 'F' | 'NB';
        let needsGenderUpdate = false;

        // Normalize gender
        if (char.gender?.toUpperCase() === 'MALE') { gender = 'M'; needsGenderUpdate = true; }
        else if (char.gender?.toUpperCase() === 'FEMALE') { gender = 'F'; needsGenderUpdate = true; }
        else if (char.gender?.toUpperCase() === 'NON-BINARY') { gender = 'NB'; needsGenderUpdate = true; }

        if (needsGenderUpdate) {
            console.log(`Normalizing gender for ${char.name}: ${char.gender} -> ${gender}`);
            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: { gender: gender }
            });
            // Update local object for next steps
            char.gender = gender;
        }

        if (!gender || !['M', 'F', 'NB'].includes(gender)) {
            // Should have been deleted above, but double check
            console.warn(`Skipping character ${char.name} with invalid gender: ${char.gender}`);
            continue;
        }

        // Re-match archetype to get the CORRECT voice profile for this gender
        // We pass explicitGender so it respects the DB gender 100%
        const match = matchArchetype(
            (char.description || '') + ' ' + (char.characterKeywords || ''),
            '',
            char.gender as 'M' | 'F' | 'NB'
        );

        // Generate new voice spec (with accent detection)
        const newVoiceSpec = generateTTSVoiceSpec(
            match.archetype,
            char.gender as 'M' | 'F' | 'NB',
            char.description || ''
        );

        // Check if we need to update
        // We update if:
        // 1. voiceName is different (re-aligning ID)
        // 2. ttsVoiceSpec is missing or different (applying accents)
        // 3. archetype changed (unlikely if desc is same, but possible with updated keyword logic)

        // Note: match.voiceProfile is the LOGICAL name (e.g. 'sage_male'). 
        // The DB stores this logical name in `voiceName` (based on previous findings).

        if (char.voiceName !== match.voiceProfile || char.ttsVoiceSpec !== newVoiceSpec) {
            // console.log(`Updating ${char.name} (${char.gender}): ${char.voiceName} -> ${match.voiceProfile}`);

            await prisma.personaTemplate.update({
                where: { id: char.id },
                data: {
                    voiceName: match.voiceProfile,
                    ttsVoiceSpec: newVoiceSpec,
                    archetype: match.archetype, // Sync archetype too
                }
            });
            updateCount++;
        }
    }

    console.log(`Updated ${updateCount} characters to enforce gender-voice alignment.`);
    console.log('Cleanup complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
