import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Public routes that DON'T require authentication
    const publicPaths = [
        '/',           // Landing page only
        '/login',
        '/signup',
        '/auth',       // Allow auth paths (callbacks)
        '/forgot-password',
        '/reset-password',
        '/privacy',
        '/terms',
        '/about',
        '/blog',
        '/discover',   // Public discovery page
        '/pricing',    // Public pricing page
        '/character',  // Public character pages
        '/chat-with',  // Public pSEO pages
        '/talk-to',    // Public pSEO pages
        '/roleplay',   // Public pSEO pages
        '/api/auth',   // Auth endpoints
        '/api/blog',   // Public blog API
        '/api/tts',    // TTS must be accessible for voice generation
        '/api/pricing', // Public pricing API
        '/api/stripe', // Stripe webhooks and checkout
        '/api/health', // Health checks
        '/api/personas', // Character/persona APIs
        '/api/characters', // Character APIs
        '/_next',      // Next.js internals
        '/favicon',
        '/images',
        '/videos',
        '/avatars',
        '/og-image',
        '/sitemap',    // Sitemaps for SEO
    ];

    // Check if current path is public
    const isPublic = publicPaths.includes(pathname) ||
        publicPaths.some(path => path !== '/' && pathname.startsWith(path + '/'));

    // Also allow static files
    const isStatic = pathname.includes('.') && !pathname.includes('/api/');
    const authToken = request.cookies.get('agentwood_token');

    // Explicitly protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!authToken) {
            return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
        }
        // In the future: Add Admin Role check here if we have a way to decode the token/session on edge
    }

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
