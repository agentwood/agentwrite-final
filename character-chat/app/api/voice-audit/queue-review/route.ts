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
        await prisma.voiceAuditLog.create({
            data: {
                characterId,
                voiceName,
                finalScore,
                genderScore: JSON.parse(scores).genderScore,
                ageScore: JSON.parse(scores).ageScore,
                accentScore: JSON.parse(scores).accentScore,
                overallScore: JSON.parse(scores).overallScore,
                consistencyScore: JSON.parse(scores).consistencyScore,
                status: 'review_required',
                reason,
            },
        });

        // Add to review queue
        await prisma.voiceReviewQueue.create({
            data: {
                characterId,
                proposedVoice: voiceName,
                finalScore,
                reason,
                priority: finalScore < 50 ? 'high' : 'medium',
                status: 'pending',
            },
        });

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
