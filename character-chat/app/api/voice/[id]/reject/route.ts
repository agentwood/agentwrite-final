import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/voice/[id]/reject
 * 
 * Admin: Reject a voice contribution.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const reason = body.reason || 'Does not meet quality standards';

        const contribution = await db.voiceContribution.findUnique({
            where: { id },
        });

        if (!contribution) {
            return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
        }

        if (contribution.status === 'rejected') {
            return NextResponse.json({ error: 'Voice already rejected' }, { status: 400 });
        }

        const updated = await db.voiceContribution.update({
            where: { id },
            data: {
                status: 'rejected',
                rejectionReason: reason,
            },
        });

        // Log audit
        await db.adminAuditLog.create({
            data: {
                adminId: 'system',
                action: 'reject_voice',
                targetType: 'voice_contribution',
                targetId: id,
                metadata: JSON.stringify({ reason, previousStatus: contribution.status }),
            },
        });

        console.log(`[Admin] Rejected voice ${id}: ${reason}`);

        return NextResponse.json({ success: true, voice: { id: updated.id, status: updated.status } });

    } catch (error: any) {
        console.error('[VoiceReject] Error:', error);
        return NextResponse.json({ error: 'Failed to reject voice' }, { status: 500 });
    }
}
