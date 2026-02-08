/**
 * User Gallery Opt-In API Route
 * POST: Update gallery opt-in preference
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth';
import { updateGalleryOptIn } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { showInGallery } = body;

    if (typeof showInGallery !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid showInGallery value' },
        { status: 400 }
      );
    }

    await updateGalleryOptIn(session.user.sub, showInGallery);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating gallery opt-in:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update gallery opt-in' },
      { status: 500 }
    );
  }
}
