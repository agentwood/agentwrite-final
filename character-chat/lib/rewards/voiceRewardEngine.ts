/**
 * Voice Reward Engine
 * 
 * Deterministic reward calculation for voice contributions.
 * Rule: Every 10 minutes of usage = $0.01 worth of $AWS
 */

const MINUTES_PER_REWARD_UNIT = 10;
const USD_PER_REWARD_UNIT = 0.01;
const MAX_SUPPLY_ALLOCATION = 0.05; // 5% of total $AWS supply

export interface RewardCalculation {
    awsTokens: number;
    cashEquivalentUsd: number;
    rewardUnits: number;
}

/**
 * Calculate $AWS tokens earned based on usage minutes and market price.
 * 
 * @param totalMinutesUsed - Total minutes of voice usage
 * @param awsMarketPriceUsd - Current $AWS token price in USD
 * @returns Calculated reward in tokens and USD equivalent
 * 
 * @example
 * // 100 minutes at $0.10 per token
 * calculateAwsReward(100, 0.10) 
 * // => { awsTokens: 1, cashEquivalentUsd: 0.10, rewardUnits: 10 }
 */
export function calculateAwsReward(
    totalMinutesUsed: number,
    awsMarketPriceUsd: number
): RewardCalculation {
    if (totalMinutesUsed <= 0 || awsMarketPriceUsd <= 0) {
        return { awsTokens: 0, cashEquivalentUsd: 0, rewardUnits: 0 };
    }

    const rewardUnits = Math.floor(totalMinutesUsed / MINUTES_PER_REWARD_UNIT);
    const cashEquivalentUsd = rewardUnits * USD_PER_REWARD_UNIT;
    const awsTokens = cashEquivalentUsd / awsMarketPriceUsd;

    return {
        awsTokens: Number(awsTokens.toFixed(6)),
        cashEquivalentUsd: Number(cashEquivalentUsd.toFixed(2)),
        rewardUnits,
    };
}

/**
 * Calculate incremental reward for a single usage event.
 * 
 * @param durationSeconds - Duration of the TTS event in seconds
 * @param awsMarketPriceUsd - Current $AWS token price
 */
export function calculateEventReward(
    durationSeconds: number,
    awsMarketPriceUsd: number
): { awsTokens: number; cashEquivalentUsd: number } {
    const minutes = durationSeconds / 60;
    // Proportional reward (not floored, for accumulation)
    const cashEquivalent = (minutes / MINUTES_PER_REWARD_UNIT) * USD_PER_REWARD_UNIT;
    const awsTokens = awsMarketPriceUsd > 0 ? cashEquivalent / awsMarketPriceUsd : 0;

    return {
        awsTokens: Number(awsTokens.toFixed(8)),
        cashEquivalentUsd: Number(cashEquivalent.toFixed(6)),
    };
}

/**
 * Get current $AWS market price.
 * In production, this would fetch from an oracle or exchange.
 * For now, returns a mock price.
 */
export async function fetchAwsMarketPrice(): Promise<number> {
    // TODO: Replace with actual oracle/API call
    // Mock: $0.05 per $AWS token
    return 0.05;
}

/**
 * Calculate days until next settlement.
 * Settlements occur every 60 days.
 */
export function getDaysUntilNextSettlement(lastSettlementDate?: Date): number {
    const SETTLEMENT_CYCLE_DAYS = 60;
    const now = new Date();

    if (!lastSettlementDate) {
        // Default to 60 days from now if no previous settlement
        return SETTLEMENT_CYCLE_DAYS;
    }

    const nextSettlement = new Date(lastSettlementDate);
    nextSettlement.setDate(nextSettlement.getDate() + SETTLEMENT_CYCLE_DAYS);

    const diffMs = nextSettlement.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

export const REWARD_CONSTANTS = {
    MINUTES_PER_REWARD_UNIT,
    USD_PER_REWARD_UNIT,
    MAX_SUPPLY_ALLOCATION,
    SETTLEMENT_CYCLE_DAYS: 60,
};
