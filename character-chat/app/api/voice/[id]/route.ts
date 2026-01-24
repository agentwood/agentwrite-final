import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * GET /api/voice/[id]
 * 
 * Fetch a single voice contribution.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const contribution = await db.voiceContribution.findUnique({
            where: { id },
            select: {
                id: true,
                displayName: true,
                description: true,
                status: true,
                qualityScore: true,
                gender: true,
                age: true,
                accent: true,
                totalMinutesUsed: true,
                activeCharacterCount: true,
                createdAt: true,
                approvedAt: true,
                contributorId: true,
            },
        });

        if (!contribution) {
            return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
        }

        return NextResponse.json({ voice: contribution });

    } catch (error: any) {
        console.error('[VoiceGet] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch voice' }, { status: 500 });
    }
}

/**
 * PATCH /api/voice/[id]
 * 
 * Update voice contribution settings.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = getUserIdFromRequest(request);
        const body = await request.json();

        // 1. Verify ownership
        const contribution = await db.voiceContribution.findUnique({
            where: { id },
            select: { contributorId: true },
        });

        if (!contribution) {
            return NextResponse.json({ error: 'Voice not found' }, { status: 404 });
        }

        if (contribution.contributorId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // 2. Allowed updates
        const allowedFields = ['displayName', 'description', 'allowEnterpriseResale', 'licensingType', 'isPaused'];
        const updateData: Record<string, any> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        // 3. Update
        const updated = await db.voiceContribution.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                displayName: true,
                allowEnterpriseResale: true,
                licensingType: true,
                isPaused: true,
            },
        });

        return NextResponse.json({ success: true, voice: updated });

    } catch (error: any) {
        console.error('[VoiceUpdate] Error:', error);
        return NextResponse.json({ error: 'Failed to update voice' }, { status: 500 });
    }
}
