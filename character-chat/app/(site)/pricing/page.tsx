'use client';

import { useState, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

interface PlanFeature {
  category: string;
  name: string;
  value: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  annualPrice?: number;
  priceId: string | null;
  annualPriceId?: string | null;
  interval?: string;
  tagline?: string;
  mostPopular?: boolean;
  features: PlanFeature[];
  limits: {
    messagesPerDay: number;
    ttsSecondsPerDay: number;
    callMinutesPerDay: number;
    characters: number;
  };
  ctaText?: string;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    fetch('/api/pricing')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pricing:', err);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (planId: string, priceId: string | null, annualPriceId?: string | null) => {
    if (!priceId) {
      window.location.href = '/signup?plan=free';
      return;
    }
    
    const selectedPriceId = billingInterval === 'annual' && annualPriceId ? annualPriceId : priceId;
    // TODO: Integrate with Stripe
    alert(`Subscribe to ${planId} plan (${billingInterval}) - Stripe integration coming soon`);
  };

  const groupFeaturesByCategory = (features: PlanFeature[]) => {
    const grouped: Record<string, PlanFeature[]> = {};
    features.forEach(feature => {
      if (!grouped[feature.category]) {
        grouped[feature.category] = [];
      }
      grouped[feature.category].push(feature);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white py-20 border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-4 text-zinc-900">Pricing</h1>
            <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-zinc-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Billing Toggle (for Pro plan) */}
                <div className="flex justify-center mb-12">
                  <div className="inline-flex bg-zinc-100 rounded-xl p-1">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        billingInterval === 'monthly'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-600'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingInterval('annual')}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        billingInterval === 'annual'
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-600'
                      }`}
                    >
                      Annual
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {plans.map((plan) => {
                    const groupedFeatures = groupFeaturesByCategory(plan.features);
                    const displayPrice = billingInterval === 'annual' && plan.annualPrice 
                      ? plan.annualPrice 
                      : plan.price;
                    const displayPriceId = billingInterval === 'annual' && plan.annualPriceId 
                      ? plan.annualPriceId 
                      : plan.priceId;
                    const isAnnual = billingInterval === 'annual' && plan.annualPrice;

                    return (
                      <div
                        key={plan.id}
                        className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${
                          plan.mostPopular
                            ? 'border-indigo-500 scale-105 relative'
                            : 'border-zinc-200'
                        }`}
                      >
                        {plan.mostPopular && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-zinc-900 text-sm font-semibold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Most Popular
                          </div>
                        )}
                        
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-zinc-900 mb-1">{plan.name}</h3>
                          {plan.tagline && (
                            <p className="text-sm text-zinc-600 mb-4">{plan.tagline}</p>
                          )}
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-bold text-zinc-900">
                              {displayPrice === 0 ? 'Free' : `$${displayPrice}`}
                            </span>
                            {displayPrice > 0 && (
                              <>
                                <span className="text-zinc-600">
                                  {plan.interval === 'one-time' ? ' / one-time' : ` / ${billingInterval === 'annual' ? 'year' : 'month'}`}
                                </span>
                                {isAnnual && plan.price && (
                                  <span className="text-sm text-zinc-500 ml-2 line-through">
                                    ${plan.price}/mo
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          {displayPrice === 0 && (
                            <p className="text-sm text-zinc-600">Forever</p>
                          )}
                          {isAnnual && plan.annualPrice && plan.price && (
                            <p className="text-sm text-indigo-600 font-semibold mt-1">
                              Save ${(plan.price * 12 - plan.annualPrice).toFixed(2)}/year
                            </p>
                          )}
                        </div>

                        <div className="space-y-6 mb-8">
                          {Object.entries(groupedFeatures).map(([category, features]) => (
                            <div key={category}>
                              <h4 className="text-sm font-bold text-zinc-900 mb-3 uppercase tracking-wider">
                                {category}
                              </h4>
                              <ul className="space-y-2">
                                {features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1">
                                      <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                                      <span className="text-sm text-zinc-700 flex-1">
                                        {feature.name}
                                      </span>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-900 ml-2">
                                      {feature.value}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleSubscribe(plan.id, displayPriceId, plan.annualPriceId)}
                          className={`w-full py-3 rounded-xl font-semibold transition-all ${
                            plan.mostPopular
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700'
                              : plan.price === 0
                              ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                              : 'bg-zinc-900 text-white hover:bg-zinc-800'
                          }`}
                        >
                          {plan.ctaText || (plan.price === 0 ? 'Start Free' : 'Subscribe')}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footnote */}
                <div className="mt-12 text-center">
                  <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
                    "Unlimited" = fair use + anti-abuse rate limits. Voice minutes reset monthly; tap-to-play voice keeps costs sane.
                  </p>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
