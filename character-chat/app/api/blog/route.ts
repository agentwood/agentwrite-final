import { NextResponse } from 'next/server';
import { getSortedPostsData } from '@/lib/blog/service';

export async function GET() {
    const posts = await getSortedPostsData();
    return NextResponse.json(posts);
}
