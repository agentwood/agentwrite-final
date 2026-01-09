'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';

interface AdBannerProps {
  variant?: 'banner' | 'sidebar' | 'inline';
  className?: string;
}

export default function AdBanner({ variant = 'banner', className = '' }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsPremium(session?.planId !== 'free');
    setIsVisible(!isPremium);
  }, []);

  if (!isVisible || isPremium) return null;

  // Mock ad content - replace with actual ad service
  const adContent = {
    banner: {
      title: 'Upgrade to Premium',
      description: 'Unlock unlimited chats, ad-free experience, and more!',
      cta: 'Upgrade Now',
      link: '/pricing',
    },
    sidebar: {
      title: 'Go Premium',
      description: 'Remove ads and unlock all features',
      cta: 'Learn More',
      link: '/pricing',
    },
    inline: {
      title: 'Premium Features',
      description: 'Upgrade to remove ads',
      cta: 'Upgrade',
      link: '/pricing',
    },
  };

  const content = adContent[variant];

  if (variant === 'banner') {
    return (
      <div className={`bg-[#5865F2] text-white flex items-center justify-between border-b border-white/10 ${className}`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-white animate-pulse" />
            <span className="font-serif italic text-lg tracking-wide">
              Unlock the full <span className="font-bold">Agentwood+</span> experience
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={content.link}
              className="px-4 py-1.5 bg-white text-[#5865F2] rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-white/90 hover:scale-105 transition-all shadow-lg"
            >
              {content.cta}
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Close ad"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-zinc-900 mb-1">{content.title}</h3>
            <p className="text-xs text-zinc-600 mb-3">{content.description}</p>
            <Link
              href={content.link}
              className="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              {content.cta}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-center ${className}`}>
      <p className="text-xs text-zinc-600 mb-2">{content.description}</p>
      <Link
        href={content.link}
        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
      >
        {content.cta} →
      </Link>
    </div>
  );
}
