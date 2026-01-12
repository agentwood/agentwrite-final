import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { headers } from 'next/headers';

// Define the rewards structure matching the user's design
const REWARDS_DEFINITIONS = [
    {
        id: 'first-whisper',
        title: 'First Whisper',
        description: 'Spend 1 hour talking to any character.',
        target: 60, // Using 60 messages as proxy for 1 hour
        rewardAmount: 50,
        type: 'credits',
        icon: 'message-circle'
    },
    {
        id: 'storyteller',
        title: 'Storyteller',
        description: 'Create your first custom character.',
        target: 1,
        rewardAmount: 0, // Unlock new voice pack
        type: 'voice-pack',
        icon: 'check-circle'
    },
    {
        id: 'deep-dive',
        title: 'Deep Dive',
        description: 'Reach a 7-day streak.',
        target: 7,
        rewardAmount: 0, // Profile Badge
        type: 'badge',
        icon: 'zap'
    },
    {
        id: 'world-builder',
        title: 'World Builder',
        description: 'Craft 5 unique stories.',
        target: 5, // 5 created characters or 5 conversations started
        rewardAmount: 200,
        type: 'credits',
        icon: 'globe'
    }
];

export async function GET(req: Request) {
    try {
        const headersList = headers();
        const userId = headersList.get('x-user-id'); // Assuming middleware sets this or we parse session

        // For demo/dev purposes if headers missing (development)
        // In production this should be stricter
        if (!userId) {
            return NextResponse.json({
                rewards: REWARDS_DEFINITIONS.map(r => ({ ...r, progress: 0, claimed: false })),
                creditsBalance: 0,
                level: 1
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                conversations: true,
                createdPersonas: true,
                _count: {
                    select: { messages: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Calculate Stats
        // First Whisper: Usage > 60 messages (approx 1 hr)
        const totalMessages = await prisma.message.count({
            where: { role: 'user', conversation: { userId: user.id } }
        });

        // Storyteller: Created 1 character
        const createdCount = await prisma.persona.count({
            where: { creatorId: user.id } // All created by user
        });

        // Deep Dive: Login Streak
        // Using a simple calculation or placeholder if streak tracking isn't fully robust yet
        // For now assuming 1 if no data, or using dates if we tracked them.
        const currentProgress = 1;

        // World Builder: 5 conversations
        const uniqueStories = user.conversations.length;

        // Fetch claimed status
        const userProgress = await prisma.userRewardProgress.findMany({
            where: { userId: user.id }
        });

        const rewardsData = REWARDS_DEFINITIONS.map(reward => {
            let calcProgress = 0;

            switch (reward.id) {
                case 'first-whisper':
                    calcProgress = totalMessages;
                    break;
                case 'storyteller':
                    calcProgress = createdCount;
                    break;
                case 'deep-dive':
                    calcProgress = currentProgress; // TODO: Implement real streak
                    break;
                case 'world-builder':
                    calcProgress = uniqueStories;
                    break;
            }

            // Cap progress at target
            const cappedProgress = Math.min(calcProgress, reward.target);

            const claimedState = userProgress.find(p => p.rewardId === reward.id);

            return {
                ...reward,
                progress: cappedProgress,
                claimed: claimedState?.claimed || false,
                readyToClaim: cappedProgress >= reward.target && !claimedState?.claimed
            };
        });

        return NextResponse.json({
            rewards: rewardsData,
            creditsBalance: user.creditsBalance,
            level: Math.floor(totalMessages / 50) + 1, // Simple level calc
            nextGoal: rewardsData.find(r => r.progress < r.target)?.title || 'Maxed Out'
        });

    } catch (error) {
        console.error('Error fetching rewards:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
