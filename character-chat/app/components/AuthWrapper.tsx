
'use client';

import { SessionProvider } from 'next-auth/react';

/**
 * AuthWrapper - MASTER RESET VERSION
 * 
 * This wrapper ONLY provides SessionProvider context.
 * It does NOT auto-trigger any auth modals.
 * 
 * Auth modals should ONLY open when:
 * 1. User explicitly clicks a protected action (favorite, chat, etc.)
 * 2. User navigates to a protected route via explicit click
 * 
 * The MasterDashboard handles its own auth modal via isAuthOpen state.
 */
export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}
