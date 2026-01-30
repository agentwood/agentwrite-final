"use client";

import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Star } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onAuthRequired?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user, onAuthRequired }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [realPlans, setRealPlans] = useState<any[]>([]);

  // Fetch real plans on mount to get price IDs
  React.useEffect(() => {
    if (isOpen) {
      fetch('/api/pricing').then(r => r.json()).then(d => setRealPlans(d.plans || [])).catch(() => { });
    }
  }, [isOpen]);

  const handleSubscribe = async (plan: any) => {
    // 1. Auth Check
    if (!user) {
      if (onAuthRequired) onAuthRequired();
      onClose(); // Close subscription modal so auth modal can show
      return;
    }

    // 2. Free Plan Logic
    if (plan.price === "0") {
      onClose();
      return;
    }

    // 3. Checkout Logic
    setProcessingPlan(plan.name);
    try {
      // Map plan names to price IDs (hardcoded for now or derived)
      // Ideally this should come from API, but for now we follow pricing page logic style
      // or we just call the checkout API with priceId if we had it. 
      // Since we don't have priceIds in this file's static list, we'll need to fetch plans or hardcode.
      // For expedience, I will use the pricing API to get the real price ID or just pass plan name if API supports it.
      // BUT referencing pricing/page.tsx, it uses specific IDs.
      // Let's Fetch plans dynamically if possible or just rely on consistent naming?
      // Better: Fetch plans like pricing/page.tsx does.

      // actually, let's just use the same Fetch logic from pricing/page.tsx inside a useEffect here?
      // Or simpler: hardcode the assumption that the API handles lookup, OR fetch plans on mount.
    } catch (e) {
      console.error(e);
    }
  };

  // Return null early if not open - AFTER all hooks are declared
  if (!isOpen) return null;

  const plans = [
    {
      name: "Free",
      id: "free",
      price: "0",
      description: "For the curious observer.",
      features: [
        "Chat with featured characters",
        "Limited daily messages",
        "Standard voice quality",
        "Basic memory (current session)"
      ],
      cta: "Start Exploring",
      variant: "basic"
    },
    {
      name: "Agentwood+",
      id: "starter",
      price: billingCycle === 'annual' ? "12.49" : "14.99",
      period: "/month",
      description: "Everything you need to get lost.",
      features: [
        "Unlimited text chat",
        "1,000 voice replies/month",
        "200 min audio calls",
        "Create unlimited characters",
        "Ad-free experience",
        "Priority queue",
        "Advanced Memory (Long-term)"
      ],
      cta: "Go Agentwood+",
      variant: "featured",
      badge: "MOST POPULAR",
      priceId: "price_1QisjRG4S4hQ4v07L0KqE1Xy", // Example - need real IDs or fetch
      annualPriceId: "price_1QiskbG4S4hQ4v07w8eR2tZq"
    },
    {
      name: "Pro",
      id: "pro",
      price: billingCycle === 'annual' ? "41.99" : "49.99",
      period: "/month",
      description: "The ultimate immersive experience.",
      features: [
        "Unlimited everything",
        "Unlimited voice & calls",
        "Highest priority queue",
        "4K Image Generation",
        "Advanced Voice Settings",
        "Early access to new models",
        "Dedicated support"
      ],
      cta: "Go Pro",
      variant: "pro"
    }
  ];

  const handlePlanClick = async (staticPlan: any) => {
    // Check auth first
    if (!user) {
      onAuthRequired?.();
      onClose();
      return;
    }

    if (staticPlan.price === "0") {
      onClose();
      return;
    }

    setProcessingPlan(staticPlan.name);

    try {
      // Find matching real plan from API data
      const match = realPlans.find(p => p.name === staticPlan.name || p.id === staticPlan.id);
      if (!match) {
        console.error("Plan not found in backend");
        return;
      }

      const priceId = billingCycle === 'annual' && match.annualPriceId ? match.annualPriceId : match.priceId;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          type: match.interval === 'one-time' ? 'payment' : 'subscription',
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error(err);
      alert((err instanceof Error ? err.message : String(err)) || "Something went wrong starting checkout");
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f0a15]/95 backdrop-blur-xl transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[90vh] overflow-y-auto rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl animate-fade-in-up scrollbar-hide">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 top-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/5 group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform" />
        </button>

        {/* Decorative Backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-dipsea-accent/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 p-12 lg:p-20 flex flex-col items-center">

          {/* Header */}
          <div className="text-center space-y-6 mb-16 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-dipsea-accent mb-4">
              <Sparkles size={12} /> Unlock the full experience
            </div>
            <h2 className="text-6xl md:text-7xl font-serif italic text-white leading-none tracking-tight">
              Invest in your <br /> imagination.
            </h2>
            <p className="text-xl text-white/40 font-sans font-light">
              Choose the plan that fits your desire level. Upgrade or cancel anytime.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center p-1.5 bg-white/5 border border-white/10 rounded-full mt-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Annual <span className="bg-[#a855f7] text-white px-1.5 py-0.5 rounded text-[9px]">-17%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl items-start">
            {plans.map((plan, index) => {
              const isFeatured = plan.variant === 'featured';
              const isPro = plan.variant === 'pro';

              return (
                <div
                  key={index}
                  className={`relative p-8 rounded-[32px] border transition-all duration-500 group
                                ${isFeatured
                      ? 'bg-[#1a0f2e]/80 border-[#a855f7]/50 shadow-[0_0_40px_rgba(168,85,247,0.15)] scale-105 z-10'
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'}
                            `}
                >
                  {isFeatured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#a855f7] to-purple-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-xl flex items-center gap-2">
                      <Star size={10} fill="currentColor" /> Most Popular
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    <h3 className={`text-2xl font-serif italic ${isFeatured ? 'text-[#a855f7]' : 'text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-sans font-medium text-white">${plan.price}</span>
                      {plan.price !== "0" && <span className="text-white/40 text-sm">{plan.period}</span>}
                    </div>
                    <p className="text-white/40 text-sm font-sans min-h-[40px]">{plan.description}</p>
                  </div>

                  <button
                    onClick={() => handlePlanClick(plan)}
                    disabled={!!processingPlan}
                    className={`w-full py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all mb-10 shadow-lg
                                ${isFeatured
                        ? 'bg-[#a855f7] text-white hover:bg-[#9333ea] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                        : isPro
                          ? 'bg-white text-black hover:bg-gray-200'
                          : 'bg-white/10 text-white hover:bg-white hover:text-black'}
                                ${processingPlan === plan.name ? 'opacity-50 cursor-wait' : ''}
                            `}>
                    {processingPlan === plan.name ? 'Processing...' : plan.cta}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full ${isFeatured ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'bg-white/10 text-white/60'}`}>
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className={`text-sm font-sans ${isFeatured ? 'text-white/90' : 'text-white/60'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 w-full text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-6">
              <span>Secure Payment</span>
              <span>•</span>
              <span>Cancel Anytime</span>
              <span>•</span>
              <span>No Hidden Fees</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
