import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Public routes that DON'T require authentication
    const publicPaths = [
        '/',           // Landing page only
        '/home',       // Allow dashboard landing (auth guards handled in component)
        '/login',
        '/signup',
        '/auth',       // Allow auth paths (callbacks)
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
    const isPublic = publicPaths.includes(pathname) ||
        publicPaths.some(path => path !== '/' && pathname.startsWith(path + '/'));

    // Also allow static files
    const isStatic = pathname.includes('.') && !pathname.includes('/api/');
    const authToken = request.cookies.get('agentwood_token');

    const response = !isPublic && !isStatic && !authToken
        ? NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url))
        : NextResponse.next();

    response.headers.set('X-Middleware-Public', isPublic ? 'true' : 'false');
    if (authToken) response.headers.set('X-Middleware-HasAuth', 'true');

    return response;
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
