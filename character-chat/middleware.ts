import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication Middleware
 * 
 * IMPORTANT: This middleware uses an ALLOWLIST for protected routes.
 * By default, routes are PUBLIC unless explicitly listed as protected.
 * This prevents accidental blocking of critical APIs.
 * 
 * To protect a new route, add it to PROTECTED_PATHS below.
 * 
 * @see scripts/verify-api-health.sh - Run this to test API accessibility
 */

// ============================================
// PROTECTED ROUTES - Require authentication
// All other routes are PUBLIC by default
// ============================================
const PROTECTED_PATHS = [
    '/app',            // User dashboard
    '/admin',          // Admin panel
    '/settings',       // User settings
    '/profile',        // User profile
    '/chat/',          // Active chat sessions (not /chat-with which is pSEO)
    '/conversations',  // Conversation history
    '/my-characters',  // User's characters
    '/api/user',       // User-specific APIs
    '/api/admin',      // Admin APIs
    '/api/conversations', // Conversation data
    '/api/chat/send',  // Sending messages (requires auth)
];

// ============================================
// ALWAYS PUBLIC - Never require auth
// (redundant with default-public, but explicit for clarity)
// ============================================
const ALWAYS_PUBLIC = [
    '/api/tts',        // Voice generation
    '/api/stripe',     // Stripe webhooks must be accessible
    '/api/health',     // Health checks
    '/api/auth',       // Auth flows
    '/api/pricing',    // Pricing info
    '/api/personas',   // Character data
    '/api/characters', // Character data
    '/api/blog',       // Blog content
    '/sitemap',        // SEO sitemaps
    '/login',
    '/signup',
    '/auth',
];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip static files entirely
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') // Static files have extensions
    ) {
        return NextResponse.next();
    }

    // Check if route is explicitly protected
    const isProtected = PROTECTED_PATHS.some(path =>
        pathname === path || pathname.startsWith(path + '/')
    );

    // Check if route is explicitly public (for logging/debugging)
    const isExplicitlyPublic = ALWAYS_PUBLIC.some(path =>
        pathname === path || pathname.startsWith(path + '/')
    );

    const authToken = request.cookies.get('agentwood_token');
    const response = NextResponse.next();

    // Only redirect to login if route is PROTECTED and user is not authenticated
    if (isProtected && !authToken) {
        console.log(`[Middleware] Protected route blocked: ${pathname}`);
        return NextResponse.redirect(new URL('/login?callbackUrl=' + pathname, request.url));
    }

    // Debug headers (remove in production if needed)
    response.headers.set('X-Route-Protected', isProtected ? 'true' : 'false');
    response.headers.set('X-Route-Explicit-Public', isExplicitlyPublic ? 'true' : 'false');
    if (authToken) response.headers.set('X-Has-Auth', 'true');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files with extensions
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};
