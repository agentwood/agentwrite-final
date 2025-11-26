import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // CRITICAL FIX FOR NETLIFY: 
  // Netlify injects variables into the system process, not necessarily the .env file.
  // We must explicitly grab them from process.env if they exist there.
  const finalEnv = {
    ...env,
    NODE_ENV: mode,
    API_KEY: process.env.API_KEY || env.API_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY
  };
  
  return {
    plugins: [react()],
    define: {
      // Manually expose the API_KEY on import.meta.env
      'import.meta.env.API_KEY': JSON.stringify(finalEnv.API_KEY),
      // Polyfill process.env with the explicitly merged variables
      'process.env': JSON.stringify(finalEnv)
    }
  };
});