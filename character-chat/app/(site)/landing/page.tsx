'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Terminal, ChevronRight, ChevronLeft, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
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
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scrollingCharacters, setScrollingCharacters] = useState<Character[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);
  const slideInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isConnected = isSupabaseConfigured();

  // Fetch featured characters for slideshow and random characters for cards
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        // Fetch all characters to get a random set
        const response = await fetch('/api/characters');
        if (response.ok) {
          const data = await response.json();
          const allPersonas = data.personas || [];
          
          // Get featured characters for slideshow (first 6)
          const featured = allPersonas.filter((p: any) => p.featured).slice(0, 6);
          
          // If we have featured, use them; otherwise use first 6
          const slideshowChars = featured.length > 0 ? featured : allPersonas.slice(0, 6);
          setCharacters(slideshowChars);
          
          // For the scrolling cards, shuffle and take 20 random characters
          const shuffled = [...allPersonas].sort(() => Math.random() - 0.5);
          const randomChars = shuffled.slice(0, 20);
          setScrollingCharacters(randomChars);
        }
      } catch (error) {
        console.error('Error fetching characters:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacters();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (!loading && characters.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % characters.length);
      }, 5000);
    }
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [loading, characters]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % characters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  const handleManualSlide = (direction: 'next' | 'prev') => {
    if (slideInterval.current) clearInterval(slideInterval.current);
    if (direction === 'next') nextSlide();
    else prevSlide();
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % characters.length);
    }, 5000);
  };

  const enterSimulation = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:95',message:'enterSimulation called',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    setSimulatedMode(true);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSession({
      id: userId,
      email: 'demo@gmail.com',
      displayName: 'Demo User',
      planId: 'free',
    });
    // Don't auto-verify age - user must verify manually
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:104',message:'Before router.push in enterSimulation',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    setIsLoading(false); // Ensure loading is cleared
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:115',message:'Redirecting to /home',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    router.push('/home');
  };

  const mockGooglePopup = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:108',message:'mockGooglePopup called',data:{isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    setShowSimulatedPopup(true);
    setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:112',message:'setTimeout callback executing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      setShowSimulatedPopup(false);
      enterSimulation();
    }, 1500);
  };

  const handleGoogleAuth = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:116',message:'handleGoogleAuth called',data:{isConnected,hasSupabase:!!supabase,simulatedMode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    setIsLoading(true);
    setErrorMsg(null);
    setIsConfigError(false);

    const shouldSimulate = !isConnected || !supabase || simulatedMode;
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:121',message:'Auth check result',data:{shouldSimulate,isConnected,hasSupabase:!!supabase,simulatedMode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (shouldSimulate) {
      console.log("Using Simulated Login (Supabase not connected or Demo Mode active).");
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:125',message:'Entering simulated mode',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      mockGooglePopup();
      return;
    }

    // REAL SUPABASE GOOGLE AUTH
    try {
      const redirectUrl = window.location.origin;
      console.log("Attempting Google Auth with Redirect URL:", redirectUrl);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:132',message:'Before signInWithOAuth',data:{redirectUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
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
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:144',message:'After signInWithOAuth',data:{hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (error) throw error;
      
      // OAuth redirect will happen, so don't clear loading here
      // The page will redirect to Google, then back to our site
    } catch (error: any) {
      console.warn("Google Auth Failed:", error);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:147',message:'Google Auth error caught',data:{errorMessage:error?.message,errorType:error?.constructor?.name,isRedirectError:error?.message?.includes('redirect_uri')||error?.message?.includes('callback URL')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (error.message?.includes('redirect_uri') || error.message?.includes('callback URL')) {
        setErrorMsg("Configuration Error: The Redirect URL in Supabase does not match this site.");
        setIsConfigError(true);
        setIsLoading(false);
      } else {
        console.log("Switching to Demo Mode due to auth failure.");
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/(site)/landing/page.tsx:154',message:'Falling back to demo mode',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        mockGooglePopup();
        // Note: setIsLoading(false) will be called in enterSimulation()
      }
    }
  };

  const handleEmailSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-white text-gray-900">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-100 rounded-full blur-[100px] pointer-events-none" />

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
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105">
            <span className="font-serif italic font-bold text-xl">A</span>
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-gray-900">
            (agentwood.ai)
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Home</Link>
          <Link href="/discover" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Discover</Link>
          <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Log in</Link>
          <Button variant="primary" className="!px-6 !py-2.5 text-sm" onClick={() => router.push('/')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Main Split Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-32 z-10 py-12 lg:py-0">
        
        {/* Left Column: Value Prop & Auth */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-start space-y-10 lg:pr-10">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              10,432 Active Agents Online
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif leading-[1] tracking-tight text-gray-900">
              Talk. Create. <br/>
              <span className="italic bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">Discover.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-lg leading-relaxed font-light">
              Have conversations with over 10,000 different characters, create and discover unique content curated, only on Agentwood.
            </p>
          </div>

          <div className="w-full space-y-4 pt-2">
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
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                simulatedMode ? 'Google (Simulated)' : 'Continue with Google'
              )}
            </Button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium tracking-widest">Or access with</span>
              </div>
            </div>

            <Button 
              fullWidth 
              variant="ghost" 
              icon={<Mail size={18} />} 
              className="border border-transparent hover:border-gray-200"
              onClick={handleEmailSignUp}
              disabled={isLoading}
            >
              Continue with Email
            </Button>

            {simulatedMode && (
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 items-start animate-fade-in">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-amber-800 leading-snug">
                  <strong>Demo Mode Active:</strong> Running in simulation. No backend connection required.
                </div>
              </div>
            )}

            {errorMsg && (
              <div className={`p-3 rounded-lg text-xs flex flex-col items-start gap-1 animate-fade-in ${isConfigError ? 'bg-amber-50 border border-amber-100 text-amber-800' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                <div className="flex items-center gap-2 font-bold">
                  {isConfigError ? <AlertTriangle size={14}/> : <AlertCircle size={14}/>} 
                  {isConfigError ? 'Setup Required' : 'Error'}
                </div>
                <p>{errorMsg}</p>
              </div>
            )}

            <p className="text-[10px] text-gray-400 text-center mt-6">
              By entering the woods, you agree to our <Link href="/terms" className="underline text-gray-600 hover:text-black">Terms</Link> and <Link href="/privacy" className="underline text-gray-600 hover:text-black">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Right Column: Character Slideshow */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative min-h-[700px] lg:min-h-[900px]">
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
            style={{ 
              backgroundImage: 'linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }}
          ></div>

          <div className="relative w-full max-w-xl">
            {/* Background decorative cards */}
            <div className="absolute top-0 inset-x-0 h-full bg-gray-100 rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[5rem] rounded-bl-[5rem] transform rotate-3 scale-95 opacity-50 border border-gray-200"></div>
            <div className="absolute top-0 inset-x-0 h-full bg-amber-50 rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[5rem] rounded-bl-[5rem] transform -rotate-2 scale-90 opacity-40 border border-amber-100"></div>

            <div className="relative w-full aspect-[3.5/5] z-10">
              {loading ? (
                <div className="w-full h-full bg-white rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[5rem] rounded-bl-[5rem] flex items-center justify-center shadow-xl border border-gray-200">
                  <div className="text-center">
                    <Terminal size={40} className="mx-auto text-gray-300 mb-6 animate-spin" />
                    <p className="text-base font-medium text-gray-400">Summoning Agents...</p>
                  </div>
                </div>
              ) : characters.length > 0 ? (
                characters.map((char, index) => (
                  <div 
                    key={char.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform origin-center ${
                      index === currentIndex 
                        ? 'opacity-100 scale-100 translate-y-0 z-20 shadow-2xl blur-none' 
                        : 'opacity-0 scale-90 translate-y-4 z-0 shadow-none blur-sm pointer-events-none'
                    }`}
                  >
                    <div className="p-8 md:p-12 rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[5rem] rounded-bl-[5rem] flex flex-col items-center text-center justify-center h-full bg-white shadow-2xl border border-white/50">
                      <div className="flex-1 flex flex-col items-center justify-center w-full">
                        <div className="relative mb-8 group">
                          <img 
                            src={char.avatarUrl} 
                            alt={char.name} 
                            className="relative w-48 h-48 md:w-64 md:h-64 rounded-[2rem] object-cover shadow-2xl ring-1 ring-black/5 rotate-3 hover:rotate-0 transition-transform duration-500 ease-out"
                          />
                        </div>
                        
                        <div className="inline-block px-5 py-2 mb-6 text-[10px] font-bold tracking-[0.25em] text-amber-600 uppercase border border-amber-200 rounded-full bg-amber-50/80">
                          {char.category}
                        </div>
                        
                        <h3 className="text-4xl md:text-5xl font-serif italic text-gray-900 mb-4 tracking-tight">{char.name}</h3>
                        {char.tagline && (
                          <p className="text-base font-medium text-gray-500 mb-8 italic max-w-[90%] leading-relaxed">"{char.tagline}"</p>
                        )}
                        
                        <div className="w-12 h-1 bg-gray-900 rounded-full mb-8 opacity-10"></div>

                        {char.description && (
                          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-sm font-light">
                            {char.description.split('//')[1]?.trim() || char.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full bg-white rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[5rem] rounded-bl-[5rem] flex items-center justify-center shadow-xl border border-gray-200">
                  <p className="text-base font-medium text-gray-400">No characters available</p>
                </div>
              )}
            </div>

            {/* Slideshow Controls */}
            {characters.length > 1 && (
              <div className="absolute -bottom-24 left-0 right-0 flex items-center justify-between px-6">
                <button 
                  onClick={() => handleManualSlide('prev')}
                  className="w-14 h-14 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black flex items-center justify-center transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex gap-3">
                  {characters.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        if(slideInterval.current) clearInterval(slideInterval.current);
                        setCurrentIndex(idx);
                        slideInterval.current = setInterval(() => {
                          setCurrentIndex((prev) => (prev + 1) % characters.length);
                        }, 5000);
                      }}
                      className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-10 bg-black' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={() => handleManualSlide('next')}
                  className="w-14 h-14 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black flex items-center justify-center transition-all shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            {/* Floating Badge */}
            {characters.length > 0 && (
              <div className="absolute -top-12 -right-8 bg-white px-6 py-4 rounded-2xl flex items-center gap-4 animate-bounce bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-50 z-30">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-lg">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Featured</p>
                  <p className="text-sm font-bold text-gray-900">Top Rated Agent</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Scrolling Character Cards Section */}
      <section className="w-full py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-3">
              Explore Characters
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
              Discover our collection of AI characters ready to chat
            </p>
            
            {/* HUMAN vs FANTASY Category Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Link
                href="/discover?type=human"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                👤 Human Characters
              </Link>
              <Link
                href="/discover?type=fantasy"
                className="px-8 py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ✨ Fantasy Waifus
              </Link>
            </div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="relative">
            {/* Gradient fade on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 via-gray-50 to-transparent z-10 pointer-events-none"></div>
            
            <div className="overflow-x-auto no-scrollbar pb-6 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
              <div className="flex gap-6" style={{ width: 'max-content' }}>
                {scrollingCharacters.length > 0 ? (
                  scrollingCharacters.map((char, index) => (
                    <Link
                      key={`${char.id}-${index}`}
                      href={`/c/${char.id}`}
                      className="group flex-shrink-0 w-[300px] bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-amber-300 transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
                    >
                      {/* Image Section */}
                      <div className="relative h-[380px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={char.avatarUrl}
                          alt={char.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Hover text */}
                        <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <p className="text-white text-base font-bold">Chat now →</p>
                        </div>
                        {/* Category badge */}
                        <div className="absolute top-4 left-4">
                          <span className="inline-block px-4 py-1.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase border border-amber-300 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                            {char.category}
                          </span>
                        </div>
                      </div>
                      
                      {/* Content Section */}
                      <div className="p-6">
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                          {char.name}
                        </h3>
                        {char.tagline && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed italic">
                            "{char.tagline}"
                          </p>
                        )}
                        {char.description && (
                          <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                            {char.description.split('//')[1]?.trim() || char.description}
                          </p>
                        )}
                        {/* Decorative line */}
                        <div className="w-12 h-0.5 bg-amber-200 rounded-full mt-4 group-hover:bg-amber-400 transition-colors"></div>
                      </div>
                    </Link>
                  ))
                ) : loading ? (
                  <div className="flex items-center justify-center w-full py-20">
                    <div className="text-center">
                      <Terminal size={40} className="mx-auto text-gray-300 mb-4 animate-spin-slow" />
                      <p className="text-gray-400">Loading characters...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full py-20">
                    <p className="text-gray-400">No characters available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Scroll hint */}
          {scrollingCharacters.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <span>←</span>
                <span>Scroll to explore more characters</span>
                <span>→</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
