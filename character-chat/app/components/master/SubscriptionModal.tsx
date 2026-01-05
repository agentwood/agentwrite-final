"use client";

import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, Crown, Star } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      name: "Free",
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
      badge: "MOST POPULAR"
    },
    {
      name: "Pro",
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
                    Invest in your <br/> imagination.
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

                            <button className={`w-full py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] transition-all mb-10 shadow-lg
                                ${isFeatured 
                                    ? 'bg-[#a855f7] text-white hover:bg-[#9333ea] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                                    : isPro
                                        ? 'bg-white text-black hover:bg-gray-200'
                                        : 'bg-white/10 text-white hover:bg-white hover:text-black'}
                            `}>
                                {plan.cta}
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
