import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Define protected routes that require FULL authentication (not just anonymous)
    const protectedPaths = [
        '/pricing',
        '/character',
        '/create',
        '/library',
        '/voice-studio',
        '/settings',
        '/dashboard' // if it exists
    ];

    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtected) {
        // Check for the auth cookie set by lib/auth.ts
        const authToken = request.cookies.get('agentwood_token');

        if (!authToken) {
            // Redirect to login if accessing protected route without auth
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('callbackUrl', request.nextUrl.pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/pricing/:path*',
        '/character/:path*',
        '/create/:path*',
        '/library/:path*',
        '/voice-studio/:path*',
        '/settings/:path*',
        // Add other protected routes here
    ],
};
