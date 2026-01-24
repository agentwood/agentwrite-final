
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { generateText } from '../lib/geminiClient';
import slugify from 'slugify';

// Initialize Prisma
const prisma = new PrismaClient();

// A larger list of seed keywords for the bulk operation
const SEED_KEYWORDS = [
    "best ai girlfriend app", "chat with ai characters", "free ai roleplay",
    "nsfw ai chat alternatives", "character ai alternative", "virtual waifu chat",
    "anime character chat", "create your own ai character", "voice chat with ai",
    // Add hundreds more here for real scale
];

async function generateBulkSEO(limit: number = 5) {
    console.log(`Starting Bulk SEO Generation for ${limit} pages...`);

    let count = 0;

    for (const keyword of SEED_KEYWORDS) {
        if (count >= limit) break;

        const title = `The Ultimate Guide to ${keyword.replace(/(^\w|\s\w)/g, m => m.toUpperCase())}`;
        const slug = slugify(title, { lower: true, strict: true });

        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) {
            console.log(`Skipping existing: ${slug}`);
            continue;
        }

        try {
            console.log(`Generating: ${title}`);

            // Simplified prompt for speed/bulk
            const contentPrompt = `
            Write a 800-word SEO article about "${keyword}".
            Focus on user intent and helpful information.
            Include a section on how Agentwood solves this need.
            Format in Markdown.
            `;

            const content = await generateText(contentPrompt);

            await prisma.blogPost.create({
                data: {
                    slug,
                    title,
                    content,
                    excerpt: `Everything you need to know about ${keyword} and the best AI solutions.`,
                    metaDescription: `Comprehensive guide to ${keyword}. Learn more about AI chat options.`,
                    tags: ["SEO", "Guide", "AI"],
                    author: "Agentwood SEO Team",
                    publishedAt: new Date(),
                }
            });

            console.log(`[CREATED] ${slug}`);
            count++;

            // Rate limit pause
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
            console.error(`Failed to generate for ${keyword}`, error);
        }
    }

    console.log(`Bulk generation complete. ${count} pages created.`);
}

if (require.main === module) {
    // Default to 5 for testing, can be increased via args
    const limit = process.argv[2] ? parseInt(process.argv[2]) : 5;
    generateBulkSEO(limit)
        .then(() => process.exit(0))
        .catch((e) => {
            console.error(e);
            process.exit(1);
        });
}
