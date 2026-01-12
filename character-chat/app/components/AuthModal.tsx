'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { setSession } from '@/lib/auth';

/**
 * PRODUCTION NOTE: 
 * This modal should appear for ANY button click after the homepage loads.
 * Currently bypassed for local development testing.
 * Before production deployment, ensure this modal is triggered on first interaction.
 */

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    if (!isOpen) return null;

    const handleAppleLogin = () => {
        if (!termsAccepted) {
            alert('Please accept the terms and privacy policy to continue.');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const userId = `apple_${Date.now()}`;
            setSession({
                id: userId,
                email: 'apple.user@example.com',
                displayName: 'Apple User',
                planId: 'free',
            });
            localStorage.setItem('agentwood_age_verified', 'true');
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    const handleGoogleLogin = () => {
        if (!termsAccepted) {
            alert('Please accept the terms and privacy policy to continue.');
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            const userId = `google_${Date.now()}`;
            setSession({
                id: userId,
                email: 'google.user@example.com',
                displayName: 'Google User',
                planId: 'free',
            });
            localStorage.setItem('agentwood_age_verified', 'true');
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        if (!termsAccepted) {
            alert('Please accept the terms and privacy policy to continue.');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const userId = `user_${Date.now()}`;
            setSession({
                id: userId,
                email: email,
                displayName: email.split('@')[0],
                planId: 'free',
            });
            localStorage.setItem('agentwood_age_verified', 'true');
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-sm bg-[#111111] shadow-2xl border border-white/5 min-h-[600px]">
                {/* Left side - Auth form */}
                <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-[#111111]">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 left-6 p-2 text-white/40 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="max-w-md">
                        {/* Header */}
                        <h1 className="text-6xl md:text-7xl font-serif text-white mb-6 tracking-tight">
                            Welcome.
                        </h1>
                        <p className="text-xl text-dipsea-accent/80 font-serif italic mb-12 leading-relaxed">
                            Join the woods for exclusive stories and intimate connections.
                        </p>

                        <div className="space-y-4 mb-8">
                            {/* Apple button - WHITE */}
                            <button
                                onClick={handleAppleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                Continue with Apple
                            </button>

                            {/* Google button - WHITE */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-[1px] bg-white/5" />
                            <span className="text-white/20 text-[10px] font-bold tracking-[0.2em]">OR</span>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        {/* Email input with Submit button */}
                        <form onSubmit={handleEmailSubmit} className="mb-8">
                            <div className="relative group mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-white/20 focus:outline-none focus:border-dipsea-accent transition-all font-serif italic text-lg"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !email.trim() || !termsAccepted}
                                className="w-full px-8 py-4 bg-dipsea-accent/80 hover:bg-dipsea-accent rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Signing in...' : 'Continue with Email'}
                            </button>
                        </form>

                        {/* Terms Checkbox */}
                        <label className="flex items-start gap-3 cursor-pointer mb-6">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-dipsea-accent focus:ring-dipsea-accent focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase leading-relaxed">
                                I agree to the{' '}
                                <a href="/terms" className="text-white/60 hover:text-white border-b border-transparent hover:border-white transition-all">Terms</a>
                                {' '}and{' '}
                                <a href="/privacy" className="text-white/60 hover:text-white border-b border-transparent hover:border-white transition-all">Privacy Policy</a>
                            </span>
                        </label>
                    </div>
                </div>

                {/* Right side - Fireplace Image */}
                <div className="hidden lg:block w-[45%] relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-transparent to-transparent z-10" />
                    <img
                        src="/hero.png"
                        alt="Fireplace"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/20 z-0" />

                    {/* Close button on image side */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

