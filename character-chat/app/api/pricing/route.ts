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
      tagline: 'For the curious observer.',
      features: [
        'Chat with featured characters',
        'Limited daily messages',
        'Standard voice quality',
        'Basic memory (current session)',
      ],
      limits: {
        messagesPerDay: 50,
        ttsSecondsPerDay: 300,
        callMinutesPerDay: 0,
        characters: 0,
      },
      ctaText: 'START EXPLORING',
      redirectUrl: '/', // Redirect to home - user is already on Starter
    },
    {
      id: 'plus',
      name: 'Agentwood+',
      price: 14.99,
      priceId: process.env.STRIPE_PRICE_PLUS_MONTHLY || 'price_plus_monthly',
      interval: 'month',
      annualPrice: 149,
      annualPriceId: process.env.STRIPE_PRICE_PLUS_ANNUAL || 'price_plus_annual',
      tagline: 'Everything you need to get lost.',
      mostPopular: true,
      features: [
        'Everything in Starter, and',
        'Unlimited text chat',
        '1,000 voice replies/month',
        '200 min audio calls',
        'Create unlimited characters',
        'Ad-free experience',
        'Priority queue',
        'Advanced Memory (Long-term)',
      ],
      limits: {
        messagesPerDay: -1,
        ttsSecondsPerDay: 60000,
        callMinutesPerDay: 200,
        characters: -1,
      },
      ctaText: 'GO AGENTWOOD+',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 49.99,
      priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly',
      interval: 'month',
      annualPrice: 499,
      annualPriceId: process.env.STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual',
      tagline: 'The ultimate immersive experience.',
      features: [
        'Everything in Plus, and',
        'Unlimited everything',
        'Unlimited voice & calls',
        'Highest priority queue',
        '4K Image Generation',
        'Advanced Voice Settings',
        'Early access to new models',
        'Dedicated support',
      ],
      limits: {
        messagesPerDay: -1,
        ttsSecondsPerDay: -1,
        callMinutesPerDay: -1,
        characters: -1,
      },
      ctaText: 'GO PRO',
    },
  ];

  return NextResponse.json({ plans });
}
