import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure this never caches statically

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');

        const whereClause: any = {
            creationStatus: 'ready',
        };

        if (category && category !== 'All' && category !== '') {
            whereClause.category = category;
        }

        const characters = await db.personaTemplate.findMany({
            where: whereClause,
            orderBy: {
                viewCount: 'desc' // Default sort by popularity
            }
        });

        // Map to CharacterProfile interface
        const profiles = characters.map(c => ({
            id: c.id,
            name: c.name,
            handle: c.handle || `@${c.name.replace(/\s+/g, '').toLowerCase()}`,
            tagline: c.tagline || '',
            description: c.description || '',
            avatarUrl: c.avatarUrl,
            category: c.category,
            chatCount: c.chatCount || 0,
            viewCount: c.viewCount || 0,
            followerCount: c.followerCount || 0,
            saveCount: c.saveCount || 0,
            voiceName: c.voiceName,
            chatStarters: c.prompts ? JSON.parse(c.prompts) : [],
            // Add other fields as necessary
        }));

        return NextResponse.json(profiles);
    } catch (error) {
        console.error('Error fetching character list:', error);
        return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
    }
}
