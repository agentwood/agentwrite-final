import { createClient } from '@supabase/supabase-js';

// Use process.env which is polyfilled in vite.config.ts
// @ts-ignore
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

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