import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { world, characters, prompt: customPrompt } = await request.json();

        const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let finalPrompt = customPrompt;
        if (!finalPrompt) {
            finalPrompt = `Write a short, immersive story scene set in the world of "${world.name}" (${world.description}). 
            The story should feature the following characters: ${characters.map((c: any) => `${c.name} (${c.tagline})`).join(', ')}.
            The tone should be sophisticated, intimate, and narrative-driven. Keep it under 300 words.`;
        }

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error('Story generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate story' }, { status: 500 });
    }
}
