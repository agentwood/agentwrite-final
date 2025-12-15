import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const archetype = searchParams.get('archetype');

    const where: any = {};
    if (category) where.category = category;
    if (featured) where.featured = true;
    if (trending) where.trending = true;
    if (archetype) where.archetype = archetype;

    const personas = await db.personaTemplate.findMany({
      where,
      orderBy: featured 
        ? { retentionScore: 'desc' }
        : trending
        ? { retentionScore: 'desc' }
        : { createdAt: 'desc' },
    });

    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

