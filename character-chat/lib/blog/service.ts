import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    image: string;
    author: string;
    tags: string[];
    contentHtml?: string;
    viewCount?: number;
}

export async function getSortedPostsData(): Promise<BlogPost[]> {
    const posts = await prisma.blogPost.findMany({
        orderBy: {
            publishedAt: 'desc',
        },
        select: {
            slug: true,
            title: true,
            publishedAt: true,
            excerpt: true,
            image: true,
            author: true,
            tags: true,
        },
    });

    return posts.map(post => ({
        slug: post.slug,
        title: post.title,
        date: post.publishedAt.toISOString().split('T')[0],
        excerpt: post.excerpt || '',
        image: post.image || '',
        author: post.author,
        tags: post.tags,
    }));
}

export async function getPostData(slug: string): Promise<BlogPost | null> {
    const post = await prisma.blogPost.findUnique({
        where: { slug },
    });

    if (!post) {
        return null;
    }

    // Increment view count asynchronously
    // We don't await this to keep the response fast
    prisma.blogPost.update({
        where: { slug },
        data: { viewCount: { increment: 1 } },
    }).catch(console.error);

    return {
        slug: post.slug,
        title: post.title,
        date: post.publishedAt.toISOString().split('T')[0],
        excerpt: post.excerpt || '',
        image: post.image || '',
        author: post.author,
        tags: post.tags,
        contentHtml: post.content, // Assuming content is already HTML or Markdown that the frontend handles
        viewCount: post.viewCount,
    };
}

export async function getAllPostSlugs() {
    const posts = await prisma.blogPost.findMany({
        select: { slug: true },
    });

    return posts.map(post => ({
        params: {
            slug: post.slug,
        },
    }));
}
