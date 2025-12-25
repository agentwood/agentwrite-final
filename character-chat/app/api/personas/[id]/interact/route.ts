import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const { type } = await request.json(); // 'chat', 'voice', 'call'

    await db.personaTemplate.update({
      where: { id: personaId },
      data: { 
        interactionCount: { increment: 1 },
        ...(type === 'chat' && { chatCount: { increment: 1 } }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record interaction' },
      { status: 500 }
    );
  }
}

