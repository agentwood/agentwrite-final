import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Reward definitions
const REWARDS = [
    {
        id: 'first-chat',
        title: 'First Conversation',
        description: 'Start your first chat with any character',
        rewardAmount: 50,
        rewardType: 'credits',
        target: 1,
        icon: 'star',
    },
    {
        id: 'chat-10',
        title: 'Social Butterfly',
        description: 'Chat with 10 different characters',
        rewardAmount: 150,
        rewardType: 'credits',
        target: 10,
        icon: 'users',
    },
    {
        id: 'messages-100',
        title: 'Chatterer',
        description: 'Send 100 messages across all chats',
        rewardAmount: 200,
        rewardType: 'credits',
        target: 100,
        icon: 'zap',
    },
    {
        id: 'create-char',
        title: 'Creator',
        description: 'Create your first custom character',
        rewardAmount: 100,
        rewardType: 'credits',
        target: 1,
        icon: 'pen',
    },
    {
        id: 'daily-login-7',
        title: 'Dedicated Fan',
        description: 'Log in 7 days in a row',
        rewardAmount: 300,
        rewardType: 'credits',
        target: 7,
        icon: 'trophy',
    },
    {
        id: 'referral',
        title: 'Friend Finder',
        description: 'Refer a friend who signs up',
        rewardAmount: 500,
        rewardType: 'credits',
        target: 1,
        icon: 'gift',
    },
];

/**
 * GET /api/rewards - Fetch user's real reward progress
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

        // Get user data
        const user = await db.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                creditsBalance: true,
                referralCount: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate real progress for each reward

        // 1. First chat - count conversations
        const conversationCount = await db.conversation.count({
            where: { userId },
        });

        // 2. Chat with 10 characters - unique characters
        const uniqueCharacters = await db.userCharacterEngagement.count({
            where: { userId },
        });

        // 3. Messages sent - total messages
        const totalMessages = await db.message.count({
            where: {
                conversation: { userId },
                role: 'user',
            },
        });

        // 4. Created characters (if we have a createdBy field)
        // For now, set to 0 as we don't track character creation
        const createdCharacters = 0;

        // 5. Login streak
        const loginStreak = await db.userLoginStreak.findUnique({
            where: { userId },
        });

        // 6. Referrals
        const referralCount = user.referralCount || 0;

        // Get claimed rewards
        const claimedRewards = await db.userRewardProgress.findMany({
            where: { userId, claimed: true },
            select: { rewardId: true },
        });
        const claimedIds = new Set(claimedRewards.map(r => r.rewardId));

        // Build reward progress
        const rewardsWithProgress = REWARDS.map(reward => {
            let progress = 0;

            switch (reward.id) {
                case 'first-chat':
                    progress = Math.min(conversationCount, reward.target);
                    break;
                case 'chat-10':
                    progress = Math.min(uniqueCharacters, reward.target);
                    break;
                case 'messages-100':
                    progress = Math.min(totalMessages, reward.target);
                    break;
                case 'create-char':
                    progress = Math.min(createdCharacters, reward.target);
                    break;
                case 'daily-login-7':
                    progress = Math.min(loginStreak?.currentStreak || 0, reward.target);
                    break;
                case 'referral':
                    progress = Math.min(referralCount, reward.target);
                    break;
            }

            return {
                ...reward,
                progress,
                claimed: claimedIds.has(reward.id),
            };
        });

        // Calculate totals
        const totalEarned = rewardsWithProgress
            .filter(r => r.claimed)
            .reduce((sum, r) => sum + r.rewardAmount, 0);

        const totalAvailable = rewardsWithProgress
            .filter(r => r.progress >= r.target && !r.claimed)
            .reduce((sum, r) => sum + r.rewardAmount, 0);

        return NextResponse.json({
            rewards: rewardsWithProgress,
            totalEarned,
            totalAvailable,
            creditsBalance: user.creditsBalance,
        });
    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rewards' },
            { status: 500 }
        );
    }
}
