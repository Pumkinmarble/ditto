import { NextResponse } from 'next/server';
import { writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { questionNum, questionText, answer, sessionId } = await request.json();

    // Create answers directory if it doesn't exist
    const answersDir = path.join(process.cwd(), 'quiz-answers');
    const filePath = path.join(answersDir, `session-${sessionId}.txt`);

    // Create directory
    if (!existsSync(answersDir)) {
      await mkdir(answersDir, { recursive: true });
    }

    const answerLine = `Q${questionNum}: ${questionText}\nAnswer: ${answer}\n\n`;

    // Append to file
    if (existsSync(filePath)) {
      await appendFile(filePath, answerLine);
    } else {
      await writeFile(filePath, answerLine);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving answer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}
