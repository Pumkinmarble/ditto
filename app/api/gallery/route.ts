/**
 * Public Gallery API Route
 * GET: Fetch public gallery entries
 */

import { NextResponse } from 'next/server';
import { getGalleryEntries } from '../../../lib/db';

export async function GET() {
  try {
    const entries = await getGalleryEntries();
    return NextResponse.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching gallery entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery entries' },
      { status: 500 }
    );
  }
}
