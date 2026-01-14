import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const config = {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'MISSING',
        anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'MISSING',
        serviceKey: supabaseServiceKey ? 'PRESENT' : 'MISSING',
        nodeEnv: process.env.NODE_ENV,
    };

    try {
        if (!supabaseUrl || !supabaseAnonKey) {
            return NextResponse.json({
                status: 'error',
                message: 'Supabase URL or Anon Key missing from environment',
                config
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // Try a simple health check query
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            return NextResponse.json({
                status: 'error',
                message: `Supabase Auth Check Failed: ${error.message}`,
                config
            }, { status: 500 });
        }

        return NextResponse.json({
            status: 'success',
            message: 'Supabase configuration is valid and reachable',
            config,
            sessionPresent: !!data.session
        });

    } catch (err: any) {
        return NextResponse.json({
            status: 'error',
            message: err.message,
            config
        }, { status: 500 });
    }
}
