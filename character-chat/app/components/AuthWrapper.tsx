
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/lib/auth';
import AuthModal from './AuthModal';

const PUBLIC_ROUTES = ['/', '/home', '/login', '/signup', '/api', '/terms', '/privacy', '/cookie-policy'];

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            pathname === route || pathname.startsWith('/api/')
        );

        if (!isPublicRoute && !isAuthenticated()) {
            setShowAuthModal(true);
        } else {
            setShowAuthModal(false);
        }
    }, [pathname, isMounted]);

    if (!isMounted) return null;

    const handleClose = () => {
        // If on a protected route and closing modal, redirect to home
        const isPublicRoute = PUBLIC_ROUTES.some(route =>
            pathname === route || pathname.startsWith('/api/')
        );

        if (!isPublicRoute) {
            router.push('/home');
        }
        setShowAuthModal(false);
    };

    return (
        <>
            {children}
            {showAuthModal && (
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={handleClose}
                />
            )}
        </>
    );
}
