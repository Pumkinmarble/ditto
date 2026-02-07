/**
 * Session Management
 * Manages user session ID across the application
 * Persists in localStorage for consistent user identification
 */

const SESSION_KEY = 'echo_session_id';

/**
 * Get or create a persistent session ID
 * This ID remains the same until user explicitly clears it
 */
export function getSessionId(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return Date.now().toString();
  }

  // Try to get existing session ID from localStorage
  let sessionId = localStorage.getItem(SESSION_KEY);

  // If no session ID exists, create one
  if (!sessionId) {
    sessionId = Date.now().toString();
    localStorage.setItem(SESSION_KEY, sessionId);
    console.log('🆔 New session created:', sessionId);
  } else {
    console.log('🆔 Existing session loaded:', sessionId);
  }

  return sessionId;
}

/**
 * Clear the current session
 * Call this on logout or when user wants to start fresh
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    console.log('🗑️ Session cleared');
  }
}

/**
 * Check if a session exists
 */
export function hasSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(SESSION_KEY) !== null;
}
