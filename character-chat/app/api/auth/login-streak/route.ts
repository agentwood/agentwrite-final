import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/auth/login-streak - Update login streak on each login
 * Call this when user logs in to track daily streak
 */
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        const now = new Date();
        const todayUTC = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
        ));

        // Get or create login streak
        let streak = await db.userLoginStreak.findUnique({
            where: { userId },
        });

        if (!streak) {
            // First login - create streak
            streak = await db.userLoginStreak.create({
                data: {
                    userId,
                    currentStreak: 1,
                    longestStreak: 1,
                    lastLoginDate: todayUTC,
                },
            });
        } else {
            const lastLogin = new Date(streak.lastLoginDate);
            const lastLoginUTC = new Date(Date.UTC(
                lastLogin.getUTCFullYear(),
                lastLogin.getUTCMonth(),
                lastLogin.getUTCDate()
            ));

            // Calculate days difference
            const daysDiff = Math.floor(
                (todayUTC.getTime() - lastLoginUTC.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysDiff === 0) {
                // Same day - no update needed
                return NextResponse.json({
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    message: 'Already logged in today',
                });
            } else if (daysDiff === 1) {
                // Consecutive day - increment streak
                const newStreak = streak.currentStreak + 1;
                streak = await db.userLoginStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: newStreak,
                        longestStreak: Math.max(streak.longestStreak, newStreak),
                        lastLoginDate: todayUTC,
                    },
                });
            } else {
                // Streak broken - reset to 1
                streak = await db.userLoginStreak.update({
                    where: { userId },
                    data: {
                        currentStreak: 1,
                        lastLoginDate: todayUTC,
                    },
                });
            }
        }

        return NextResponse.json({
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            lastLoginDate: streak.lastLoginDate,
        });
    } catch (error) {
        console.error('Error updating login streak:', error);
        return NextResponse.json(
            { error: 'Failed to update login streak' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/auth/login-streak - Get current login streak
 */
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        const streak = await db.userLoginStreak.findUnique({
            where: { userId },
        });

        return NextResponse.json({
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            lastLoginDate: streak?.lastLoginDate || null,
        });
    } catch (error) {
        console.error('Error fetching login streak:', error);
        return NextResponse.json(
            { error: 'Failed to fetch login streak' },
            { status: 500 }
        );
    }
}
