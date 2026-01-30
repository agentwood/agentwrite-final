import { db } from '@/lib/db';
import { remark } from 'remark';
import html from 'remark-html';

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    image: string;
    author: string;
    tags: string[];
    contentHtml?: string;
    category?: string;
}

export async function getSortedPostsData(): Promise<BlogPost[]> {
    try {
        const posts = await db.blogPost.findMany({
            where: { publishedAt: { gt: new Date(0) } },
            orderBy: { publishedAt: 'desc' },
        });

        return posts.map(post => ({
            slug: post.slug,
            title: post.title,
            date: post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : new Date().toISOString(),
            excerpt: post.excerpt || '',
            image: post.image || '/images/blog-placeholder.jpg',
            author: post.author || 'Agentwood Team',
            tags: post.tags || [],
            category: post.tags?.[0] || 'GENERAL', // Use first tag as category
        }));
    } catch (error) {
        console.error("Error fetching blog posts from DB:", error);
        return [];
    }
}

export async function getPostData(slug: string): Promise<BlogPost | null> {
    try {
        const post = await db.blogPost.findUnique({
            where: { slug },
        });

        if (!post) return null;

        // Convert Markdown to HTML
        const processedContent = await remark()
            .use(html)
            .process(post.content || '');
        const contentHtml = processedContent.toString();

        return {
            slug: post.slug,
            title: post.title,
            date: post.publishedAt ? post.publishedAt.toISOString().split('T')[0] : new Date().toISOString(),
            excerpt: post.excerpt || '',
            image: post.image || '/images/blog-placeholder.jpg',
            author: post.author || 'Agentwood Team',
            tags: post.tags || [],
            contentHtml,
            category: post.tags?.[0] || 'GENERAL',
        };
    } catch (error) {
        console.error(`Error fetching blog post ${slug}:`, error);
        return null;
    }
}

export async function getAllPostSlugs(): Promise<{ params: { slug: string } }[]> {
    const posts = await db.blogPost.findMany({
        select: { slug: true },
    });
    return posts.map((post) => ({
        params: {
            slug: post.slug,
        },
    }));
}

export async function getAllPostsWithDates(): Promise<{ slug: string; date: string }[]> {
    const posts = await db.blogPost.findMany({
        select: { slug: true, publishedAt: true },
    });
    return posts.map((post) => ({
        slug: post.slug,
        date: post.publishedAt ? post.publishedAt.toISOString() : new Date().toISOString(),
    }));
}
