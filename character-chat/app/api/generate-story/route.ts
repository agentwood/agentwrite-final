import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { world, characters, prompt: customPrompt } = await request.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let finalPrompt = customPrompt;
        if (!finalPrompt) {
            finalPrompt = `Write a compelling, short, immersive story scene (max 250 words) set in the world of "${world.name}".
            World Description: ${world.description}
            
            The story must feature these characters: 
            ${characters.map((c: any) => `- ${c.name}: ${c.tagline}`).join('\n')}
            
            Style Guidelines:
            - Sophisticated and intimate narrative prose.
            - Focus on character interaction and atmospheric details.
            - Start in the middle of a meaningful moment.
            - Realistic and cinematic tone.`;
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
