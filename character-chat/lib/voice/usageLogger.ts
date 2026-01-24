/**
 * Voice Usage Logger
 * 
 * Logs usage events for voice contributions when TTS is generated.
 */

import { db } from '@/lib/db';
import { createHash } from 'crypto';
import { calculateEventReward, fetchAwsMarketPrice } from '@/lib/rewards/voiceRewardEngine';

interface UsageEventParams {
    voiceContributionId: string;
    characterId: string;
    userId: string | null;
    sessionId?: string;
    durationSeconds: number;
    textLength: number;
}

/**
 * Log a voice usage event and update aggregates.
 * This is called after each successful TTS generation using a contributed voice.
 */
export async function logVoiceUsageEvent(params: UsageEventParams): Promise<void> {
    const {
        voiceContributionId,
        characterId,
        userId,
        sessionId,
        durationSeconds,
        textLength,
    } = params;

    // Generate idempotency hash
    const eventHash = createHash('sha256')
        .update(`${voiceContributionId}:${characterId}:${userId || sessionId}:${Date.now()}`)
        .digest('hex');

    try {
        // Get current AWS price for reward calculation
        const awsPrice = await fetchAwsMarketPrice();
        const { awsTokens } = calculateEventReward(durationSeconds, awsPrice);

        // Create usage event (idempotent - upsert by hash)
        await db.voiceUsageEvent.upsert({
            where: { eventHash },
            create: {
                voiceContributionId,
                characterId,
                userId,
                sessionId: sessionId || null,
                durationSeconds,
                textLength,
                eventHash,
                awsTokensEarned: awsTokens,
                awsPriceAtEvent: awsPrice,
            },
            update: {}, // No update on collision
        });

        // Update voice contribution aggregates
        const minutesUsed = durationSeconds / 60;
        await db.voiceContribution.update({
            where: { id: voiceContributionId },
            data: {
                totalMinutesUsed: { increment: minutesUsed },
            },
        });

        // Update or create character link
        await db.voiceCharacterLink.upsert({
            where: {
                voiceContributionId_characterId: {
                    voiceContributionId,
                    characterId,
                },
            },
            create: {
                voiceContributionId,
                characterId,
                totalMinutes: minutesUsed,
                totalRevenue: awsTokens * awsPrice,
                usageCount: 1,
                lastUsedAt: new Date(),
            },
            update: {
                totalMinutes: { increment: minutesUsed },
                totalRevenue: { increment: awsTokens * awsPrice },
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });

        console.log(`[VoiceUsage] Logged: voice=${voiceContributionId}, char=${characterId}, ${durationSeconds}s, ${awsTokens.toFixed(6)} $AWS`);

    } catch (error: any) {
        // Log but don't fail TTS on usage logging errors
        console.error('[VoiceUsage] Failed to log usage:', error.message);
    }
}

/**
 * Check if a character is using a contributed voice.
 * Returns the voiceContributionId if found.
 */
export async function getContributedVoiceForCharacter(characterId: string): Promise<string | null> {
    // First check if character has a linked VoiceContribution
    const link = await db.voiceCharacterLink.findFirst({
        where: { characterId },
        select: { voiceContributionId: true },
    });

    if (link) {
        return link.voiceContributionId;
    }

    // TODO: Implement voice matching logic
    // For now, return null (no contributed voice)
    return null;
}
