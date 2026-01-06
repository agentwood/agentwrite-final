
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const persona = await prisma.personaTemplate.findFirst({
        where: { seedId: 'eloise-durand' }
    }) || await prisma.personaTemplate.findFirst();

    if (!persona) {
        console.error('No personas found');
        return;
    }

    console.log('Testing with persona:', persona.name, persona.id);

    const conversation = await prisma.conversation.create({
        data: {
            personaId: persona.id,
            userId: null
        }
    });

    console.log('Created conversation:', conversation.id);

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: conversation.id,
                characterId: persona.id,
                messages: [{ role: 'user', text: 'hi' }]
            })
        });
        const data = await response.json();
        console.log('Chat STATUS:', response.status);
        console.log('Chat RESPONSE:', data);
    } catch (error) {
        console.error('Chat FAILED:', error.message);
    }
}

main().finally(() => prisma.$disconnect());
