import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import Navigation from '../components/Navigation';

const PricingPage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Hobby & Student',
      price: billingCycle === 'monthly' ? 14 : 11,
      credits: '225,000',
      features: [
        'Unlimited projects',
        'Basic AI models (Gemini Flash)',
        'Brainstorming Engine',
        'Community Support'
      ],
      notIncluded: ['Veo Video Generation', 'Audiobook Studio', 'Critique Circle Pro'],
      color: 'bg-white',
      textColor: 'text-slate-900',
      buttonColor: 'bg-slate-100 text-slate-900 hover:bg-slate-200'
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? 22 : 18,
      credits: '1,000,000',
      isPopular: true,
      features: [
        'Everything in Hobby',
        'Advanced AI models (Gemini Pro)',
        'Veo Video Studio (10k credits/video)',
        'Audiobook Exports',
        'Priority Support'
      ],
      notIncluded: [],
      color: 'bg-slate-900',
      textColor: 'text-white',
      buttonColor: 'bg-amber-500 text-white hover:bg-amber-600'
    },
    {
      name: 'Max',
      price: billingCycle === 'monthly' ? 44 : 36,
      credits: '2,000,000',
      features: [
        'Everything in Professional',
        'Unlimited Video Generation',
        '4K Upscaling',
        '1-on-1 Writing Coach Session',
        'Early Access Features'
      ],
      notIncluded: [],
      color: 'bg-white',
      textColor: 'text-slate-900',
      buttonColor: 'bg-slate-900 text-white hover:bg-slate-800'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />
      
      <main className="pt-32 pb-20 px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-serif text-5xl text-slate-900 mb-6">Invest in your story.</h1>
          <p className="text-xl text-slate-500 mb-10 font-light">
            Choose the plan that fits your writing goals. Upgrade or downgrade anytime.
          </p>
          
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
              Yearly <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Save 20%</span>
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-3xl p-8 flex flex-col border transition-transform duration-300 hover:-translate-y-2 ${plan.color} ${plan.isPopular ? 'border-slate-900 shadow-xl' : 'border-stone-200 shadow-sm'}`}
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
                onClick={() => navigate('/profile')}
                className={`w-full py-4 rounded-xl font-bold text-sm transition shadow-lg ${plan.buttonColor}`}
              >
                {idx === 0 ? 'Start Free Trial' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
           <p className="text-slate-400 text-sm mb-4">Trusted by 50,000+ writers worldwide.</p>
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