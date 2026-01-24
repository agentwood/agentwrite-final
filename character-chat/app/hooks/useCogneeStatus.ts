import { useState, useEffect } from 'react';
import { isCogneeAvailable } from '@/lib/cogneeClient';

export function useCogneeStatus(intervalMs = 10000) {
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [lastChecked, setLastChecked] = useState<Date>(new Date());

    const checkStatus = async () => {
        const status = await isCogneeAvailable();
        setIsAvailable(status);
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
