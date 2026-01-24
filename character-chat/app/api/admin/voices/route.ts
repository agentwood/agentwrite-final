import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/voices
 * 
 * List all voice contributions for admin management.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const where = status ? { status } : {};

        const [voices, total] = await Promise.all([
            db.voiceContribution.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    contributor: {
                        select: { id: true, username: true, email: true },
                    },
                    _count: {
                        select: { usageEvents: true, characterLinks: true },
                    },
                },
            }),
            db.voiceContribution.count({ where }),
        ]);

        return NextResponse.json({
            voices: voices.map((v) => ({
                id: v.id,
                displayName: v.displayName,
                status: v.status,
                qualityScore: v.qualityScore,
                noiseScore: v.noiseScore,
                totalMinutesUsed: v.totalMinutesUsed,
                activeCharacterCount: v._count.characterLinks,
                usageEventCount: v._count.usageEvents,
                contributor: v.contributor,
                gender: v.gender,
                age: v.age,
                accent: v.accent,
                createdAt: v.createdAt,
                approvedAt: v.approvedAt,
            })),
            total,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error('[AdminVoices] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch voices' }, { status: 500 });
    }
}
