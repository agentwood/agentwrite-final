
import { createBrowserClient } from '@supabase/ssr';

// Use process.env for Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Create a singleton Supabase client using SSR package for correct cookie handling in Next.js App Router
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to check if Supabase is configured.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};




