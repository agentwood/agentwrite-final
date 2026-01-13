'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email) {
            setError('Please enter your email address.');
            setIsLoading(false);
            return;
        }

        try {
            if (!supabase) {
                throw new Error("Supabase is not configured.");
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
            });

            if (error) throw error;

            setIsSubmitted(true);
            toast.success('Password reset email sent!');
        } catch (e: any) {
            console.error("Reset failed:", e);
            setError(e.message || "Failed to send reset email");
            toast.error(e.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div className="w-full max-w-lg bg-[#0f0f0f] rounded-3xl overflow-hidden shadow-2xl relative animate-fade-in-up border border-white/5">

                {/* Close Button */}
                <button
                    onClick={() => router.push('/login')}
                    className="absolute top-6 right-6 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all text-white/60 hover:text-white backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-12 relative bg-[#120b18]">
                    {/* Background Gradient */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-900/10 via-[#120b18] to-[#120b18] pointer-events-none" />

                    <div className="relative z-10">
                        <div className="mb-8">
                            <Link href="/login" className="inline-flex items-center text-white/40 hover:text-white text-xs font-bold uppercase tracking-wider mb-6 transition-colors">
                                <ArrowLeft size={14} className="mr-2" />
                                Back to Login
                            </Link>

                            <h1 className="text-3xl font-serif italic text-white mb-2 tracking-tight">Recover Password.</h1>
                            <p className="text-white/40 text-sm leading-relaxed">
                                Enter the email associated with your account and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-white/20 transition-colors group">
                                    <label className="block text-[10px] font-bold text-white/30 mb-1 group-focus-within:text-purple-400 transition-colors">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none"
                                        placeholder="sarah@example.com"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-xs text-red-400 flex items-center gap-2 justify-center bg-red-900/10 py-2 rounded-lg border border-red-900/20">
                                        <AlertCircle size={12} />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl text-white font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send Recovery Link'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 animate-fade-in">
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                    <Mail size={24} />
                                </div>
                                <h3 className="text-white font-bold mb-2">Check your email</h3>
                                <p className="text-white/40 text-sm px-4">
                                    We've sent a recovery link to <strong>{email}</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
