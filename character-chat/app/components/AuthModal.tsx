'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { setSession } from '@/lib/auth';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleAppleLogin = () => {
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
                            Join the wood for exclusive stories and intimate connections.
                        </p>

                        <div className="space-y-4 mb-8">
                            {/* Apple button */}
                            <button
                                onClick={handleAppleLogin}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300"
                            >
                                Continue with Apple
                            </button>

                            {/* Google button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-300"
                            >
                                Continue with Google
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-[1px] bg-white/5" />
                            <span className="text-white/20 text-[10px] font-bold tracking-[0.2em]">OR</span>
                            <div className="flex-1 h-[1px] bg-white/5" />
                        </div>

                        {/* Email input */}
                        <form onSubmit={handleEmailSubmit} className="mb-12">
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full bg-transparent border-b border-white/10 py-4 text-white placeholder-white/20 focus:outline-none focus:border-dipsea-accent transition-all font-serif italic text-lg pr-12"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !email.trim()}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-dipsea-accent hover:text-white transition-all disabled:opacity-0 group-focus-within:opacity-100"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <p className="text-white/20 text-[9px] font-bold tracking-[0.3em] uppercase">
                            BY ENTERING, YOU AGREE TO OUR{' '}
                            <a href="/terms" className="hover:text-white border-b border-transparent hover:border-white transition-all">TERMS</a>
                            {' '}&{' '}
                            <a href="/privacy" className="hover:text-white border-b border-transparent hover:border-white transition-all">PRIVACY</a>
                        </p>
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

                    {/* Close button on image side too if needed for mobile/other layouts, but we have one on left */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    {/* Floating Text overlay like in some high-end designs? Optional */}
                </div>
            </div>
        </div>
    );
}
