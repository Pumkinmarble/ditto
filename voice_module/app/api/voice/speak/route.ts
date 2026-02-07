import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsError, textToSpeech } from "../../../../lib/elevenlabs";
import { readToneProfile } from "../../../../lib/toneProfile";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      voice_id?: string;
      text?: string;
    };

    const voiceId = body.voice_id?.trim();
    const text = body.text?.trim();

    if (!voiceId || !text) {
      return NextResponse.json(
        { error: "Missing voice_id or text" },
        { status: 400 }
      );
    }

    const voiceSettings = await readToneProfile();
    const result = await textToSpeech({
      voice_id: voiceId,
      text,
      voice_settings: voiceSettings ?? undefined,
    });

    return new NextResponse(result.audio, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof ElevenLabsError) {
      return NextResponse.json(
        { error: err.message || "ElevenLabs error" },
        { status: err.status || 502 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
