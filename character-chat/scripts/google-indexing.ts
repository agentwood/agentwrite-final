#!/usr/bin/env npx tsx
/**
 * Google Indexing API Script
 * 
 * Submits URLs to Google for indexing via the Indexing API
 * 
 * Setup:
 * 1. Create Google Cloud project
 * 2. Enable Indexing API
 * 3. Create service account with JSON key
 * 4. Add service account email to Search Console as owner
 * 5. Set GOOGLE_APPLICATION_CREDENTIALS env var
 * 
 * Run: npx tsx scripts/google-indexing.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentwood.xyz';

interface IndexingResult {
    url: string;
    status: 'success' | 'error';
    message?: string;
}

async function getGoogleAuthToken(): Promise<string | null> {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!credentialsPath || !fs.existsSync(credentialsPath)) {
        console.error('❌ GOOGLE_APPLICATION_CREDENTIALS not set or file not found');
        console.log('\nSetup instructions:');
        console.log('1. Go to https://console.cloud.google.com');
        console.log('2. Create project and enable Indexing API');
        console.log('3. Create service account with JSON key');
        console.log('4. Add service account email to Search Console as owner');
        console.log('5. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json');
        return null;
    }

    try {
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
            keyFilename: credentialsPath,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();
        return token.token || null;
    } catch (error) {
        console.error('Auth error:', error);
        return null;
    }
}

async function submitUrl(url: string, token: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<IndexingResult> {
    try {
        const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                type,
            }),
        });

        if (response.ok) {
            return { url, status: 'success' };
        } else {
            const error = await response.text();
            return { url, status: 'error', message: error };
        }
    } catch (error) {
        return { url, status: 'error', message: String(error) };
    }
}

async function getAllUrls(): Promise<string[]> {
    const urls: string[] = [];

    // Static pages
    const staticPages = [
        '', '/discover', '/create', '/pricing', '/about', '/blog',
        '/privacy', '/terms', '/careers', '/safety', '/rewards'
    ];
    urls.push(...staticPages.map(p => `${SITE_URL}${p}`));

    // Characters
    const characters = await prisma.personaTemplate.findMany({
        select: { id: true },
        orderBy: { viewCount: 'desc' },
        take: 1000, // Indexing API has daily limits
    });
    urls.push(...characters.map(c => `${SITE_URL}/character/${c.id}`));

    // Categories - get distinct categories
    const allChars = await prisma.personaTemplate.findMany({
        select: { category: true },
    });
    const uniqueCategories = [...new Set(allChars.map(c => c.category).filter(Boolean))];
    urls.push(...uniqueCategories.map(c => `${SITE_URL}/category/${encodeURIComponent(c as string)}`));

    return urls;
}

async function main() {
    console.log('🔍 Google Indexing API Script\n');

    const token = await getGoogleAuthToken();
    if (!token) {
        console.log('\n📋 URLs that would be submitted:');
        const urls = await getAllUrls();
        console.log(`Total: ${urls.length} URLs`);
        urls.slice(0, 10).forEach(u => console.log(`  - ${u}`));
        if (urls.length > 10) console.log(`  ... and ${urls.length - 10} more`);

        // Save URLs to file for manual submission
        const urlsPath = path.join(process.cwd(), 'reports', `urls-to-index-${Date.now()}.txt`);
        fs.mkdirSync(path.dirname(urlsPath), { recursive: true });
        fs.writeFileSync(urlsPath, urls.join('\n'));
        console.log(`\n📝 URLs saved to: ${urlsPath}`);

        await prisma.$disconnect();
        return;
    }

    console.log('✅ Authenticated with Google\n');

    const urls = await getAllUrls();
    console.log(`📊 Submitting ${urls.length} URLs...\n`);

    const results: IndexingResult[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Rate limit: 200 requests per minute
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const result = await submitUrl(url, token);
        results.push(result);

        if (result.status === 'success') {
            successCount++;
            console.log(`✅ ${i + 1}/${urls.length}: ${url}`);
        } else {
            errorCount++;
            console.log(`❌ ${i + 1}/${urls.length}: ${url} - ${result.message}`);
        }

        // Rate limiting: 3 requests per second max
        if ((i + 1) % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n📊 Results: ${successCount} success, ${errorCount} errors`);

    // Save report
    const reportPath = path.join(process.cwd(), 'reports', `indexing-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        total: urls.length,
        success: successCount,
        errors: errorCount,
        results
    }, null, 2));
    console.log(`📝 Report saved: ${reportPath}`);

    await prisma.$disconnect();
}

main().catch(console.error);
