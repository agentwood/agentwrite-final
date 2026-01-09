import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '');

// POST - Run a simulation chat with training parameters applied
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
        }

        // Fetch the character with training config
        const persona = await db.personaTemplate.findUnique({
            where: { id },
            select: {
                name: true,
                archetype: true,
                systemPrompt: true,
                description: true,
                behaviorEmpathy: true,
                behaviorAgreeable: true,
                styleVerbosity: true,
                styleFormality: true,
                trainingConstraints: true,
            },
        });

        if (!persona) {
            return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 });
        }

        // Parse constraints
        let constraints: string[] = [];
        if (persona.trainingConstraints) {
            try {
                constraints = JSON.parse(persona.trainingConstraints);
            } catch {
                constraints = [];
            }
        }

        // Build training-aware system prompt
        let trainingPrompt = `You are ${persona.name}, a ${persona.archetype}.\n\n`;
        trainingPrompt += `${persona.description || ''}\n\n`;

        // Apply behavioral sliders
        const empathy = persona.behaviorEmpathy ?? 50;
        const agreeable = persona.behaviorAgreeable ?? 50;
        const verbosity = persona.styleVerbosity ?? 50;
        const formality = persona.styleFormality ?? 50;

        trainingPrompt += `BEHAVIORAL PARAMETERS:\n`;
        if (empathy < 30) {
            trainingPrompt += `- Lead with empathy and emotional understanding\n`;
        } else if (empathy > 70) {
            trainingPrompt += `- Prioritize logic and rational analysis over emotions\n`;
        }

        if (agreeable < 30) {
            trainingPrompt += `- Be agreeable and supportive\n`;
        } else if (agreeable > 70) {
            trainingPrompt += `- Challenge assumptions and play devil's advocate\n`;
        }

        trainingPrompt += `\nSTYLISTIC PARAMETERS:\n`;
        if (verbosity < 30) {
            trainingPrompt += `- Keep responses very concise and brief\n`;
        } else if (verbosity > 70) {
            trainingPrompt += `- Provide detailed, thorough explanations\n`;
        }

        if (formality < 30) {
            trainingPrompt += `- Use casual, conversational language\n`;
        } else if (formality > 70) {
            trainingPrompt += `- Maintain formal, professional tone\n`;
        }

        // Apply constraints
        if (constraints.length > 0) {
            trainingPrompt += `\nHARD CONSTRAINTS (you MUST follow these):\n`;
            const constraintDescriptions: Record<string, string> = {
                refuse_emotional: '- DO NOT provide emotional reassurance or comfort',
                avoid_slang: '- DO NOT use modern slang or informal expressions',
                no_speculation: '- DO NOT speculate without evidence; only state facts',
                limit_length: '- Keep all responses under 100 words',
                period_character: '- Stay in historical character; no modern references',
                reject_flirtation: '- Politely reject any flirtatious advances',
            };
            constraints.forEach(c => {
                if (constraintDescriptions[c]) {
                    trainingPrompt += `${constraintDescriptions[c]}\n`;
                }
            });
        }

        trainingPrompt += `\nThis is a SIMULATION MODE for testing. Respond authentically while following all parameters and constraints.`;

        // Generate response using Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: trainingPrompt }] },
                { role: 'model', parts: [{ text: 'Understood. I am ready to respond according to my configured parameters.' }] },
                { role: 'user', parts: [{ text: message }] },
            ],
        });

        const response = result.response.text();

        return NextResponse.json({ success: true, response });
    } catch (error) {
        console.error('Simulation error:', error);
        return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
    }
}
