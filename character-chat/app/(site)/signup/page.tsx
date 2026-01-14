'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Calendar, AlertCircle, CheckCircle2, Sparkles, X } from 'lucide-react';
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
    setErrors({});

    try {
      const { supabase } = await import('@/lib/supabaseClient');
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.email.split('@')[0],
            birth_date: formData.birthDate,
          }
        }
      });

      if (error) throw error;

      if (data?.user) {
        // Track that we need age verification after this signup
        localStorage.setItem('agentwood_needs_age_verification', 'true');

        // Set local session
        setSession({
          id: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          planId: 'free',
        });

        // Set Middleware Cookie
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `agentwood_token=${data.user.id}; expires=${date.toUTCString()}; path=/`;

        // SYNC to Prisma
        try {
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name,
            })
          });
        } catch (syncErr) {
          console.error("DB Sync failed:", syncErr);
        }

        // If no session (needs email verify), show message
        if (!data.session) {
          setErrors({ submit: 'Account created! Please check your email to verify your account.' });
          return;
        }

        // Redirect
        window.location.href = '/home';
      }
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f0a15] p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0f0a15] to-[#0f0a15] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-[#0f0f0f] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex relative min-h-[700px] border border-white/5 animate-fade-in-up">

        {/* Close / Home Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-8 right-8 z-50 p-2 bg-black/20 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white backdrop-blur-md border border-white/5"
        >
          <X size={20} />
        </button>

        {/* LEFT SIDE - FORM */}
        <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center relative bg-[#120b18]">
          <div className="max-w-md mx-auto w-full relative z-10">

            <div className="text-center mb-8">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-3">Begin Your Journey</h2>
              <h1 className="text-4xl md:text-5xl font-serif italic text-white mb-2 tracking-tight">Create Account.</h1>
              <p className="text-white/40 text-sm font-sans">Join the story in the woods.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="group">
                <div className="relative bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:bg-white/5 transition-all">
                  <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wider">Email Address</label>
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
                    className={`w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none ${errors.email ? 'text-red-300' : ''}`}
                    placeholder="name@example.com"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                </div>
                {errors.email && <p className="mt-1 text-[10px] text-red-400 pl-1">{errors.email}</p>}
              </div>

              {/* Birth Date (Age Verification) */}
              <div className="group">
                <div className={`relative bg-[#1a1a1a] border rounded-xl px-4 py-3 focus-within:bg-white/5 transition-all ${ageVerified && !errors.birthDate ? 'border-green-500/30' : errors.birthDate ? 'border-red-500/30' : 'border-white/5 focus-within:border-purple-500/50'
                  }`}>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-white/30 uppercase tracking-wider">Date of Birth</label>
                    {ageVerified && !errors.birthDate && (
                      <span className="text-[10px] text-green-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Verified (13+)
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={handleBirthDateChange}
                    max={maxDateString}
                    min={minDateString}
                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none [color-scheme:dark]"
                  />
                </div>
                {errors.birthDate && <p className="mt-1 text-[10px] text-red-400 pl-1">{errors.birthDate}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <div className="relative bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:bg-white/5 transition-all">
                    <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wider">Password</label>
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
                      className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none"
                      placeholder="8+ chars"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-[10px] text-red-400 pl-1">{errors.password}</p>}
                </div>

                <div className="group">
                  <div className="relative bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-purple-500/50 focus-within:bg-white/5 transition-all">
                    <label className="block text-[10px] font-bold text-white/30 mb-1 uppercase tracking-wider">Confirm</label>
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
                      className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none"
                      placeholder="Repeat"
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-[10px] text-red-400 pl-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {errors.submit && (
                <div className="text-xs text-red-400 flex items-center gap-2 justify-center py-2 bg-red-500/10 rounded-lg">
                  <AlertCircle size={12} />
                  {errors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !ageVerified}
                className={`w-full py-4 mt-6 rounded-xl font-bold uppercase tracking-[0.2em] text-xs transition-all transform active:scale-[0.98] ${isLoading || !ageVerified
                  ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] shadow-lg'
                  }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="text-center mt-6">
                <span className="text-white/40 text-[10px]">Already have an account? </span>
                <Link href="/login" className="text-purple-400 font-bold text-[10px] hover:text-purple-300 uppercase tracking-wider transition-colors">Sign In</Link>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE - VISUAL */}
        <div className="hidden lg:flex w-[55%] relative overflow-hidden items-end p-16">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/fireplace.mp4" type="video/mp4" />
          </video>

          {/* Overlays */}
          <div className="absolute inset-0 bg-black/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-transparent to-transparent z-10" />

          <div className="relative z-20 max-w-lg">
            <div className="mb-6 flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20" />
              ))}
            </div>
            <h3 className="text-4xl md:text-5xl font-serif italic text-white mb-6 leading-tight drop-shadow-2xl">
              "I finally found a character that listens."
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/20 overflow-hidden ring-2 ring-black/50">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" alt="User" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-widest uppercase py-1">Elena R.</div>
                <div className="text-[10px] text-white/60">Storyteller & Explorer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




