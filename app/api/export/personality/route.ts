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

    // Fetch the user's personality data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('personality_type, personality_data, name, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.personality_data || !user.personality_type) {
      return NextResponse.json(
        { success: false, error: 'User has not completed personality quiz' },
        { status: 404 }
      );
    }

    // Format personality data into text format for Backboard.io
    const personalityData = user.personality_data;
    const dimensions = personalityData.dimensions || [];
    const description = personalityData.description || {};

    // Build the personality text file
    let personalityText = `PERSONALITY QUIZ RESULTS - ${user.name || 'User'}\n\n`;
    personalityText += `Email: ${user.email}\n`;
    personalityText += `Personality Type: ${user.personality_type}\n\n`;

    personalityText += `PERSONALITY DIMENSIONS:\n`;
    dimensions.forEach((dim: any) => {
      const percentage = Math.round((dim.score / dim.maxScore) * 100);
      personalityText += `- ${dim.dimension} (${percentage}%) - ${dim.tendency}\n`;
    });

    personalityText += `\n`;

    // Add description sections if available
    if (description.traits) {
      personalityText += `CORE TRAITS:\n`;
      description.traits.forEach((trait: string) => {
        personalityText += `- ${trait}\n`;
      });
      personalityText += `\n`;
    }

    if (description.communicationStyle) {
      personalityText += `COMMUNICATION STYLE:\n${description.communicationStyle}\n\n`;
    }

    if (description.strengths) {
      personalityText += `STRENGTHS:\n`;
      description.strengths.forEach((strength: string) => {
        personalityText += `- ${strength}\n`;
      });
      personalityText += `\n`;
    }

    if (description.values) {
      personalityText += `CORE VALUES:\n`;
      description.values.forEach((value: string) => {
        personalityText += `- ${value}\n`;
      });
      personalityText += `\n`;
    }

    if (description.summary) {
      personalityText += `SUMMARY:\n${description.summary}\n`;
    }

    return NextResponse.json({
      success: true,
      personalityText,
      metadata: {
        userId: user.email,
        personalityType: user.personality_type,
        completedAt: personalityData.completedAt,
      },
    });
  } catch (error) {
    console.error('Error exporting personality:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export personality',
      },
      { status: 500 }
    );
  }
}
