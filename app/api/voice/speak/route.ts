import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/voice/speak
 *
 * Takes text and userId, looks up the user's cloned voice_id,
 * calls ElevenLabs TTS, and returns the audio.
 */
export async function POST(req: NextRequest) {
  try {
    const { text, userId } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Look up user's cloned voice_id
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('voice_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.voice_id) {
      return NextResponse.json(
        { success: false, error: 'No cloned voice found. Please clone your voice first.' },
        { status: 404 }
      );
    }

    // Call ElevenLabs TTS
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${user.voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      throw new Error(`ElevenLabs TTS failed: ${error}`);
    }

    // Return audio as binary response
    const audioBuffer = await ttsResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate speech',
      },
      { status: 500 }
    );
  }
}
