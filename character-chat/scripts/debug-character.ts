
import { db } from '@/lib/db';

async function checkCharacter() {
    const id = 'cmkkcowoc002zcd65wtmbjc8o';
    console.log(`Checking character ${id}...`);
    try {
        const char = await db.personaTemplate.findUnique({
            where: { id },
        });
        console.log(JSON.stringify(char, null, 2));

        if (char && char.prompts) {
            try {
                JSON.parse(char.prompts as string);
                console.log("Prompts JSON is valid.");
            } catch (e) {
                console.error("Prompts JSON is INVALID:", e);
            }
        }

        if (char && char.trainingConstraints) {
            try {
                JSON.parse(char.trainingConstraints as string);
                console.log("trainingConstraints JSON is valid.");
            } catch (e) {
                console.error("trainingConstraints JSON is INVALID:", e);
            }
        }

    } catch (e) {
        console.error("DB Error:", e);
    }
}

checkCharacter();
