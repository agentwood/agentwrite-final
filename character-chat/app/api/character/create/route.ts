import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            gender,
            description,
            intro,
            opening,
            avatarUrl,
            selectedVoice,
            selectedSkills
        } = body;

        if (!name || !description) {
            return NextResponse.json({ success: false, error: 'Name and description are required' }, { status: 400 });
        }

        // Map voice ID if needed (for now just use as provided or default)
        const voiceName = selectedVoice || 'Aria';

        // Create the persona template
        const character = await db.personaTemplate.create({
            data: {
                name,
                gender,
                description, // This is the user-facing description
                systemPrompt: description, // Defaulting system prompt to the description for now
                greeting: opening || intro || `Hello! I am ${name}.`,
                tagline: intro?.slice(0, 100) || `${name}`,
                avatarUrl: avatarUrl || '/avatars/default.png',
                voiceName: voiceName,
                archetype: 'custom',
                category: 'Original',
                voiceReady: true,
                featured: false,
                prompts: JSON.stringify([opening, "Tell me about yourself", "What can you do?"]),
                characterKeywords: selectedSkills ? JSON.stringify(selectedSkills) : '[]',
            }
        });

        return NextResponse.json({ success: true, character });
    } catch (error: any) {
        console.error('Error in character creation API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
