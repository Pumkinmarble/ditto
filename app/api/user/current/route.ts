/**
 * Current User API Route
 * GET: Returns the current authenticated user's Supabase ID
 * This bridges Auth0 user (auth0_id) to Supabase user (id)
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByAuth0Id, getOrCreateUser } from '@/lib/db';

export async function GET() {
  try {
    // Get Auth0 session
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get or create user in Supabase
    const user = await getOrCreateUser({
      sub: session.user.sub,
      email: session.user.email!,
      name: session.user.name,
      picture: session.user.picture,
    });

    // Return Supabase user ID (UUID)
    return NextResponse.json({
      success: true,
      id: user.id,
      auth0_id: user.auth0_id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current user',
      },
      { status: 500 }
    );
  }
}
