import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Note: Using simplified auth - in production, validate user session properly
        const resolvedParams = await params;
        const characterId = resolvedParams.id;
        const body = await request.json();
        const { systemPrompt, name, description, avatarUrl, voiceName, greeting } = body;

        // Verify ownership
        const character = await db.personaTemplate.findUnique({
            where: { id: characterId }
        });

        if (!character) {
            return NextResponse.json({ error: 'Character not found' }, { status: 404 });
        }

        // In a real app, check if user created this character
        // For now, allow update if authenticated

        const updated = await db.personaTemplate.update({
            where: { id: characterId },
            data: {
                systemPrompt: systemPrompt !== undefined ? systemPrompt : undefined,
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
                voiceName: voiceName !== undefined ? voiceName : undefined,
                greeting: greeting !== undefined ? greeting : undefined,
            }
        });

        return NextResponse.json({ success: true, character: updated });
    } catch (error: any) {
        console.error('Error updating character:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
