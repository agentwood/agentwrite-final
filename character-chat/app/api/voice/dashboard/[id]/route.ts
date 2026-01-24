import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { calculateAwsReward, fetchAwsMarketPrice, getDaysUntilNextSettlement } from '@/lib/rewards/voiceRewardEngine';

/**
 * GET /api/voice/dashboard/[id]
 * 
 * Fetch complete dashboard data for a voice contribution.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = getUserIdFromRequest(request);

        // 1. Fetch voice contribution with relations
        const contribution = await db.voiceContribution.findUnique({
            where: { id },
            include: {
                characterLinks: {
                    orderBy: { totalMinutes: 'desc' },
                    take: 20,
                },
                settlements: {
                    orderBy: { periodStart: 'desc' },
                    take: 10,
                },
            },
        });

        if (!contribution) {
            return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
        }

        // 2. Authorization check
        if (contribution.contributorId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 3. Calculate current rewards
        const awsPrice = await fetchAwsMarketPrice();
        const { awsTokens, cashEquivalentUsd } = calculateAwsReward(
            contribution.totalMinutesUsed,
            awsPrice
        );

        // 4. Get usage growth (24h, 7d)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [usage24h, usage7d] = await Promise.all([
            db.voiceUsageEvent.aggregate({
                where: {
                    voiceContributionId: id,
                    createdAt: { gte: oneDayAgo },
                },
                _sum: { durationSeconds: true },
                _count: true,
            }),
            db.voiceUsageEvent.aggregate({
                where: {
                    voiceContributionId: id,
                    createdAt: { gte: sevenDaysAgo },
                },
                _sum: { durationSeconds: true },
                _count: true,
            }),
        ]);

        // 5. Get character details for links
        const characterIds = contribution.characterLinks.map(link => link.characterId);
        const characters = characterIds.length > 0
            ? await db.personaTemplate.findMany({
                where: { id: { in: characterIds } },
                select: { id: true, name: true, avatarUrl: true },
            })
            : [];

        const characterMap = new Map(characters.map(c => [c.id, c]));

        // 6. Get last settlement for days calculation
        const lastSettlement = contribution.settlements[0];
        const daysUntilNextPayout = getDaysUntilNextSettlement(lastSettlement?.periodEnd);

        // 7. Build response
        return NextResponse.json({
            voice: {
                id: contribution.id,
                displayName: contribution.displayName,
                description: contribution.description,
                status: contribution.status,
                qualityScore: contribution.qualityScore,
                gender: contribution.gender,
                age: contribution.age,
                accent: contribution.accent,
                licensingType: contribution.licensingType,
                allowEnterpriseResale: contribution.allowEnterpriseResale,
                isPaused: contribution.isPaused,
                createdAt: contribution.createdAt,
                approvedAt: contribution.approvedAt,
            },
            usage: {
                totalMinutes: Number(contribution.totalMinutesUsed.toFixed(2)),
                uniqueUsers: contribution.uniqueUsersServed,
                activeCharacters: contribution.activeCharacterCount,
                growth: {
                    last24h: {
                        minutes: (usage24h._sum.durationSeconds || 0) / 60,
                        events: usage24h._count,
                    },
                    last7d: {
                        minutes: (usage7d._sum.durationSeconds || 0) / 60,
                        events: usage7d._count,
                    },
                },
            },
            earnings: {
                accruedAwsTokens: Number(awsTokens.toFixed(2)),
                accruedCashUsd: Number(cashEquivalentUsd.toFixed(2)),
                lifetimeEarningsUsd: Number(contribution.lifetimeEarningsUsd.toFixed(2)),
                daysUntilNextPayout,
                awsPrice,
            },
            characters: contribution.characterLinks.map(link => ({
                characterId: link.characterId,
                name: characterMap.get(link.characterId)?.name || 'Unknown',
                avatarUrl: characterMap.get(link.characterId)?.avatarUrl || null,
                totalMinutes: Number(link.totalMinutes.toFixed(2)),
                totalRevenue: Number(link.totalRevenue.toFixed(2)),
                usageCount: link.usageCount,
                lastUsedAt: link.lastUsedAt,
            })),
            settlements: contribution.settlements.map(s => ({
                id: s.id,
                period: s.settlementPeriod,
                totalAwsTokens: s.totalAwsTokens,
                totalCashUsd: s.totalCashUsd,
                payoutType: s.payoutType,
                status: s.status,
                completedAt: s.completedAt,
            })),
        });

    } catch (error: any) {
        console.error('[VoiceDashboard] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard', details: error.message }, { status: 500 });
    }
}
