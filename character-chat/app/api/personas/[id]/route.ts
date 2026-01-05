import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count atomically
    const persona = await db.personaTemplate.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        avatarUrl: true,
        category: true,
        viewCount: true,
        chatCount: true,
        followerCount: true,
        interactionCount: true,
        saveCount: true,
        commentCount: true,
      },
    });

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(persona);
  } catch (error: any) {
    console.error('Error fetching persona:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}




