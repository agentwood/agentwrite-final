import { db } from './db';

/**
 * Persona Discovery Pipeline
 * 
 * Ranks templates weekly using telemetry (retention metrics)
 * and suggests new templates by remixing top archetypes.
 */

interface RetentionMetrics {
  personaId: string;
  viewCount: number;
  chatCount: number;
  avgMessagesPerChat: number;
  returnRate: number; // % of users who chat again
  retentionScore: number;
}

/**
 * Calculate retention score for a persona
 * Formula: (chatCount * 0.4) + (avgMessagesPerChat * 0.3) + (returnRate * 100 * 0.3)
 */
export async function calculateRetentionScore(personaId: string): Promise<number> {
  const persona = await db.personaTemplate.findUnique({
    where: { id: personaId },
    include: {
      conversations: {
        include: {
          messages: true,
        },
      },
    },
  });

  if (!persona || persona.conversations.length === 0) {
    return 0;
  }

  const chatCount = persona.chatCount;
  const totalMessages = persona.conversations.reduce(
    (sum, conv) => sum + conv.messages.length,
    0
  );
  const avgMessagesPerChat = totalMessages / chatCount;

  // Calculate return rate (users who have multiple conversations)
  const userIds = persona.conversations
    .map(c => c.userId)
    .filter(id => id !== null);
  const uniqueUsers = new Set(userIds);
  const returnRate = userIds.length > uniqueUsers.size 
    ? (userIds.length - uniqueUsers.size) / userIds.length 
    : 0;

  // Retention score (0-100 scale)
  const retentionScore = Math.min(
    (chatCount * 0.4) + (avgMessagesPerChat * 0.3) + (returnRate * 100 * 0.3),
    100
  );

  return retentionScore;
}

/**
 * Rank all personas and update featured/trending flags
 * Should be run weekly via cron job
 */
export async function rankPersonas() {
  console.log('🔄 Ranking personas...');

  const personas = await db.personaTemplate.findMany({
    include: {
      conversations: {
        include: {
          messages: true,
        },
      },
    },
  });

  const rankings: Array<{ id: string; score: number }> = [];

  for (const persona of personas) {
    const score = await calculateRetentionScore(persona.id);
    rankings.push({ id: persona.id, score });

    // Update retention score
    await db.personaTemplate.update({
      where: { id: persona.id },
      data: {
        retentionScore: score,
        lastRankedAt: new Date(),
      },
    });
  }

  // Sort by score
  rankings.sort((a, b) => b.score - a.score);

  // Top 10% are featured
  const featuredCount = Math.max(1, Math.floor(rankings.length * 0.1));
  const featuredIds = rankings.slice(0, featuredCount).map(r => r.id);

  // Top 20% are trending
  const trendingCount = Math.max(1, Math.floor(rankings.length * 0.2));
  const trendingIds = rankings.slice(0, trendingCount).map(r => r.id);

  // Update featured/trending flags
  await db.personaTemplate.updateMany({
    where: { id: { in: featuredIds } },
    data: { featured: true },
  });

  await db.personaTemplate.updateMany({
    where: { id: { notIn: featuredIds } },
    data: { featured: false },
  });

  await db.personaTemplate.updateMany({
    where: { id: { in: trendingIds } },
    data: { trending: true },
  });

  await db.personaTemplate.updateMany({
    where: { id: { notIn: trendingIds } },
    data: { trending: false },
  });

  console.log(`✅ Ranked ${rankings.length} personas`);
  console.log(`⭐ Featured: ${featuredIds.length}`);
  console.log(`📈 Trending: ${trendingIds.length}`);

  return { rankings, featuredIds, trendingIds };
}

/**
 * Suggest new persona templates by remixing top archetypes
 */
export async function suggestRemixes(): Promise<Array<{
  archetype: string;
  tonePack: string;
  scenarioSkin: string;
  reason: string;
}>> {
  const topPersonas = await db.personaTemplate.findMany({
    where: {
      retentionScore: { gt: 50 },
    },
    orderBy: { retentionScore: 'desc' },
    take: 20,
  });

  // Count archetype/tonePack/scenarioSkin combinations
  const combinations = new Map<string, number>();
  
  for (const persona of topPersonas) {
    const key = `${persona.archetype}|${persona.tonePack}|${persona.scenarioSkin}`;
    combinations.set(key, (combinations.get(key) || 0) + 1);
  }

  // Find missing combinations that might work well
  const allArchetypes = ['hero', 'mentor', 'ally', 'trickster', 'guardian', 'herald', 'shadow', 'threshold_guardian', 'shapeshifter', 'explorer', 'curmudgeon', 'healer'];
  const allTonePacks = ['comedic', 'dramatic', 'supportive', 'mysterious'];
  const allScenarioSkins = ['modern', 'fantasy', 'sci-fi', 'noir', 'historical'];

  const suggestions: Array<{
    archetype: string;
    tonePack: string;
    scenarioSkin: string;
    reason: string;
  }> = [];

  for (const archetype of allArchetypes) {
    for (const tonePack of allTonePacks) {
      for (const scenarioSkin of allScenarioSkins) {
        const key = `${archetype}|${tonePack}|${scenarioSkin}`;
        
        // Check if this combination exists
        const exists = await db.personaTemplate.findFirst({
          where: {
            archetype,
            tonePack,
            scenarioSkin,
          },
        });

        if (!exists) {
          // Check if similar combinations are performing well
          const similarArchetype = topPersonas.some(p => p.archetype === archetype);
          const similarTone = topPersonas.some(p => p.tonePack === tonePack);
          const similarSkin = topPersonas.some(p => p.scenarioSkin === scenarioSkin);

          if (similarArchetype && similarTone && similarSkin) {
            suggestions.push({
              archetype,
              tonePack,
              scenarioSkin,
              reason: `High-performing archetype (${archetype}) with proven tone (${tonePack}) and scenario (${scenarioSkin})`,
            });
          }
        }
      }
    }
  }

  return suggestions.slice(0, 10); // Top 10 suggestions
}

