
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Use the shared client instance
import { setSession } from '@/lib/auth';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const [status, setStatus] = useState('Authenticating...');

    useEffect(() => {
        if (error) {
            setStatus(`Authentication Error: ${error}`);
            setTimeout(() => router.push('/login?error=' + error), 2000);
            return;
        }

        if (code) {
            // Exchange code for session using the CLIENT instance (access to local storage/cookies)
            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (error) {
                    console.error("Auth Callback Error:", error);
                    setStatus('Authentication failed. Redirecting...');
                    setTimeout(() => router.push('/login?error=' + error.message), 2000);
                } else if (data.session) {
                    // Success!
                    const user = data.user;
                    // Set local app session/cookies if needed
                    setSession({
                        id: user.id,
                        email: user.email || '',
                        displayName: user.user_metadata?.full_name,
                        planId: 'free', // Or fetch from DB
                    });

                    // Set the middleware cookie manually here to be safe (client-side)
                    // Though setSession might do it? Let's verify via document.cookie
                    const date = new Date();
                    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
                    document.cookie = `agentwood_token=${user.id}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;

                    setStatus('Success! Redirecting...');
                    router.push('/home'); // Or use 'next' param
                }
            });
        } else {
            // No code, maybe already logged in?
            router.push('/home');
        }
    }, [code, error, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-lg font-sans text-white/60">{status}</p>
        </div>
    );
}
