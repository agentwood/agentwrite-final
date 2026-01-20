import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * Session Tracking API
 * Tracks user sessions for analytics
 */

// Start a new session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userAgent, device, browser, os } = body;

        // Get IP from headers
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor?.split(',')[0] || 'unknown';

        // Create session
        const session = await db.userSession.create({
            data: {
                userId: userId || null,
                ipAddress,
                userAgent: userAgent || request.headers.get('user-agent') || null,
                device: device || null,
                browser: browser || null,
                os: os || null,
                pageViews: 1,
            }
        });

        // Update daily analytics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        await db.dailyAnalytics.upsert({
            where: { date: today },
            update: {
                totalSessions: { increment: 1 },
                activeUsers: { increment: userId ? 1 : 0 },
            },
            create: {
                date: today,
                totalSessions: 1,
                activeUsers: userId ? 1 : 0,
            }
        });

        return NextResponse.json({
            sessionId: session.id,
            message: 'Session started'
        });
    } catch (error) {
        console.error('Session start error:', error);
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
    }
}

// End a session (calculate duration)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, pageViews, messagesCount } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        const session = await db.userSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const endedAt = new Date();
        const durationMs = endedAt.getTime() - session.startedAt.getTime();

        await db.userSession.update({
            where: { id: sessionId },
            data: {
                endedAt,
                durationMs,
                pageViews: pageViews || session.pageViews,
                messagesCount: messagesCount || session.messagesCount,
            }
        });

        // Update daily analytics with session duration
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const durationSec = Math.floor(durationMs / 1000);

        await db.dailyAnalytics.upsert({
            where: { date: today },
            update: {
                avgSessionDur: { increment: durationSec },
                totalMessages: { increment: messagesCount || 0 },
            },
            create: {
                date: today,
                avgSessionDur: durationSec,
                totalMessages: messagesCount || 0,
            }
        });

        return NextResponse.json({
            message: 'Session ended',
            durationMs
        });
    } catch (error) {
        console.error('Session end error:', error);
        return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
    }
}

// Track page view or message
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, event, count = 1 } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        if (event === 'pageView') {
            await db.userSession.update({
                where: { id: sessionId },
                data: { pageViews: { increment: count } }
            });
        } else if (event === 'message') {
            await db.userSession.update({
                where: { id: sessionId },
                data: { messagesCount: { increment: count } }
            });

            // Also update daily analytics
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            await db.dailyAnalytics.upsert({
                where: { date: today },
                update: { totalMessages: { increment: count } },
                create: { date: today, totalMessages: count }
            });
        }

        return NextResponse.json({ message: 'Event tracked' });
    } catch (error) {
        console.error('Track event error:', error);
        return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }
}
