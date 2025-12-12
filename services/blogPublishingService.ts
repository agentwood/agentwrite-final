/**
 * Daily Blog Publishing Service
 * Automates blog post creation and publishing from content plan
 */

import { blogService } from './blogService';
import { autoGenerateTags, cleanTags } from './autoTagService';
import { supabase } from './supabaseClient';

interface BlogPostTemplate {
    title: string;
    targetKeyword: string;
    keywordDifficulty: number;
    searchVolume: number;
    wordCount: number;
    category: string;
    template: 'guide' | 'comparison' | 'list' | 'howto';
    competitors?: string[];
    focus?: string;
}

// Content plan templates - Week 1 (Priority: Easy-to-win keywords)
const CONTENT_PLAN: BlogPostTemplate[] = [
    // Week 1: Foundation & Quick Wins
    {
        title: 'AI Blog Post Writer: Complete Guide to Automated Content Creation',
        targetKeyword: 'AI blog post writer',
        keywordDifficulty: 22,
        searchVolume: 1800,
        wordCount: 4000,
        category: 'Content Writing',
        template: 'guide',
        competitors: ['Sudowrite', 'Jasper'],
        focus: 'We\'re better for blog posts (Sudowrite is novel-focused)',
    },
    {
        title: 'AI Story Generator Free: 10 Best Tools Compared (2024)',
        targetKeyword: 'AI story generator free',
        keywordDifficulty: 20,
        searchVolume: 3200,
        wordCount: 3500,
        category: 'Story Writing',
        template: 'comparison',
        competitors: ['Talefy', 'NovelAI'],
        focus: 'We offer more than just interactive stories',
    },
    {
        title: 'AI Content Writer Free: Top 7 Tools That Actually Work',
        targetKeyword: 'AI content writer free',
        keywordDifficulty: 18,
        searchVolume: 2400,
        wordCount: 3000,
        category: 'Content Writing',
        template: 'list',
        focus: 'Free tier comparison, AgentWrite advantages',
    },
    {
        title: 'Creative Writing AI Tool: How AI Transforms Storytelling',
        targetKeyword: 'creative writing AI tool',
        keywordDifficulty: 19,
        searchVolume: 1100,
        wordCount: 3500,
        category: 'Creative Writing',
        template: 'guide',
        focus: 'Long-form content creation (where Talefy/Dipsea fail)',
    },
    {
        title: 'AI Writing Assistant for Stories: Complete Beginner\'s Guide',
        targetKeyword: 'AI writing assistant for stories',
        keywordDifficulty: 15,
        searchVolume: 890,
        wordCount: 2500,
        category: 'Story Writing',
        template: 'howto',
        focus: 'Step-by-step guide, AgentWrite features',
    },
    {
        title: 'AI Novel Writer: Best Tools for Long-Form Fiction Writing',
        targetKeyword: 'AI novel writer',
        keywordDifficulty: 24,
        searchVolume: 1500,
        wordCount: 4000,
        category: 'Story Writing',
        template: 'comparison',
        competitors: ['Sudowrite'],
        focus: 'We\'re better for multi-format content',
    },
    {
        title: 'AI Short Story Generator: Create Compelling Stories in Minutes',
        targetKeyword: 'AI short story generator',
        keywordDifficulty: 16,
        searchVolume: 980,
        wordCount: 2500,
        category: 'Story Writing',
        template: 'guide',
        focus: 'Short-form content (Sudowrite weakness)',
    },
    // Week 2: Storytelling & Fiction
    {
        title: 'Interactive Story Creator: Beyond Basic Chatbots',
        targetKeyword: 'interactive story creator',
        keywordDifficulty: 17,
        searchVolume: 1200,
        wordCount: 3000,
        category: 'Story Writing',
        template: 'guide',
        competitors: ['Talefy'],
        focus: 'Compare with Talefy, show we do more',
    },
    {
        title: 'AI Story Writing Software: Complete Comparison Guide',
        targetKeyword: 'AI story writing software',
        keywordDifficulty: 15,
        searchVolume: 890,
        wordCount: 3500,
        category: 'Story Writing',
        template: 'comparison',
        focus: 'Comprehensive tool comparison',
    },
    {
        title: 'Fiction Writing AI Assistant: Write Better Stories Faster',
        targetKeyword: 'fiction writing AI assistant',
        keywordDifficulty: 13,
        searchVolume: 750,
        wordCount: 3000,
        category: 'Creative Writing',
        template: 'guide',
        focus: 'Long-form fiction (Talefy weakness)',
    },
    {
        title: 'AI Character Generator for Stories: Create Memorable Characters',
        targetKeyword: 'AI character generator for stories',
        keywordDifficulty: 16,
        searchVolume: 1100,
        wordCount: 2500,
        category: 'Creative Writing',
        template: 'guide',
        focus: 'Character development features',
    },
    {
        title: 'AI Plot Generator: 50 Story Ideas That Actually Work',
        targetKeyword: 'AI plot generator',
        keywordDifficulty: 18,
        searchVolume: 1400,
        wordCount: 3000,
        category: 'Story Writing',
        template: 'list',
        focus: 'Plot generation capabilities',
    },
    {
        title: 'Story Idea Generator AI: Never Run Out of Ideas Again',
        targetKeyword: 'story idea generator AI',
        keywordDifficulty: 19,
        searchVolume: 1600,
        wordCount: 2500,
        category: 'Story Writing',
        template: 'guide',
        focus: 'Idea generation features',
    },
    {
        title: 'AI Writing Tool for Novels: Complete Guide for Authors',
        targetKeyword: 'AI writing tool for novels',
        keywordDifficulty: 20,
        searchVolume: 1000,
        wordCount: 4000,
        category: 'Story Writing',
        template: 'guide',
        competitors: ['Sudowrite'],
        focus: 'Compete with Sudowrite directly',
    },
    // Week 3: Content Creation & Blogging
    {
        title: 'AI Article Writer: Generate High-Quality Articles Automatically',
        targetKeyword: 'AI article writer',
        keywordDifficulty: 21,
        searchVolume: 2100,
        wordCount: 3500,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Article writing (Sudowrite/Talefy weakness)',
    },
    {
        title: 'AI Blog Content Generator: Scale Your Content Production',
        targetKeyword: 'AI blog content generator',
        keywordDifficulty: 17,
        searchVolume: 1300,
        wordCount: 3000,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Blog-specific features',
    },
    {
        title: 'AI Copywriting Tool: Write Compelling Marketing Copy',
        targetKeyword: 'AI copywriting tool',
        keywordDifficulty: 22,
        searchVolume: 1800,
        wordCount: 3000,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Marketing content (competitor weakness)',
    },
    {
        title: 'AI Writing Tool for Content Creators: Complete Guide',
        targetKeyword: 'AI writing tool for content creators',
        keywordDifficulty: 15,
        searchVolume: 980,
        wordCount: 3500,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Multi-format content creation',
    },
    {
        title: 'Automated Content Writing: How to Scale Your Blog',
        targetKeyword: 'automated content writing',
        keywordDifficulty: 19,
        searchVolume: 1200,
        wordCount: 3000,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Automation features',
    },
    {
        title: 'Best Free AI Writing Tool for Stories: 2024 Comparison',
        targetKeyword: 'best free AI writing tool for stories',
        keywordDifficulty: 12,
        searchVolume: 420,
        wordCount: 3500,
        category: 'AI Tools',
        template: 'comparison',
        focus: 'Free tier advantages',
    },
    {
        title: 'AI Tool to Write Blog Posts Automatically: Step-by-Step',
        targetKeyword: 'AI tool to write blog posts automatically',
        keywordDifficulty: 11,
        searchVolume: 380,
        wordCount: 2500,
        category: 'Tutorials',
        template: 'howto',
        focus: 'Tutorial format',
    },
    // Week 4: Advanced Topics
    {
        title: 'How to Use AI for Creative Writing: Complete Guide',
        targetKeyword: 'how to use AI for creative writing',
        keywordDifficulty: 10,
        searchVolume: 320,
        wordCount: 3000,
        category: 'Tutorials',
        template: 'howto',
        focus: 'Educational content',
    },
    {
        title: 'AI Writing Assistant vs Human Writer: The Truth',
        targetKeyword: 'AI writing assistant vs human writer',
        keywordDifficulty: 13,
        searchVolume: 450,
        wordCount: 3500,
        category: 'Writing Tips',
        template: 'comparison',
        focus: 'Comparison and benefits',
    },
    {
        title: 'Free AI Story Generator No Signup: Top 5 Tools',
        targetKeyword: 'free AI story generator no signup',
        keywordDifficulty: 9,
        searchVolume: 280,
        wordCount: 2500,
        category: 'AI Tools',
        template: 'list',
        focus: 'No-signup advantage',
    },
    {
        title: 'AI Writing Tools Comparison: Sudowrite vs AgentWrite vs Talefy',
        targetKeyword: 'AI writing tools comparison',
        keywordDifficulty: 18,
        searchVolume: 1200,
        wordCount: 4000,
        category: 'Tool Comparisons',
        template: 'comparison',
        competitors: ['Sudowrite', 'Talefy'],
        focus: 'Direct competitor comparison',
    },
    {
        title: 'Long-Form Content Writing with AI: Complete Guide',
        targetKeyword: 'long-form content writing AI',
        keywordDifficulty: 17,
        searchVolume: 950,
        wordCount: 3500,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Our strength vs competitors',
    },
    {
        title: 'AI Storytelling Tools: Beyond Interactive Fiction',
        targetKeyword: 'AI storytelling tools',
        keywordDifficulty: 19,
        searchVolume: 1100,
        wordCount: 3000,
        category: 'Story Writing',
        template: 'guide',
        focus: 'We do more than Talefy',
    },
    {
        title: 'Content Writing Automation: Scale Your Writing Business',
        targetKeyword: 'content writing automation',
        keywordDifficulty: 18,
        searchVolume: 1050,
        wordCount: 3000,
        category: 'Content Writing',
        template: 'guide',
        focus: 'Business use cases',
    },
];

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

