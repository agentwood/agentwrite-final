/**
 * Character Evolution System
 * 
 * This system enables characters to evolve and improve over time based on:
 * - User feedback
 * - Conversation patterns
 * - Response quality metrics
 * - Interaction frequency
 */

import { db } from '@/lib/db';
import { getLearnedPatterns, getCharacterMemory } from './contextSystem';

export interface EvolutionMetrics {
  totalInteractions: number;
  averageRating: number;
  responseQuality: number;
  userSatisfaction: number;
  engagementScore: number;
}

/**
 * Calculate evolution metrics for a character
 */
export async function calculateEvolutionMetrics(
  personaId: string
): Promise<EvolutionMetrics> {
  const evolution = await db.characterEvolution.findFirst({
    where: { personaId },
    orderBy: { version: 'desc' },
  });

  const patterns = await getLearnedPatterns(personaId);
  const memories = await db.characterMemory.findMany({
    where: { personaId },
  });

  const totalInteractions = evolution?.totalInteractions || 0;
  const averageRating = evolution?.averageRating || 0;
  const responseQuality = evolution?.responseQuality || 0.5;

  // Calculate user satisfaction (based on ratings and feedback)
  const feedback = await db.messageFeedback.findMany({
    where: {
      message: {
        conversation: {
          personaId,
        },
      },
    },
  });

  const positiveFeedback = feedback.filter(f => f.thumbsUp || (f.rating && f.rating >= 4)).length;
  const totalFeedback = feedback.length || 1;
  const userSatisfaction = positiveFeedback / totalFeedback;

  // Calculate engagement score (based on interaction frequency and memory depth)
  const uniqueUsers = new Set(memories.map(m => m.userId).filter(Boolean)).size;
  const avgConfidence = memories.reduce((sum, m) => sum + m.confidenceScore, 0) / (memories.length || 1);
  const engagementScore = Math.min(1.0, (uniqueUsers / 10) * 0.5 + avgConfidence * 0.5);

  return {
    totalInteractions,
    averageRating,
    responseQuality,
    userSatisfaction,
    engagementScore,
  };
}

/**
 * Evolve character based on metrics and patterns
 */
export async function evolveCharacter(personaId: string): Promise<void> {
  const metrics = await calculateEvolutionMetrics(personaId);
  const patterns = await getLearnedPatterns(personaId, 0.6);
  const currentEvolution = await db.characterEvolution.findFirst({
    where: { personaId },
    orderBy: { version: 'desc' },
  });

  const improvements: string[] = [];

  // Analyze patterns and suggest improvements
  const stylePatterns = patterns.filter(p => p.type === 'style');
  const preferencePatterns = patterns.filter(p => p.type === 'preference');

  if (stylePatterns.length > 0) {
    improvements.push(`Adapted to user communication styles: ${stylePatterns.map(p => p.key).join(', ')}`);
  }

  if (preferencePatterns.length > 0) {
    improvements.push(`Learned user preferences: ${preferencePatterns.length} preferences identified`);
  }

  if (metrics.userSatisfaction > 0.7) {
    improvements.push('High user satisfaction - maintaining quality responses');
  } else if (metrics.userSatisfaction < 0.5) {
    improvements.push('Improving response quality based on feedback');
  }

  if (metrics.engagementScore > 0.7) {
    improvements.push('High engagement - users are actively interacting');
  }

  // Create new evolution version
  const newVersion = (currentEvolution?.version || 0) + 1;

  await db.characterEvolution.create({
    data: {
      personaId,
      version: newVersion,
      improvements: JSON.stringify(improvements),
      performanceMetrics: JSON.stringify(metrics),
      totalInteractions: metrics.totalInteractions,
      averageRating: metrics.averageRating,
      responseQuality: metrics.responseQuality,
      lastEvolved: new Date(),
    },
  });

  // Update persona template with evolution data
  await db.personaTemplate.update({
    where: { id: personaId },
    data: {
      retentionScore: metrics.engagementScore,
      updatedAt: new Date(),
    },
  });
}

/**
 * Schedule periodic evolution (call this via cron job)
 */
export async function scheduleEvolution(): Promise<void> {
  const personas = await db.personaTemplate.findMany({
    where: {
      chatCount: { gt: 10 }, // Only evolve characters with significant interactions
    },
  });

  for (const persona of personas) {
    try {
      await evolveCharacter(persona.id);
      console.log(`✅ Evolved character: ${persona.name}`);
    } catch (error) {
      console.error(`❌ Error evolving character ${persona.name}:`, error);
    }
  }
}

/**
 * Get evolution history for a character
 */
export async function getEvolutionHistory(personaId: string) {
  return await db.characterEvolution.findMany({
    where: { personaId },
    orderBy: { version: 'desc' },
  });
}




