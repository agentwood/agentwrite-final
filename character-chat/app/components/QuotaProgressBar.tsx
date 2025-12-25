'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Volume2, Phone } from 'lucide-react';
import { getSession, getAuthHeaders } from '@/lib/auth';
import { getPlanLimits } from '@/lib/subscription';

interface QuotaProgressBarProps {
  type: 'messages' | 'tts' | 'calls';
  className?: string;
}

export default function QuotaProgressBar({ type, className = '' }: QuotaProgressBarProps) {
  const [usage, setUsage] = useState({ current: 0, limit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuota();
  }, []);

  const loadQuota = async () => {
    try {
      const session = getSession();
      if (!session) return;

      const limits = getPlanLimits(session.planId);
      
      // Get current usage
      const response = await fetch('/api/quota/reset', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const quota = data.quota;

        if (type === 'messages') {
          setUsage({
            current: quota.textReplies || 0,
            limit: limits.messagesPerDay > 0 ? limits.messagesPerDay : Infinity,
          });
        } else if (type === 'tts') {
          setUsage({
            current: quota.ttsSeconds || 0,
            limit: limits.ttsSecondsPerDay > 0 ? limits.ttsSecondsPerDay : Infinity,
          });
        } else {
          setUsage({
            current: quota.callMinutes || 0,
            limit: limits.callMinutesPerDay > 0 ? limits.callMinutesPerDay : Infinity,
          });
        }
      }
    } catch (error) {
      console.error('Error loading quota:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || usage.limit === Infinity) return null;

  const percent = Math.min((usage.current / usage.limit) * 100, 100);
  const isNearLimit = percent >= 80;
  const isAtLimit = percent >= 100;

  const icons = {
    messages: MessageSquare,
    tts: Volume2,
    calls: Phone,
  };

  const labels = {
    messages: 'Messages',
    tts: 'Voice (seconds)',
    calls: 'Calls (minutes)',
  };

  const Icon = icons[type];

  return (
    <div className={`bg-white border border-zinc-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-700">{labels[type]}</span>
        </div>
        <span className={`text-xs font-semibold ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-zinc-600'
        }`}>
          {usage.current} / {usage.limit}
        </span>
      </div>
      <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isAtLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-orange-500'
              : 'bg-indigo-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}




