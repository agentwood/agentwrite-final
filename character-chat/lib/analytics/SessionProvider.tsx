'use client';

/**
 * Session Provider Component
 * Wraps the app to provide session tracking
 */

import { useEffect } from 'react';
import { useSessionTracker } from './useSessionTracker';

interface SessionProviderProps {
    children: React.ReactNode;
    userId?: string | null;
}

export function SessionProvider({ children, userId }: SessionProviderProps) {
    // Initialize session tracking
    useSessionTracker(userId);

    return <>{children}</>;
}

export default SessionProvider;
