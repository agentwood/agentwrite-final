'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgeVerificationModal from './AgeVerificationModal';
import { isAgeVerified } from '@/lib/auth';

interface AgeGateProps {
  children: React.ReactNode;
}

export default function AgeGate({ children }: AgeGateProps) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      if (typeof window === 'undefined') {
        setIsChecking(false);
        return;
      }

      // ONLY show age verification if explicitly flagged after first-time signup
      // This flag should be set in the signup/register flow ONLY
      const needsVerification = localStorage.getItem('agentwood_needs_age_verification') === 'true';

      if (!needsVerification) {
        // Not flagged for verification - skip entirely
        setIsChecking(false);
        return;
      }

      // Check if already verified or skipped
      const verified = isAgeVerified();
      const skipped = localStorage.getItem('agentwood_age_skipped') === 'true';

      if (verified || skipped) {
        // Clear the flag
        localStorage.removeItem('agentwood_needs_age_verification');
        setIsChecking(false);
        return;
      }

      // Show verification modal
      setShowModal(true);
      setIsChecking(false);
    };

    check();
  }, []);

  const handleVerify = async (dateOfBirth: Date) => {
    try {
      const { getAuthHeaders } = await import('@/lib/auth');
      const response = await fetch('/api/verify-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          dateOfBirth: dateOfBirth.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify age');
      }

      localStorage.setItem('agentwood_age_verified', 'true');
      localStorage.setItem('agentwood_age', dateOfBirth.toISOString());
      localStorage.removeItem('agentwood_needs_age_verification');
      setShowModal(false);
    } catch (error: any) {
      console.error('Error verifying age:', error);
      alert(error.message || 'Failed to verify age. Please try again.');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('agentwood_age_skipped', 'true');
    localStorage.removeItem('agentwood_needs_age_verification');
    setShowModal(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (showModal) {
    return (
      <AgeVerificationModal
        isOpen={showModal}
        onVerify={handleVerify}
        onSkip={handleSkip}
      />
    );
  }

  return <>{children}</>;
}

