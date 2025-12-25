import { NextResponse } from 'next/server';

/**
 * New pricing structure for Agentwood
 */
export async function GET() {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      priceId: null,
      tagline: 'Start free — no card.',
      features: [
        { category: 'Characters (core)', name: '50 Featured Characters', value: 'Included' },
        { category: 'Characters (core)', name: 'Text chat', value: 'Limited daily quota' },
        { category: 'Characters (core)', name: 'Create characters', value: '2 characters (1 public + 1 private)' },
        { category: 'Characters (core)', name: 'Save chats + basic history', value: 'Included' },
        { category: 'Characters (core)', name: 'Queue + discovery', value: 'Standard queue + community discovery' },
        { category: 'Voice', name: 'Voice replies', value: 'Limited/day, tap-to-play' },
        { category: 'Voice', name: 'Audio calls', value: '10 minutes/week' },
        { category: 'AgentWrite bonus', name: 'Projects', value: '1 project' },
        { category: 'AgentWrite bonus', name: 'Brainstorming + export', value: 'Basic brainstorming + PDF export (basic)' },
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
      priceId: 'price_pro_monthly',
      interval: 'month',
      annualPrice: 79,
      annualPriceId: 'price_pro_annual',
      tagline: 'Most Popular',
      mostPopular: true,
      features: [
        { category: 'Characters (core)', name: 'Unlimited text chat', value: 'Fair use' },
        { category: 'Characters (core)', name: 'Create characters', value: '50 characters' },
        { category: 'Characters (core)', name: 'Better memory', value: 'Longer context' },
        { category: 'Characters (core)', name: 'Character builder', value: 'Persona + examples + style sliders' },
        { category: 'Characters (core)', name: 'Private/public characters', value: 'Share links' },
        { category: 'Characters (core)', name: 'Creator analytics', value: 'Plays, likes, retention' },
        { category: 'Voice', name: 'Voice replies', value: '1,000/month' },
        { category: 'Voice', name: 'Audio calls', value: '200 minutes/month' },
        { category: 'Voice', name: 'Queue priority', value: 'Priority queue' },
        { category: 'AgentWrite bonus', name: 'Projects', value: 'Unlimited projects' },
        { category: 'AgentWrite bonus', name: 'PDF export', value: 'Included' },
        { category: 'AgentWrite bonus', name: 'Scene + dialogue tools', value: 'Powered by your characters' },
      ],
      limits: {
        messagesPerDay: -1, // Unlimited (fair use)
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
      priceId: 'price_lifetime',
      interval: 'one-time',
      tagline: 'Same price as Pro annual, way more value',
      features: [
        { category: 'Everything in Pro', name: 'All Pro features', value: 'Included' },
        { category: 'Characters (core upgrades)', name: 'Create characters', value: '250 characters' },
        { category: 'Characters (core upgrades)', name: 'Queue priority', value: 'Highest priority queue' },
        { category: 'Characters (core upgrades)', name: 'Early access', value: 'New character features' },
        { category: 'Characters (core upgrades)', name: 'Featured boost', value: 'Discovery placement credits' },
        { category: 'Voice upgrades', name: 'Voice replies', value: '3,000/month' },
        { category: 'Voice upgrades', name: 'Audio calls', value: '600 minutes/month' },
        { category: 'Voice upgrades', name: 'Voice quality', value: 'Best available when enabled' },
        { category: 'Creator advantage', name: 'Marketplace access', value: 'Early access' },
        { category: 'Creator advantage', name: 'Platform fee', value: 'Lower fee (Founder perk)' },
        { category: 'AgentWrite bonus', name: 'Audiobook exports', value: 'Higher limits' },
        { category: 'AgentWrite bonus', name: 'Collaboration tools', value: 'When released' },
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

  return NextResponse.json({ 
    plans,
    footnote: '"Unlimited" = fair use + anti-abuse rate limits. Voice minutes reset monthly; tap-to-play voice keeps costs sane.'
  });
}
