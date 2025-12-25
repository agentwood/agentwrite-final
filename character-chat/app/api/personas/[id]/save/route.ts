import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const userId = getUserId() || 'anonymous';

    // Check if already saved
    const existing = await db.characterSave.findUnique({
      where: {
        userId_personaId: {
          userId,
          personaId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ saved: true });
    }

    // Create save
    await db.characterSave.create({
      data: {
        userId,
        personaId,
      },
    });

    // Increment save count
    await db.personaTemplate.update({
      where: { id: personaId },
      data: { saveCount: { increment: 1 } },
    });

    return NextResponse.json({ saved: true });
  } catch (error: any) {
    console.error('Error saving character:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const userId = getUserId() || 'anonymous';

    const existing = await db.characterSave.findUnique({
      where: {
        userId_personaId: {
          userId,
          personaId,
        },
      },
    });

    if (existing) {
      await db.characterSave.delete({
        where: { id: existing.id },
      });

      // Decrement save count
      await db.personaTemplate.update({
        where: { id: personaId },
        data: { saveCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ saved: false });
  } catch (error: any) {
    console.error('Error unsaving character:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to unsave character' },
      { status: 500 }
    );
  }
}

