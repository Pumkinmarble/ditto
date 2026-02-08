/**
 * User Profile API Route
 * GET: Fetch current user's profile from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { getUserByAuth0Id } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Get user from database
    const user = await getUserByAuth0Id(session.user.sub);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Return user profile (excluding sensitive data)
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
        hasBackboardAssistant: !!user.assistant_id,
        hasVoiceClone: !!user.voice_id,
        blockchainCommitted: !!user.blockchain_committed_at,
        walletAddress: user.wallet_address,
        solanaTxHash: user.solana_tx_hash,
        blockchainCommittedAt: user.blockchain_committed_at,
        showInGallery: user.show_in_gallery ?? false,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
