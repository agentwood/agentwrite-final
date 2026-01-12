import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ recents: [] });
        }

        // Fetch recent conversations, ordered by updatedAt
        const conversations = await prisma.conversation.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                persona: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        category: true
                    }
                }
            }
        });

        // Map to expected format
        const recents = conversations.map((c: any) => ({
            id: c.persona.id,
            name: c.persona.name,
            avatarUrl: c.persona.avatarUrl,
            category: c.persona.category || 'Character',
            lastMessageAt: c.updatedAt
        }));

        return NextResponse.json({ recents });

    } catch (error) {
        console.error('Error fetching recents:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
