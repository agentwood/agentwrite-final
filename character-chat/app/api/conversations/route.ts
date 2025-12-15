import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { characterId, userId } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      );
    }

    // Verify persona exists
    const persona = await db.personaTemplate.findUnique({
      where: { id: characterId },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.personaTemplate.update({
      where: { id: characterId },
      data: { viewCount: { increment: 1 } },
    });

    const conversation = await db.conversation.create({
      data: {
        personaId: characterId,
        userId: userId || null,
      },
      include: {
        persona: true,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

