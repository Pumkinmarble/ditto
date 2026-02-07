/**
 * Auth0 Dynamic Route Handler
 * Handles /api/auth/login, /api/auth/logout, /api/auth/callback, etc.
 */

import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

/**
 * Custom callback handler to create user in database
 * TODO: Uncomment when Supabase is configured
 */
const afterCallback = async (req: NextRequest, session: any) => {
  if (session?.user) {
    // TODO: Uncomment when Supabase is set up
    // try {
    //   const { getOrCreateUser } = await import('../../../../lib/db');
    //   await getOrCreateUser({
    //     sub: session.user.sub,
    //     email: session.user.email,
    //     name: session.user.name,
    //     picture: session.user.picture,
    //   });
    // } catch (error) {
    //   console.error('Error creating user in database:', error);
    // }

    console.log('User logged in:', session.user.email);
  }
  return session;
};

/**
 * Export Auth0 handlers
 * This automatically creates these routes:
 * - /api/auth/login
 * - /api/auth/logout
 * - /api/auth/callback
 * - /api/auth/me
 */
export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard', // Redirect after login
  }),
  callback: handleCallback({
    afterCallback,
  }),
});
