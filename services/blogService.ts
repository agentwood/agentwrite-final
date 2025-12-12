import { supabase } from './supabaseClient';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    tags: string[];
    readTime: number;
    imageUrl?: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'published' | 'archived';
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    viewCount: number;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export const blogService = {
    async getAllPosts(category?: string, limit?: number, offset?: number): Promise<BlogPost[]> {
        if (!supabase) {
            return [];
        }

        let query = supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (limit) {
            query = query.limit(limit);
        }

        if (offset) {
            query = query.range(offset, offset + (limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching blog posts:', error);
            return [];
        }

        return (data || []).map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            category: post.category,
            tags: post.tags || [],
            readTime: post.read_time,
            imageUrl: post.image_url,
            publishedAt: post.published_at,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            status: post.status,
            seoTitle: post.seo_title,
            seoDescription: post.seo_description,
            seoKeywords: post.seo_keywords,
            viewCount: post.view_count || 0,
        }));
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
        if (!supabase) {
            return null;
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single();

        if (error || !data) {
            console.error('Error fetching blog post:', error);
            return null;
        }

        // Increment view count
        await supabase
            .from('blog_posts')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id);

        return {
            id: data.id,
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            author: data.author,
            category: data.category,
            tags: data.tags || [],
            readTime: data.read_time,
            imageUrl: data.image_url,
            publishedAt: data.published_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            status: data.status,
            seoTitle: data.seo_title,
            seoDescription: data.seo_description,
            seoKeywords: data.seo_keywords,
            viewCount: (data.view_count || 0) + 1,
        };
    },

    async searchPosts(query: string): Promise<BlogPost[]> {
        if (!supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
            .order('published_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error searching blog posts:', error);
            return [];
        }

        return (data || []).map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            category: post.category,
            tags: post.tags || [],
            readTime: post.read_time,
            imageUrl: post.image_url,
            publishedAt: post.published_at,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            status: post.status,
            seoTitle: post.seo_title,
            seoDescription: post.seo_description,
            seoKeywords: post.seo_keywords,
            viewCount: post.view_count || 0,
        }));
    },

    async getCategories(): Promise<BlogCategory[]> {
        if (!supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('blog_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }

        return (data || []).map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
        }));
    },

    async getRelatedPosts(category: string, excludeSlug: string, limit: number = 3): Promise<BlogPost[]> {
        if (!supabase) {
            return [];
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .eq('category', category)
            .neq('slug', excludeSlug)
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching related posts:', error);
            return [];
        }

        return (data || []).map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            author: post.author,
            category: post.category,
            tags: post.tags || [],
            readTime: post.read_time,
            imageUrl: post.image_url,
            publishedAt: post.published_at,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            status: post.status,
            seoTitle: post.seo_title,
            seoDescription: post.seo_description,
            seoKeywords: post.seo_keywords,
            viewCount: post.view_count || 0,
        }));
    },
    
    /**
     * Auto-generate tags for a blog post based on content
     */
    async autoTagPost(
        title: string,
        content: string,
        excerpt: string,
        category: string,
        seoKeywords?: string
    ): Promise<string[]> {
        // Import auto-tagging service
        const { autoGenerateTags, cleanTags } = await import('./autoTagService');
        
        // Generate tags automatically
        const generatedTags = autoGenerateTags(title, content, excerpt, category, seoKeywords);
        
        // Clean and validate tags
        return cleanTags(generatedTags);
    },
};

