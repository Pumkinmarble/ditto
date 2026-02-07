import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch all diary entries for the user, ordered by date
    const { data: entries, error } = await supabaseAdmin
      .from('diary_entries')
      .select('content, entry_date, created_at')
      .eq('user_id', userId)
      .order('entry_date', { ascending: true });

    if (error) {
      throw error;
    }

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No diary entries found for this user' },
        { status: 404 }
      );
    }

    // Format diary entries into text format for Backboard.io
    // Format: Date\nContent\n\n (double newline separator)
    let diaryText = '';

    entries.forEach((entry, index) => {
      // Format date as "Month Day, Year" (e.g., "February 3, 2026")
      const date = new Date(entry.entry_date);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      diaryText += `${formattedDate}\n`;
      diaryText += `${entry.content}`;

      // Add double newline separator between entries (but not after the last one)
      if (index < entries.length - 1) {
        diaryText += '\n\n';
      }
    });

    return NextResponse.json({
      success: true,
      diaryText,
      metadata: {
        userId,
        entryCount: entries.length,
        dateRange: {
          first: entries[0]?.entry_date,
          last: entries[entries.length - 1]?.entry_date,
        },
      },
    });
  } catch (error) {
    console.error('Error exporting diary entries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export diary entries',
      },
      { status: 500 }
    );
  }
}
