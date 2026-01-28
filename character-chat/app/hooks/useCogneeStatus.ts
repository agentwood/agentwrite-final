import { useState, useEffect } from 'react';

export function useCogneeStatus(intervalMs = 10000) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());

    const checkStatus = async () => {
        try {
            const response = await fetch('/api/cognee/health');
            if (response.ok) {
                setIsAvailable(true);
            } else {
                console.warn('[CogneeStatus] Health check returned non-200:', response.status);
                setIsAvailable(false);
            }
        } catch (e) {
            console.error('[CogneeStatus] Health check failed:', e);
            setIsAvailable(false);
        }
        setLastChecked(new Date());
    };

    useEffect(() => {
        // Initial check
        checkStatus();

        // Poll
        const interval = setInterval(checkStatus, intervalMs);

        return () => clearInterval(interval);
    }, [intervalMs]);

    return { isAvailable, lastChecked, checkStatus };
}
