import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';
import { stripeService } from '../services/stripeService';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planName: string, isLTD: boolean = false) => {
    setLoading(planName);
    setError(null);

    try {
      // Check if user is authenticated
      if (!user) {
        navigate('/signup');
        return;
      }

      const priceId = stripeService.getPriceId(planName, billingCycle);
      if (!priceId) {
        throw new Error('Price ID not found for this plan. Please contact support.');
      }

      await stripeService.createCheckoutSession({
        priceId,
        planName,
        isLTD,
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Countdown timer for LTD offer (30 days from deploy date)
  useEffect(() => {
    const endDate = new Date('2024-12-27T23:59:59'); // 30 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 14 : 7,
      credits: '15,000',
      features: [
        'Unlimited projects',
        'Basic AI models (Gemini Flash)',
        'Brainstorming Engine',
        'PDF Export',
        'Community Support'
      ],
      notIncluded: ['Veo Video Generation', 'Audiobook Studio', 'Priority Support'],
      color: 'bg-white',
      textColor: 'text-slate-900',
      buttonColor: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      borderColor: 'border-stone-200'
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 24 : 15,
      credits: '75,000',
      isPopular: true,
      features: [
        'Everything in Starter',
        'Advanced AI models (Gemini Pro)',
        'Veo Video Studio (1k credits/video)',
        'Audiobook Exports',
        'Collaboration Tools',
        'Priority Support'
      ],
      notIncluded: [],
      color: 'bg-gradient-to-br from-slate-900 to-slate-800',
      textColor: 'text-white',
      buttonColor: 'bg-amber-500 text-white hover:bg-amber-600',
      borderColor: 'border-slate-900'
    },
    {
      name: 'Unlimited',
      price: billingCycle === 'monthly' ? 44 : 29,
      credits: 'Unlimited',
      features: [
        'Everything in Pro',
        'Unlimited Video Generation',
        '4K Upscaling',
        'Rollover Credits',
        '1-on-1 Writing Coach Session',
        'Early Access Features'
      ],
      notIncluded: [],
      color: 'bg-white',
      textColor: 'text-slate-900',
      buttonColor: 'bg-slate-900 text-white hover:bg-slate-800',
      borderColor: 'border-stone-200'
    }
  ];

  const ltdOffer = {
    name: 'Lifetime Deal',
    originalPrice: 348,
    price: 60,
    savings: 83,
    credits: 'Unlimited',
    features: [
      'All Unlimited features for 12 months',
      'Lifetime priority support badge',
      'Early access to new features',
      'No auto-renewal',
      'One-time payment'
    ],
    color: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    textColor: 'text-white',
    buttonColor: 'bg-white text-orange-600 hover:bg-gray-100',
    borderColor: 'border-amber-400'
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-5xl text-slate-900 mb-6">Invest in your story.</h1>
          <p className="text-xl text-slate-500 mb-10 font-light">
            Choose the plan that fits your writing goals. 40% cheaper than competitors.
          </p>

          {error && (
            <div className="max-w-md mx-auto mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
              <X size={18} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <div className="inline-flex bg-white p-1 rounded-full border border-stone-200 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Yearly <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Save 50%</span>
            </button>
          </div>
        </div>

        {/* Regular Plans */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col border transition-transform duration-300 hover:-translate-y-2 ${plan.color} ${plan.isPopular ? `${plan.borderColor} shadow-2xl` : `${plan.borderColor} shadow-sm`}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-2 ${plan.textColor}`}>{plan.name}</h3>
                <div className={`flex items-baseline gap-1 ${plan.textColor}`}>
                  <span className="text-4xl font-serif font-medium">${plan.price}</span>
                  <span className="text-sm opacity-60">/month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-xs mt-1 opacity-70 font-medium">
                    Billed ${plan.price * 12}/year
                  </div>
                )}
                <div className={`text-sm mt-2 font-medium opacity-80 ${plan.textColor}`}>
                  {plan.credits} credits/mo
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`mt-0.5 p-0.5 rounded-full ${plan.isPopular ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                      <Check size={12} />
                    </div>
                    <span className={`text-sm ${plan.textColor} opacity-90`}>{feat}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 opacity-40">
                    <div className="mt-0.5 p-0.5">
                      <X size={12} />
                    </div>
                    <span className={`text-sm ${plan.textColor}`}>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(plan.name.toLowerCase(), false)}
                disabled={loading === plan.name.toLowerCase()}
                className={`w-full py-4 rounded-xl font-bold text-sm transition shadow-lg ${plan.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === plan.name.toLowerCase() ? 'Processing...' : (idx === 0 ? 'Start Free Trial' : 'Subscribe Now')}
              </button>
            </div>
          ))}
        </div>

        {/* LTD Offer - Highlighted Card */}
        <div className="max-w-2xl mx-auto">
          <div className={`relative rounded-3xl p-10 flex flex-col border-4 shadow-2xl ${ltdOffer.color} ${ltdOffer.borderColor} animate-pulse`}>
            {/* LTD Badge */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-xl flex items-center gap-2">
              <Sparkles size={16} className="animate-spin" />
              Limited Time Only
              <Sparkles size={16} className="animate-spin" />
            </div>

            <div className="mb-6 text-center">
              <h3 className={`text-2xl font-bold mb-3 ${ltdOffer.textColor}`}>{ltdOffer.name}</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-xl line-through opacity-60 text-white">${ltdOffer.originalPrice}</span>
                <div className={`flex items-baseline gap-1 ${ltdOffer.textColor}`}>
                  <span className="text-6xl font-serif font-bold">${ltdOffer.price}</span>
                  <span className="text-lg opacity-80">/year</span>
                </div>
              </div>
              <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                Save {ltdOffer.savings}% • Just $5.00/month 🤯
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="text-white" size={20} />
                <span className="text-white font-bold text-sm uppercase tracking-wide">Offer Ends In</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds }
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl py-3 px-2 mb-2">
                      <span className="text-3xl font-bold text-white font-mono">{String(item.value).padStart(2, '0')}</span>
                    </div>
                    <span className="text-xs text-white/80 uppercase tracking-wide font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 mb-8">
              {ltdOffer.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1 rounded-full bg-white/20 text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className={`text-sm ${ltdOffer.textColor} font-medium`}>{feat}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleCheckout('ltd', true)}
              disabled={loading === 'ltd'}
              className={`w-full py-5 rounded-xl font-bold text-lg transition shadow-2xl transform hover:scale-105 ${ltdOffer.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === 'ltd' ? 'Processing...' : 'Claim Lifetime Deal Now →'}
            </button>

            <p className="text-center text-white/70 text-xs mt-4">
              ⚡ Limited to first 1,000 customers • Less than ONE month of Unlimited • 30-day money-back guarantee
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <p className="text-slate-400 text-sm mb-4">40-50% cheaper than Jasper, Sudowrite, and Copy.ai</p>
          <div className="flex justify-center gap-8 opacity-30 grayscale">
            <span className="text-2xl font-serif font-bold text-slate-900">WIRED</span>
            <span className="text-2xl font-serif font-bold text-slate-900">TheVerge</span>
            <span className="text-2xl font-serif font-bold text-slate-900">TechCrunch</span>
            <span className="text-2xl font-serif font-bold text-slate-900">Medium</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;