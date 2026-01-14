
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const next = requestUrl.searchParams.get('next') || '/home';

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.session) {
            // Create response to redirect to home
            const response = NextResponse.redirect(new URL(next, request.url));

            // We also need to set the agentwood_token for middleware compatibility
            // since the AuthModal sets it manually for email login
            if (data.user) {
                response.cookies.set('agentwood_token', data.user.id, {
                    path: '/',
                    maxAge: 30 * 24 * 60 * 60, // 30 days
                    sameSite: 'lax'
                });
            }

            return response;
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(new URL('/login?error=auth-code-error', request.url));
}
