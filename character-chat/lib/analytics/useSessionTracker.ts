'use client';

/**
 * Session Tracker Hook
 * Tracks user sessions for analytics
 * - Starts session on mount
 * - Ends session on unmount/beforeunload
 * - Tracks page views and messages
 */

import { useEffect, useRef, useCallback } from 'react';

// Detect device type
function getDeviceInfo() {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;

    // Device type
    let device = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(ua)) {
        device = /iPad|Tablet/.test(ua) ? 'tablet' : 'mobile';
    }

    // Browser
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    // OS
    let os = 'unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { device, browser, os, userAgent: ua };
}

// Store session ID in sessionStorage
const SESSION_KEY = 'aw_session_id';

export function useSessionTracker(userId?: string | null) {
    const sessionIdRef = useRef<string | null>(null);
    const pageViewsRef = useRef(0);
    const messagesRef = useRef(0);

    // Start session
    const startSession = useCallback(async () => {
        // Check if session already exists
        try {
            const existingSession = sessionStorage.getItem(SESSION_KEY);
            if (existingSession) {
                sessionIdRef.current = existingSession;
                return;
            }
        } catch {
            // sessionStorage not available (private mode, etc)
            return;
        }

        try {
            const deviceInfo = getDeviceInfo();
            const response = await fetch('/api/analytics/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId || null,
                    ...deviceInfo,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                sessionIdRef.current = data.sessionId;
                sessionStorage.setItem(SESSION_KEY, data.sessionId);
            }
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    }, [userId]);

    // End session
    const endSession = useCallback(async () => {
        let sessionId = sessionIdRef.current;
        try {
            sessionId = sessionId || sessionStorage.getItem(SESSION_KEY);
        } catch {
            // sessionStorage not available
        }
        if (!sessionId) return;

        try {
            // Use sendBeacon for reliable delivery on page unload
            const data = JSON.stringify({
                sessionId,
                pageViews: pageViewsRef.current,
                messagesCount: messagesRef.current,
            });

            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/analytics/session', data);
            } else {
                await fetch('/api/analytics/session', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true,
                });
            }

            try {
                sessionStorage.removeItem(SESSION_KEY);
            } catch {
                // sessionStorage not available
            }
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    }, []);

    // Track page view
    const trackPageView = useCallback(async () => {
        pageViewsRef.current += 1;
        let sessionId = sessionIdRef.current;
        try {
            sessionId = sessionId || sessionStorage.getItem(SESSION_KEY);
        } catch {
            // sessionStorage not available
        }
        if (!sessionId) return;

        try {
            await fetch('/api/analytics/session', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, event: 'pageView' }),
            });
        } catch (error) {
            // Silent fail for tracking
        }
    }, []);

    // Track message sent
    const trackMessage = useCallback(async () => {
        messagesRef.current += 1;
        let sessionId = sessionIdRef.current;
        try {
            sessionId = sessionId || sessionStorage.getItem(SESSION_KEY);
        } catch {
            // sessionStorage not available
        }
        if (!sessionId) return;

        try {
            await fetch('/api/analytics/session', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, event: 'message' }),
            });
        } catch (error) {
            // Silent fail for tracking
        }
    }, []);

    useEffect(() => {
        // Start session on mount
        startSession();

        // End session on unload
        const handleUnload = () => endSession();
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [startSession, endSession]);

    return { trackPageView, trackMessage };
}

export default useSessionTracker;
