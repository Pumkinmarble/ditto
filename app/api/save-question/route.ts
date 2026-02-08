import { NextResponse } from 'next/server';
import { appendFile, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    const questionsDir = path.join(process.cwd(), 'questions');
    const filePath = path.join(questionsDir, 'questions.txt');

    if (!existsSync(questionsDir)) {
      await mkdir(questionsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${question.trim()}\n`;

    if (existsSync(filePath)) {
      await appendFile(filePath, line);
    } else {
      await writeFile(filePath, line);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save question' },
      { status: 500 }
    );
  }
}
