'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AgeVerificationModal from './AgeVerificationModal';
import { getSession, isAgeVerified } from '@/lib/auth';

interface AgeGateProps {
  children: React.ReactNode;
}

export default function AgeGate({ children }: AgeGateProps) {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      const session = getSession();
      const verified = isAgeVerified();

      if (!session) {
        router.push('/');
        return;
      }

      if (!verified) {
        setShowModal(true);
      }

      setIsChecking(false);
    };

    check();
  }, [router]);

  const handleVerify = async (dateOfBirth: Date) => {
    try {
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
      setShowModal(false);
    } catch (error: any) {
      console.error('Error verifying age:', error);
      alert(error.message || 'Failed to verify age. Please try again.');
    }
  };

  const handleSkip = () => {
    router.push('/home');
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-zinc-500">Loading...</div>
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
