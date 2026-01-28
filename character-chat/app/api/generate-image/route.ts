import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Use Pollinations.ai for reliable, free, keyless generation
        // This is much more stable for a demo/template environment than relying on specific Google Cloud permissions for Imagen
        const encodedPrompt = encodeURIComponent(prompt + " high quality, detailed, 8k");
        const pollinationUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&width=1024&height=1024&model=flux`;

        const imageRes = await fetch(pollinationUrl);
        if (!imageRes.ok) {
            throw new Error(`Pollinations API error: ${imageRes.statusText}`);
        }

        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');

        return NextResponse.json({
            mimeType: 'image/png',
            data: base64
        });

    } catch (error: any) {
        console.error('Image generation error:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
    }
}
