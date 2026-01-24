
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/analytics
 * Returns analytics for the current user's characters.
 * (Logic adapted from app/api/training/analytics/route.ts)
 */
export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Strategy: We want to show analytics for characters "owned" or "created" by the user.
        // Since PersonaTemplate lacks `creatorId`, we infer ownership via:
        // 1. Explicit `creatorId` if added later (future proofing)
        // 2. OR `Conversation` history (as used in training/analytics) - effectively "characters I use"
        // 3. OR `UserFollow` if they follow their own characters.

        // Using the logic from `app/api/training/analytics/route.ts` which seems to serve the "Creator" dashboard:
        const userConversations = await db.conversation.findMany({
            where: { userId },
            select: { personaId: true },
            distinct: ['personaId'],
        });

        const characterIds = userConversations.map(c => c.personaId);

        if (characterIds.length === 0) {
            return NextResponse.json({
                totalViews: 0,
                totalInteractions: 0,
                totalFollowers: 0,
                avgRetention: 0,
                characters: []
            });
        }

        const characters = await db.personaTemplate.findMany({
            where: {
                id: { in: characterIds },
            },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                viewCount: true,
                interactionCount: true,
                followerCount: true,
                saveCount: true,
                retentionScore: true,
                createdAt: true,
            },
            orderBy: { interactionCount: 'desc' } // Default sort
        });

        // Calculate aggregates
        const totalViews = characters.reduce((acc, c) => acc + (c.viewCount || 0), 0);
        const totalInteractions = characters.reduce((acc, c) => acc + (c.interactionCount || 0), 0);
        const totalFollowers = characters.reduce((acc, c) => acc + (c.followerCount || 0), 0);
        const avgRetention = characters.length > 0
            ? characters.reduce((acc, c) => acc + (c.retentionScore || 0), 0) / characters.length
            : 0;

        return NextResponse.json({
            totalViews,
            totalInteractions,
            totalFollowers,
            avgRetention: Number(avgRetention.toFixed(2)),
            characters: characters.map(c => ({
                id: c.id,
                name: c.name,
                avatarUrl: c.avatarUrl,
                stats: {
                    views: c.viewCount || 0,
                    interactions: c.interactionCount || 0,
                    followers: c.followerCount || 0,
                    saves: c.saveCount || 0,
                    retention: c.retentionScore || 0
                },
                createdAt: c.createdAt
            }))
        });

    } catch (error: any) {
        console.error('[User Analytics] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user analytics' },
            { status: 500 }
        );
    }
}
