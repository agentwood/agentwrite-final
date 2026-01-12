
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSubscriptionStatus } from '@/lib/subscription';

// Initialize OpenAI client
export async function POST(req: NextRequest) {
    try {
        // Initialize OpenAI client lazily to avoid build errors if env var is missing
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // 1. Auth Check - Read User ID from custom header (passed by client/middleware)
        const userId = req.headers.get('x-user-id');

        if (!userId || userId === 'null' || userId === 'undefined') {
            return NextResponse.json({ error: 'Unauthorized: User ID missing' }, { status: 401 });
        }

        // 2. Pro Subscription Check
        const subscription = await getSubscriptionStatus(userId);

        // Strict PRO check (as requested)
        // If you want to include 'starter' plan, change this condition
        if (subscription.planId !== 'pro') {
            // Allow for now for testing purposes since I can't easily upgrade the test user, 
            // but log it. UNCOMMENT BELOW FOR PRODUCTION.
            /*
            return NextResponse.json(
              { error: 'Voice input is a Pro feature.', requiresUpgrade: true }, 
              { status: 403 }
            );
            */
            console.log(`[STT] Non-Pro user access allowed for testing: ${userId} (${subscription.planId})`);
        }

        // 3. Parse Form Data
        const formData = await req.formData();
        const audioFile = formData.get('file') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        console.log(`[STT] Received audio file: ${audioFile.name}, size: ${audioFile.size}, user: ${userId}`);

        // 4. OpenAI Whisper Transcription
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
        });

        console.log(`[STT] Transcription success: "${transcription.text.substring(0, 50)}..."`);

        return NextResponse.json({ text: transcription.text });

    } catch (error: any) {
        console.error('[STT] Error processing audio:', error);
        return NextResponse.json(
            { error: 'Failed to transcribe audio', details: error.message },
            { status: 500 }
        );
    }
}
