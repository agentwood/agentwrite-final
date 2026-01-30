/**
 * Simple session-based authentication
 * Uses localStorage for client-side session management
 * In production, replace with proper JWT/cookie-based auth
 */

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  planId: 'free' | 'starter' | 'pro';
}

const STORAGE_KEY = 'agentwood_user_session';
const USER_ID_KEY = 'agentwood_user_id';

/**
 * Get current user ID from session
 */
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;

  const userId = localStorage.getItem(USER_ID_KEY);
  if (userId) return userId;

  // Generate a new anonymous user ID
  const newUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(USER_ID_KEY, newUserId);
  return newUserId;
}

/**
 * Check if user has verified age (18+)
 */
export function isAgeVerified(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('agentwood_age_verified') === 'true';
}

/**
 * Get user's age
 */
export function getUserAge(): number | null {
  if (typeof window === 'undefined') return null;
  const age = localStorage.getItem('agentwood_age');
  return age ? parseInt(age, 10) : null;
}

/**
 * Get current user session
 * Note: Age verification is checked separately - this just returns the session
 */
export function getSession(): User | null {
  if (typeof window === 'undefined') return null;

  const session = localStorage.getItem(STORAGE_KEY);
  if (!session) {
    // Create anonymous session
    const userId = getUserId();
    const anonymousUser: User = {
      id: userId!,
      planId: 'free',
    };
    setSession(anonymousUser);
    return anonymousUser;
  }

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

/**
 * Set user session
 */
export function setSession(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(USER_ID_KEY, user.id);

  // Set cookie for Middleware access
  // Expires in 30 days
  const date = new Date();
  date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
  const expires = "; expires=" + date.toUTCString();

  // Create a minimal session cookie for the server to verify presence
  // We allow 'anon' users to be considered "logged in" for basic access, 
  // but for STRICT auth (like the user requested), we might only want to set this 
  // if they have an email.
  // HOWEVER, the current logic creates anon users by default. 
  // The user said "none of this should work unless signed in".
  // So we only set the cookie if user.email exists (Simulated Login).

  if (user.email && !user.email.includes('anon')) {
    document.cookie = "agentwood_token=" + user.id + expires + "; path=/; SameSite=Lax";
  }
}

/**
 * Clear session (logout)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  document.cookie = "agentwood_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Check if the user is fully authenticated (not anonymous)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = getSession();
  // A "fully" logged in user in this simple system is one with a session that isn't just anonymous
  // Usually this means they have an email or we check if the session was created via login
  return !!(session && session.email);
}

/**
 * Get auth headers for API requests
 */
export function getAuthHeaders(): Record<string, string> {
  const userId = getUserId();
  return {
    'x-user-id': userId || '',
  };
}

/**
 * Get user ID from a server-side request
 * Extracts user ID from request headers or cookies
 */
export function getUserIdFromRequest(request: Request): string | null {
  // Try x-user-id header first
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId && headerUserId !== '') {
    return headerUserId;
  }

  // Try to get from cookie
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    if (cookies['agentwood_token']) {
      return cookies['agentwood_token'];
    }
  }

  return null;
}
