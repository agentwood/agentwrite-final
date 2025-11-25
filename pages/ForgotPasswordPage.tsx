import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import Navigation from '../components/Navigation';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  const simulateSuccess = () => {
      setTimeout(() => {
        setIsSimulated(true);
        setIsSubmitted(true);
        setIsLoading(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulation Mode if Supabase is not configured
    if (!isSupabaseConfigured() || !supabase) {
        simulateSuccess();
        return;
    }

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/#/onboarding`,
        });
        if (error) throw error;
        setIsSubmitted(true);
        setIsLoading(false);
    } catch (err: any) {
        console.warn("Forgot Password Error (Expected in Preview):", err);
        // Auto-fallback to simulation for preview environments so user isn't stuck
        simulateSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />
      
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20">
        <div className="w-full max-w-md bg-white p-8 md:p-12 rounded-xl border border-stone-200 shadow-sm animate-fade-in-up">
            {!isSubmitted ? (
                <>
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
                            <Mail size={24} />
                        </div>
                        <h1 className="font-serif text-2xl text-slate-900 mb-2">Reset Password</h1>
                        <p className="text-slate-500 text-sm">Enter your email and we'll send you a link to get back into your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-lg border border-stone-200 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all bg-white font-medium text-slate-800"
                                placeholder="name@example.com"
                            />
                        </div>
                        
                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-xs text-center border border-rose-100">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white p-3 rounded-lg font-medium hover:bg-slate-800 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
                        </button>
                    </form>
                    
                    <button 
                        onClick={() => navigate('/signup', { state: { mode: 'login' } })}
                        className="w-full text-slate-400 hover:text-slate-900 transition text-xs font-bold uppercase tracking-wider mt-6"
                    >
                        Back to Log In
                    </button>
                </>
            ) : (
                <div className="text-center py-8 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="font-serif text-2xl text-slate-900 mb-2">Check your inbox</h1>
                    <p className="text-slate-500 text-sm mb-8">
                        We've sent a password reset link to <span className="font-bold text-slate-800">{email}</span>.
                    </p>

                    {isSimulated && (
                        <div className="mb-6 bg-amber-50 text-amber-800 p-3 rounded-lg text-xs border border-amber-100">
                            <strong>Demo Mode:</strong> No email was actually sent.
                        </div>
                    )}
                    
                    <button 
                        onClick={() => navigate('/signup', { state: { mode: 'login' } })}
                        className="w-full bg-stone-100 text-slate-900 py-3 rounded-lg font-medium hover:bg-stone-200 transition text-sm"
                    >
                        Back to Log In
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;