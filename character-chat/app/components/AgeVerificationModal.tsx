'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerify: (dateOfBirth: Date) => void;
  onSkip?: () => void; // Optional skip for now
}

export default function AgeVerificationModal({ isOpen, onVerify, onSkip }: AgeVerificationModalProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = () => {
    setError(null);

    // Validate inputs
    if (!day || !month || !year) {
      setError('Please enter your complete date of birth');
      return;
    }

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      setError('Please enter valid numbers');
      return;
    }

    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
      setError('Please enter a valid date');
      return;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return;
    }

    // Create date and verify age
    const dateOfBirth = new Date(yearNum, monthNum - 1, dayNum);
    const today = new Date();
    let age = today.getFullYear() - yearNum;
    const monthDiff = today.getMonth() - (monthNum - 1);
    const dayDiff = today.getDate() - dayNum;

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    if (age < 18) {
      setError('You must be 18 years or older to chat with Characters');
      return;
    }

    // Verify successful
    onVerify(dateOfBirth);
  };

  // Generate day options (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  // Generate month options (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  // Generate year options (current year down to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center mb-3">
            Verify your age
          </h2>

          {/* Subtitle */}
          <p className="text-zinc-600 text-center mb-8">
            To chat with Characters, please verify that you're 18 years or older.
          </p>

          {/* Date of Birth Input */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Day */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wide">
                  Day
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition-all"
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wide">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition-all"
                >
                  <option value="">Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2 uppercase tracking-wide">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-zinc-400 transition-all"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              className="w-full py-4 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Verify identity
            </button>
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full py-4 bg-zinc-50 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2"
              >
                Not now
              </button>
            )}
          </div>

          {/* Footer text */}
          <p className="text-xs text-zinc-500 text-center mt-6 leading-relaxed">
            If you'd prefer not to verify your age, you can still use Agentwood, but 1:1 chat won't be available. You can verify your age later by going to Settings → Advanced → Verify age.
          </p>
        </div>
      </div>
    </div>
  );
}




