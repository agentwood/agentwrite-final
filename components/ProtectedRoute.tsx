import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            // 1. Check if Supabase is configured
            if (!isSupabaseConfigured() || !supabase) {
                // Fallback to local storage for demo mode
                const localUser = localStorage.getItem('agentwrite_user_prefs');
                setAuthenticated(!!localUser);
                setLoading(false);
                return;
            }

            // 2. Check real Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setAuthenticated(true);
            } else {
                // Double check local storage just in case (hybrid mode)
                const localUser = localStorage.getItem('agentwrite_user_prefs');
                setAuthenticated(!!localUser);
            }

            setLoading(false);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
            setLoading(false);
        }) || { data: { subscription: { unsubscribe: () => { } } } };

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!authenticated) {
        // Redirect to login, but save the location they were trying to go to
        return <Navigate to="/signup" state={{ from: location, mode: 'login' }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
