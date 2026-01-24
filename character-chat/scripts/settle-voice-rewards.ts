/**
 * Voice Reward Settlement Script
 * 
 * Runs every 60 days to settle accumulated rewards.
 * Usage: npx tsx scripts/settle-voice-rewards.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import { calculateAwsReward, fetchAwsMarketPrice, REWARD_CONSTANTS } from '../lib/rewards/voiceRewardEngine';
import { subDays, format, getMonth } from 'date-fns';

const prisma = new PrismaClient();
const isDryRun = process.argv.includes('--dry-run');

async function main() {
    console.log('🎯 Voice Reward Settlement');
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
    console.log('');

    const awsPrice = await fetchAwsMarketPrice();
    console.log(`Current $AWS Price: $${awsPrice}`);
    console.log('');

    const periodEnd = new Date();
    const periodStart = subDays(periodEnd, REWARD_CONSTANTS.SETTLEMENT_CYCLE_DAYS);
    const periodName = `${format(periodStart, 'yyyy')}-P${Math.ceil((getMonth(periodStart) + 1) / 2)}`;

    console.log(`Settlement Period: ${format(periodStart, 'yyyy-MM-dd')} to ${format(periodEnd, 'yyyy-MM-dd')}`);
    console.log(`Period Name: ${periodName}`);
    console.log('');

    // Get all approved voices
    const voices = await prisma.voiceContribution.findMany({
        where: { status: 'approved' },
        include: {
            contributor: { select: { id: true, email: true, username: true } },
        },
    });

    console.log(`Found ${voices.length} approved voices to process`);
    console.log('');

    let totalAwsSettled = 0;
    let totalCashSettled = 0;
    let settledCount = 0;

    for (const voice of voices) {
        // Get usage events for this period
        const usageEvents = await prisma.voiceUsageEvent.findMany({
            where: {
                voiceContributionId: voice.id,
                createdAt: {
                    gte: periodStart,
                    lte: periodEnd,
                },
            },
        });

        const totalSeconds = usageEvents.reduce((sum, e) => sum + e.durationSeconds, 0);
        const totalMinutes = totalSeconds / 60;

        if (totalMinutes < REWARD_CONSTANTS.MINUTES_PER_REWARD_UNIT) {
            console.log(`  ⏭️  ${voice.displayName}: ${totalMinutes.toFixed(2)} min (below threshold)`);
            continue;
        }

        const { awsTokens, cashEquivalentUsd } = calculateAwsReward(totalMinutes, awsPrice);

        console.log(`  💰 ${voice.displayName}:`);
        console.log(`      Minutes: ${totalMinutes.toFixed(2)}`);
        console.log(`      Tokens: ${awsTokens.toFixed(2)} $AWS`);
        console.log(`      Cash: $${cashEquivalentUsd.toFixed(2)}`);

        if (!isDryRun) {
            // Create settlement record
            await prisma.voiceSettlement.create({
                data: {
                    contributorId: voice.contributorId,
                    voiceContributionId: voice.id,
                    settlementPeriod: periodName,
                    periodStart,
                    periodEnd,
                    totalAwsTokens: awsTokens,
                    totalCashUsd: cashEquivalentUsd,
                    payoutType: 'pending_choice',
                    status: 'pending',
                },
            });

            // Update reward ledger
            await prisma.voiceRewardLedger.create({
                data: {
                    voiceContributionId: voice.id,
                    periodStart,
                    periodEnd,
                    totalMinutes,
                    totalEvents: usageEvents.length,
                    awsTokensEarned: awsTokens,
                    cashEquivalentUsd: cashEquivalentUsd,
                    awsPriceUsed: awsPrice,
                    status: 'pending_settlement',
                },
            });

            // Update voice lifetime earnings
            await prisma.voiceContribution.update({
                where: { id: voice.id },
                data: {
                    accruedAwsTokens: { increment: awsTokens },
                    accruedCashUsd: { increment: cashEquivalentUsd },
                },
            });

            console.log(`      ✅ Settlement record created`);
        }

        totalAwsSettled += awsTokens;
        totalCashSettled += cashEquivalentUsd;
        settledCount++;
    }

    console.log('');
    console.log('='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Voices Settled: ${settledCount}`);
    console.log(`Total $AWS: ${totalAwsSettled.toFixed(2)}`);
    console.log(`Total Cash: $${totalCashSettled.toFixed(2)}`);

    if (isDryRun) {
        console.log('');
        console.log('⚠️  DRY RUN - No changes were made');
    }
}

main()
    .catch((e) => {
        console.error('Settlement failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
