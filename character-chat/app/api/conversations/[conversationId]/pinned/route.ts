import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    const pinned = await db.pinnedMessage.findMany({
      where: {
        userId,
        message: {
          conversationId,
        },
      },
      include: {
        message: true,
      },
      orderBy: { pinnedAt: 'desc' },
    });

    return NextResponse.json({
      messages: pinned.map(p => p.message),
    });
  } catch (error) {
    console.error('Error fetching pinned messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pinned messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { messageId } = await request.json();
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Verify message belongs to conversation
    const message = await db.message.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found in this conversation' },
        { status: 404 }
      );
    }

    // Check if already pinned
    const existing = await db.pinnedMessage.findUnique({
      where: { messageId },
    });

    if (existing) {
      await db.pinnedMessage.delete({
        where: { messageId },
      });
      return NextResponse.json({ pinned: false });
    }

    await db.pinnedMessage.create({
      data: {
        messageId,
        userId,
      },
    });

    return NextResponse.json({ pinned: true });
  } catch (error) {
    console.error('Error toggling pin:', error);
    return NextResponse.json(
      { error: 'Failed to toggle pin' },
      { status: 500 }
    );
  }
}

