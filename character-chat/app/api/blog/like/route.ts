import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/blog/like - Like a blog post
 * GET /api/blog/like?slug=xxx - Get like count for a post
 */

export async function POST(request: NextRequest) {
    try {
        const { slug, sessionId } = await request.json();

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        // Check if already liked by this session
        const existing = await db.blogLike.findFirst({
            where: {
                slug,
                sessionId,
            },
        });

        if (existing) {
            // Unlike
            await db.blogLike.delete({ where: { id: existing.id } });
            const count = await db.blogLike.count({ where: { slug } });
            return NextResponse.json({ liked: false, count });
        }

        // Like
        await db.blogLike.create({
            data: {
                slug,
                sessionId,
            },
        });

        const count = await db.blogLike.count({ where: { slug } });
        return NextResponse.json({ liked: true, count });
    } catch (error: any) {
        console.error('[Blog Like] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const sessionId = searchParams.get('sessionId');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const count = await db.blogLike.count({ where: { slug } });

        let liked = false;
        if (sessionId) {
            const existing = await db.blogLike.findFirst({
                where: { slug, sessionId },
            });
            liked = !!existing;
        }

        return NextResponse.json({ count, liked });
    } catch (error: any) {
        console.error('[Blog Like] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
