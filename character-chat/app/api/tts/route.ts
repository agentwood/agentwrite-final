import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';
import { Modality } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceName, styleHint } = await request.json();

    if (!text || !voiceName) {
      return NextResponse.json(
        { error: 'text and voiceName are required' },
        { status: 400 }
      );
    }

    // Check if we have cached audio (you can implement caching here)
    // For now, we'll generate fresh audio

    const ai = getGeminiClient();
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      return NextResponse.json(
        { error: 'No audio data returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio: audioData,
      format: 'pcm',
      sampleRate: 24000,
    });
  } catch (error) {
    console.error('Error generating TTS:', error);
    return NextResponse.json(
      { error: 'Failed to generate TTS' },
      { status: 500 }
    );
  }
}

