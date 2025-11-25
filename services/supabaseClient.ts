
import { createClient } from '@supabase/supabase-js';

// Try to get keys from various process.env formats (Vite or standard Node)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Only create the client if keys are present to avoid runtime crashes in demo mode
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Helper to check if Supabase is configured.
 * Useful for showing UI warnings if keys are missing.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};
