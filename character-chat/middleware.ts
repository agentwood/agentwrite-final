import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Public routes that DON'T require authentication
    const publicPaths = [
        '/',           // Landing page only
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/privacy',
        '/terms',
        '/about',
        '/blog',
        '/api/auth',   // Auth endpoints
        '/api/blog',   // Public blog API
        '/_next',      // Next.js internals
        '/favicon',
        '/images',
        '/videos',
        '/avatars',
        '/og-image',
    ];

    // Check if current path is public
    const isPublic = publicPaths.some(path =>
        pathname === path || pathname.startsWith(path + '/')
    );

    // Also allow static files
    const isStatic = pathname.includes('.') && !pathname.includes('/api/');

    if (!isPublic && !isStatic) {
        // Check for the auth cookie set by lib/auth.ts
        const authToken = request.cookies.get('agentwood_token');

        if (!authToken) {
            // Redirect to login if accessing protected route without auth
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
