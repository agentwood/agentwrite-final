import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/voices/pool
 * 
 * Returns all available voice seeds for character creation.
 * Used by the VoiceSelector UI component.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const gender = searchParams.get('gender');

        // Build filter
        const where: any = {};
        if (category) where.category = category;
        if (gender) where.gender = gender;

        const voiceSeeds = await db.voiceSeed.findMany({
            where,
            select: {
                id: true,
                name: true,
                filePath: true,
                gender: true,
                age: true,
                tone: true,
                energy: true,
                accent: true,
                category: true,
                tags: true,
                suitableFor: true,
                description: true,
            },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        // Parse JSON fields back to arrays
        const formatted = voiceSeeds.map(seed => ({
            ...seed,
            tags: JSON.parse(seed.tags || '[]'),
            suitableFor: JSON.parse(seed.suitableFor || '[]'),
            // Add preview URL for audio player
            previewUrl: seed.filePath,
        }));

        // Group by category for UI
        const grouped = formatted.reduce((acc: any, seed) => {
            if (!acc[seed.category]) {
                acc[seed.category] = [];
            }
            acc[seed.category].push(seed);
            return acc;
        }, {});

        return NextResponse.json({
            total: voiceSeeds.length,
            categories: Object.keys(grouped),
            voices: formatted,
            grouped
        });

    } catch (error: any) {
        console.error('[VoicePool] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch voice pool', details: error.message }, { status: 500 });
    }
}
