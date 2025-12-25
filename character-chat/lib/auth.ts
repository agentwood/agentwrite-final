/**
 * Simple session-based authentication
 * Uses localStorage for client-side session management
 * In production, replace with proper JWT/cookie-based auth
 */

export interface User {
  id: string;
  email?: string;
  displayName?: string;
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
}

/**
 * Clear session (logout)
 */
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_ID_KEY);
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

