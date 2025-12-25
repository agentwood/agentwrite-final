import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { updateVoiceRating } from '@/lib/ml/voiceOptimizer';
import { optimizeParameters } from '@/lib/ml/parameterOptimizer';

export async function POST(request: NextRequest) {
  try {
    const {
      messageId,
      personaId,
      voiceName,
      voiceRating,
      speedRating,
      pitchRating,
      naturalnessRating,
      feedbackText,
      currentParams,
    } = await request.json();

    const userId = request.headers.get('x-user-id') || null;

    // Save feedback
    await db.voiceFeedback.create({
      data: {
        messageId,
        personaId,
        voiceName,
        userId: userId || undefined,
        voiceRating,
        speedRating,
        pitchRating,
        naturalnessRating,
        feedbackText,
      },
    });

    // Update voice performance
    if (voiceRating) {
      await updateVoiceRating(personaId, voiceName, voiceRating, userId);
    }

    // Optimize parameters
    if (currentParams && (speedRating || pitchRating || naturalnessRating)) {
      await optimizeParameters(
        personaId,
        voiceName,
        {
          speedRating,
          pitchRating,
          naturalnessRating,
        },
        currentParams
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving voice feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}




