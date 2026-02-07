import { readFile, writeFile } from "fs/promises";
import path from "path";
import { EchoService } from "../../AI/echo-service";
import type { VoiceSettings } from "./toneProfile";

const SESSION_PATH = "voice_profiles/echo_session.json";
const PERSONALITY_PATH = "../AI/examples/personality-quiz.txt";
const DIARY_PATH = "../AI/examples/diary-entries.txt";

interface EchoSession {
  assistantId: string;
  threadId: string;
}

// Singleton — survives across requests within the same server process
let echoInstance: EchoService | null = null;
let initialized = false;

async function loadSession(): Promise<EchoSession | null> {
  try {
    const fullPath = path.join(process.cwd(), SESSION_PATH);
    const raw = await readFile(fullPath, "utf8");
    return JSON.parse(raw) as EchoSession;
  } catch {
    return null;
  }
}

async function saveSession(session: EchoSession): Promise<void> {
  const fullPath = path.join(process.cwd(), SESSION_PATH);
  await writeFile(fullPath, JSON.stringify(session, null, 2), "utf8");
}

async function getEcho(): Promise<EchoService> {
  if (echoInstance && initialized) return echoInstance;

  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BACKBOARD_API_KEY in environment");
  }

  const echo = new EchoService({ apiKey });

  // Try to resume an existing session
  const session = await loadSession();
  if (session?.assistantId && session?.threadId) {
    try {
      await echo.loadExisting(session.assistantId, session.threadId);
      echoInstance = echo;
      initialized = true;
      return echo;
    } catch {
      // Session expired or invalid — fall through to fresh init
    }
  }

  // Fresh initialization: load personality + diary entries
  const personalityPath = path.join(process.cwd(), PERSONALITY_PATH);
  const personalityText = await readFile(personalityPath, "utf8");
  await echo.initialize(personalityText);

  const diaryPath = path.join(process.cwd(), DIARY_PATH);
  await echo.uploadDiaryEntriesFromFile(diaryPath);

  // Save session IDs for next time
  const ids = echo.getIds();
  if (ids.assistantId && ids.threadId) {
    await saveSession({
      assistantId: ids.assistantId,
      threadId: ids.threadId,
    });
  }

  echoInstance = echo;
  initialized = true;
  return echo;
}

// --- Emotional tone → voice settings ---

const TONE_KEYWORDS: { tone: string; words: string[]; settings: VoiceSettings }[] = [
  {
    tone: "urgent",
    words: ["injustice", "failing", "fight", "wrong", "destroy", "burning", "struggle", "crisis", "anger", "furious"],
    settings: { stability: 0.45, similarity_boost: 0.85, style: 0.50, speaker_boost: true },
  },
  {
    tone: "emotional",
    words: ["heartbreak", "soul", "tears", "crying", "broke my heart", "deeply", "love", "pain", "grief", "miss"],
    settings: { stability: 0.50, similarity_boost: 0.85, style: 0.45, speaker_boost: true },
  },
  {
    tone: "warm",
    words: ["hope", "healing", "compassion", "children", "smile", "joy", "kindness", "gentle", "care", "hug"],
    settings: { stability: 0.55, similarity_boost: 0.85, style: 0.40, speaker_boost: true },
  },
  {
    tone: "reflective",
    words: ["balance", "wisdom", "journey", "decisions", "logic", "rational", "philosophy", "think", "consider", "understand"],
    settings: { stability: 0.65, similarity_boost: 0.85, style: 0.20, speaker_boost: true },
  },
];

const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.30,
  speaker_boost: true,
};

function analyzeEmotionalTone(text: string): VoiceSettings {
  const lower = text.toLowerCase();
  const scores = TONE_KEYWORDS.map(({ tone, words, settings }) => {
    const count = words.reduce((sum, w) => sum + (lower.split(w).length - 1), 0);
    return { tone, count, settings };
  });

  // Pick the tone with the most keyword matches
  scores.sort((a, b) => b.count - a.count);
  if (scores[0].count > 0) {
    return scores[0].settings;
  }

  return DEFAULT_SETTINGS;
}

// --- Public API ---

export interface AskResult {
  answer: string;
  voiceSettings: VoiceSettings;
  tone: string;
}

export async function askEcho(question: string): Promise<AskResult> {
  const echo = await getEcho();
  const answer = await echo.ask(question);

  const voiceSettings = analyzeEmotionalTone(answer);

  // Figure out which tone was picked (for debugging/UI)
  const lower = answer.toLowerCase();
  const scores = TONE_KEYWORDS.map(({ tone, words }) => {
    const count = words.reduce((sum, w) => sum + (lower.split(w).length - 1), 0);
    return { tone, count };
  });
  scores.sort((a, b) => b.count - a.count);
  const tone = scores[0].count > 0 ? scores[0].tone : "default";

  return { answer, voiceSettings, tone };
}
