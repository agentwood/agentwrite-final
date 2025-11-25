import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { verifySessionAndUpgrade } from '../services/stripeService';
import Navigation from '../components/Navigation';

const StripeSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [planDetails, setPlanDetails] = useState<{ plan: string, credits: number } | null>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const planId = searchParams.get('plan');
    
    if (!sessionId || !planId) {
        setStatus('error');
        return;
    }

    const verify = async () => {
        try {
            const result = await verifySessionAndUpgrade(sessionId, planId);
            if (result.success) {
                setPlanDetails({ plan: result.plan, credits: result.credits });
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navigation />

      <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-stone-200 shadow-xl text-center">
            {status === 'verifying' && (
                <div className="py-10">
                    <Loader2 size={48} className="text-slate-900 animate-spin mx-auto mb-6" />
                    <h2 className="font-serif text-2xl text-slate-900 mb-2">Finalizing Upgrade...</h2>
                    <p className="text-slate-500">Confirming payment with Stripe.</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="py-6 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="font-serif text-3xl text-slate-900 mb-2">Welcome to {planDetails?.plan}!</h2>
                    <p className="text-slate-500 mb-8">
                        Your account has been upgraded. You now have <span className="font-bold text-slate-900">{planDetails?.credits.toLocaleString()} credits</span> to use this month.
                    </p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        Go to Studio <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="py-6">
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="rotate-45" /> 
                    </div>
                    <h2 className="font-serif text-2xl text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-8">We couldn't verify the payment session. Please try again or contact support.</p>
                    <button 
                        onClick={() => navigate('/pricing')}
                        className="text-slate-900 font-medium hover:underline"
                    >
                        Return to Pricing
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StripeSuccessPage;