"use client";

import { useEffect, useRef, useState } from "react";
import VoiceRecorder from "../../components/VoiceRecorder";

const DEFAULT_SCRIPT =
  "Hello! This is my Echo voice sample. I'm excited to share a few memories and stories from my life. I grew up loving music, long walks, and late-night conversations with friends. Over the years, I learned to value curiosity, kindness, and showing up for the people I care about. This recording will help my digital twin speak in a way that feels like me.";

export default function VoiceTestPage() {
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [question, setQuestion] = useState("What do you think about family relationships and forgiveness?");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [tone, setTone] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load saved voice_id on mount
  useEffect(() => {
    fetch("/api/voice/id")
      .then((res) => res.json())
      .then((data) => {
        if (data.voice_id) setVoiceId(data.voice_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const handleAsk = async () => {
    if (!voiceId || !question.trim()) return;
    setIsSpeaking(true);
    setError(null);
    setAiResponse(null);
    setTone(null);

    try {
      const res = await fetch("/api/voice/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate response");
      }

      const data = await res.json();

      // Show the AI text response
      setAiResponse(data.answer);
      setTone(data.tone);

      // Decode base64 audio and play
      const audioBytes = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
      const blob = new Blob([audioBytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });

      requestAnimationFrame(() => {
        audioRef.current?.play();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleReplay = () => {
    audioRef.current?.play();
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Echo Voice Module</p>
          <h1 className="text-3xl font-semibold">Voice cloning + AI personality demo</h1>
          <p className="text-sm text-slate-600">
            Record a voice sample, then ask questions — the AI responds in that person&apos;s personality and voice.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-slate-900">Recommended script (30-60 seconds)</p>
          <p className="mt-2 text-sm text-slate-600">{DEFAULT_SCRIPT}</p>
        </section>

        <VoiceRecorder onVoiceCloned={setVoiceId} />

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-900">Voice ID</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {voiceId || "Not created yet"}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-900" htmlFor="question">
              Ask a question
            </label>
            <textarea
              id="question"
              rows={3}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none"
              placeholder="Ask the digital twin a question..."
              disabled={isSpeaking}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
                onClick={handleAsk}
                disabled={!voiceId || !question.trim() || isSpeaking}
                type="button"
              >
                {isSpeaking ? "Thinking & Speaking..." : "Ask & Speak"}
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
                onClick={handleReplay}
                disabled={!audioUrl || isSpeaking}
                type="button"
              >
                Replay
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {aiResponse && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-slate-500">AI Response</span>
                {tone && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    {tone}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{aiResponse}</p>
            </div>
          )}

          <div className="mt-4">
            <audio ref={audioRef} controls src={audioUrl || undefined} className="w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
