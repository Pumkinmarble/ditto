/**
 * Auth0 Helper Functions
 * Provides authentication utilities for the Echo AI Digital Twin project
 */

import { getSession as getAuth0Session } from '@auth0/nextjs-auth0';
import { Session } from '@auth0/nextjs-auth0';

/**
 * Get the current user session
 * Use this in Server Components and API routes
 */
export async function getSession(): Promise<Session | null | undefined> {
  try {
    return await getAuth0Session();
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get the current user's Auth0 ID
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.sub || null;
}

/**
 * Get the current user's email
 * Returns null if not authenticated
 */
export async function getUserEmail(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.email || null;
}

/**
 * Require authentication for a route
 * Throws an error if user is not authenticated
 * Use this in API routes that require auth
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized - Please log in');
  }

  return session;
}

/**
 * Get user info from session
 * Returns a clean user object
 */
export async function getUserInfo() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.sub,
    email: session.user.email,
    name: session.user.name,
    picture: session.user.picture,
  };
}

/**
 * Check if user is authenticated
 * Returns true if user is logged in
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}
