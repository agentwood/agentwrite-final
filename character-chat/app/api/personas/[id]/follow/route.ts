import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    // Ensure user exists in DB
    if (userId !== 'anonymous') {
      const userExists = await db.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        await db.user.create({
          data: {
            id: userId,
            username: `user_${userId.substring(0, 8)}`,
            subscriptionTier: 'free',
          }
        });
      }
    }

    // Check if already following
    const existing = await db.userFollow.findUnique({
      where: {
        userId_personaId: {
          userId,
          personaId,
        },
      },
    });

    if (existing) {
      // Unfollow
      await db.userFollow.delete({
        where: { id: existing.id },
      });
      await db.personaTemplate.update({
        where: { id: personaId },
        data: { followerCount: { decrement: 1 } },
      });
      return NextResponse.json({ following: false });
    }

    // Follow
    await db.userFollow.create({
      data: {
        userId,
        personaId,
      },
    });
    await db.personaTemplate.update({
      where: { id: personaId },
      data: { followerCount: { increment: 1 } },
    });

    return NextResponse.json({ following: true });
  } catch (error) {
    console.error('Error toggling follow:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const userId = request.headers.get('x-user-id') || 'anonymous';

    const follow = await db.userFollow.findUnique({
      where: {
        userId_personaId: {
          userId,
          personaId,
        },
      },
    });

    return NextResponse.json({ following: !!follow });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}

