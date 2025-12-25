'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModal, { OnboardingData } from '@/app/components/OnboardingModal';
import LockedFeature from '@/app/components/LockedFeature';
import CharacterCreator from './CharacterCreator';
import { getSubscriptionStatus } from '@/lib/subscription';
import Footer from '@/app/components/Footer';

export default function CreateCharacterPage() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check subscription status
  useEffect(() => {
    getSubscriptionStatus(null).then(status => {
      setIsPremium(status.planId !== 'free');
      setLoading(false);
      
      // Only show onboarding if premium
      if (status.planId === 'free') {
        setShowOnboarding(false);
      } else {
        const hasCompletedOnboarding = localStorage.getItem('nexus_onboarding_completed');
        if (hasCompletedOnboarding) {
          setShowOnboarding(false);
          const savedData = localStorage.getItem('nexus_onboarding_data');
          if (savedData) {
            setOnboardingData(JSON.parse(savedData));
          }
        }
      }
    });
  }, []);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    // Save to localStorage
    localStorage.setItem('nexus_onboarding_completed', 'true');
    localStorage.setItem('nexus_onboarding_data', JSON.stringify(data));

    // Save to backend (for ML context system)
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }

    setOnboardingData(data);
    setShowOnboarding(false);
    
    // Redirect to home or character creation
    router.push('/');
  };

  const handleClose = () => {
    // Allow closing without completing (optional)
    setShowOnboarding(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-zinc-50 items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show character creator for premium users, locked feature for free users
  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-50">
      {!isPremium ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <LockedFeature
            featureName="Character Creation"
            planRequired="starter"
            className="min-h-[400px] w-full max-w-2xl"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">Create Custom Characters</h2>
              <p className="text-zinc-600 mb-6">
                Design unique AI characters with custom personalities, voices, and appearances.
              </p>
            </div>
          </LockedFeature>
        </div>
      ) : (
        <>
          {showOnboarding && (
            <OnboardingModal
              isOpen={showOnboarding}
              onClose={handleClose}
              onComplete={handleOnboardingComplete}
            />
          )}
          {!showOnboarding && <CharacterCreator />}
        </>
      )}
      <Footer />
    </div>
  );
}
