import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { content, sessionId } = await request.json();

    if (!content || !content.trim() || content.trim() === 'Start writing...') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    let userId: string;

    // Check if sessionId is a valid UUID (Auth0 user ID from logged-in user)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);

    if (isUUID) {
      // This is an Auth0 user ID, use it directly
      userId = sessionId;

      // Verify the user exists
      const { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (fetchError || !user) {
        throw new Error('User not found');
      }
    } else {
      // This is a demo sessionId, create/use a demo user
      const demoAuth0Id = `demo_${sessionId}`;

      // Find or create user
      let { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth0_id', demoAuth0Id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // User doesn't exist, create one
        const demoEmail = `demo-${sessionId}@echo.ai`;
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              auth0_id: demoAuth0Id,
              email: demoEmail,
              name: 'Demo User',
            },
          ])
          .select('id')
          .single();

        if (insertError) {
          throw insertError;
        }

        userId = newUser.id;
      } else if (fetchError) {
        throw fetchError;
      } else if (!existingUser) {
        throw new Error('User not found');
      } else {
        userId = existingUser.id;
      }
    }

    // Save diary entry to database
    const { data: diaryEntry, error: diaryError } = await supabaseAdmin
      .from('diary_entries')
      .insert([
        {
          user_id: userId,
          content: content.trim(),
          entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        },
      ])
      .select()
      .single();

    if (diaryError) {
      throw diaryError;
    }

    return NextResponse.json({
      success: true,
      message: 'Diary entry saved successfully!',
      entryId: diaryEntry.id,
    });
  } catch (error) {
    console.error('Error saving diary entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save diary entry',
      },
      { status: 500 }
    );
  }
}
