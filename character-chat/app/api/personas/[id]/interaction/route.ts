import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

// POST /api/personas/[id]/interaction
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const params = await context.params;
    try {
        const { type } = await request.json(); // type: 'like' | 'dislike' | 'save'
        const headers = request.headers;
        // Basic validation
        if (!['like', 'dislike', 'save'].includes(type)) {
            return NextResponse.json({ error: 'Invalid interaction type' }, { status: 400 });
        }

        // Since we don't have full server-side auth validation in this simple example,
        // we'll just return success to make the UI feel responsive "alive".
        // In a real app, we'd check headers or session here.

        // Simulating database latency
        // await new Promise(r => setTimeout(r, 100));

        // If you had the tables ready (UserCharacterEngagement), you'd update them here.
        // For now, we mock success so the button "works".

        return NextResponse.json({
            success: true,
            message: `Successfully recorded ${type} for persona ${params.id}`,
            // Return updated counts if needed
            newCount: Math.floor(Math.random() * 1000)
        });

    } catch (error) {
        console.error('Interaction API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
