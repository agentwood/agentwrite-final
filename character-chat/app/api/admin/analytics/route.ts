import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Admin Analytics API
 * Returns aggregated stats for the admin dashboard
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || '7d';

        // Calculate Date Range
        const now = new Date();
        const past = new Date(now);

        switch (period) {
            case '1h': past.setHours(now.getHours() - 1); break;
            case '24h': past.setHours(now.getHours() - 24); break;
            case '7d': past.setDate(now.getDate() - 7); break;
            case '30d': past.setDate(now.getDate() - 30); break;
            case '90d': past.setDate(now.getDate() - 90); break;
            default: past.setDate(now.getDate() - 7);
        }

        // --- SCOPED QUERIES (Time-sensitive) ---

        // Total Users (Created in this period)
        // If period is extremely recent, this shows growth. 
        // BUT the dashboard card implies "Total Users" as a standing count.
        // The user likely wants "New Users in Period" for growth, but "Total Users" for standing.
        // HOWEVER, standard analytics usually filter "Active" or "New" by date.
        // Let's provide "New Users" for the time range, but we might keep "Total Ever" if it's cleaner.
        // Correct approach: The dashboard labels it "Total Users", usually implies standing count. 
        // But for "1 hour", showing specific activity is better.
        // Let's stick to Activity within the range:

        const newUsersInPeriod = await db.user.count({
            where: { createdAt: { gte: past } }
        });

        const activeUsersInPeriod = await db.conversation.groupBy({
            by: ['userId'],
            where: { updatedAt: { gte: past }, userId: { not: null } }
        });

        // Registered Users (Non-anonymous) - Global Count usually desired, but we can check "New Registered"
        const totalRegisteredUsers = await db.user.count({
            where: { email: { not: null } }
        });

        const totalUsersEver = await db.user.count();

        const conversationsInPeriod = await db.conversation.count({
            where: { updatedAt: { gte: past } }
        });

        const messagesInPeriod = await db.message.count({
            where: { createdAt: { gte: past } }
        });

        // --- STANDING METRICS (Mostly global state) ---
        const totalCharacters = await db.personaTemplate.count();
        const voiceReadyCharacters = await db.personaTemplate.count({ where: { voiceReady: true } });

        // Views/Likes are aggregates on the character, sadly we don't have a time-series for these yet in schema
        // So these remain global
        const viewsAgg = await db.personaTemplate.aggregate({
            _sum: { viewCount: true },
            _avg: { viewCount: true },
            _max: { viewCount: true }
        });

        const likesAgg = await db.personaTemplate.aggregate({
            _sum: { saveCount: true },
            _avg: { saveCount: true }
        });

        const topByViews = await db.personaTemplate.findMany({
            orderBy: { viewCount: 'desc' },
            take: 10,
            select: { id: true, name: true, category: true, viewCount: true, saveCount: true, chatCount: true, avatarUrl: true, trending: true, retentionScore: true }
        });

        const topByChats = await db.personaTemplate.findMany({
            orderBy: { chatCount: 'desc' },
            take: 10,
            select: { id: true, name: true, category: true, viewCount: true, chatCount: true, avatarUrl: true }
        });

        const categoryBreakdown = await db.personaTemplate.groupBy({
            by: ['category'],
            _count: { id: true },
            _sum: { viewCount: true }
        });

        const officialCount = await db.personaTemplate.count({ where: { featured: true } });

        return NextResponse.json({
            overview: {
                totalCharacters,
                voiceReadyCharacters,
                officialCharacters: officialCount,
                communityCharacters: totalCharacters - officialCount,
                totalUsers: totalUsersEver, // Stick to global for the big number, maybe show 'new' in subtext later
                newUsers: newUsersInPeriod,
                registeredUsers: totalRegisteredUsers,
                totalConversations: conversationsInPeriod, // This is now context-aware

                // This 'activeUsersToday' prop was used for "Registered" in UI, 
                // but let's pass the real registered count here.
                activeUsersToday: totalRegisteredUsers,

                avgSessionDuration: 0,
                totalMessagesToday: messagesInPeriod, // This is effectively "Messages in Period"
            },
            engagement: {
                totalViews: viewsAgg._sum.viewCount || 0,
                avgViewsPerCharacter: Math.round(viewsAgg._avg.viewCount || 0),
                maxViews: viewsAgg._max.viewCount || 0,
                totalLikes: likesAgg._sum.saveCount || 0,
                avgLikesPerCharacter: Math.round(likesAgg._avg.saveCount || 0),
                totalChats: conversationsInPeriod,
                totalInteractions: messagesInPeriod
            },
            topCharacters: { byViews: topByViews, byChats: topByChats },
            categoryBreakdown: categoryBreakdown.map(c => ({
                category: c.category,
                count: c._count.id,
                totalViews: c._sum.viewCount || 0
            }))
        });
    } catch (error) {
        console.error('Admin analytics error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
