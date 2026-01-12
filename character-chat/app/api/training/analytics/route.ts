/**
 * Training Analytics API
 * Returns analytics for character creators (PRO feature)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get characters the user has interacted with (since there's no creatorId on PersonaTemplate)
        // For PRO users, show stats on characters they've chatted with
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
                totalSaves: 0,
                avgRetentionScore: 0,
                topCharacter: null,
                characters: [],
                messagesThisWeek: 0,
                dailyActiveUsers: 0,
            });
        }

        const characters = await db.personaTemplate.findMany({
            where: {
                id: { in: characterIds },
            },
            select: {
                id: true,
                name: true,
                viewCount: true,
                interactionCount: true,
                followerCount: true,
                saveCount: true,
                commentCount: true,
                retentionScore: true,
            },
        });

        if (characters.length === 0) {
            return NextResponse.json({
                totalViews: 0,
                totalInteractions: 0,
                totalFollowers: 0,
                totalSaves: 0,
                avgRetentionScore: 0,
                topCharacter: null,
                characters: [],
                messagesThisWeek: 0,
                dailyActiveUsers: 0,
            });
        }

        // Aggregate stats
        const totalViews = characters.reduce((sum, c) => sum + (c.viewCount || 0), 0);
        const totalInteractions = characters.reduce((sum, c) => sum + (c.interactionCount || 0), 0);
        const totalFollowers = characters.reduce((sum, c) => sum + (c.followerCount || 0), 0);
        const totalSaves = characters.reduce((sum, c) => sum + (c.saveCount || 0), 0);
        const avgRetentionScore = characters.reduce((sum, c) => sum + (c.retentionScore || 0), 0) / characters.length;

        // Find top performing character
        const topCharacter = characters.reduce((top, c) =>
            (c.interactionCount || 0) > (top?.interactionCount || 0) ? c : top
            , characters[0]);

        // Get messages this week for creator's characters
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const messagesThisWeek = await db.message.count({
            where: {
                conversation: {
                    personaId: {
                        in: characters.map(c => c.id),
                    },
                },
                createdAt: {
                    gte: oneWeekAgo,
                },
            },
        });

        // Count unique users interacting today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyConversations = await db.conversation.findMany({
            where: {
                personaId: {
                    in: characters.map(c => c.id),
                },
                updatedAt: {
                    gte: today,
                },
            },
            select: {
                userId: true,
            },
            distinct: ['userId'],
        });

        const dailyActiveUsers = dailyConversations.filter(c => c.userId).length;

        return NextResponse.json({
            totalViews,
            totalInteractions,
            totalFollowers,
            totalSaves,
            avgRetentionScore: Number(avgRetentionScore.toFixed(2)),
            topCharacter: topCharacter ? {
                id: topCharacter.id,
                name: topCharacter.name,
                interactions: topCharacter.interactionCount,
            } : null,
            characters: characters.map(c => ({
                id: c.id,
                name: c.name,
                views: c.viewCount || 0,
                interactions: c.interactionCount || 0,
                followers: c.followerCount || 0,
            })),
            messagesThisWeek,
            dailyActiveUsers,
        });
    } catch (error: any) {
        console.error('[Training Analytics] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
