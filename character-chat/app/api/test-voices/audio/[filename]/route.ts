import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { getGeminiClient } from '@/lib/geminiClient';
import { Modality } from '@google/genai';

// Map test files to voice names and reference text
const TEST_VOICE_MAP: Record<string, { voiceName: string; text: string }> = {
  'test-1.wav': { voiceName: 'kore', text: 'Hello, I am a professional character with a clear speaking voice. This is a test for OpenVoice voice cloning.' },
  'test-2.wav': { voiceName: 'aoede', text: 'Hi there! I am a friendly character with a warm voice. This sample will be used for voice cloning testing.' },
  'test-3.wav': { voiceName: 'charon', text: 'Hey! I am an energetic character with an enthusiastic voice. This is perfect for testing voice synthesis quality.' },
  'test-4.wav': { voiceName: 'pulcherrima', text: 'Hello. I am a calm character with a soothing voice. This reference audio will help test OpenVoice capabilities.' },
  'test-5.wav': { voiceName: 'rasalgethi', text: 'Good day. I am an authoritative character with a confident speaking style. This sample tests voice cloning accuracy.' },
};

function isValidWAV(buffer: Buffer): boolean {
  // Check for WAV file header: "RIFF" (52 49 46 46) followed by "WAVE"
  if (buffer.length < 12) return false;
  const header = buffer.toString('ascii', 0, 4);
  const format = buffer.toString('ascii', 8, 12);
  return header === 'RIFF' && format === 'WAVE';
}

/**
 * Convert PCM16 audio data to WAV format
 * PCM is Int16 Little Endian, 24kHz, mono
 */
function pcmToWAV(pcmData: Buffer, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16): Buffer {
  const dataLength = pcmData.length;
  const fileSize = 36 + dataLength;
  
  // Create WAV header
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize - 8, 4); // File size - 8
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // Audio format (1 = PCM)
  header.writeUInt16LE(channels, 22); // Number of channels
  header.writeUInt32LE(sampleRate, 24); // Sample rate
  header.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28); // Byte rate
  header.writeUInt16LE(channels * (bitsPerSample / 8), 32); // Block align
  header.writeUInt16LE(bitsPerSample, 34); // Bits per sample
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40); // Data size
  
  // Combine header + PCM data
  return Buffer.concat([header, pcmData]);
}

async function generateAudioOnDemand(filename: string): Promise<Buffer> {
  const voiceConfig = TEST_VOICE_MAP[filename];
  if (!voiceConfig) {
    throw new Error(`Unknown test file: ${filename}`);
  }

  const ai = getGeminiClient();
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: {
      parts: [{ text: voiceConfig.text }]
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceConfig.voiceName.toLowerCase()
          }
        }
      }
    }
  });

  const audioData = result.candidates?.[0]?.content?.parts?.find(
    (part: any) => part.inlineData?.mimeType?.includes('audio')
  )?.inlineData?.data;

  if (!audioData) {
    throw new Error('No audio data returned from TTS');
  }

  // Gemini TTS returns PCM16 data, convert to WAV
  const pcmBuffer = Buffer.from(audioData, 'base64');
  return pcmToWAV(pcmBuffer, 24000, 1, 16);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // #region agent log
    const logData = { location: 'api/test-voices/audio/[filename]/route.ts:10', message: 'Audio API request received', data: { filename, url: request.url }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
    await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {});
    // #endregion
    
    // Validate filename to prevent path traversal
    if (!filename.match(/^test-[1-5]\.wav$/)) {
      // #region agent log
      const logData = { location: 'api/test-voices/audio/[filename]/route.ts:16', message: 'Invalid filename', data: { filename }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
      await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {});
      // #endregion
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Path to audio files
    const audioPath = path.join(
      process.cwd(),
      '..',
      'poc',
      'openvoice-demo',
      'sample-reference-audio',
      filename
    );

    let audioBuffer: Buffer;

    // Check if file exists and is valid
    if (fs.existsSync(audioPath)) {
      const fileBuffer = fs.readFileSync(audioPath);
      
      // Check if file is corrupted (starts with zeros) - if so, regenerate
      const startsWithZeros = fileBuffer.length > 0 && fileBuffer[0] === 0 && fileBuffer[1] === 0 && fileBuffer[2] === 0 && fileBuffer[3] === 0;
      
      // Validate WAV format
      if (!isValidWAV(fileBuffer) || startsWithZeros) {
        // #region agent log
        const logData = { location: 'api/test-voices/audio/[filename]/route.ts:validate', message: startsWithZeros ? 'Corrupted file (starts with zeros), generating fresh audio' : 'Invalid WAV file, generating fresh audio', data: { filename, fileSize: fileBuffer.length, startsWithZeros }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
        await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {});
        // #endregion
        // File is corrupted or invalid, generate fresh audio
        audioBuffer = await generateAudioOnDemand(filename);
      } else {
        // Valid WAV file, use as-is
        audioBuffer = fileBuffer;
      }
    } else {
      // #region agent log
      const logData = { location: 'api/test-voices/audio/[filename]/route.ts:missing', message: 'Audio file not found, generating on-demand', data: { filename, audioPath }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
      await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {});
      // #endregion
      // File doesn't exist, generate on-demand
      audioBuffer = await generateAudioOnDemand(filename);
    }
    
    // #region agent log
    const headerCheck = audioBuffer.length >= 12 ? {
      first4Bytes: audioBuffer.toString('ascii', 0, 4),
      bytes8to12: audioBuffer.toString('ascii', 8, 12),
      first12Hex: audioBuffer.slice(0, 12).toString('hex')
    } : { tooSmall: true };
    const logData3 = { location: 'api/test-voices/audio/[filename]/route.ts:46', message: 'Serving audio file', data: { filename, bufferSize: audioBuffer.length, isValidWAV: isValidWAV(audioBuffer), headerCheck }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
    await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData3) }).catch(() => {});
    // #endregion
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable cache to ensure fresh WAV files
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    // #region agent log
    const logData = { location: 'api/test-voices/audio/[filename]/route.ts:56', message: 'Error serving audio file', data: { error: error.message, stack: error.stack }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' };
    await fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {});
    // #endregion
    console.error('Error serving audio file:', error);
    return NextResponse.json(
      { error: 'Failed to serve audio file', details: error.message },
      { status: 500 }
    );
  }
}

