import { NextRequest, NextResponse } from 'next/server';
import { rankPersonas, suggestRemixes } from '@/lib/personaDiscovery';

// Admin-only endpoint to trigger persona ranking
// Should be called weekly via cron job

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { rankings, featuredIds, trendingIds } = await rankPersonas();
    const suggestions = await suggestRemixes();

    return NextResponse.json({
      success: true,
      ranked: rankings.length,
      featured: featuredIds.length,
      trending: trendingIds.length,
      suggestions,
    });
  } catch (error) {
    console.error('Error ranking personas:', error);
    return NextResponse.json(
      { error: 'Failed to rank personas' },
      { status: 500 }
    );
  }
}




