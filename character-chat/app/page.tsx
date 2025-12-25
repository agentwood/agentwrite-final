'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LandingPage from './(site)/landing/page';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user has a session
    const session = getSession();
    if (session) {
      // User is logged in, redirect to home
      router.push('/home');
    }
    // If no session, show landing page (default behavior)
  }, [router]);
  
  return <LandingPage />;
}
