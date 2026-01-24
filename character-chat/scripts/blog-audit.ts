#!/usr/bin/env npx tsx
/**
 * Blog Content Audit Script
 * 
 * Automatically audits blog posts for:
 * - SEO quality (title length, meta description, keywords)
 * - Human-like writing (varied sentence length, no repetitive patterns)
 * - Word count variety
 * - Internal link presence
 * - Readability score
 * 
 * Run: npx tsx scripts/blog-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

interface AuditResult {
    file: string;
    title: string;
    passed: boolean;
    issues: string[];
    warnings: string[];
    stats: {
        wordCount: number;
        sentenceCount: number;
        avgSentenceLength: number;
        headingCount: number;
        internalLinks: number;
        externalLinks: number;
        readabilityScore: number;
    };
}

function calculateReadability(text: string): number {
    // Flesch Reading Ease approximation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((acc, word) => {
        return acc + countSyllables(word);
    }, 0);

    if (words.length === 0 || sentences.length === 0) return 0;

    const score = 206.835 - (1.015 * (words.length / sentences.length)) - (84.6 * (syllables / words.length));
    return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let prevVowel = false;

    for (const char of word) {
        const isVowel = vowels.includes(char);
        if (isVowel && !prevVowel) count++;
        prevVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e')) count--;

    return Math.max(1, count);
}

function detectRepetitivePatterns(text: string): string[] {
    const issues: string[] = [];

    // Check for repeated sentence starters
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    const starters: Record<string, number> = {};

    sentences.forEach(s => {
        const firstWord = s.split(/\s+/)[0]?.toLowerCase();
        if (firstWord) {
            starters[firstWord] = (starters[firstWord] || 0) + 1;
        }
    });

    Object.entries(starters).forEach(([word, count]) => {
        if (count > 3 && count / sentences.length > 0.15) {
            issues.push(`Repetitive sentence starter: "${word}" used ${count} times`);
        }
    });

    // Check for AI-like phrases
    const aiPhrases = [
        'in this article',
        'in this guide',
        'let\'s dive in',
        'without further ado',
        'it\'s important to note',
        'it goes without saying',
        'needless to say',
        'at the end of the day',
    ];

    const lowerText = text.toLowerCase();
    aiPhrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
            issues.push(`AI-like phrase detected: "${phrase}"`);
        }
    });

    return issues;
}

function auditBlogPost(filePath: string): AuditResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: markdown } = matter(content);

    const issues: string[] = [];
    const warnings: string[] = [];

    // Strip markdown formatting for text analysis
    const plainText = markdown
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '');

    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const headings = (markdown.match(/^#+\s/gm) || []).length;
    const internalLinks = (markdown.match(/\]\(https?:\/\/agentwood\.xyz[^)]*\)/g) || []).length +
        (markdown.match(/\]\(\/[^)]*\)/g) || []).length;
    const externalLinks = (markdown.match(/\]\(https?:\/\/(?!agentwood\.xyz)[^)]+\)/g) || []).length;

    const stats = {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceLength: sentences.length > 0 ? Math.round(words.length / sentences.length) : 0,
        headingCount: headings,
        internalLinks,
        externalLinks,
        readabilityScore: Math.round(calculateReadability(plainText)),
    };

    // SEO Checks
    if (!frontmatter.title) {
        issues.push('Missing title in frontmatter');
    } else if (frontmatter.title.length < 30) {
        warnings.push(`Title too short (${frontmatter.title.length} chars, aim for 50-60)`);
    } else if (frontmatter.title.length > 70) {
        warnings.push(`Title too long (${frontmatter.title.length} chars, aim for 50-60)`);
    }

    if (!frontmatter.excerpt) {
        issues.push('Missing excerpt/meta description');
    } else if (frontmatter.excerpt.length < 100) {
        warnings.push(`Excerpt too short (${frontmatter.excerpt.length} chars, aim for 150-160)`);
    } else if (frontmatter.excerpt.length > 165) {
        warnings.push(`Excerpt too long (${frontmatter.excerpt.length} chars, aim for 150-160)`);
    }

    if (!frontmatter.tags || frontmatter.tags.length === 0) {
        warnings.push('No tags defined');
    }

    // Content Quality Checks
    if (stats.wordCount < 500) {
        issues.push(`Content too thin (${stats.wordCount} words, minimum 500)`);
    } else if (stats.wordCount < 800) {
        warnings.push(`Short content (${stats.wordCount} words, aim for 1000+)`);
    }

    if (stats.avgSentenceLength > 25) {
        warnings.push(`Long sentences (avg ${stats.avgSentenceLength} words, aim for 15-20)`);
    }

    if (stats.headingCount < 3) {
        warnings.push('Few headings - add more structure');
    }

    if (stats.internalLinks === 0) {
        issues.push('No internal links to Agentwood');
    }

    if (stats.readabilityScore < 40) {
        warnings.push(`Low readability (${stats.readabilityScore}, aim for 60+)`);
    }

    // Human-like writing checks
    const repetitiveIssues = detectRepetitivePatterns(plainText);
    warnings.push(...repetitiveIssues);

    return {
        file: path.basename(filePath),
        title: frontmatter.title || 'Untitled',
        passed: issues.length === 0,
        issues,
        warnings,
        stats,
    };
}

async function main() {
    console.log('📝 Blog Content Audit\n');
    console.log('='.repeat(60));

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
        console.log('No blog posts found in', BLOG_DIR);
        return;
    }

    const results: AuditResult[] = [];
    let passCount = 0;

    for (const file of files) {
        const result = auditBlogPost(path.join(BLOG_DIR, file));
        results.push(result);

        const status = result.passed ? '✅' : '❌';
        console.log(`\n${status} ${result.title}`);
        console.log(`   File: ${result.file}`);
        console.log(`   Words: ${result.stats.wordCount} | Sentences: ${result.stats.sentenceCount} | Readability: ${result.stats.readabilityScore}`);
        console.log(`   Headings: ${result.stats.headingCount} | Internal Links: ${result.stats.internalLinks}`);

        if (result.issues.length > 0) {
            console.log('   ❌ Issues:');
            result.issues.forEach(i => console.log(`      - ${i}`));
        }

        if (result.warnings.length > 0) {
            console.log('   ⚠️  Warnings:');
            result.warnings.forEach(w => console.log(`      - ${w}`));
        }

        if (result.passed) passCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Summary: ${passCount}/${files.length} posts passed audit`);

    // Word count variety check
    const wordCounts = results.map(r => r.stats.wordCount);
    const avgWordCount = Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length);
    const variance = Math.round(Math.sqrt(wordCounts.reduce((acc, wc) => acc + Math.pow(wc - avgWordCount, 2), 0) / wordCounts.length));

    console.log(`\n📈 Word Count Analysis:`);
    console.log(`   Average: ${avgWordCount} words`);
    console.log(`   Variance: ${variance} (higher = more variety, aim for 200+)`);

    if (variance < 100) {
        console.log('   ⚠️  Posts are too similar in length - vary your content!');
    }

    // Save report
    const reportPath = path.join(process.cwd(), 'reports', `blog-audit-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { total: files.length, passed: passCount, avgWordCount, variance },
        results,
    }, null, 2));
    console.log(`\n📝 Report saved: ${reportPath}`);
}

main().catch(console.error);
