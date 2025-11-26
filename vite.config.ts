import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Manually expose the API_KEY on import.meta.env so we don't have to prefix it with VITE_
      'import.meta.env.API_KEY': JSON.stringify(env.API_KEY),
      // process.env polyfill for any libraries that might rely on it. 
      // We merge 'mode' to ensure NODE_ENV is present.
      'process.env': JSON.stringify({ ...env, NODE_ENV: mode })
    }
  };
});