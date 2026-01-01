'use client';

import { Lock, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LockedFeatureProps {
  featureName: string;
  planRequired?: 'starter' | 'pro';
  children?: React.ReactNode;
  className?: string;
  showUpgradeButton?: boolean;
}

export default function LockedFeature({
  featureName,
  planRequired = 'starter',
  children,
  className = '',
  showUpgradeButton = true,
}: LockedFeatureProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-zinc-300">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            {featureName} is Locked
          </h3>
          <p className="text-sm text-zinc-600 mb-4 max-w-xs">
            Upgrade to <span className="font-semibold text-indigo-600">
              {planRequired === 'starter' ? 'Agentwood+ Standard' : 'Agentwood+ Pro'}
            </span> to unlock this feature
          </p>
          {showUpgradeButton && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}




