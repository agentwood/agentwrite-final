'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { setSession, getSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.email || !formData.password) {
      setErrors({ submit: 'Please fill in all fields.' });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to authenticate user
      // For now, check if age is verified
      const ageVerified = localStorage.getItem('agentwood_age_verified');
      
      if (ageVerified !== 'true') {
        setErrors({ submit: 'Please verify your age by signing up first.' });
        setIsLoading(false);
        return;
      }

      // Create session
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSession({
        id: userId,
        email: formData.email,
        displayName: formData.email.split('@')[0],
        planId: 'free',
      });

      // Redirect to home
      router.push('/');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Invalid email or password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Back</h1>
              <p className="text-zinc-600">Sign in to continue chatting with AI characters</p>
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="name@example.com"
                    required
                  />
                </div>
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
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-zinc-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Forgot password?
                </Link>
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
                disabled={isLoading}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  isLoading
                    ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Signup Link */}
              <div className="text-center pt-4 border-t border-zinc-200">
                <p className="text-sm text-zinc-600">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                    Sign up
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




