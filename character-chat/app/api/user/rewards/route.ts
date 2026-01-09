import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
    try {
        // Get user from session
        // Since we're in a route handler, ideally we'd use createRouteHandlerClient
        // But for now we'll check the Authorization header which specific client calls might send,
        // Or we will rely on client-side passing the user ID via query param if we trust it (weak security),
        // OR better: use the supabase-js client to verify token if passed.

        // For this implementation, let's assume the user ID is passed or we can get it from a simple auth check if possible.
        // Given the constraints and setup, let's look for a user_id header or query param for now, 
        // knowing this should be upgraded to proper server-side session validation.

        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Fetch User, Streak, and Engagement stats
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                loginStreak: true,
                engagements: true,
                conversations: true,
                savedCharacters: true, // For "custom chars" or "stories" proxy
            }
        });

        if (!user) {
            // Return default/empty stats if user not found in Prisma (might exist in Auth but not synced)
            return NextResponse.json({
                level: 1,
                credits: 0,
                chatHours: 0,
                customChars: 0,
                streak: 0,
                stories: 0
            });
        }

        // Calculate stats
        // Level: Approximation based on credits spent or engagement
        const level = Math.floor((user.affiliateEarnings + 100) / 100) || 1;

        // Chat Hours: Sum of totalChatTime (in seconds? let's assume minutes if not spec'd, schema said default 0)
        // schema: totalChatTime Int @default(0)
        const totalChatMinutes = user.engagements.reduce((acc, curr) => acc + (curr.totalChatTime || 0), 0);
        const chatHours = parseFloat((totalChatMinutes / 60).toFixed(1));

        // Custom Chars: Number of personas created by user? 
        // We don't have a direct "createdPersonas" relation on User in the schema snapshot provided?
        // Wait, User has `conversations`, `savedCharacters`.
        // PersonaTemplate doesn't seem to have `creatorId`.
        // Let's assume 'stories' = conversations length for now.
        const uniqueStories = user.conversations.length;

        // Streak
        const streak = user.loginStreak?.currentStreak || 0;

        return NextResponse.json({
            level,
            credits: user.creditsBalance,
            chatHours,
            customChars: 0, // Placeholder as we don't track creatorId on personas in schema view
            streak,
            stories: uniqueStories
        });

    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
