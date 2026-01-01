import { NextResponse } from 'next/server';

/**
 * Simplified pricing structure for Agentwood
 * Character.AI / Talefy style - clean and simple
 */
export async function GET() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: null,
      tagline: 'Start chatting instantly',
      features: [
        'Chat with 50+ featured characters',
        'Limited text messages daily',
        'Voice replies (tap-to-play)',
        '10 min audio calls/week',
        'Create 2 characters',
        'Basic chat history',
      ],
      limits: {
        messagesPerDay: 50,
        ttsSecondsPerDay: 300,
        callMinutesPerDay: 10,
        characters: 2,
      },
      ctaText: 'Start Free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 7.99,
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
      interval: 'month',
      annualPrice: 79,
      annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
      tagline: 'Unlimited everything',
      mostPopular: true,
      features: [
        'Unlimited text chat',
        '1,000 voice replies/month',
        '200 min audio calls/month',
        'Create 50 characters',
        'Priority queue',
        'Longer memory',
        'Character builder tools',
        'Creator analytics',
      ],
      limits: {
        messagesPerDay: -1,
        ttsSecondsPerDay: -1,
        callMinutesPerDay: 200,
        characters: 50,
      },
      ctaText: 'Go Pro',
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: 79,
      priceId: process.env.STRIPE_PRICE_LIFETIME || 'price_lifetime',
      interval: 'one-time',
      tagline: 'Pay once, own forever',
      features: [
        'Everything in Pro',
        '3,000 voice replies/month',
        '600 min audio calls/month',
        'Create 250 characters',
        'Highest priority queue',
        'Early access features',
        'Founder perks',
      ],
      limits: {
        messagesPerDay: -1,
        ttsSecondsPerDay: -1,
        callMinutesPerDay: 600,
        characters: 250,
      },
      ctaText: 'Get Lifetime',
    },
  ];

  return NextResponse.json({ plans });
}
