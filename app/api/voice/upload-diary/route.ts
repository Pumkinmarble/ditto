import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Voice Upload + Transcription + Diary Save
 *
 * Workflow:
 * 1. Receive MP3 audio file
 * 2. Transcribe using ElevenLabs Scribe v2 API
 * 3. Clone voice with ElevenLabs (optional, for later use)
 * 4. Save transcription to diary_entries
 * 5. Update user's voice_id
 */

export const runtime = 'nodejs';

const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'audio/mp4',
  'audio/m4a',
];

interface TranscriptionResponse {
  text: string;
  language_code?: string;
}

/**
 * Transcribe audio using ElevenLabs Scribe v2 API
 */
async function transcribeAudio(audioFile: File): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const formData = new FormData();
  formData.append('file', audioFile); // ElevenLabs expects 'file', not 'audio'
  formData.append('model_id', 'scribe_v2'); // Scribe v2 model (note: underscore, not hyphen)

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs transcription failed: ${error}`);
  }

  const data = await response.json() as TranscriptionResponse;
  return data.text;
}

/**
 * Clone voice using ElevenLabs API
 */
async function cloneVoiceElevenLabs(audioFile: File, voiceName: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const formData = new FormData();
  formData.append('name', voiceName);
  formData.append('files', audioFile, audioFile.name || 'voice-sample.mp3');

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs voice cloning failed: ${error}`);
  }

  const data = await response.json() as { voice_id: string };
  return data.voice_id;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio');
    const userId = formData.get('userId');
    const voiceName = formData.get('voiceName') || 'Echo Voice';
    const cloneVoice = formData.get('cloneVoice') === 'true';

    // Validate inputs
    if (!audio || !(audio instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Missing audio file' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validate audio type
    const audioType = audio.type.toLowerCase();
    if (!ACCEPTED_AUDIO_TYPES.includes(audioType)) {
      return NextResponse.json(
        { success: false, error: `Unsupported audio type: ${audio.type}` },
        { status: 400 }
      );
    }

    console.log('📝 Step 1: Transcribing audio with ElevenLabs Scribe v2...');

    // Step 1: Transcribe the audio
    const transcription = await transcribeAudio(audio);

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transcription returned empty text' },
        { status: 400 }
      );
    }

    console.log(`✅ Transcription complete: "${transcription.substring(0, 50)}..."`);

    // Step 2: Clone voice (optional)
    let voiceId: string | null = null;

    if (cloneVoice) {
      try {
        console.log('🎤 Step 2: Cloning voice with ElevenLabs...');
        voiceId = await cloneVoiceElevenLabs(audio, voiceName as string);
        console.log(`✅ Voice cloned: ${voiceId}`);

        // Update user's voice_id
        await supabaseAdmin
          .from('users')
          .update({
            voice_id: voiceId,
            voice_name: voiceName,
          })
          .eq('id', userId);
      } catch (error) {
        console.warn('⚠️  Voice cloning failed (continuing anyway):', error);
        // Don't fail the whole request if voice cloning fails
      }
    }

    // Step 3: Save transcription to diary_entries
    console.log('💾 Step 3: Saving transcription to diary...');

    const { data: diaryEntry, error: diaryError } = await supabaseAdmin
      .from('diary_entries')
      .insert([
        {
          user_id: userId,
          content: transcription,
          entry_date: new Date().toISOString().split('T')[0],
        },
      ])
      .select()
      .single();

    if (diaryError) {
      throw diaryError;
    }

    console.log('✅ Diary entry saved successfully!');

    return NextResponse.json({
      success: true,
      transcription,
      voiceId,
      diaryEntryId: diaryEntry.id,
      message: 'Audio transcribed and saved to diary successfully!',
    });

  } catch (error) {
    console.error('Error processing voice upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process voice upload',
      },
      { status: 500 }
    );
  }
}
