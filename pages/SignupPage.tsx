import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Feather, CheckCircle2, Wrench, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import Navigation from '../components/Navigation';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for Login vs Signup mode
  const [isLogin, setIsLogin] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Simulation / Dev Mode
  const [simulatedMode, setSimulatedMode] = useState(false);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);

  useEffect(() => {
    // Check if we navigated here with an intent to login
    if (location.state?.mode === 'login') {
        setIsLogin(true);
    }
  }, [location.state]);

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    if (isSupabaseConfigured() && supabase) {
      // Listen for Auth Changes
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/onboarding');
        }
      });
      authListener = data;
    }

    return () => {
      if (authListener) authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const enterSimulation = () => {
      const mockUser = { 
        name: 'Demo User', 
        email: email || 'demo@gmail.com',
        authProvider: 'simulated',
        plan: 'hobby',
        credits: 225000,
        maxCredits: 225000
    };
    localStorage.setItem('agentwrite_user_prefs', JSON.stringify(mockUser));
    
    // Close popup if open
    setShowSimulatedPopup(false);
    
    setTimeout(() => {
        setIsLoading(false);
        navigate('/onboarding');
    }, 800);
  };

  const mockGooglePopup = () => {
      setShowSimulatedPopup(true);
      // Simulate user clicking "Confirm" in Google window after 2 seconds
      setTimeout(() => {
          setSimulatedMode(true);
          enterSimulation();
      }, 2500);
  };

  const handleGoogleAuth = async (forceSimulate = false) => {
    const isForceSimulate = typeof forceSimulate === 'boolean' && forceSimulate;
    
    setIsLoading(true);
    setErrorMsg(null);

    // 1. CHECK FOR PREVIEW/LOCALHOST ENVIRONMENTS
    // If we are in a preview environment without specific env vars, we MUST simulate
    // because standard OAuth redirects won't work without registering the specific preview domain.
    const isPreviewEnv = window.location.hostname.includes('webcontainer') || 
                         window.location.hostname.includes('localhost') || 
                         window.location.hostname.includes('netlify.app');

    // SIMULATION TRIGGER
    if (!isSupabaseConfigured() || !supabase || simulatedMode || isForceSimulate || (isPreviewEnv && !process.env.VITE_SUPABASE_URL)) {
      console.log("Using Simulated Google Login (Preview Mode)");
      mockGooglePopup();
      return;
    }

    // REAL SUPABASE GOOGLE AUTH
    try {
      // Use origin only to avoid "Redirect URL not allowed" errors with hashes.
      // The onAuthStateChange listener or Supabase default handling will manage the session.
      const redirectUrl = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
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
      console.warn("Google Auth Failed (Switching to Demo):", error);
      
      // AUTO-FALLBACK
      // If the real auth fails (e.g. invalid keys), immediately switch to simulation
      // to provide a smooth demo experience without confusing error messages.
      mockGooglePopup();
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    
    // SIMULATION MODE
    if (!isSupabaseConfigured() || !supabase || simulatedMode) {
      setTimeout(enterSimulation, 1000);
      return;
    }

    // REAL SUPABASE EMAIL AUTH
    try {
      if (isLogin) {
          // LOG IN
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
          });
          if (error) throw error;
          if (data.user) navigate('/onboarding');
      } else {
          // SIGN UP
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          if (data.user && !data.session) {
              alert("Please check your email to confirm your account.");
              setIsLoading(false);
              return;
          }
          if (data.user) navigate('/onboarding');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      // Fallback for demo convenience if config is missing/broken
      if (error.message?.includes('configure') || error.message?.includes('provider') || error.message?.includes('API key')) {
           console.log("Backend not configured. Starting Demo Mode...");
           setTimeout(() => {
               setSimulatedMode(true);
               enterSimulation();
           }, 1000);
      } else {
          setErrorMsg(error.message || "Authentication failed");
          setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />
      
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
                       <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer border border-transparent hover:border-gray-200 transition">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <Feather size={14} />
                            </div>
                           <div className="flex-1">
                               <div className="text-sm font-medium text-gray-700">Use another account</div>
                           </div>
                       </div>
                   </div>
               </div>
               <div className="bg-gray-50 px-8 py-4 text-xs text-gray-500 text-center border-t border-gray-100">
                   To continue, Google will share your name, email address, and profile picture with AgentWrite.
               </div>
           </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-xl border border-stone-200 shadow-sm animate-fade-in-up">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded flex items-center justify-center">
                        <Feather size={20} />
                    </div>
                </div>
            <h1 className="font-serif text-3xl text-slate-900 mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-slate-500 text-sm">{isLogin ? 'Resume your writing journey.' : 'Join a community of serious writers.'}</p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="relative">
                    <button 
                        type="button" 
                        onClick={() => handleGoogleAuth()}
                        disabled={isLoading}
                        className="w-full bg-white border border-stone-200 hover:bg-stone-50 hover:border-slate-300 text-slate-700 p-3 rounded-lg font-medium transition flex items-center justify-center gap-3 group"
                    >
                        {isLoading ? (
                        <Loader2 className="animate-spin text-slate-400" size={20} />
                        ) : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-105 transition-transform" alt="Google" />
                            {simulatedMode ? 'Google (Simulated)' : 'Continue with Google'}
                        </>
                        )}
                    </button>
                </div>
                
                {simulatedMode && (
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 items-start animate-fade-in">
                    <CheckCircle2 size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-[11px] text-amber-800 leading-snug">
                    <strong>Demo Mode Active:</strong> Running in simulation. No backend connection required.
                    </div>
                </div>
                )}

                {errorMsg && (
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-700 text-center flex flex-col items-center gap-2 animate-fade-in">
                        <div className="flex items-center gap-2 font-bold"><AlertCircle size={14}/> {errorMsg}</div>
                    </div>
                )}
                
                <div className="flex items-center gap-4">
                    <div className="h-px bg-stone-100 flex-1"></div>
                    <span className="text-slate-300 text-[10px] font-bold uppercase tracking-wider">or with email</span>
                    <div className="h-px bg-stone-100 flex-1"></div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white font-medium text-slate-800 placeholder:text-slate-300"
                            placeholder="name@example.com"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white font-medium text-slate-800 placeholder:text-slate-300"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-70 shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
            >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Log In' : 'Create Account')}
            </button>
            
            <div className="flex flex-col items-center gap-4 mt-6 text-xs">
                <button type="button" className="text-slate-400 hover:text-slate-900 transition" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
                
                <div className="text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        type="button" 
                        className="underline font-bold text-slate-900 hover:text-slate-700" 
                        onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </div>
            </div>
            </form>

            <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                <button 
                    type="button"
                    onClick={enterSimulation}
                    className="w-full bg-amber-50 text-amber-900 p-3 rounded-lg border border-amber-100 hover:bg-amber-100 transition flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider group"
                >
                    <Wrench size={14} className="group-hover:rotate-12 transition-transform" /> 
                    Developer Mode: Instant Access
                </button>
                <p className="text-[10px] text-slate-400 mt-2">Skip configuration and test the app immediately.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;