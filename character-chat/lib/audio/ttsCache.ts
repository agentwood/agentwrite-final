import crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * Generate a unique hash for TTS cache lookup
 */
export function generateTTSCacheHash(
    text: string,
    voiceId: string,
    engine: string,
    params?: Record<string, any>
): string {
    const input = JSON.stringify({
        text: text.trim().toLowerCase(), // Normalize
        voiceId,
        engine,
        params: params || {},
    });

    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Get cached TTS audio if available
 */
export async function getCachedTTS(hash: string) {
    const cached = await db.tTSCache.findUnique({
        where: { textHash: hash },
    });

    if (cached) {
        // Update stats
        await db.tTSCache.update({
            where: { id: cached.id },
            data: {
                hitCount: { increment: 1 },
                lastUsed: new Date(),
            },
        });

        console.log(`[TTS Cache] HIT - Hash: ${hash.slice(0, 8)}... (${cached.hitCount + 1} uses)`);
    }

    return cached;
}

/**
 * Save TTS audio to cache
 */
export async function cacheTTS(
    hash: string,
    text: string,
    voiceId: string,
    engine: string,
    audioBase64: string,
    format: string,
    contentType: string,
    sampleRate: number
) {
    try {
        await db.tTSCache.create({
            data: {
                textHash: hash,
                text: text.substring(0, 500), // Store truncated for debugging
                voiceId,
                engine,
                audioBase64,
                format,
                contentType,
                sampleRate,
            },
        });

        console.log(`[TTS Cache] STORED - Hash: ${hash.slice(0, 8)}...`);
    } catch (error: any) {
        // Ignore duplicate errors (race condition)
        if (!error.message?.includes('UNIQUE constraint')) {
            console.error('[TTS Cache] Error storing:', error.message);
        }
    }
}

/**
 * Get cache statistics
 */
export async function getTTSCacheStats() {
    const totalEntries = await db.tTSCache.count();
    const totalHits = await db.tTSCache.aggregate({
        _sum: { hitCount: true },
    });

    return {
        totalEntries,
        totalHits: totalHits._sum.hitCount || 0,
        savingsEstimate: `$${((totalHits._sum.hitCount || 0) * 0.06).toFixed(2)}`,
    };
}
