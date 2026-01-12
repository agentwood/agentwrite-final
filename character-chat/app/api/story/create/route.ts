import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { generateText } from '@/lib/llm/gemini'; // Assuming we have this or similar helper

export async function POST(req: Request) {
    try {
        const { world, characters, type, idea } = await req.json();
        const userId = req.headers.get('x-user-id'); // Or from session

        if (!conversationData(world, characters)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const primaryChar = characters[0];

        // 1. Construct the Scenario Context
        const storyContext = `
        STORY MODE: ${type?.toUpperCase() || 'ADVENTURE'}
        WORLD: ${world?.name || 'Unknown Land'}
        PREMISE: ${idea || 'A new journey begins.'}
        CHARACTERS: ${characters.map((c: any) => c.name).join(', ')}
        
        INSTRUCTIONS:
        - You are roleplaying as ${primaryChar.name}.
        - Start the story based on the premise above.
        - Be engaging, descriptive, and stay in character.
        - Do not break character.
        `;

        // 2. Generate Opening Message (using LLM or fallback)
        // ideally we call Gemini here, but for now we can fallback or use a quick prompt
        let firstMessage = "The journey begins...";
        try {
            // Quick generation if available, otherwise generic
            // const generated = await generateText(storyContext + "\nWrite the first message:");
            // firstMessage = generated;

            // Fallback for now to ensure speed/reliability
            firstMessage = `*Looking around the ${world.name}* So, this is where our story starts. ${idea ? `You mentioned: "${idea}"` : "Ready for an adventure?"}`;
        } catch (e) {
            console.error("LLM gen failed", e);
        }

        // 3. Create Conversation in DB
        // We might need to find or create a Persona/Character record if it doesn't exist linked to this specific story context
        // For simplicity now, we attach to the existing Persona of the first character.

        // Find existing persona ID by matching name/seedId or create a temporary one?
        // Assuming primaryChar has an ID we can use. If not (it's a profile), we need to resolve it.
        // MasterDashboard uses 'CharacterProfile' which likely has an ID.

        // let personaId = primaryChar.id; 
        // IF character is from 'showcase' it might not be in our DB yet.
        // We need to ensure the persona exists.

        let persona = await prisma.personaTemplate.findFirst({
            where: { name: primaryChar.name }
        });

        if (!persona) {
            // Create phantom persona if missing (from showcase)
            persona = await prisma.personaTemplate.create({
                data: {
                    name: primaryChar.name,
                    description: primaryChar.tagline,
                    avatarUrl: primaryChar.avatarUrl,
                    category: 'Story',
                    systemPrompt: storyContext, // Store the story context here!
                    voiceName: 'puck', // Default
                }
            });
        }

        const conversation = await prisma.conversation.create({
            data: {
                userId: userId!, // Ensure we handle guest/auth later
                personaId: persona.id,
                // We might want to store the 'storyContext' in the conversation if schema supports it, 
                // or just rely on the Persona's system prompt if we created a unique one.
                // For now, we rely on the first message setting the tone.
            }
        });

        // 4. Create the first message in the DB
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: firstMessage,
                userId: userId!
            }
        });

        return NextResponse.json({
            conversationId: conversation.id,
            firstMessage: firstMessage,
            systemPrompt: storyContext
        });

    } catch (error) {
        console.error('Story creation failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function conversationData(world: any, characters: any[]) {
    return world && characters && characters.length > 0;
}
