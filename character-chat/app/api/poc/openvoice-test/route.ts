/**
 * POC Test endpoint for OpenVoice integration
 * Temporary endpoint to test OpenVoice API calls from Next.js
 */

import { NextRequest, NextResponse } from 'next/server';

const OPENVOICE_API_URL = process.env.OPENVOICE_LOCAL_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Test health check
    const healthResponse = await fetch(`${OPENVOICE_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!healthResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `OpenVoice server not responding: ${healthResponse.statusText}`,
          openvoice_url: OPENVOICE_API_URL,
        },
        { status: 503 }
      );
    }

    const healthData = await healthResponse.json();

    return NextResponse.json({
      success: true,
      openvoice_url: OPENVOICE_API_URL,
      health: healthData,
      message: healthData.openvoice_ready
        ? 'OpenVoice server is ready'
        : 'OpenVoice server is running but not initialized',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to OpenVoice server',
        openvoice_url: OPENVOICE_API_URL,
        hint: 'Make sure OpenVoice server is running: python server.py',
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, reference_audio_base64, speed = 1.0, tone, emotion } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    // Test synthesis endpoint
    const synthesizeResponse = await fetch(`${OPENVOICE_API_URL}/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        reference_audio_base64,
        speed,
        tone,
        emotion,
      }),
    });

    if (!synthesizeResponse.ok) {
      const errorData = await synthesizeResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.detail || synthesizeResponse.statusText,
          status: synthesizeResponse.status,
        },
        { status: synthesizeResponse.status }
      );
    }

    const synthesizeData = await synthesizeResponse.json();

    return NextResponse.json({
      success: true,
      data: synthesizeData,
      message: synthesizeData.message || 'Synthesis completed',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to call OpenVoice API',
        openvoice_url: OPENVOICE_API_URL,
      },
      { status: 500 }
    );
  }
}
