import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to 'VITE_' to only load VITE_ prefixed variables.
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  // CRITICAL FIX FOR NETLIFY: 
  // Netlify injects variables into the system process.
  // We explicitly grab API_KEY and merge all VITE_ variables.
  const finalEnv = {
    ...env, // This contains all VITE_ prefixed variables
    NODE_ENV: mode,
    API_KEY: process.env.API_KEY || env.API_KEY, // Explicitly allow API_KEY
    // Do NOT include STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET here
  };

  return {
    plugins: [react()],
    server: {
      host: 'aibcmedia.com',
      port: 5173,
    },
    define: {
      // Manually expose the API_KEY on import.meta.env
      'import.meta.env.API_KEY': JSON.stringify(finalEnv.API_KEY),
      // Note: Vite automatically exposes VITE_ prefixed env vars to import.meta.env
      // We don't need to manually define them here
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'react-quill'],
            supabase: ['@supabase/supabase-js'],
            ai: ['@google/genai']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  };
});