
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Feather, CheckCircle2, Wrench, AlertCircle, Wifi, WifiOff, Info, Copy } from 'lucide-react';
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
  const [showDebug, setShowDebug] = useState(false);
  
  // Status check
  const isConnected = isSupabaseConfigured();

  useEffect(() => {
    // Check if we navigated here with an intent to login
    if (location.state?.mode === 'login') {
        setIsLogin(true);
    }
  }, [location.state]);

  useEffect(() => {
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    if (isConnected && supabase) {
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
  }, [navigate, isConnected]);

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
      // Simulate user clicking "Confirm" in Google window
      setTimeout(() => {
          setSimulatedMode(true);
          enterSimulation();
      }, 1500);
  };

  const handleGoogleAuth = async (forceSimulate = false) => {
    setIsLoading(true);
    setErrorMsg(null);

    // INTELLIGENT SIMULATION DETECTION
    const shouldSimulate = !isConnected || 
                           !supabase || 
                           simulatedMode || 
                           forceSimulate;

    if (shouldSimulate) {
      console.log("Using Simulated Login (Supabase not connected or Demo Mode active).");
      mockGooglePopup();
      return;
    }

    // REAL SUPABASE GOOGLE AUTH
    try {
      const redirectUrl = window.location.origin;
      console.log("Attempting Google Auth with Redirect URL:", redirectUrl);
      
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
      console.warn("Google Auth Failed:", error);
      
      // Check for common configuration errors
      if (error.message?.includes('redirect_uri') || error.message?.includes('callback URL')) {
          setErrorMsg("Configuration Error: The Redirect URL in Supabase does not match this site.");
          setShowDebug(true); // Auto-show debug info
          setIsLoading(false);
      } else {
          // Fallback to simulation for other errors so user isn't stuck
          console.log("Switching to Demo Mode due to auth failure.");
          mockGooglePopup();
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    
    const shouldSimulate = !isConnected || !supabase || simulatedMode;

    if (shouldSimulate) {
      setTimeout(enterSimulation, 1000);
      return;
    }

    // REAL SUPABASE EMAIL AUTH
    try {
      if (isLogin) {
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
          });
          if (error) throw error;
          if (data.user) navigate('/onboarding');
      } else {
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
      
      // Fallback for demo convenience
      if (error.message?.includes('configure') || error.message?.includes('provider') || error.message?.includes('API key')) {
           console.log("Backend issue detected. Starting Demo Mode...");
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

  const copyRedirectUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    alert("URL copied! Paste this into Supabase > Auth > URL Configuration.");
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
                   </div>
               </div>
               <div className="bg-gray-50 px-8 py-4 text-xs text-gray-500 text-center border-t border-gray-100">
                   This is a simulation because the backend is not fully configured yet.
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
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded text-xs text-rose-700 flex flex-col items-start gap-1 animate-fade-in">
                        <div className="flex items-center gap-2 font-bold"><AlertCircle size={14}/> Error</div>
                        <p>{errorMsg}</p>
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
                   onClick={() => setShowDebug(!showDebug)}
                   className={`flex items-center justify-center gap-2 text-[10px] p-2 rounded border w-full transition-colors ${isConnected ? 'text-green-600 bg-green-50 border-green-100' : 'text-slate-400 bg-slate-50 border-slate-100 hover:bg-slate-100'}`}
                >
                    {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />} 
                    {isConnected ? "Supabase Connected" : "Backend Not Connected"}
                    <Info size={12} className="ml-1 opacity-50" />
                </button>
                
                {showDebug && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left animate-fade-in">
                        <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider flex items-center gap-2">
                             <Wrench size={12} /> Configuration Helper
                        </h4>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            For Google Login to work, this exact URL must be in your Supabase Redirect list.
                        </p>
                        
                        <div className="flex gap-2">
                            <code className="flex-1 bg-white border border-stone-200 p-2 rounded text-[10px] text-slate-600 font-mono break-all">
                                {window.location.origin}
                            </code>
                            <button onClick={copyRedirectUrl} className="p-2 bg-white border border-stone-200 rounded hover:bg-slate-100 text-slate-500">
                                <Copy size={14} />
                            </button>
                        </div>
                        <div className="mt-3 text-[10px] text-slate-400">
                            {"Go to: Supabase Dashboard > Authentication > URL Configuration > Redirect URLs"}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
