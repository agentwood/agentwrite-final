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
      <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 relative ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{content.title}</p>
              <p className="text-xs text-indigo-100">{content.description}</p>
            </div>
          </div>
          <Link
            href={content.link}
            className="px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors whitespace-nowrap"
          >
            {content.cta}
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
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



