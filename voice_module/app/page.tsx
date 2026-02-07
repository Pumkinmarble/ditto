import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ marginBottom: 8 }}>Echo Voice Module</h1>
      <p style={{ marginBottom: 16 }}>
        Go to the voice demo page to test cloning and TTS.
      </p>
      <Link href="/voice-test">Open voice demo</Link>
    </main>
  );
}
