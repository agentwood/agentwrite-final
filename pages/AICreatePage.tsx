import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AICreatePage - Redirects to the new Character.ai clone
 * This replaces the old interactive story generation with the new Character.ai clone
 * running on the Next.js app (character-chat) at /create
 */
const AICreatePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new Character.ai clone homepage (character gallery)
    // In development: Next.js runs on port 3001 (to avoid conflict with main app on 5173)
    // In production: should be configured to point to the same domain
    const nextJsUrl = process.env.NODE_ENV === 'production' 
      ? '/'  // Same domain in production - Character.ai clone homepage
      : 'http://localhost:3000/';  // Next.js dev server in development - Character.ai clone homepage
    
    // Use window.location for external redirect (cross-origin)
    window.location.href = nextJsUrl;
  }, []);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-600">Redirecting to Character.ai clone...</p>
      </div>
    </div>
  );
};

export default AICreatePage;
