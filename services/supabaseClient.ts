import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (process.env as any).VITE_SUPABASE_ANON_KEY;

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