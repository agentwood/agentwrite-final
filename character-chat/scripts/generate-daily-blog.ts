
import 'dotenv/config';
import { generateText } from '../lib/geminiClient';
import fs from 'fs';
import path from 'path';
import {
    KEYWORD_PILLARS,
    CONTENT_TEMPLATES,
    INTERNAL_LINK_RULES,
    EXECUTION_PROMPT
} from '../lib/seo/content-strategy';

// Ensure GEMINI_API_KEY is set
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is missing!');
    process.exit(1);
}

// Utility to get random item from array
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

// Helper to determine template based on keyword intent
function determineTemplate(keyword: string, pillarName: string) {
    const k = keyword.toLowerCase();

    if (k.includes('vs') || k.includes('alternative') || k.includes('comparison') || k.includes('better than')) {
        return CONTENT_TEMPLATES.TEMPLATE_B_COMPARISON;
    }

    if (k.includes('architecture') || k.includes('system') || k.includes('model') || k.includes('infrastructure')) {
        return CONTENT_TEMPLATES.TEMPLATE_C_DEEP_DIVE;
    }

    // Default to Explainer for most "what is" or concept keywords
    return CONTENT_TEMPLATES.TEMPLATE_A_EXPLAINER;
}

async function main() {
    console.log('🚀 Starting Daily Blog Generation with Advanced Strategy...');

    // 1. Select Pillar and Keyword
    const pillars = Object.keys(KEYWORD_PILLARS) as Array<keyof typeof KEYWORD_PILLARS>;
    const selectedPillarKey = random(pillars);
    const selectedPillar = KEYWORD_PILLARS[selectedPillarKey];

    // Weighted random selection: 70% chance of 'Easy', 30% 'Medium'
    const difficulty = Math.random() < 0.7 ? 'easy' : 'medium';
    const selectedKeyword = random(selectedPillar[difficulty]);

    console.log(`🎯 Target: [${selectedPillarKey}] -> "${selectedKeyword}" (${difficulty})`);

    // 2. Select Template
    const template = determineTemplate(selectedKeyword, selectedPillarKey);
    console.log(`📝 Template: ${template.name}`);

    // 3. Construct Prompt
    const fullPrompt = `
${EXECUTION_PROMPT}

CONTEXT:
Topical Pillar: ${selectedPillarKey}
Primary Keyword: "${selectedKeyword}"
Template Structure:
${template.structure}

Template Rules:
${template.rules.map((r: string) => `- ${r}`).join('\n')}

Internal Linking Rules:
${INTERNAL_LINK_RULES.global.map((r: string) => `- ${r}`).join('\n')}
${INTERNAL_LINK_RULES.citation.rule} (e.g. ${INTERNAL_LINK_RULES.citation.example})

Generate a JSON object with the following fields:
{
  "title": "A compelling, human-sounding title (no 'Unleashing', 'Revolutionizing')",
  "slug": "url-friendly-slug-targeted-keyword",
  "excerpt": "A short, punchy summary for SEO meta description",
  "content": "The full blog post content in Markdown format. Use H2/H3 headers. Include the internal links naturally.",
  "imagePrompt": "A detailed prompt for an Unsplash-style header image (tech/abstract/high-quality)"
}
`;

    // 4. Generate Content via Gemini
    try {
        console.log('🤖 Generating content...');
        const response = await generateText(fullPrompt);

        // Clean response to ensure valid JSON
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

        // 5. Save to Database (or File System as Backup)
        // For now, we'll simulate saving to DB and write to file for inspection

        // Ensure content directory exists
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
pillar: "${selectedPillarKey}"
keyword: "${selectedKeyword}"
template: "${template.name}"
---

${blogData.content}
`;

        fs.writeFileSync(filePath, fileContent);
        console.log(`💾 Saved to file: ${filePath}`);

        // TODO: DB Insert Implementation
        // await db.post.create({ ... })

    } catch (error) {
        console.error('❌ Error generating blog:', error);
        process.exit(1);
    }
}

main();
