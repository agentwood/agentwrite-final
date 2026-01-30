"use client";

import { supabase } from '@/lib/supabaseClient';
import { setSession } from '@/lib/auth';
import { toast } from 'sonner';

import React, { useState } from 'react';
import { X, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: { id: string; email: string; displayName?: string; planId: 'free' | 'starter' | 'pro' }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  if (!isOpen) return null;


  // --- REAL AUTH LOGIC ---
  const handleEmailAuth = async () => {
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      setIsLoading(false);
      return;
    }

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      let result;

      if (mode === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { data, error } = result;
      console.log("Auth attempt result:", { hasData: !!data, hasSession: !!data?.session, error });

      if (error) throw error;

      // For signup, we might need email verification
      if (mode === 'signup' && data?.user && !data.session) {
        console.log("Signup successful, waiting for verification:", data.user.email);
        toast.success('Account created! Please check your email to verify.');
        setIsLoading(false);
        return;
      }

      // Safe check for session and user
      if (data?.session && data.user) {
        console.log("Login successful for user:", data.user.id);
        setSession({
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          planId: 'free',
        });

        // Set Middleware Cookie
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `agentwood_token=${data.user.id}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;

        // SYNC to Prisma
        console.log("Syncing user to DB...");
        try {
          const syncRes = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name,
              avatar_url: data.user.user_metadata?.avatar_url
            })
          });
          console.log("Sync result status:", syncRes.status);
        } catch (syncErr) {
          console.error("DB Sync failed:", syncErr);
        }

        toast.success(mode === 'signup' ? 'Welcome to Agentwood!' : 'Welcome back!');

        // CRITICAL: Pass user data back to parent IMMEDIATELY before closing
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          planId: 'free' as const,
        };

        if (onAuthSuccess) {
          onAuthSuccess(userData);
        }

        // Close modal - parent now has the user data
        onClose();
      }

    } catch (e: any) {
      console.error("Auth failed error object:", e);
      setError(e.message || "Authentication failed");
      toast.error(e.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured.");
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (e: any) {
      console.error("OAuth error:", e);
      toast.error(`Error connecting to ${provider}: ${e.message}`);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('google');

  // SVGs for brand icons
  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.424 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.249 C -21.864 50.459 -21.734 49.689 -21.484 48.969 L -21.484 45.879 L -25.464 45.879 C -26.284 47.509 -26.754 49.329 -26.754 51.249 C -26.754 53.169 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 44.009 C -12.984 44.009 -11.424 44.619 -10.174 45.809 L -6.714 42.349 C -8.804 40.409 -11.514 39.239 -14.754 39.239 C -19.424 39.239 -23.494 41.939 -25.464 45.879 L -21.484 48.969 C -20.534 46.119 -17.884 44.009 -14.754 44.009 Z" />
      </g>
    </svg>
  );

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f0a15]/95 backdrop-blur-xl transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative flex h-[700px] w-full max-w-5xl overflow-hidden rounded-[32px] shadow-[0_0_100px_rgba(168,85,247,0.15)] animate-fade-in-up">

        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-50 p-2 rounded-full bg-black/20 hover:bg-white/20 text-white transition-all backdrop-blur-md border border-white/5"
        >
          <X size={20} />
        </button>

        {/* Left Side: Auth Form (Colorful Gradient Background) */}
        <div className="flex w-full lg:w-[45%] flex-col justify-center px-12 lg:px-16 relative overflow-hidden">
          {/* ... existing background ... */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a0a1a] via-[#1a0510] to-[#0a0508] z-0"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.15),transparent_50%)] z-0"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(194,149,110,0.1),transparent_50%)] z-0"></div>

          <div className="relative z-10 text-white">
            {/* ... header ... */}
            <div className="mb-10 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 mb-3 block">
                {mode === 'signup' ? 'Join Us' : 'Welcome Back'}
              </span>
              <h2 className="text-5xl font-serif italic tracking-tighter mb-2 text-white">
                {mode === 'signup' ? 'Sign up.' : 'Sign in.'}
              </h2>
              <p className="text-sm text-white/40 font-sans">
                {mode === 'signup' ? 'Start your journey in the woods.' : 'Resume your story in the woods.'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Inputs */}
              <div className="space-y-4">
                <div className="group relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-white font-sans"
                  />
                </div>
                <div className="group relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 pr-12 text-sm outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-white font-sans"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button className="text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors">Forgot Password?</button>
                </div>
              )}

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:scale-[1.02] transition-all shadow-lg border border-white/10 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </div>

            <div className="relative py-2 flex items-center gap-4 mb-8">
              <div className="flex-1 border-t border-white/5"></div>
              <span className="text-[9px] font-bold tracking-[0.3em] text-white/20">OR CONTINUE WITH</span>
              <div className="flex-1 border-t border-white/5"></div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 bg-white text-black rounded-xl py-3.5 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-all shadow-lg active:scale-[0.98]"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
            </div>

            <p className="mt-10 text-[10px] text-white/30 text-center font-sans">
              {mode === 'signin' ? (
                <>New to Agentwood? <button onClick={() => setMode('signup')} className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors underline decoration-purple-400/30 underline-offset-4">Create Account</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('signin')} className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors underline decoration-purple-400/30 underline-offset-4">Sign In</button></>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Fireplace Video */}
        <div className="hidden lg:block flex-1 relative bg-black overflow-hidden">
          {/* ... existing video ... */}
          <video
            src="/videos/fireplace.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0510]/80 to-transparent"></div>

          <div className="absolute bottom-12 left-12 right-12">
            <h3 className="text-3xl font-serif italic text-white mb-4 leading-tight">
              "The voice was so real, I forgot where I was."
            </h3>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-white/20">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">Sarah M.</p>
                <p className="text-[10px] text-white/40 font-sans">Premium Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
