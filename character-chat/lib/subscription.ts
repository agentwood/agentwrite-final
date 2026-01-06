/**
 * Subscription utility functions
 * Handles subscription checks and feature gating
 */

import { db } from './db';

export type PlanId = 'free' | 'starter' | 'pro';

export interface SubscriptionStatus {
  planId: PlanId;
  isActive: boolean;
  expiresAt?: Date;
  features: {
    unlimitedChat: boolean;
    adFree: boolean;
    unlimitedTTS: boolean;
    unlimitedCalls: boolean;
    advancedVoiceSettings: boolean;
    customCharacters: boolean;
    prioritySupport: boolean;
  };
}

/**
 * Get subscription status for a user
 * Fetches from database and returns appropriate plan features
 */
export async function getSubscriptionStatus(userId?: string | null): Promise<SubscriptionStatus> {
  if (!userId) {
    return getFreePlanFeatures();
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
      },
    });

    if (!user || user.subscriptionStatus !== 'active') {
      return getFreePlanFeatures();
    }

    // Return features based on subscription tier
    switch (user.subscriptionTier) {
      case 'premium':
      case 'pro':
        return getProPlanFeatures();
      case 'starter':
        return getStarterPlanFeatures();
      default:
        return getFreePlanFeatures();
    }
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return getFreePlanFeatures();
  }
}

/**
 * Free plan features
 */
function getFreePlanFeatures(): SubscriptionStatus {
  return {
    planId: 'free',
    isActive: true,
    features: {
      unlimitedChat: false,
      adFree: false,
      unlimitedTTS: false,
      unlimitedCalls: false,
      advancedVoiceSettings: false,
      customCharacters: false,
      prioritySupport: false,
    },
  };
}

/**
 * Starter plan features (Talkie+ Standard)
 */
function getStarterPlanFeatures(): SubscriptionStatus {
  return {
    planId: 'starter',
    isActive: true,
    features: {
      unlimitedChat: true,
      adFree: true,
      unlimitedTTS: true,
      unlimitedCalls: true,
      advancedVoiceSettings: true,
      customCharacters: false,
      prioritySupport: false,
    },
  };
}

/**
 * Pro plan features (Talkie+ Pro)
 */
function getProPlanFeatures(): SubscriptionStatus {
  return {
    planId: 'pro',
    isActive: true,
    features: {
      unlimitedChat: true,
      adFree: true,
      unlimitedTTS: true,
      unlimitedCalls: true,
      advancedVoiceSettings: true,
      customCharacters: true,
      prioritySupport: true,
    },
  };
}

/**
 * Check if a feature is available for the user's plan
 */
export async function hasFeature(
  userId: string | null | undefined,
  feature: keyof SubscriptionStatus['features']
): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status.features[feature];
}

/**
 * Check if user has premium plan (starter or pro)
 */
export async function isPremium(userId?: string | null): Promise<boolean> {
  const status = await getSubscriptionStatus(userId);
  return status.planId !== 'free';
}

/**
 * Get plan limits
 */
export function getPlanLimits(planId: PlanId) {
  const limits = {
    free: {
      messagesPerDay: 20,      // Very limited for free users
      ttsSecondsPerDay: 60,    // 1 minute TTS
      callMinutesPerDay: 0,
    },
    starter: {
      messagesPerDay: 100,     // Limited but usable
      ttsSecondsPerDay: 300,   // 5 minutes TTS  
      callMinutesPerDay: 10,
    },
    pro: {
      messagesPerDay: 500,     // High limit (Plus tier)
      ttsSecondsPerDay: 1800,  // 30 minutes TTS
      callMinutesPerDay: 60,
    },
  };

  return limits[planId];
}




