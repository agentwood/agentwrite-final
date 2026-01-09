import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Approve voice and release to production
 * POST /api/voice-audit/approve
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, voiceName, finalScore, scores } = body;

        // Update character with approved voice
        await prisma.personaTemplate.update({
            where: { id: characterId },
            data: {
                voiceName,
                voiceReady: true,
            },
        });

        // Log the approval in audit trail
        // Note: voiceAuditLog model not in schema - logging skipped
        // TODO: Add VoiceAuditLog model to schema if needed
        console.log(`Voice approved: ${characterId} -> ${voiceName} (score: ${finalScore})`);

        return NextResponse.json({
            success: true,
            message: 'Voice approved and released to production',
            characterId,
            voiceName,
            finalScore,
        });
    } catch (error: any) {
        console.error('Approval error:', error);
        return NextResponse.json(
            { error: 'Failed to approve voice', details: error.message },
            { status: 500 }
        );
    }
}
