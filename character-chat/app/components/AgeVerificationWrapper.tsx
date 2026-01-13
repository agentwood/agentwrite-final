'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AgeVerificationModal from './AgeVerificationModal';
import { getSession, isAgeVerified } from '@/lib/auth';

interface AgeVerificationWrapperProps {
  children: React.ReactNode;
}

export default function AgeVerificationWrapper({ children }: AgeVerificationWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Quick check - don't block rendering
    const timeout = setTimeout(() => {
      if (isChecking) {
        setIsChecking(false);
      }
    }, 1000);

    const checkAgeVerification = () => {
      try {
        if (typeof window === 'undefined') {
          setIsChecking(false);
          return;
        }

        // IMPORTANT: Age verification should ONLY show after first-time signup
        // Check if this is a brand new signup that needs age verification
        const needsAgeVerification = localStorage.getItem('agentwood_needs_age_verification') === 'true';

        // If not flagged for age verification, skip entirely
        if (!needsAgeVerification) {
          setIsChecking(false);
          return;
        }

        // Check if already verified or skipped
        const ageVerified = isAgeVerified();
        const hasSkipped = localStorage.getItem('agentwood_age_skipped') === 'true';

        if (ageVerified || hasSkipped) {
          // Clear the flag since they've dealt with it
          localStorage.removeItem('agentwood_needs_age_verification');
          setIsChecking(false);
          return;
        }

        // Show modal only if they need to verify
        setShowModal(true);
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking age verification:', error);
        setIsChecking(false);
      }
    };

    checkAgeVerification();

    return () => clearTimeout(timeout);
  }, []);

  const handleVerify = async (dateOfBirth: Date) => {
    try {
      const session = getSession();
      if (!session) return;

      const response = await fetch('/api/verify-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch (error) {
      console.error('Error verifying age:', error);
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <div className="text-white/40 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <AgeVerificationModal
        isOpen={showModal}
        onVerify={handleVerify}
        onSkip={handleSkip}
      />
    </>
  );
}

