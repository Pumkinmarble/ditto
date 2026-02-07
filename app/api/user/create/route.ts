/**
 * User Creation API Route
 * Creates a user in the database (usually called automatically after Auth0 login)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // TODO: Uncomment when Supabase is set up
    // const { getOrCreateUser } = await import('../../../lib/db');
    // const user = await getOrCreateUser({
    //   sub: session.user.sub,
    //   email: session.user.email,
    //   name: session.user.name,
    //   picture: session.user.picture,
    // });

    // For now, return user from Auth0 session
    return NextResponse.json({
      success: true,
      user: {
        id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
        message: 'Supabase not configured - using Auth0 session only',
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
