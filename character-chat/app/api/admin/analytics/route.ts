import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Admin Analytics API
 * Returns aggregated stats for the admin dashboard
 */
export async function GET() {
    try {
        // Get total character count
        const totalCharacters = await db.personaTemplate.count();

        // Get characters with voiceReady
        const voiceReadyCharacters = await db.personaTemplate.count({
            where: { voiceReady: true }
        });

        // Get total views across all characters
        const viewsAgg = await db.personaTemplate.aggregate({
            _sum: { viewCount: true },
            _avg: { viewCount: true },
            _max: { viewCount: true }
        });

        // Get total likes (saveCount) across all characters
        const likesAgg = await db.personaTemplate.aggregate({
            _sum: { saveCount: true },
            _avg: { saveCount: true }
        });

        // Get total chats/interactions
        const chatsAgg = await db.personaTemplate.aggregate({
            _sum: { chatCount: true, interactionCount: true }
        });

        // Get top 10 characters by views
        const topByViews = await db.personaTemplate.findMany({
            orderBy: { viewCount: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                category: true,
                viewCount: true,
                saveCount: true,
                chatCount: true,
                avatarUrl: true,
                isOfficial: true
            }
        });

        // Get top 10 by chats
        const topByChats = await db.personaTemplate.findMany({
            orderBy: { chatCount: 'desc' },
            take: 10,
            select: {
                id: true,
                name: true,
                category: true,
                viewCount: true,
                chatCount: true,
                avatarUrl: true
            }
        });

        // Get category breakdown
        const categoryBreakdown = await db.personaTemplate.groupBy({
            by: ['category'],
            _count: { id: true },
            _sum: { viewCount: true }
        });

        // Get official vs community count
        const officialCount = await db.personaTemplate.count({
            where: { isOfficial: true }
        });

        // Get user count if available
        let userCount = 0;
        try {
            userCount = await db.user.count();
        } catch (e) {
            // User table might not exist
        }

        // Get conversation count if available
        let conversationCount = 0;
        try {
            conversationCount = await db.conversation.count();
        } catch (e) {
            // Conversation table might not exist
        }

        return NextResponse.json({
            overview: {
                totalCharacters,
                voiceReadyCharacters,
                officialCharacters: officialCount,
                communityCharacters: totalCharacters - officialCount,
                totalUsers: userCount,
                totalConversations: conversationCount
            },
            engagement: {
                totalViews: viewsAgg._sum.viewCount || 0,
                avgViewsPerCharacter: Math.round(viewsAgg._avg.viewCount || 0),
                maxViews: viewsAgg._max.viewCount || 0,
                totalLikes: likesAgg._sum.saveCount || 0,
                avgLikesPerCharacter: Math.round(likesAgg._avg.saveCount || 0),
                totalChats: chatsAgg._sum.chatCount || 0,
                totalInteractions: chatsAgg._sum.interactionCount || 0
            },
            topCharacters: {
                byViews: topByViews,
                byChats: topByChats
            },
            categoryBreakdown: categoryBreakdown.map(c => ({
                category: c.category,
                count: c._count.id,
                totalViews: c._sum.viewCount || 0
            }))
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
