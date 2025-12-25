import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personaId = params.id;
    const comments = await db.characterComment.findMany({
      where: {
        personaId,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const personaId = params.id;
    const { text } = await request.json();
    const userId = getUserId() || 'anonymous';

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await db.characterComment.create({
      data: {
        personaId,
        userId,
        text: text.trim(),
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Increment comment count
    await db.personaTemplate.update({
      where: { id: personaId },
      data: { commentCount: { increment: 1 } },
    });

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create comment' },
      { status: 500 }
    );
  }
}




