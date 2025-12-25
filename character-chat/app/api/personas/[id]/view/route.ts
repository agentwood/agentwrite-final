import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const userId = request.headers.get('x-user-id') || undefined;

    // Record view
    await db.personaView.create({
      data: {
        personaId,
        userId: userId || undefined,
      },
    });

    // Increment view count
    await db.personaTemplate.update({
      where: { id: personaId },
      data: { 
        viewCount: { increment: 1 },
        interactionCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    );
  }
}

