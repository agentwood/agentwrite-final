
import 'dotenv/config';
import { generateText } from '../lib/geminiClient';
import fs from 'fs';
import path from 'path';
import {
    INTERNAL_LINK_RULES,
    EXECUTION_PROMPT
} from '../lib/seo/content-strategy';
import { AutonomousEngine } from '../lib/seo/autonomous-engine';

// Ensure GEMINI_API_KEY is set
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing!');
    process.exit(1);
}

async function main() {
    console.log('🚀 Starting Autonomous Content Engine Run...');

    const engine = new AutonomousEngine();

    try {
        // 1. Get Target from Engine (Deterministic based on State)
        const target = engine.getNextTarget();
        console.log(`🎯 Target: [${target.pillar}] -> "${target.keyword}"`);
        console.log(`📝 Template: ${target.template.name}`);

        // 2. Get Internal Link Context
        const suggestedLinks = engine.getInternalLinks(target.pillar);
        console.log(`🔗 Found ${suggestedLinks.length} internal link candidates.`);
        const linkContext = suggestedLinks.map(l => `- [${l.title}](/blog/${l.slug}) (${l.type})`).join('\n');

        // 3. Construct Prompt
        const fullPrompt = `
${EXECUTION_PROMPT}

CONTEXT:
Topical Pillar: ${target.pillar}
Primary Keyword: "${target.keyword}"
Template Structure:
${target.template.structure}

Template Rules:
${target.template.rules.map((r: string) => `- ${r}`).join('\n')}

Internal Linking Rules:
${INTERNAL_LINK_RULES.global.map((r: string) => `- ${r}`).join('\n')}
${INTERNAL_LINK_RULES.citation.rule} (e.g. ${INTERNAL_LINK_RULES.citation.example})

SUGGESTED INTERNAL LINKS (Include 1-2 of these if relevant, using natural anchors):
${linkContext || "No existing articles to link yet. You are writing one of the first articles."}

Generate a JSON object with the following fields:
{
  "title": "A compelling, human-sounding title",
  "slug": "url-friendly-slug-targeted-keyword",
  "excerpt": "A short, punchy summary for SEO",
  "content": "The full blog post content in Markdown format. Use H2/H3 headers.",
  "imagePrompt": "A detailed prompt for an Unsplash-style header image"
}
`;

        // 4. Generate Content via Gemini
        console.log('🤖 Generating content...');
        const response = await generateText(fullPrompt);

        // Clean response
        const jsonString = response.replace(/```json\n?|\n?```/g, '').trim();
        let blogData;
        try {
            blogData = JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse JSON response:", jsonString);
            throw e;
        }

        if (!blogData.title || !blogData.content) {
            throw new Error('Invalid JSON structure from Gemini');
        }

        console.log(`✅ Generated: "${blogData.title}"`);

        // 5. Save to File
        const date = new Date().toISOString().split('T')[0];
        const outputDir = path.join(process.cwd(), 'content', 'blog');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const filename = `${date}-${blogData.slug}.md`;
        const filePath = path.join(outputDir, filename);

        const fileContent = `---
title: "${blogData.title}"
date: "${new Date().toISOString()}"
excerpt: "${blogData.excerpt}"
imagePrompt: "${blogData.imagePrompt}"
pillar: "${target.pillar}"
keyword: "${target.keyword}"
template: "${target.template.name}"
---

${blogData.content}
`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`💾 Saved to file: ${filePath}`);

        // 6. Update Engine State
        engine.markAsPublished(target.keyword);
        console.log(`🔄 State Updated: "${target.keyword}" marked as PUBLISHED`);

    } catch (error) {
        console.error('❌ Error in Autonomous Engine Run:', error);
        process.exit(1);
    }
}

main();
