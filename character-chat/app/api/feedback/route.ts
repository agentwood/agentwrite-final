import { NextRequest, NextResponse } from 'next/server';
import { recordFeedback } from '@/lib/ml/contextSystem';
import { db } from '@/lib/db';

/**
 * POST /api/feedback
 * Record user feedback on a message to improve character responses
 */
export async function POST(request: NextRequest) {
  try {
    const { messageId, rating, thumbsUp, thumbsDown, feedbackText } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 }
      );
    }

    // Get user ID from request (implement auth later)
    const userId = request.headers.get('x-user-id') || undefined;

    // Verify message exists
    const message = await db.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Record feedback
    await recordFeedback(messageId, userId, {
      rating,
      thumbsUp,
      thumbsDown,
      feedbackText,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded',
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}