/**
 * Generate excerpt from title and keyword
 */
function generateExcerpt(title: string, targetKeyword: string, focus?: string): string {
    const baseExcerpt = `Learn how ${targetKeyword} can transform your content creation. ${focus || 'Discover the best tools and strategies for automated writing.'} This comprehensive guide covers everything you need to know.`;
    return baseExcerpt.substring(0, 160);
}

/**
 * Generate SEO metadata
 */
function generateSEOMetadata(template: BlogPostTemplate) {
    return {
        seoTitle: `${template.title} | AgentWrite`,
        seoDescription: generateExcerpt(template.title, template.targetKeyword, template.focus),
        seoKeywords: `${template.targetKeyword}, AI writing tools, ${template.category.toLowerCase()}, content creation, automated writing${template.competitors ? `, ${template.competitors.join(' alternative')}` : ''}`,
    };
}

/**
 * Calculate read time from word count
 */
function calculateReadTime(wordCount: number): number {
    // Average reading speed: 200 words per minute
    return Math.max(3, Math.ceil(wordCount / 200));
}

/**
 * Create a blog post from template
 */
export async function createBlogPostFromTemplate(
    template: BlogPostTemplate,
    content?: string
): Promise<string | null> {
    if (!supabase) {
        console.error('Supabase not configured');
        return null;
    }

    try {
        const slug = generateSlug(template.title);
        const excerpt = generateExcerpt(template.title, template.targetKeyword, template.focus);
        const seoMetadata = generateSEOMetadata(template);
        const readTime = calculateReadTime(template.wordCount);

        // Generate tags automatically
        const tags = await blogService.autoTagPost(
            template.title,
            content || `This is a comprehensive guide about ${template.targetKeyword}. ${template.focus || ''}`,
            excerpt,
            template.category,
            seoMetadata.seoKeywords
        );

        // Create the blog post
        const { data, error } = await supabase
            .from('blog_posts')
            .insert({
                title: template.title,
                slug: slug,
                excerpt: excerpt,
                content: content || `[Content for: ${template.title}]`, // Placeholder - should be generated
                author: 'AgentWrite Team',
                category: template.category,
                tags: tags,
                read_time: readTime,
                status: 'draft', // Start as draft, publish manually or via schedule
                seo_title: seoMetadata.seoTitle,
                seo_description: seoMetadata.seoDescription,
                seo_keywords: seoMetadata.seoKeywords,
                published_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating blog post:', error);
            return null;
        }

        return data.id;
    } catch (error) {
        console.error('Error in createBlogPostFromTemplate:', error);
        return null;
    }
}

/**
 * Schedule blog posts for daily publishing
 */
export async function scheduleDailyPosts(startDate: Date = new Date()): Promise<void> {
    const posts: Array<{ template: BlogPostTemplate; publishDate: Date }> = [];

    CONTENT_PLAN.forEach((template, index) => {
        const publishDate = new Date(startDate);
        publishDate.setDate(publishDate.getDate() + index);
        publishDate.setHours(9, 0, 0, 0); // 9 AM publish time
        posts.push({ template, publishDate });
    });

    console.log(`Scheduled ${posts.length} blog posts starting from ${startDate.toISOString()}`);

    // Store schedule (you can save this to database or localStorage)
    if (typeof window !== 'undefined') {
        localStorage.setItem('blog_publishing_schedule', JSON.stringify(posts));
    }

    return Promise.resolve();
}

/**
 * Get next post to publish
 */
export function getNextScheduledPost(): BlogPostTemplate | null {
    if (typeof window === 'undefined') return null;

    const schedule = localStorage.getItem('blog_publishing_schedule');
    if (!schedule) return null;

    try {
        const posts: Array<{ template: BlogPostTemplate; publishDate: string }> = JSON.parse(schedule);
        const now = new Date();

        // Find next post that should be published
        const nextPost = posts.find(post => {
            const publishDate = new Date(post.publishDate);
            return publishDate <= now;
        });

        return nextPost?.template || null;
    } catch (error) {
        console.error('Error reading schedule:', error);
        return null;
    }
}

/**
 * Get all scheduled posts
 */
export function getAllScheduledPosts(): Array<{ template: BlogPostTemplate; publishDate: Date }> {
    if (typeof window === 'undefined') return [];

    const schedule = localStorage.getItem('blog_publishing_schedule');
    if (!schedule) return [];

    try {
        const posts: Array<{ template: BlogPostTemplate; publishDate: string }> = JSON.parse(schedule);
        return posts.map(post => ({
            template: post.template,
            publishDate: new Date(post.publishDate),
        }));
    } catch (error) {
        console.error('Error reading schedule:', error);
        return [];
    }
}

/**
 * Publish a scheduled post
 */
export async function publishScheduledPost(postId: string): Promise<boolean> {
    if (!supabase) return false;

    try {
        const { error } = await supabase
            .from('blog_posts')
            .update({
                status: 'published',
                published_at: new Date().toISOString(),
            })
            .eq('id', postId);

        if (error) {
            console.error('Error publishing post:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in publishScheduledPost:', error);
        return false;
    }
}

/**
 * Get content plan templates
 */
export function getContentPlan(): BlogPostTemplate[] {
    return CONTENT_PLAN;
}

/**
 * Get template by index
 */
export function getTemplateByIndex(index: number): BlogPostTemplate | null {
    if (index < 0 || index >= CONTENT_PLAN.length) return null;
    return CONTENT_PLAN[index];
}

