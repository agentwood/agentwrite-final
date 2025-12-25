import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Reset daily quotas for all users
 * Should be called daily via cron job or scheduled function
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin secret (in production, use proper auth)
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Reset all user quotas
    const result = await db.userQuota.updateMany({
      where: {
        lastResetDate: {
          lt: today,
        },
      },
      data: {
        textRepliesToday: 0,
        ttsSecondsToday: 0,
        callMinutesToday: 0,
        lastResetDate: today,
      },
    });

    return NextResponse.json({
      success: true,
      resetCount: result.count,
      resetDate: today.toISOString(),
    });
  } catch (error: any) {
    console.error('Error resetting quotas:', error);
    return NextResponse.json(
      { error: 'Failed to reset quotas', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get current quota status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let quota = await db.userQuota.findUnique({
      where: { userId },
    });

    // Create quota if doesn't exist
    if (!quota) {
      quota = await db.userQuota.create({
        data: {
          userId,
          textRepliesToday: 0,
          ttsSecondsToday: 0,
          callMinutesToday: 0,
          lastResetDate: today,
        },
      });
    } else if (quota.lastResetDate < today) {
      // Reset if last reset was before today
      quota = await db.userQuota.update({
        where: { userId },
        data: {
          textRepliesToday: 0,
          ttsSecondsToday: 0,
          callMinutesToday: 0,
          lastResetDate: today,
        },
      });
    }

    return NextResponse.json({
      quota: {
        textReplies: quota.textRepliesToday,
        ttsSeconds: quota.ttsSecondsToday,
        callMinutes: quota.callMinutesToday,
        lastResetDate: quota.lastResetDate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching quota:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quota', details: error.message },
      { status: 500 }
    );
  }
}




