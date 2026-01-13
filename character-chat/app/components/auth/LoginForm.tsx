'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { setSession } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // --- REAL SUPABASE AUTH LOGIC ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        if (!formData.email || !formData.password) {
            setErrors({ submit: 'Please fill in all fields.' });
            toast.error('Please fill in all fields.');
            setIsLoading(false);
            return;
        }

        try {
            if (!supabase) {
                throw new Error("Supabase is not configured. Please check your environment variables.");
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data?.session) {
                // Set local session helper for app compatibility
                setSession({
                    id: data.user.id,
                    email: data.user.email,
                    displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
                    planId: 'free',
                });

                // Also explicitly set the cookie for middleware immediately
                const date = new Date();
                date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
                document.cookie = `agentwood_token=${data.user.id}; expires=${date.toUTCString()}; path=/`;

                toast.success('Welcome back!');

                // Force hard navigation to ensure state is clean
                window.location.href = '/home';
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setErrors({ submit: error.message || "Invalid login credentials" });
            toast.error(error.message || "Login failed");
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = async (provider: 'google' | 'apple') => {
        setIsLoading(true);
        try {
            if (!supabase) {
                throw new Error("Supabase is not configured.");
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
            // Supabase handles the redirect automatically
        } catch (error: any) {
            console.error('OAuth error:', error);
            toast.error(`Error connecting to ${provider}: ${error.message}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div className="w-full max-w-5xl bg-[#0f0f0f] rounded-3xl overflow-hidden shadow-2xl flex relative min-h-[600px] animate-fade-in-up">

                {/* Close Button */}
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-6 right-6 z-50 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-all text-white/60 hover:text-white backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* LEFT SIDE - FORM */}
                <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center relative bg-[#120b18]">
                    {/* Background Gradient for Left Side */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-900/20 via-[#120b18] to-[#120b18] pointer-events-none" />

                    <div className="max-w-sm mx-auto w-full relative z-10">

                        <div className="text-center mb-8">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-3">WELCOME BACK</h2>
                            <h1 className="text-5xl font-serif italic text-white mb-2 tracking-tight">Sign in.</h1>
                            <p className="text-white/40 text-sm">Resume your story in the woods.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email */}
                            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-white/20 transition-colors">
                                <label className="block text-[10px] font-bold text-white/30 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none"
                                    placeholder="sarah@example.com"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="bg-[#1a1a1a] border border-white/5 rounded-xl px-4 py-3 focus-within:border-white/20 transition-colors flex items-center justify-between">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-white/30 mb-1">Password</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder:text-white/20 outline-none"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-white/20 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <Link href="/forgot-password" className="text-[10px] font-bold text-white/30 hover:text-white/60 uppercase tracking-wider transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            {errors.submit && (
                                <div className="text-xs text-red-400 flex items-center gap-2 justify-center">
                                    <AlertCircle size={12} />
                                    {errors.submit}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl text-white font-bold uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform active:scale-95 mt-4"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="my-6 relative flex items-center justify-center">
                            <div className="absolute w-full h-[1px] bg-white/5"></div>
                            <span className="relative bg-[#120b18] px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">Or continue with</span>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={isLoading}
                                className="w-full bg-white text-black py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" /><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" /><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" /><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.799 L -6.744 42.389 C -8.804 40.459 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" /></g></svg>
                                Google
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <span className="text-white/40 text-[10px]">New to Agentwood? </span>
                            <Link href="/signup" className="text-purple-400 font-bold text-[10px] hover:text-purple-300">Create Account</Link>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE - FIREPLACE BACKGROUND */}
                <div className="hidden lg:flex w-[55%] relative overflow-hidden items-end p-12">
                    {/* Fireplace Video Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src="/videos/fireplace.mp4" type="video/mp4" />
                        </video>
                    </div>

                    <div className="relative z-20 max-w-md">
                        <p className="text-4xl font-serif italic leading-tight text-white mb-6 drop-shadow-xl">
                            "The voice was so real, I forgot where I was."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white tracking-widest uppercase shadow-black drop-shadow-md">Sarah M.</div>
                                <div className="text-[10px] text-white/60 shadow-black drop-shadow-md">Premium Member</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
