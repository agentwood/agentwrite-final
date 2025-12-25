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
  const safeLimit = limit > 0 ? limit : 1; // Prevent division by zero
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-2">
            {labels.title}
          </h2>

          {/* Description */}
          <p className="text-zinc-600 text-center mb-6">
            {getDescription()}
          </p>

          {/* Usage Bar */}
          {type !== 'calls' && limit > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-600">Usage</span>
                <span className="font-semibold text-zinc-900">
                  {formatNumber(currentUsage)} / {formatNumber(limit)}
                </span>
              </div>
              <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="bg-zinc-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-zinc-900 mb-3">Upgrade to unlock:</p>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Unlimited {type === 'messages' ? 'messages' : type === 'tts' ? 'voice' : 'calls'}
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Ad-free experience
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Priority support
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={upgradeUrl}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-semibold hover:bg-zinc-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

