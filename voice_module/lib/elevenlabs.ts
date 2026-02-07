const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

export class ElevenLabsError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ElevenLabsError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new ElevenLabsError("Missing ELEVENLABS_API_KEY", 500);
  }
  return key;
}

export type CloneVoiceResult = {
  voice_id: string;
};

export async function cloneVoice(params: {
  audio: File;
  name?: string;
}): Promise<CloneVoiceResult> {
  const apiKey = getApiKey();

  const form = new FormData();
  form.append("name", params.name?.trim() || "Echo Voice Clone");
  // ElevenLabs expects one or more files under the `files` field.
  form.append("files", params.audio, params.audio.name || "voice-sample.webm");

  const res = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new ElevenLabsError(
      text || "Failed to clone voice",
      res.status || 502
    );
  }

  const data = (await res.json()) as { voice_id?: string };
  if (!data.voice_id) {
    throw new ElevenLabsError("Voice ID missing from ElevenLabs", 502);
  }

  return { voice_id: data.voice_id };
}

export async function textToSpeech(params: {
  voice_id: string;
  text: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speaker_boost?: boolean;
  };
}): Promise<{ audio: ArrayBuffer; contentType: string }> {
  const apiKey = getApiKey();

  const payload: Record<string, unknown> = {
    text: params.text,
    model_id: "eleven_multilingual_v2",
    output_format: "mp3_44100_128",
  };

  if (params.voice_settings && Object.keys(params.voice_settings).length > 0) {
    payload.voice_settings = params.voice_settings;
  }

  const res = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(
      params.voice_id
    )}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await safeReadText(res);
    throw new ElevenLabsError(text || "Failed to generate speech", res.status);
  }

  const contentType = res.headers.get("Content-Type") || "audio/mpeg";
  const audio = await res.arrayBuffer();
  return { audio, contentType };
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
