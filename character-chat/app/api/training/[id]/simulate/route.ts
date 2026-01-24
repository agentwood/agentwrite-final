import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGeminiClient } from '@/lib/geminiClient';
import {
    buildTreeESystemPrompt,
    EmotionalStateVector
} from '@/lib/tree-e-prompts';
import { evaluateResponse } from '@/lib/rag-testing';

// POST - Run a simulation chat using the REAL TREE-E Engine
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

        // Fetch the character with ALL TREE-E dependencies
        const persona = await db.personaTemplate.findUnique({
            where: { id },
            include: { voiceIdentity: true },
        });

        if (!persona) {
            return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 });
        }

        // Parse constraints
        let constraints: string[] = [];
        if (persona.trainingConstraints) {
            try {
                const parsed = typeof persona.trainingConstraints === 'string' ? JSON.parse(persona.trainingConstraints) : persona.trainingConstraints;
                if (Array.isArray(parsed)) constraints = parsed;
            } catch {
                constraints = [];
            }
        }

        // Use default training emotional state
        const emotionalState: EmotionalStateVector = {
            valence: 0.2,
            arousal: 0.5,
            dominance: 0.5,
            stability: 0.9
        };

        // Build the EXACT SAME prompt as production (Part I)
        const systemInstruction = buildTreeESystemPrompt(
            (persona as any).voiceIdentity,
            emotionalState,
            persona,
            constraints,
            0.5 // Default confidence for simulation
        );

        const geminiContents = [
            {
                role: 'user',
                parts: [{
                    text: `SYSTEM INSTRUCTION: You are simulated version of ${persona.name}. TEST MODE.`
                }]
            },
            {
                role: 'model',
                parts: [{ text: `Understood. I am running in SIMULATION/TRAINING mode. I will strictly adhere to my persona.` }]
            },
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ];

        // Generate response (Part V - logic only)
        const ai = getGeminiClient();
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: geminiContents,
            config: {
                systemInstruction: { parts: [{ text: systemInstruction }] },
                maxOutputTokens: 1000,
                temperature: 0.9,
            },
        });

        // Extract text
        let responseText = '';
        try {
            const resAny = result as any;
            if (typeof resAny.text === 'string') responseText = resAny.text;
            else if (typeof resAny.text === 'function') responseText = resAny.text();
            else if (resAny.response?.candidates?.[0]?.content?.parts?.[0]?.text) responseText = resAny.response.candidates[0].content.parts[0].text;
            else if (resAny.candidates?.[0]?.content?.parts?.[0]?.text) responseText = resAny.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error('Text extraction failed', e);
        }

        if (!responseText) responseText = "Error: No response generated.";

        // Clean up
        responseText = responseText.trim()
            .replace(/^["'](.+)["']$/g, '$1')
            .replace(/\[([^\]]+)\]/g, '*$1*');

        // Evaluate (Part II)
        // We expose the evaluation result to the trainer!
        const evalResult = await evaluateResponse(responseText, persona.name, constraints);

        return NextResponse.json({
            success: true,
            response: responseText,
            evaluation: evalResult // UI can show "Constraint Warning!"
        });

    } catch (error) {
        console.error('Simulation error:', error);
        return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
    }
}

