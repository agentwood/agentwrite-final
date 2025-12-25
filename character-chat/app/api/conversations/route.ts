import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const personaId = searchParams.get('personaId');
    const userId = request.headers.get('x-user-id') || undefined;

    const where: any = {};
    if (personaId) where.personaId = personaId;
    if (userId) where.userId = userId;

    const conversations = await db.conversation.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            text: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

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

