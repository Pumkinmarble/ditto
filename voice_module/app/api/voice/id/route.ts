import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const idPath = path.join(process.cwd(), "voice_profiles", "active_voice_id.txt");
    const voiceId = (await readFile(idPath, "utf8")).trim();
    if (!voiceId) {
      return NextResponse.json({ voice_id: null });
    }
    return NextResponse.json({ voice_id: voiceId });
  } catch {
    return NextResponse.json({ voice_id: null });
  }
}
