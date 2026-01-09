import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/personas/[id]/status
 * Returns the creation status of a character being generated
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const character = await db.personaTemplate.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                creationStatus: true,
                creationProgress: true,
                creationMessage: true,
                creationError: true,
            },
        });

        if (!character) {
            return NextResponse.json(
                { error: 'Character not found' },
                { status: 404 }
            );
        }

        // If character has no status tracking, assume it's ready
        if (!character.creationStatus) {
            return NextResponse.json({
                status: 'ready',
                progress: 100,
                message: 'Character is ready',
            });
        }

        return NextResponse.json({
            status: character.creationStatus,
            progress: character.creationProgress || 0,
            message: character.creationMessage || '',
            error: character.creationError || undefined,
        });
    } catch (error: any) {
        console.error('Error fetching character status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        );
    }
}
