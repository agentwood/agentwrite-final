import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                if (!isSupabaseConfigured() || !supabase) {
                    console.warn('Supabase not configured, auth disabled');
                    setLoading(false);
                    return;
                }

                // Get initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (mounted) {
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);
                    setLoading(false);
                }

                // Listen for changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
                    if (mounted) {
                        setSession(newSession);
                        setUser(newSession?.user ?? null);
                        setLoading(false);
                    }
                });

                return () => {
                    subscription.unsubscribe();
                };
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        return () => {
            mounted = false;
        };
    }, []);

    const signOut = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
