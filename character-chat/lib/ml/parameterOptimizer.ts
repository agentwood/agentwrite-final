import { db } from '@/lib/db';

interface OptimalParameters {
  speed: number;
  pitch: number;
  styleHint: string | null;
  confidence: number;
}

/**
 * Get optimized voice parameters for a character
 */
export async function getOptimalParameters(
  personaId: string,
  voiceName: string
): Promise<OptimalParameters> {
  try {
    const params = await db.voiceParameters.findUnique({
      where: {
        personaId_voiceName: {
          personaId,
          voiceName,
        },
      },
    });

    if (params && params.confidence > 0.5) {
      return {
        speed: params.speed,
        pitch: params.pitch,
        styleHint: params.styleHint || null,
        confidence: params.confidence,
      };
    }

    // Default parameters - Faster, more natural defaults
    return {
      speed: 1.25, // 25% faster for more responsive, natural feel
      pitch: 1.0,
      styleHint: null,
      confidence: 0.0,
    };
  } catch (error) {
    console.error('Error getting optimal parameters:', error);
    return {
      speed: 1.0,
      pitch: 1.0,
      styleHint: null,
      confidence: 0.0,
    };
  }
}

/**
 * Update parameters based on feedback
 */
export async function optimizeParameters(
  personaId: string,
  voiceName: string,
  feedback: {
    speedRating?: number;
    pitchRating?: number;
    naturalnessRating?: number;
  },
  currentParams: {
    speed: number;
    pitch: number;
  }
) {
  try {
    const existing = await db.voiceParameters.findUnique({
      where: {
        personaId_voiceName: {
          personaId,
          voiceName,
        },
      },
    });

    // Calculate new optimal parameters using gradient descent-like approach
    let newSpeed = currentParams.speed;
    let newPitch = currentParams.pitch;
    let confidence = existing?.confidence || 0.0;

    if (feedback.speedRating) {
      // If rating < 3, adjust speed (too fast/slow)
      const adjustment = (feedback.speedRating - 3) * 0.05;
      newSpeed = Math.max(0.5, Math.min(2.0, currentParams.speed + adjustment));
    }

    if (feedback.pitchRating) {
      const adjustment = (feedback.pitchRating - 3) * 0.05;
      newPitch = Math.max(0.5, Math.min(2.0, currentParams.pitch + adjustment));
    }

    // Increase confidence with more data
    confidence = Math.min(1.0, confidence + 0.1);

    // Calculate performance score
    const performanceScore = 
      (feedback.speedRating || 3) * 0.3 +
      (feedback.pitchRating || 3) * 0.3 +
      (feedback.naturalnessRating || 3) * 0.4;

    await db.voiceParameters.upsert({
      where: {
        personaId_voiceName: {
          personaId,
          voiceName,
        },
      },
      update: {
        speed: newSpeed,
        pitch: newPitch,
        confidence,
        performanceScore,
        usageCount: { increment: 1 },
        lastOptimized: new Date(),
      },
      create: {
        personaId,
        voiceName,
        speed: newSpeed,
        pitch: newPitch,
        confidence,
        performanceScore,
        usageCount: 1,
      },
    });
  } catch (error) {
    console.error('Error optimizing parameters:', error);
  }
}

/**
 * A/B test different parameter combinations
 */
export async function testParameterCombination(
  personaId: string,
  voiceName: string,
  testParams: {
    speed: number;
    pitch: number;
  },
  result: {
    rating: number;
    engagement: number;
  }
) {
  try {
    // Store test results
    const existing = await db.voiceParameters.findUnique({
      where: {
        personaId_voiceName: {
          personaId,
          voiceName,
        },
      },
    });

    if (!existing || result.rating > existing.performanceScore) {
      // New parameters are better, adopt them
      await db.voiceParameters.upsert({
        where: {
          personaId_voiceName: {
            personaId,
            voiceName,
          },
        },
        update: {
          speed: testParams.speed,
          pitch: testParams.pitch,
          performanceScore: result.rating,
          confidence: Math.min(1.0, (existing?.confidence || 0) + 0.15),
          lastOptimized: new Date(),
        },
        create: {
          personaId,
          voiceName,
          speed: testParams.speed,
          pitch: testParams.pitch,
          performanceScore: result.rating,
          confidence: 0.5,
          usageCount: 1,
        },
      });
    }
  } catch (error) {
    console.error('Error testing parameters:', error);
  }
}

