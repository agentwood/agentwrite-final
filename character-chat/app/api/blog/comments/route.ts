import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/blog/comments - Add a comment to a blog post
 * GET /api/blog/comments?slug=xxx - Get comments for a post
 */

export async function POST(request: NextRequest) {
    try {
        const { slug, name, email, content } = await request.json();

        if (!slug || !name || !content) {
            return NextResponse.json(
                { error: 'Slug, name, and content are required' },
                { status: 400 }
            );
        }

        if (content.length > 2000) {
            return NextResponse.json(
                { error: 'Comment is too long (max 2000 characters)' },
                { status: 400 }
            );
        }

        const comment = await db.blogComment.create({
            data: {
                slug,
                name,
                email: email || null,
                content,
            },
        });

        return NextResponse.json({ success: true, comment });
    } catch (error: any) {
        console.error('[Blog Comment] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
        }

        const comments = await db.blogComment.findMany({
            where: { slug, approved: true },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                content: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ comments, count: comments.length });
    } catch (error: any) {
        console.error('[Blog Comment] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
