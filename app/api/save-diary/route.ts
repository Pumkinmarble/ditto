import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { content, sessionId } = await request.json();

    // Create diary-entries directory if it doesn't exist
    const diaryDir = path.join(process.cwd(), 'diary-entries');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(diaryDir, `diary-${timestamp}-${sessionId}.txt`);

    // Create directory
    if (!existsSync(diaryDir)) {
      await mkdir(diaryDir, { recursive: true });
    }

    // Write the diary entry to file
    await writeFile(filePath, content, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Diary entry saved successfully',
      filename: path.basename(filePath)
    });
  } catch (error) {
    console.error('Error saving diary entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save diary entry' },
      { status: 500 }
    );
  }
}
