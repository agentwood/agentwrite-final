import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/data/characters
 * Export character data for training/analysis
 */
export async function GET(request: NextRequest) {
    try {
        const characters = await db.personaTemplate.findMany({
            select: {
                id: true,
                seedId: true,
                name: true,
                tagline: true,
                description: true,
                category: true,
                archetype: true,
                gender: true,
                avatarUrl: true,
                voiceName: true,
                styleHint: true,
                systemPrompt: true,
                greeting: true,
                viewCount: true,
                createdAt: true,
                _count: {
                    select: {
                        conversations: true,
                        followers: true
                    }
                }
            },
            orderBy: { viewCount: 'desc' }
        });

        const formattedData = characters.map(char => ({
            id: char.id,
            seedId: char.seedId,
            name: char.name,
            tagline: char.tagline,
            description: char.description,
            category: char.category,
            archetype: char.archetype,
            gender: char.gender,
            avatarUrl: char.avatarUrl,
            voiceName: char.voiceName,
            styleHint: char.styleHint,
            systemPrompt: char.systemPrompt,
            greeting: char.greeting,
            stats: {
                views: char.viewCount || 0,
                conversations: char._count.conversations,
                followers: char._count.followers
            },
            createdAt: char.createdAt
        }));

        return NextResponse.json({
            count: formattedData.length,
            characters: formattedData
        });

    } catch (error: any) {
        console.error('[Character Data Export] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
