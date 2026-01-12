const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function detectGenderFromName(name) {
    const nameLower = name.toLowerCase();
    if (nameLower.startsWith('lady ') || nameLower.startsWith('miss ') || nameLower.startsWith('mrs ') || nameLower.startsWith('madame ') || nameLower.includes('queen')) {
        return 'female';
    }
    if (nameLower.startsWith('sir ') || nameLower.startsWith('mr ') || nameLower.startsWith('lord ') || nameLower.includes('king')) {
        return 'male';
    }
    return null;
}

async function main() {
    const allCharacters = await prisma.personaTemplate.findMany();
    for (const char of allCharacters) {
        const detected = detectGenderFromName(char.name);
        if (detected) {
            const dbGender = detected === 'female' ? 'F' : 'M';
            if (char.gender !== dbGender) {
                console.log(`Fixing gender for ${char.name}: ${char.gender} -> ${dbGender}`);
                await prisma.personaTemplate.update({
                    where: { id: char.id },
                    data: { gender: dbGender }
                });
            }
        }
    }
    await prisma.$disconnect();
}

main().catch(console.error);
