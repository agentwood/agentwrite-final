import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';

export async function POST(request: NextRequest) {
  try {
    const ai = getGeminiClient();
    
    // Create ephemeral token for Live API
    const token = await ai.authTokens.create({
      // Token configuration - check Gemini API docs for exact parameters
    });

    if (!token || !token.name) {
      return NextResponse.json(
        { error: 'Failed to create token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token: token.name,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    });
  } catch (error) {
    console.error('Error creating live token:', error);
    return NextResponse.json(
      { error: 'Failed to create live token' },
      { status: 500 }
    );
  }
}

