'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Calendar, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { setSession } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateAge = (birthDate: string): boolean => {
    if (!birthDate) return false;
    const age = calculateAge(birthDate);
    return age >= 13;
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFormData({ ...formData, birthDate: date });

    if (date) {
      const isValid = validateAge(date);
      setAgeVerified(isValid);

      if (!isValid) {
        const age = calculateAge(date);
        setErrors({
          ...errors,
          birthDate: age < 13
            ? 'You must be at least 13 years old to use this service.'
            : 'Please enter a valid birth date.',
        });
      } else {
        const newErrors = { ...errors };
        delete newErrors.birthDate;
        setErrors(newErrors);
      }
    } else {
      setAgeVerified(false);
      setErrors({ ...errors, birthDate: 'Birth date is required.' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Age verification
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required.';
    } else if (!ageVerified) {
      const age = calculateAge(formData.birthDate);
      newErrors.birthDate = age < 13
        ? 'You must be at least 13 years old to use this service.'
        : 'Please enter a valid birth date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to create user account
      // For now, create a session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const age = calculateAge(formData.birthDate);

      // Store age verification in session
      setSession({
        id: userId,
        email: formData.email,
        displayName: formData.email.split('@')[0],
        planId: 'free',
      });

      // Store age verification in localStorage
      localStorage.setItem('agentwood_age_verified', 'true');
      localStorage.setItem('agentwood_birth_date', formData.birthDate);
      localStorage.setItem('agentwood_age', age.toString());

      // Force hard navigation to ensure state updates (mirrors Login fix)
      window.location.href = '/home';
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate max date (13 years ago)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Calculate min date (reasonable limit, e.g., 120 years ago)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create Your Account</h1>
              <p className="text-zinc-600">Join Agentwood and start chatting with AI characters</p>
            </div>

            {/* Age Requirement Notice */}
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900 mb-1">Age Requirement</p>
                  <p className="text-xs text-indigo-700">
                    You must be at least <strong>13 years old</strong> to use Agentwood. We verify your age to ensure a safe environment for all users.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) {
                        const newErrors = { ...errors };
                        delete newErrors.email;
                        setErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                      }`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={handleBirthDateChange}
                    max={maxDateString}
                    min={minDateString}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.birthDate ? 'border-red-300 bg-red-50' : ageVerified ? 'border-green-300 bg-green-50' : 'border-zinc-200'
                      }`}
                  />
                </div>
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.birthDate}
                  </p>
                )}
                {ageVerified && !errors.birthDate && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Age verified: {calculateAge(formData.birthDate)} years old
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) {
                        const newErrors = { ...errors };
                        delete newErrors.password;
                        setErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                      }`}
                    placeholder="At least 8 characters"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      if (errors.confirmPassword) {
                        const newErrors = { ...errors };
                        delete newErrors.confirmPassword;
                        setErrors(newErrors);
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-zinc-200'
                      }`}
                    placeholder="Re-enter your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !ageVerified}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${isLoading || !ageVerified
                  ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-zinc-500 text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Privacy Policy
                </Link>
                . You must be 13+ to use this service.
              </p>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-zinc-200">
                <p className="text-sm text-zinc-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}




