import { createClient } from '@supabase/supabase-js';

// Robustly check for environment variables in Vite (import.meta.env) and Node (process.env)
const getEnvVar = (key: string, viteKey: string): string => {
  // Check Vite's import.meta.env first (standard for Vite apps)
  // Casting to any to avoid TypeScript errors if types are not configured
  if (import.meta && (import.meta as any).env && (import.meta as any).env[viteKey]) {
    return (import.meta as any).env[viteKey];
  }
  // Fallback to process.env (handled by vite.config.ts define)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[viteKey] || process.env[key] || '';
  }
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

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