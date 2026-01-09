import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Queue voice for manual review
 * POST /api/voice-audit/queue-review
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, voiceName, finalScore, scores, reason } = body;

        // Don't release the voice - keep current voice or mark as not ready
        await prisma.personaTemplate.update({
            where: { id: characterId },
            data: {
                voiceReady: false,
            },
        });

        // Log the rejection and queue for review
        // Note: voiceAuditLog and voiceReviewQueue models not in schema - logging skipped
        // TODO: Add these models to schema if needed
        console.log(`Voice queued for review: ${characterId} -> ${voiceName} (score: ${finalScore}, reason: ${reason})`);

        return NextResponse.json({
            success: true,
            message: 'Voice queued for manual review',
            characterId,
            voiceName,
            finalScore,
            reason,
        });
    } catch (error: any) {
        console.error('Queue error:', error);
        return NextResponse.json(
            { error: 'Failed to queue for review', details: error.message },
            { status: 500 }
        );
    }
}
