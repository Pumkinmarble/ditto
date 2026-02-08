import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { personalityType, dimensions, description, sessionId } = await request.json();

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
      const demoEmail = `demo-${sessionId}@echo.ai`;
      const demoAuth0Id = `demo_${sessionId}`;

      // Check if demo user exists
      let { data: existingUser, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth0_id', demoAuth0Id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // User doesn't exist, create one
        const { data: newUser, error: insertError } = await supabaseAdmin
          .from('users')
          .insert([
            {
              auth0_id: demoAuth0Id,
              email: demoEmail,
              name: 'Demo User',
            },
          ])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        userId = newUser.id;
      } else if (fetchError) {
        throw fetchError;
      } else {
        userId = existingUser.id;
      }
    }

    // Update user with personality data
    const personalityData = {
      type: personalityType,
      dimensions,
      description,
      completedAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        personality_completed: true,
        personality_type: personalityType,
        personality_data: personalityData,
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      userId,
      message: 'Personality results saved successfully!',
    });
  } catch (error) {
    console.error('Error saving personality results:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save personality results',
      },
      { status: 500 }
    );
  }
}
