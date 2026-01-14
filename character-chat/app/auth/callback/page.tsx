"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { setSession } from '@/lib/auth';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const [status, setStatus] = useState('Authenticating...');

    useEffect(() => {
        const handleAuth = async () => {
            // 1. FIRST check if Supabase already has a session (from hash/implicit flow)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (session) {
                // Success! Session found (likely from hash token)
                handleSuccess(session.user);
                return;
            }

            // 2. If no session, try Code Exchange (PKCE flow)
            if (code) {
                const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                if (data?.session) {
                    handleSuccess(data.session.user);
                    return;
                } else if (error) {
                    handleFailure(error.message);
                    return;
                }
            }

            // 3. If no code and no session, show error
            if (errorParam) {
                handleFailure(errorParam);
            } else {
                // 4. Wait a moment for hash to be parsed, then retry
                setTimeout(async () => {
                    const { data: { session: retrySession } } = await supabase.auth.getSession();
                    if (retrySession) {
                        handleSuccess(retrySession.user);
                    } else {
                        handleFailure('No session found. Please try again.');
                    }
                }, 1000);
            }
        };

        handleAuth();
    }, [code, errorParam, router]);

    const handleSuccess = (user: any) => {
        setStatus('Success! Redirecting...');
        setSession({
            id: user.id,
            email: user.email || '',
            displayName: user.user_metadata?.full_name,
            planId: 'free',
        });

        // Set cookie for middleware
        const date = new Date();
        date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `agentwood_token=${user.id}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;

        // Hard navigation to ensure middleware sees cookie
        window.location.href = '/home';
    };

    const handleFailure = (msg: string) => {
        setStatus(`Authentication Error: ${msg}`);
        setTimeout(() => router.push('/login?error=' + encodeURIComponent(msg)), 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-lg font-sans text-white/60">{status}</p>
        </div>
    );
}
