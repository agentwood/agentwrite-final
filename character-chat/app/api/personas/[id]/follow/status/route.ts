import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/personas/[id]/follow/status
 * Check if a user is following a persona
 */
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
        console.error('Error checking follow status:', error);
        return NextResponse.json(
            { error: 'Failed to check follow status' },
            { status: 500 }
        );
    }
}
