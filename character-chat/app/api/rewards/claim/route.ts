import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Reward amounts (must match route.ts)
const REWARD_AMOUNTS: Record<string, number> = {
    'first-chat': 50,
    'chat-10': 150,
    'messages-100': 200,
    'create-char': 100,
    'daily-login-7': 300,
    'referral': 500,
};

/**
 * POST /api/rewards/claim - Claim a completed reward
 */
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        const { rewardId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 401 }
            );
        }

        if (!rewardId || !REWARD_AMOUNTS[rewardId]) {
            return NextResponse.json(
                { error: 'Invalid reward ID' },
                { status: 400 }
            );
        }

        // Check if already claimed
        const existing = await db.userRewardProgress.findUnique({
            where: {
                userId_rewardId: { userId, rewardId },
            },
        });

        if (existing?.claimed) {
            return NextResponse.json(
                { error: 'Reward already claimed' },
                { status: 400 }
            );
        }

        const rewardAmount = REWARD_AMOUNTS[rewardId];

        // Transaction: mark as claimed and add credits
        await db.$transaction([
            // Mark reward as claimed
            db.userRewardProgress.upsert({
                where: {
                    userId_rewardId: { userId, rewardId },
                },
                create: {
                    userId,
                    rewardId,
                    progress: 0,
                    claimed: true,
                    claimedAt: new Date(),
                },
                update: {
                    claimed: true,
                    claimedAt: new Date(),
                },
            }),
            // Add credits to user
            db.user.update({
                where: { id: userId },
                data: {
                    creditsBalance: { increment: rewardAmount },
                },
            }),
            // Log the transaction
            db.creditTransaction.create({
                data: {
                    userId,
                    amount: rewardAmount,
                    actionType: 'reward_claim',
                    description: `Claimed reward: ${rewardId}`,
                    balanceAfter: 0, // Will be updated by trigger or next query
                },
            }),
        ]);

        // Get updated balance
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { creditsBalance: true },
        });

        return NextResponse.json({
            success: true,
            rewardId,
            creditsAdded: rewardAmount,
            newBalance: user?.creditsBalance || 0,
        });
    } catch (error) {
        console.error('Error claiming reward:', error);
        return NextResponse.json(
            { error: 'Failed to claim reward' },
            { status: 500 }
        );
    }
}
