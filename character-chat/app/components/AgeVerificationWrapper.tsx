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
    const checkAgeVerification = async () => {
      try {
        const session = getSession();
        if (!session) {
          // No session, redirect to landing
          router.push('/');
          return;
        }

        // Check if age is verified
        const ageVerified = isAgeVerified();
        
        if (!ageVerified) {
          // Show age verification modal
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking age verification:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAgeVerification();
  }, [router]);

  const handleVerify = async (dateOfBirth: Date) => {
    try {
      const session = getSession();
      if (!session) return;

      // Save to database via API
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

      // Also save to localStorage for immediate access
      localStorage.setItem('agentwood_age_verified', 'true');
      localStorage.setItem('agentwood_age', dateOfBirth.toISOString());

      setShowModal(false);
    } catch (error) {
      console.error('Error verifying age:', error);
    }
  };

  const handleSkip = () => {
    // Allow skipping for now, but they won't be able to chat
    setShowModal(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-zinc-500">Loading...</div>
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

