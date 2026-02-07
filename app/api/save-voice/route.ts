import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const timestamp = formData.get('timestamp') as string;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Create voice-recordings directory if it doesn't exist
    const voiceDir = path.join(process.cwd(), 'voice-recordings');
    const tempWebmPath = path.join(voiceDir, `voice-${timestamp}.webm`);
    const mp3Filename = `voice-${timestamp}.mp3`;
    const mp3Path = path.join(voiceDir, mp3Filename);

    // Create directory
    if (!existsSync(voiceDir)) {
      await mkdir(voiceDir, { recursive: true });
    }

    // Convert blob to buffer and write temporary webm file
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempWebmPath, buffer);

    // Convert webm to mp3 using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempWebmPath)
        .toFormat('mp3')
        .audioBitrate('192k')
        .on('end', resolve)
        .on('error', reject)
        .save(mp3Path);
    });

    // Delete temporary webm file
    await unlink(tempWebmPath);

    return NextResponse.json({
      success: true,
      message: 'Voice recording saved successfully',
      filename: mp3Filename
    });
  } catch (error) {
    console.error('Error saving voice recording:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save voice recording' },
      { status: 500 }
    );
  }
}
