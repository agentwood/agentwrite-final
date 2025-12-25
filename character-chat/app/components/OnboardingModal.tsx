'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}

export interface OnboardingData {
  pronoun: 'she/her' | 'he/him' | 'they/them' | null;
  ageRange: string | null;
  relationshipPreference: 'male' | 'female' | 'non-binary' | null;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    pronoun: null,
    ageRange: null,
    relationshipPreference: null,
  });

  if (!isOpen) return null;

  const handlePronounSelect = (pronoun: 'she/her' | 'he/him' | 'they/them') => {
    setData({ ...data, pronoun });
    setStep(2);
  };

  const handleAgeSelect = (ageRange: string) => {
    setData({ ...data, ageRange });
    setStep(3);
  };

  const handleRelationshipSelect = (preference: 'male' | 'female' | 'non-binary') => {
    setData({ ...data, relationshipPreference: preference });
  };

  const handleComplete = () => {
    onComplete(data);
    onClose();
  };

  const isStep1Complete = data.pronoun !== null;
  const isStep2Complete = data.ageRange !== null;
  const isStep3Complete = data.relationshipPreference !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 pb-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Hi, <span className="text-yellow-400">Welcome to Agentwood</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-2">
              Tell us more for a better personalized experience
            </p>
          </div>

          {/* Step 1: Pronoun Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-4">
                  Which pronoun do you use? <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={() => handlePronounSelect('she/her')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-full transition-all w-20 h-20 ${
                      data.pronoun === 'she/her'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      data.pronoun === 'she/her' ? 'bg-zinc-900/20' : 'bg-white/20'
                    }`}>
                      <span className="text-2xl">♀</span>
                    </div>
                    <span className="text-sm font-medium">She/Her</span>
                  </button>
                  <button
                    onClick={() => handlePronounSelect('he/him')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-full transition-all w-20 h-20 ${
                      data.pronoun === 'he/him'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      data.pronoun === 'he/him' ? 'bg-zinc-900/20' : 'bg-white/20'
                    }`}>
                      <span className="text-2xl">♂</span>
                    </div>
                    <span className="text-sm font-medium">He/Him</span>
                  </button>
                  <button
                    onClick={() => handlePronounSelect('they/them')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-full transition-all w-20 h-20 ${
                      data.pronoun === 'they/them'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      data.pronoun === 'they/them' ? 'bg-zinc-900/20' : 'bg-white/20'
                    }`}>
                      <span className="text-2xl">*</span>
                    </div>
                    <span className="text-sm font-medium">They/Them</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Age Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-4">
                  What's your age? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Above 26', '24-26', '21-23', '18-20', '14-17', '0-13'].map((age) => (
                    <button
                      key={age}
                      onClick={() => handleAgeSelect(age)}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        data.ageRange === age
                          ? 'bg-yellow-400 text-zinc-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Relationship Preference */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-4">
                  What's your relationship preference?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRelationshipSelect('male')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      data.relationshipPreference === 'male'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">👨</span>
                    <span>Male</span>
                  </button>
                  <button
                    onClick={() => handleRelationshipSelect('female')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      data.relationshipPreference === 'female'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">👩</span>
                    <span>Female</span>
                  </button>
                  <button
                    onClick={() => handleRelationshipSelect('non-binary')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      data.relationshipPreference === 'non-binary'
                        ? 'bg-yellow-400 text-zinc-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xl">🏳️‍🌈</span>
                    <span>Non-binary</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Complete Button - Always show on step 3, but disabled until preference selected */}
          {step === 3 && (
            <button
              onClick={handleComplete}
              disabled={!isStep3Complete}
              className="w-full mt-8 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all"
            >
              Enter Agentwood Now!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

