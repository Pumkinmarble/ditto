/**
 * User Creation API Route
 * Creates a user in the database (usually called automatically after Auth0 login)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { getOrCreateUser } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Create or get user in database
    const user = await getOrCreateUser({
      sub: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.picture,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        personalityCompleted: user.personality_completed,
        diaryEntryCount: user.diary_entry_count,
        voiceUploaded: user.voice_sample_uploaded,
        blockchainCommitted: !!user.blockchain_committed_at,
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
