
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getGeminiClient } from '@/lib/geminiClient';
import { pocketTtsClient } from '@/lib/audio/pocketTtsClient';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results = {
        database: { status: 'unknown', latency: 0, message: '' },
        tts_primary: { status: 'unknown', latency: 0, message: '' },
        tts_backup: { status: 'unknown', latency: 0, message: '' },
        gemini: { status: 'unknown', latency: 0, message: '' },
        timestamp: new Date().toISOString(),
    };

    // 1. Database Check
    const dbStart = Date.now();
    try {
        await db.$queryRaw`SELECT 1`;
        results.database = { status: 'healthy', latency: Date.now() - dbStart, message: 'Connected' };
    } catch (e: any) {
        results.database = { status: 'down', latency: Date.now() - dbStart, message: e.message };
    }

    // 2. Gemini Check
    const geminiStart = Date.now();
    try {
        const client = getGeminiClient();
        await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{ parts: [{ text: 'ping' }] }]
        });
        results.gemini = { status: 'healthy', latency: Date.now() - geminiStart, message: 'Operational' };
    } catch (e: any) {
        results.gemini = { status: 'down', latency: Date.now() - geminiStart, message: e.message };
    }

    // 3. TTS Checks
    // We manually check the known URLs to be specific
    const ttsPrimaryUrl = process.env.POCKET_TTS_URL || 'http://137.184.82.132:8000';
    const ttsBackupUrl = process.env.POCKET_TTS_BACKUP_URL || 'http://137.184.82.132:8001';

    // Primary
    const ttsPStart = Date.now();
    try {
        const res = await fetch(`${ttsPrimaryUrl}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) results.tts_primary = { status: 'healthy', latency: Date.now() - ttsPStart, message: 'Active' };
        else results.tts_primary = { status: 'down', latency: Date.now() - ttsPStart, message: `Status ${res.status}` };
    } catch (e: any) {
        results.tts_primary = { status: 'down', latency: Date.now() - ttsPStart, message: e.message };
    }

    // Backup
    const ttsBStart = Date.now();
    try {
        const res = await fetch(`${ttsBackupUrl}/health`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) results.tts_backup = { status: 'healthy', latency: Date.now() - ttsBStart, message: 'Active (Standby)' };
        else results.tts_backup = { status: 'down', latency: Date.now() - ttsBStart, message: `Status ${res.status}` };
    } catch (e: any) {
        results.tts_backup = { status: 'down', latency: Date.now() - ttsBStart, message: e.message };
    }

    // Overall Status
    const isHealthy = Object.values(results).every((r: any) => typeof r === 'object' && r.status === 'healthy');

    return NextResponse.json({
        ok: isHealthy,
        results
    }, { status: isHealthy ? 200 : 503 });
}
