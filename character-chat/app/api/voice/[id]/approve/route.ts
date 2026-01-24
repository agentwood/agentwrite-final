import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/voice/[id]/approve
 * 
 * Admin: Approve a voice contribution.
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // TODO: Add admin auth check
        // const adminId = getAdminIdFromRequest(request);
        // if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const contribution = await db.voiceContribution.findUnique({
            where: { id },
        });

        if (!contribution) {
            return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
        }

        if (contribution.status === 'approved') {
            return NextResponse.json({ error: 'Voice already approved' }, { status: 400 });
        }

        const updated = await db.voiceContribution.update({
            where: { id },
            data: {
                status: 'approved',
                approvedAt: new Date(),
            },
        });

        // Log audit
        await db.adminAuditLog.create({
            data: {
                adminId: 'system', // Replace with actual admin ID
                action: 'approve_voice',
                targetType: 'voice_contribution',
                targetId: id,
                metadata: JSON.stringify({ previousStatus: contribution.status }),
            },
        });

        console.log(`[Admin] Approved voice ${id}`);

        return NextResponse.json({ success: true, voice: { id: updated.id, status: updated.status } });

    } catch (error: any) {
        console.error('[VoiceApprove] Error:', error);
        return NextResponse.json({ error: 'Failed to approve voice' }, { status: 500 });
    }
}
