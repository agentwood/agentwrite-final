import { createClient } from '@supabase/supabase-js';

// Server-side only client with Service Role Key
// DANGER: Never expose this key to the client!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey)
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

if (!supabaseAdmin) {
    console.warn('[Supabase Admin] Service Role Key missing. Admin operations will fail.');
}
