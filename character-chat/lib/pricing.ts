/**
 * Pricing configuration matching Talkie AI
 * Based on typical AI character chat platform pricing
 */

export const PRICING_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Limited character chats per day',
      'Basic voice features',
      'Standard response quality',
    ],
    limits: {
      textRepliesPerDay: 50,
      ttsSecondsPerDay: 300, // 5 minutes
      callMinutesPerDay: 0,
    },
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited character chats',
      'Priority voice generation',
      'Advanced character customization',
      'Faster response times',
      'Exclusive character access',
      'Priority support',
    ],
    limits: {
      textRepliesPerDay: -1, // Unlimited
      ttsSecondsPerDay: -1, // Unlimited
      callMinutesPerDay: 60, // 1 hour per day
    },
  },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;

export function getPlanById(id: string) {
  return PRICING_PLANS[id as PlanId] || PRICING_PLANS.FREE;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

