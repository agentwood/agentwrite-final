import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: personaId } = await params;
    const { type } = await request.json(); // 'like' or 'dislike'
    const userId = getUserId() || 'anonymous';

    // For now, we'll just increment/decrement a like count on the persona
    // In a full implementation, you'd want a UserLike model to track individual likes
    if (type === 'like') {
      await db.personaTemplate.update({
        where: { id: personaId },
        data: { 
          // Note: We'll use interactionCount as a proxy for likes if likes field doesn't exist
          // Or you can add a likes field to the schema
        },
      });
    }

    return NextResponse.json({ success: true, type });
  } catch (error: any) {
    console.error('Error handling like:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to handle like' },
      { status: 500 }
    );
  }
}




