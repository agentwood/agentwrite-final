import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionStatus, getPlanLimits } from '@/lib/subscription';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || null;

    // Check quota for calls
    const subscriptionStatus = await getSubscriptionStatus(userId);
    const limits = getPlanLimits(subscriptionStatus.planId);
    
    if (limits.callMinutesPerDay === 0) {
      return NextResponse.json(
        { 
          error: 'Voice calls not available',
          reason: 'Voice calls are only available for premium users. Upgrade to unlock this feature.',
          quotaExceeded: true,
          upgradeUrl: '/pricing',
        },
        { status: 403 }
      );
    }
    
    if (limits.callMinutesPerDay > 0) {
      // Check daily call usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const quota = userId ? await db.userQuota.findFirst({
        where: {
          userId: userId,
          lastResetDate: {
            gte: today,
          },
        },
      }) : null;

      const usedMinutes = quota ? (quota.callMinutesToday || 0) / 60 : 0;
      
      if (usedMinutes >= limits.callMinutesPerDay) {
        return NextResponse.json(
          { 
            error: 'Daily call limit reached',
            reason: `You've reached your daily call limit of ${limits.callMinutesPerDay} minutes. Upgrade to unlock unlimited calls.`,
            quotaExceeded: true,
            upgradeUrl: '/pricing',
          },
          { status: 429 }
        );
      }
    }

    // For Live API, we need to use the API key directly in the WebSocket connection
    // The token is typically the API key itself, or we generate a short-lived token
    // For now, we'll return a token that the client can use
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not set' },
        { status: 500 }
      );
    }

    // Note: Live API authentication may require the API key to be sent as:
    // - Authorization header: `Authorization: Bearer ${apiKey}`
    // - Or as a query parameter in the WebSocket URL
    // 
    // For security, we should generate a short-lived token server-side
    // For now, we'll return a token identifier that the client can use
    
    // In production, you might want to:
    // 1. Generate a JWT token with short expiration
    // 2. Store it temporarily
    // 3. Return the token ID to the client
    // 4. Client uses the token ID to authenticate
    
    // For now, we'll return a simple token (in production, use proper token generation)
    const token = Buffer.from(`${Date.now()}:${apiKey}`).toString('base64');
    
    return NextResponse.json({
      token: token,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      // Note: Client should use GEMINI_API_KEY directly for WebSocket auth
      // This token is just for tracking/validation
    });
  } catch (error: any) {
    console.error('Error creating live token:', error);
    return NextResponse.json(
      { error: 'Failed to create live token', details: error.message },
      { status: 500 }
    );
  }
}
