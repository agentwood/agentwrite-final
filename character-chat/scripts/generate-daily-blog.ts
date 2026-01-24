
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { generateText } from '../lib/geminiClient';
import slugify from 'slugify';

// Initialize Prisma
const prisma = new PrismaClient();

const BLOG_TOPICS = [
    "AI Companionship",
    "The Future of Digital Intimacy",
    "Voice AI Technology",
    "Virtual Reality & Social Connection",
    "The Psychology of Chatbots",
    "AI in Creative Writing",
    "Character Development in the Digital Age",
    "Roleplay and Mental Health",
    "Privacy in AI Interactions",
    "The Ethics of Sentient AI"
];

const TARGET_AUDIENCE = "Tech-savvy users, writers, and people seeking virtual connection.";
const TONE = "Insightful, empathetic, and slightly futuristic.";

async function generateBlogPost() {
    console.log("Starting Daily Blog Generation...");

    try {
        // 1. Pick a topic
        const topic = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];

        // 2. Generate Title
        const titlePrompt = `Generate a catchy, SEO-friendly blog post title about "${topic}" for an audience interested in AI characters and roleplay. Return ONLY the title, no quotes.`;
        const title = (await generateText(titlePrompt)).trim();
        const slug = slugify(title, { lower: true, strict: true });

        // Check for duplicates
        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
            console.log(`Skipping duplicate: ${slug}`);
            return;
        }

        // 3. Generate Content
        const contentPrompt = `
        Write a high-quality, 1500-word blog post in Markdown format about "${title}".
        Target Audience: ${TARGET_AUDIENCE}
        Tone: ${TONE}
        
        Structure:
        - Engaging Introduction
        - 3-4 Deep Dive Subheadings (H2)
        - Key Takeaways or Future Outlook
        - Conclusion
        
        Include relevant keywords for SEO: AI companions, virtual girlfriend, chatbot roleplay, Agentwood.
        Do NOT include frontmatter. Just the markdown content.
        `;

        const content = await generateText(contentPrompt);

        // 4. Generate Excerpt
        const excerptPrompt = `Write a compelling 150-character meta description/excerpt for this blog post: "${title}".`;
        const excerpt = (await generateText(excerptPrompt)).trim();

        // 5. Generate Tags
        const tagsPrompt = `Generate 5 relevant JSON tags for this post about "${title}". Return ONLY a JSON array of strings e.g. ["AI", "Tech"].`;
        const tagsRaw = await generateText(tagsPrompt);
        let tags: string[] = ["AI", "Blog"];
        try {
            // extraction attempt
            const jsonMatch = tagsRaw.match(/\[.*\]/s);
            if (jsonMatch) {
                tags = JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            console.warn("Failed to parse tags", e);
        }

        // 6. Save to DB
        const post = await prisma.blogPost.create({
            data: {
                slug,
                title,
                content, // Markdown
                excerpt,
                metaDescription: excerpt,
                tags,
                author: "Agentwood AI",
                image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200", // Placeholder or dynamic
                publishedAt: new Date(),
            }
        });

        console.log(`[SUCCESS] Generated blog: ${title} (${post.id})`);

    } catch (error) {
        console.error("Error generating blog post:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
if (require.main === module) {
    generateBlogPost()
        .then(() => process.exit(0))
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}
