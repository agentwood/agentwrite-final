import { db } from '@/lib/db';
import { getRealisticVoice, REALISTIC_VOICES } from '@/lib/audio/voiceConfig';

interface VoicePerformanceMetrics {
  voiceName: string;
  averageRating: number;
  engagementScore: number;
  usageCount: number;
  confidence: number;
}

/**
 * Track voice performance after each TTS generation
 */
export async function trackVoicePerformance(
  personaId: string,
  voiceName: string,
  userId: string | null,
  metrics: {
    conversationLength?: number;
    userReturned?: boolean;
    messageCount?: number;
  }
) {
  try {
    const engagementScore = calculateEngagementScore(metrics);
    
    const existing = await db.voicePerformance.findUnique({
      where: {
        personaId_voiceName_userId: {
          personaId,
          voiceName,
          userId: userId || 'anonymous',
        },
      },
    });

    if (existing) {
      // Weighted average: 70% old, 30% new
      const newEngagementScore = existing.engagementScore * 0.7 + engagementScore * 0.3;
      
      await db.voicePerformance.update({
        where: { id: existing.id },
        data: {
          usageCount: { increment: 1 },
          engagementScore: newEngagementScore,
          lastUsed: new Date(),
        },
      });
    } else {
      await db.voicePerformance.create({
        data: {
          personaId,
          voiceName,
          userId: userId || 'anonymous',
          rating: 3.0, // Default neutral
          engagementScore,
          usageCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error tracking voice performance:', error);
  }
}

/**
 * Get optimal voice for a character using ML predictions
 */
export async function getOptimalVoice(
  personaId: string,
  archetype: string,
  userId?: string | null
): Promise<string> {
  try {
    // Get historical performance data
    const performances = await db.voicePerformance.findMany({
      where: {
        personaId,
        ...(userId && { userId }),
      },
      orderBy: [
        { engagementScore: 'desc' },
        { rating: 'desc' },
        { usageCount: 'desc' },
      ],
      take: 10,
    });

    if (performances.length > 0) {
      // Calculate weighted score
      const scoredVoices = performances.map(p => ({
        voiceName: p.voiceName,
        score: p.rating * 0.4 + p.engagementScore * 0.6,
        confidence: Math.min(p.usageCount / 10, 1.0), // More usage = more confidence
      }));

      // Get best voice with confidence threshold
      const bestVoice = scoredVoices
        .filter(v => v.confidence > 0.3) // At least 3 uses
        .sort((a, b) => b.score - a.score)[0];

      if (bestVoice && bestVoice.score > 3.5) {
        return bestVoice.voiceName;
      }
    }

    // Fallback to archetype-based selection
    return getRealisticVoice('', archetype);
  } catch (error) {
    console.error('Error getting optimal voice:', error);
    return getRealisticVoice('', archetype);
  }
}

/**
 * Calculate engagement score based on user behavior
 */
function calculateEngagementScore(metrics: {
  conversationLength?: number;
  userReturned?: boolean;
  messageCount?: number;
}): number {
  let score = 0.5; // Base score

  // Conversation length factor (longer = better)
  if (metrics.conversationLength) {
    score += Math.min(metrics.conversationLength / 1000, 0.3);
  }

  // Message count factor
  if (metrics.messageCount) {
    score += Math.min(metrics.messageCount / 20, 0.2);
  }

  // Return rate factor
  if (metrics.userReturned) {
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

/**
 * Update voice rating from user feedback
 */
export async function updateVoiceRating(
  personaId: string,
  voiceName: string,
  rating: number,
  userId?: string | null
) {
  try {
    const existing = await db.voicePerformance.findUnique({
      where: {
        personaId_voiceName_userId: {
          personaId,
          voiceName,
          userId: userId || 'anonymous',
        },
      },
    });

    if (existing) {
      // Weighted average: 80% old, 20% new
      const newRating = existing.rating * 0.8 + rating * 0.2;
      
      await db.voicePerformance.update({
        where: { id: existing.id },
        data: {
          rating: newRating,
          updatedAt: new Date(),
        },
      });
    } else {
      await db.voicePerformance.create({
        data: {
          personaId,
          voiceName,
          userId: userId || 'anonymous',
          rating,
          engagementScore: 0.5,
          usageCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error updating voice rating:', error);
  }
}




