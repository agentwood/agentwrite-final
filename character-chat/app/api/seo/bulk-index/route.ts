import { NextRequest, NextResponse } from 'next/server';
import { bulkIndexCharacters } from '@/lib/seo/phase2/bulk-operations';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { characterIds, limit, category, concurrency = 10 } = await request.json();

    let ids: string[] = characterIds || [];

    // If no IDs provided, fetch from database
    if (ids.length === 0) {
      const where: any = {};
      if (category) {
        where.category = category;
      }

      const characters = await db.personaTemplate.findMany({
        where,
        select: { id: true },
        take: limit || 1000,
        orderBy: { viewCount: 'desc' },
      });

      ids = characters.map(c => c.id);
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { error: 'No characters found to index' },
        { status: 400 }
      );
    }

    // Process in background (don't wait)
    bulkIndexCharacters(ids, concurrency).then(results => {
      console.log('Bulk indexing completed:', results);
    }).catch(error => {
      console.error('Bulk indexing error:', error);
    });

    return NextResponse.json({
      success: true,
      queued: ids.length,
      message: `Queued ${ids.length} characters for indexing`,
    });
  } catch (error: any) {
    console.error('Error in bulk index:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to bulk index' },
      { status: 500 }
    );
  }
}

