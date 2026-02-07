import { readFile } from "fs/promises";
import path from "path";

export type VoiceSettings = {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  speaker_boost?: boolean;
};

const DEFAULT_PROFILE_PATH = "voice_profiles/active.txt";

export async function readToneProfile(
  profilePath: string = DEFAULT_PROFILE_PATH
): Promise<VoiceSettings | null> {
  try {
    const fullPath = path.join(process.cwd(), profilePath);
    const raw = await readFile(fullPath, "utf8");
    return parseToneProfile(raw);
  } catch {
    return null;
  }
}

export function parseToneProfile(raw: string): VoiceSettings {
  const lines = raw.split(/\r?\n/);
  const settings: VoiceSettings = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) break;
    if (trimmed.startsWith("#")) continue;

    const [keyRaw, ...rest] = trimmed.split(":");
    if (!keyRaw || rest.length === 0) continue;
    const key = keyRaw.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (key === "speaker_boost") {
      settings.speaker_boost = value.toLowerCase() === "true";
      continue;
    }

    const numeric = normalizeNumber(value);
    if (numeric === null) continue;

    if (key === "stability") settings.stability = numeric;
    if (key === "similarity_boost") settings.similarity_boost = numeric;
    if (key === "style") settings.style = numeric;
  }

  return settings;
}

function normalizeNumber(value: string): number | null {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;

  if (parsed > 1) {
    const scaled = parsed / 100;
    return clamp(scaled, 0, 1);
  }

  return clamp(parsed, 0, 1);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
