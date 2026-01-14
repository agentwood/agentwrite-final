'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import { getSession, isAuthenticated, setSession } from '@/lib/auth';
import { AuthModal } from '@/app/components/master/AuthModal';

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
  features: string[];
  ctaText?: string;
  redirectUrl?: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);
  const [showDevBypass, setShowDevBypass] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    // Check for dev bypass flag in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setShowDevBypass(urlParams.has('dev') || urlParams.get('dev') === '1');
    }
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

  const handleSubscribe = async (plan: Plan) => {
    console.log('Subscribe clicked for plan:', plan.id);

    // Free tier redirects to homepage
    if (!plan.priceId || plan.price === 0) {
      window.location.href = plan.redirectUrl || '/';
      return;
    }

    const auth = isAuthenticated(); // Check fresh
    console.log('Is authenticated:', auth);

    if (!auth) {
      console.log('Showing login modal...');
      setPendingPlan(plan); // Store which plan they wanted
      setShowAuthModal(true); // Show modal instead of redirect
      return;
    }

    const session = getSession();

    setProcessingPlan(plan.id);

    try {
      const priceId = billingInterval === 'annual' && plan.annualPriceId
        ? plan.annualPriceId
        : plan.priceId;

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          type: plan.interval === 'one-time' ? 'payment' : 'subscription',
          userId: session?.id,
          email: session?.email, // Include email directly from session
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Unable to start checkout. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) return 'Free';
    if (billingInterval === 'annual' && plan.annualPrice) {
      return `$${plan.annualPrice}`;
    }
    return `$${plan.price}`;
  };

  const getPriceLabel = (plan: Plan) => {
    if (plan.price === 0) return 'forever';
    if (plan.interval === 'one-time') return 'one-time';
    return billingInterval === 'annual' && plan.annualPrice ? '/year' : '/month';
  };

  // Handle auth modal close - resume checkout if user logged in
  const handleAuthClose = () => {
    setShowAuthModal(false);
    // Check if user is now authenticated and had a pending plan
    setTimeout(() => {
      if (isAuthenticated() && pendingPlan) {
        setIsLoggedIn(true);
        handleSubscribe(pendingPlan);
        setPendingPlan(null);
      }
    }, 100);
  };

  // Dev Bypass - creates a test session for testing checkout
  const handleDevBypass = () => {
    const testEmail = `testuser_${Date.now()}@agentwood.xyz`;
    setSession({
      id: `dev_${Date.now()}`,
      email: testEmail,
      displayName: 'Dev Tester',
      planId: 'free',
    });
    localStorage.setItem('agentwood_age_verified', 'true');
    setIsLoggedIn(true);
    setShowAuthModal(false);
    alert(`✅ Dev Bypass Active!\nEmail: ${testEmail}\n\nYou can now test the checkout flow.`);
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#0f0f0f] text-white">
      {/* Sidebar - same as home page */}
      <Sidebar recentCharacters={[]} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 overflow-y-auto">
        {/* Hero */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-white/60">
              Start free. Upgrade when you need more.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Billing Toggle */}
                <div className="flex justify-center mb-10">
                  <div className="inline-flex bg-[#1a1a1a] rounded-full p-1 border border-white/10">
                    <button
                      onClick={() => setBillingInterval('monthly')}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'monthly'
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                        }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingInterval('annual')}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingInterval === 'annual'
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                        }`}
                    >
                      Annual
                      <span className="ml-2 text-xs text-emerald-400">Save 17%</span>
                    </button>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-6 ${plan.mostPopular
                        ? 'bg-gradient-to-b from-purple-900/30 to-[#1a1a1a] border-2 border-purple-500/50 scale-105'
                        : 'bg-[#1a1a1a] border border-white/10'
                        }`}
                    >
                      {/* Popular Badge */}
                      {plan.mostPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          MOST POPULAR
                        </div>
                      )}

                      {/* Plan Name & Tagline */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                        <p className="text-sm text-white/40">{plan.tagline}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <span className="text-3xl font-bold text-white">
                          {getDisplayPrice(plan)}
                        </span>
                        <span className="text-white/40 ml-1 text-sm">
                          {getPriceLabel(plan)}
                        </span>
                        {billingInterval === 'annual' && plan.annualPrice && plan.price > 0 && plan.interval !== 'one-time' && (
                          <p className="text-sm text-emerald-400 mt-1">
                            Save ${((plan.price * 12) - plan.annualPrice).toFixed(0)}/year
                          </p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={processingPlan === plan.id}
                        className={`w-full py-3 rounded-xl font-semibold transition-all mb-6 ${plan.mostPopular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                          : plan.price === 0
                            ? 'bg-[#2a2a2a] text-white hover:bg-[#333]'
                            : 'bg-white text-black hover:bg-white/90'
                          } ${processingPlan === plan.id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        {processingPlan === plan.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          plan.ctaText || 'Subscribe'
                        )}
                      </button>

                      {/* Features */}
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-white/70">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Trust Badge */}
                <div className="mt-10 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] rounded-full border border-white/10">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white/60">
                      Cancel anytime · No hidden fees · Secure payment
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Auth Modal - appears when unauthenticated user clicks a plan */}
      <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />

      {/* Dev Bypass Button - visible when accessing /pricing?dev or /pricing?dev=1 */}
      {showDevBypass && !isLoggedIn && (
        <button
          onClick={handleDevBypass}
          className="fixed bottom-4 right-4 px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-all z-[200]"
        >
          🔓 Dev Bypass
        </button>
      )}
    </div>
  );
}
