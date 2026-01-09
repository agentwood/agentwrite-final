import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/character/view - Increment view count for a character
 */
export async function POST(request: NextRequest) {
    try {
        const { characterId, userId } = await request.json();

        if (!characterId) {
            return NextResponse.json(
                { error: 'Character ID required' },
                { status: 400 }
            );
        }

        // Use a transaction to ensure atomicity
        await db.$transaction([
            // 1. Increment total views on the character template
            db.personaTemplate.update({
                where: { id: characterId },
                data: { viewCount: { increment: 1 } },
            }),
            // 2. Log individual view
            db.personaView.create({
                data: {
                    personaId: characterId,
                    userId: userId || null, // Optional user ID
                },
            }),
        ]);

        // Get updated count
        const updated = await db.personaTemplate.findUnique({
            where: { id: characterId },
            select: { viewCount: true },
        });

        return NextResponse.json({
            success: true,
            viewCount: updated?.viewCount || 0,
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
        // Silent fail for views to avoid breaking UI
        return NextResponse.json(
            { error: 'Failed to increment view' },
            { status: 500 }
        );
    }
}
