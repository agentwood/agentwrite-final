'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function UsernamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider') || 'email';
  
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Check username availability
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkUsername = async () => {
      setIsChecking(true);
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        setIsAvailable(data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || username.length < 3 || !isAvailable) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Save username and provider
      const response = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create account');
      }

      const data = await response.json();
      
      // Store user session
      localStorage.setItem('agentwood_user', JSON.stringify({
        id: data.userId,
        username: data.username,
        provider: provider,
      }));

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = username.length >= 3 && username.length <= 20 && /^[a-z0-9_-]+$/.test(username);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-xl border border-zinc-200">
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 mb-2">
              Choose your username
            </h1>
            <p className="text-zinc-600 font-medium">
              This is how others will see you on Agentwood
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-zinc-900 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="username"
                  className="w-full px-4 py-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  pattern="[a-z0-9_-]+"
                  minLength={3}
                  maxLength={20}
                  required
                />
                {isChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
                  </div>
                )}
                {!isChecking && isAvailable === true && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
                {!isChecking && isAvailable === false && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="text-red-600 text-sm font-bold">✕</span>
                  </div>
                )}
              </div>
              
              {/* Validation Messages */}
              <div className="mt-2 space-y-1">
                {username.length > 0 && username.length < 3 && (
                  <p className="text-xs text-zinc-500">Username must be at least 3 characters</p>
                )}
                {username.length > 20 && (
                  <p className="text-xs text-red-600">Username must be 20 characters or less</p>
                )}
                {username.length > 0 && !/^[a-z0-9_-]+$/.test(username) && (
                  <p className="text-xs text-red-600">Only lowercase letters, numbers, hyphens, and underscores</p>
                )}
                {isAvailable === false && (
                  <p className="text-xs text-red-600">Username is already taken</p>
                )}
                {isAvailable === true && (
                  <p className="text-xs text-green-600">Username is available!</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid || !isAvailable || isLoading}
              className="w-full px-6 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-base hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? 'Creating account...' : 'Continue'}
            </button>
          </form>

          {/* Provider Info */}
          <div className="mt-6 pt-6 border-t border-zinc-200">
            <p className="text-xs text-zinc-500 text-center">
              Signing up with: <span className="font-semibold text-zinc-900 capitalize">{provider}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

