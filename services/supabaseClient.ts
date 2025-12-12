import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging for deployment
if (typeof window !== 'undefined') {
  console.log("[Supabase Config] URL Present:", !!supabaseUrl);
  console.log("[Supabase Config] Key Present:", !!supabaseAnonKey);
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[Supabase Config] ⚠️ Missing environment variables!");
    console.warn("[Supabase Config] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file");
  }
}

// Only create the client if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to check if Supabase is configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};