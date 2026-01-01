'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Terminal, ChevronRight, ChevronLeft, Loader2, AlertCircle, AlertTriangle, Sparkles, Users, Flame } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/components/Button';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { setSession } from '@/lib/auth';
import Footer from '@/app/components/Footer';

interface Character {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  avatarUrl: string;
  category: string;
  totalChats?: string;
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(3);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);
  const isConnected = isSupabaseConfigured();

  // Fetch characters
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          const allPersonas = data.personas || [];
          setCharacters(allPersonas.slice(0, 12));
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  const enterSimulation = () => {
    setSimulatedMode(true);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSession({
      id: userId,
      email: 'demo@gmail.com',
      displayName: 'Demo User',
      planId: 'free',
    });
    setIsLoading(false);
    router.push('/home');
  };

  const mockGooglePopup = () => {
    setShowSimulatedPopup(true);
    setTimeout(() => {
      setShowSimulatedPopup(false);
      enterSimulation();
    }, 1500);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsConfigError(false);

    const shouldSimulate = !isConnected || !supabase || simulatedMode;

    if (shouldSimulate) {
      mockGooglePopup();
      return;
    }

    try {
      const redirectUrl = window.location.origin;
      const { error } = await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
          }
        },
      });
      if (error) throw error;
    } catch (error: any) {
      if (error.message?.includes('redirect_uri') || error.message?.includes('callback URL')) {
        setErrorMsg("Configuration Error: The Redirect URL in Supabase does not match this site.");
        setIsConfigError(true);
        setIsLoading(false);
      } else {
        mockGooglePopup();
      }
    }
  };

  const handleEmailSignUp = () => {
    router.push('/signup');
  };

  const nextCarousel = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, characters.length - 1));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-[#0f0f0f] text-white">

      {/* SIMULATED GOOGLE POPUP */}
      {showSimulatedPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-[400px] rounded-lg shadow-2xl overflow-hidden border border-gray-200">
            <div className="h-1.5 bg-blue-500 w-full animate-pulse"></div>
            <div className="p-8 flex flex-col items-center">
              <div className="w-12 h-12 bg-white rounded-full p-2 mb-4 shadow-sm border border-gray-100">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-full h-full" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Sign in with Google</h3>
              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer border border-transparent hover:border-gray-200 transition">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">D</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700">Demo User</div>
                    <div className="text-xs text-gray-500">demo@gmail.com</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 text-xs text-gray-500 text-center border-t border-gray-100">
              This is a simulation because the backend is not fully configured yet.
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-lg transition-transform group-hover:scale-105">
            <span className="font-serif italic font-bold text-xl">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            agentwood
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/discover" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Discover</Link>
          <Link href="/create" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Create</Link>
          <Link href="/video" className="text-sm font-medium text-white/60 hover:text-white transition-colors">AvatarFX</Link>
          <Link href="/library" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Library</Link>
          <Link href="/voice-studio" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Voice Studio</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/pricing"
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            Upgrade
          </Link>
          <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION 1: Remix Iconic Comics */}
      <section className="w-full py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-white/10">
            {/* Comic book background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-pink-500/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-2/3 h-full bg-cover bg-center" style={{
                backgroundImage: 'url(/comic-bg.jpg)',
                filter: 'grayscale(50%)'
              }}></div>
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
              {/* Left: Text content */}
              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-400 uppercase tracking-wider mb-6 w-fit">
                  <Flame size={14} className="text-orange-500" />
                  NANO BANANA PRO
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  Remix Iconic<br />Comics Your Way
                </h2>

                <p className="text-white/50 text-lg mb-8">
                  New upgrade, more free tries
                </p>

                <button
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  className="px-8 py-3 bg-[#4da6ff] text-white rounded-full font-bold text-sm hover:bg-[#3d96ef] transition-colors w-fit flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  GO
                </button>
              </div>

              {/* Right: Featured character card */}
              <div className="flex items-center justify-center lg:justify-end">
                {characters.length > 0 && (
                  <div className="relative">
                    {/* Floating question bubble */}
                    <div className="absolute -top-4 -right-4 z-20 bg-white text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Are you avoiding me?
                    </div>

                    {/* Character Card */}
                    <div className="relative w-56 aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-b from-pink-200 to-pink-300 shadow-2xl border-4 border-white/20">
                      {characters[0]?.avatarUrl ? (
                        <img src={characters[0].avatarUrl} className="w-full h-full object-cover" alt={characters[0].name} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-4xl">
                          {characters[0]?.name?.charAt(0) || 'B'}
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white font-bold text-lg">{characters[0]?.name || 'Bella Swan'}</p>
                        <p className="text-white/60 text-xs">{characters[0]?.totalChats || '5.5K'} CHATS</p>
                      </div>
                    </div>

                    {/* Background decorative characters */}
                    {characters.slice(1, 4).map((char, i) => (
                      <div
                        key={i}
                        className={`absolute w-20 h-28 rounded-xl overflow-hidden opacity-60 border-2 border-white/10 shadow-lg ${i === 0 ? 'top-10 -left-24 rotate-[-8deg]' :
                            i === 1 ? '-bottom-4 -left-12 rotate-[5deg]' :
                              'top-1/2 -right-20 rotate-[10deg]'
                          }`}
                      >
                        {char.avatarUrl ? (
                          <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {char.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HERO SECTION 2: Looking for Connections */}
      <section className="w-full py-16 px-6 bg-gradient-to-b from-[#0f0f0f] to-[#1a1020]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Text and category buttons */}
            <div className="flex flex-col justify-center">
              <p className="text-white/40 text-sm tracking-wider mb-2 flex items-center gap-2">
                ARE YOU... <Sparkles size={12} className="text-white/40" />
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
                Looking for<br />connections?
              </h2>

              {/* Category icons */}
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">
                  😊
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl hover:scale-110 transition-transform border border-white/10">
                  😐
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl hover:scale-110 transition-transform border border-white/10">
                  🐱
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl hover:scale-110 transition-transform border border-white/10">
                  🤖
                </button>
              </div>
            </div>

            {/* Right: Character carousel */}
            <div className="lg:col-span-2 relative">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevCarousel}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 flex-shrink-0"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-end justify-center gap-3 py-4">
                    {characters.slice(0, 7).map((char, i) => {
                      const isCenter = i === carouselIndex;
                      const distance = Math.abs(i - carouselIndex);

                      return (
                        <div
                          key={char.id}
                          onClick={() => setCarouselIndex(i)}
                          className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${isCenter
                              ? 'w-44 h-64 z-10'
                              : distance === 1
                                ? 'w-32 h-48 opacity-80'
                                : 'w-24 h-40 opacity-50'
                            }`}
                        >
                          <div className={`w-full h-full rounded-2xl overflow-hidden border-2 transition-all ${isCenter ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-white/10'
                            }`}>
                            {char.avatarUrl ? (
                              <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                                {char.name.charAt(0)}
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                              <p className="text-white font-medium text-sm truncate">{char.name}</p>
                              <p className="text-white/50 text-xs">💬 {char.totalChats || '5K'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={nextCarousel}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10 flex-shrink-0"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Selected character info */}
              {characters[carouselIndex] && (
                <div className="text-center mt-6">
                  <p className="text-lg font-bold text-white">{characters[carouselIndex].name}</p>
                  <p className="text-white/40 text-sm">💬 {characters[carouselIndex].totalChats || '1.2M'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section className="w-full py-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to explore?</h2>
            <p className="text-white/60">Join thousands of users already chatting</p>
          </div>

          <div className="space-y-4">
            <Button
              fullWidth
              variant="outline"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="!bg-white/10 !border-white/20 hover:!bg-white/20"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Continue with Google'
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f0f] px-3 text-white/40 font-medium tracking-widest">Or</span>
              </div>
            </div>

            <Button
              fullWidth
              variant="ghost"
              icon={<Mail size={18} />}
              className="!border-white/10 hover:!bg-white/10"
              onClick={handleEmailSignUp}
              disabled={isLoading}
            >
              Continue with Email
            </Button>

            {errorMsg && (
              <div className={`p-3 rounded-lg text-xs flex flex-col items-start gap-1 ${isConfigError ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400' : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'}`}>
                <div className="flex items-center gap-2 font-bold">
                  {isConfigError ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
                  {isConfigError ? 'Setup Required' : 'Error'}
                </div>
                <p>{errorMsg}</p>
              </div>
            )}

            <p className="text-[10px] text-white/30 text-center mt-6">
              By entering, you agree to our <Link href="/terms" className="underline hover:text-white/60">Terms</Link> and <Link href="/privacy" className="underline hover:text-white/60">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
