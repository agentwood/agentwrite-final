import { NextRequest, NextResponse } from 'next/server';
import { submitToGoogleIndexing, indexCharacterPage } from '@/lib/seo/google-indexing';
import { queueCharacterIndexing } from '@/lib/seo/queue-system';

export async function POST(request: NextRequest) {
  try {
    const { characterId, useQueue = false } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      );
    }

    if (useQueue) {
      // Add to queue for async processing
      const jobId = await queueCharacterIndexing(characterId, 5);
      return NextResponse.json({
        success: true,
        queued: true,
        jobId,
      });
    } else {
      // Process immediately
      const success = await indexCharacterPage(characterId);
      return NextResponse.json({
        success,
        queued: false,
      });
    }
  } catch (error: any) {
    console.error('Error indexing character:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to index character' },
      { status: 500 }
    );
  }
}

