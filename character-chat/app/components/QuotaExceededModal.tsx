'use client';

import { X, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'messages' | 'tts' | 'calls';
  currentUsage: number;
  limit: number;
  upgradeUrl?: string;
}

export default function QuotaExceededModal({
  isOpen,
  onClose,
  type,
  currentUsage,
  limit,
  upgradeUrl = '/pricing',
}: QuotaExceededModalProps) {
  if (!isOpen) return null;

  const typeLabels = {
    messages: {
      title: 'Daily Message Limit Reached',
      description: `You've used all ${limit} of your daily messages. Upgrade to unlock unlimited conversations.`,
      icon: '💬',
    },
    tts: {
      title: 'Daily Voice Limit Reached',
      description: `You've used all ${limit} seconds of your daily voice quota. Upgrade to unlock unlimited voice features.`,
      icon: '🔊',
    },
    calls: {
      title: 'Voice Calls Not Available',
      description: 'Voice calls are only available for premium users. Upgrade to unlock this feature.',
      icon: '📞',
    },
  };

  const labels = typeLabels[type];

  // Handle division by zero and edge cases
  const safeLimit = limit > 0 ? limit : 1;
  const usagePercent = limit > 0 ? Math.min((currentUsage / limit) * 100, 100) : 100;

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  // Better description when limit is 0 or unknown
  const getDescription = () => {
    if (limit === 0 || limit === undefined) {
      if (type === 'tts') {
        return 'Your daily voice quota has been reached. Upgrade to unlock unlimited voice features.';
      } else if (type === 'messages') {
        return 'Your daily message limit has been reached. Upgrade to unlock unlimited conversations.';
      }
      return labels.description;
    }
    return labels.description;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
      <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon - Brand purple gradient */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/30">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>

          {/* Title - White on dark */}
          <h2 className="text-2xl font-bold text-white text-center mb-2 font-serif italic">
            {labels.title}
          </h2>

          {/* Description */}
          <p className="text-white/60 text-center mb-6">
            {getDescription()}
          </p>

          {/* Usage Bar - Brand colors */}
          {type !== 'calls' && limit > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Usage</span>
                <span className="font-bold text-white">
                  {formatNumber(currentUsage)} / {formatNumber(limit)}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Features List - Dark card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-6">
            <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Upgrade to unlock:</p>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Unlimited {type === 'messages' ? 'messages' : type === 'tts' ? 'voice' : 'calls'}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Ad-free experience
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Priority support
              </li>
            </ul>
          </div>

          {/* Actions - Brand buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={upgradeUrl}
              className="flex-1 px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
