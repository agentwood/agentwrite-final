/**
 * Pocket TTS Client
 * 
 * Lightweight, CPU-based TTS with zero-shot voice cloning.
 * Connects to a Pocket TTS server running `pocket-tts serve`.
 * 
 * @see https://github.com/kyutai-labs/pocket-tts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

interface PocketTtsResponse {
    audio: Buffer;
    sampleRate: number;
    format: string;
}

interface SynthesizeOptions {
    /** Path to reference audio for voice cloning (relative to public/) */
    voicePath?: string;
    /** Speed multiplier (default 1.0) */
    speed?: number;
    /** Tone modifiers based on persona description */
    toneModifiers?: {
        /** Aggression level 0-1 (affects speed and emphasis) */
        aggression?: number;
        /** Energy level 0-1 (affects pacing and volume) */
        energy?: number;
        /** Pitch adjustment -1 to 1 */
        pitch?: number;
    };
}

export class PocketTtsClient {
    private servers: string[];
    private configured: boolean;

    constructor() {
        const primary = process.env.POCKET_TTS_URL || 'http://137.184.82.132:8000'; // LOCKED IN: Permanent Fallback

        const backup = process.env.POCKET_TTS_BACKUP_URL;

        this.servers = [primary];
        if (backup) {
            this.servers.push(backup);
        }

        this.configured = !!process.env.POCKET_TTS_URL;
    }

    /**
     * Check if Pocket TTS server is configured
     */
    checkConfigured(): boolean {
        return this.configured;
    }

    /**
     * Check if ANY Pocket TTS server is healthy
     */
    async checkHealth(): Promise<boolean> {
        for (const server of this.servers) {
            try {
                const response = await fetch(`${server}/health`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(2000), // Fast check
                });
                if (response.ok) return true;
            } catch (error) {
                // Try next server
                continue;
            }
        }
        return false;
    }

    /**
     * Load reference audio file as a Blob for multipart upload
     */
    private async loadReferenceAudio(voicePath: string): Promise<Blob | null> {
        // 1. Try Local File System (Works in Dev / when bundled)
        try {
            // Handle both absolute and relative paths
            let fullPath: string;
            if (voicePath.startsWith('/')) {
                // Relative to public directory
                fullPath = path.join(process.cwd(), 'public', voicePath);
            } else {
                fullPath = voicePath;
            }

            console.log(`[Pocket TTS] Loading reference audio (FS): ${fullPath}`);
            const buffer = await fs.readFile(fullPath);

            // Determine MIME type from extension
            const ext = path.extname(fullPath).toLowerCase();
            const mimeType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';

            return new Blob([buffer], { type: mimeType });
        } catch (error) {
            console.warn(`[Pocket TTS] FS load failed, trying HTTP fetch: ${voicePath}`);
        }

        // 2. Fallback: Fetch via HTTP (Works in Serverless / Netlify)
        try {
            // Netlify exposes 'URL' env var. Vercel exposes 'VERCEL_URL'.
            // Or use NEXT_PUBLIC_SUPABASE_URL as a hint? No.
            // fallback to relative if we are on same origin? Node fetch needs absolute.

            const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
                process.env.URL ||
                (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

            const fetchUrl = `${baseUrl}${voicePath}`;
            console.log(`[Pocket TTS] Fetching reference audio (HTTP): ${fetchUrl}`);

            const response = await fetch(fetchUrl);
            if (!response.ok) {
                console.error(`[Pocket TTS] HTTP fetch failed: ${response.statusText}`);
                return null;
            }

            const buffer = await response.arrayBuffer();
            // Determine MIME type from extension
            const ext = path.extname(voicePath).toLowerCase();

            // If it's not WAV, convert it to WAV
            if (ext !== '.wav') {
                console.log(`[Pocket TTS] Auto-converting ${ext} to WAV for server compatibility...`);
                const tempInput = path.join('/tmp', `input_${Date.now()}${ext}`);
                const tempOutput = path.join('/tmp', `output_${Date.now()}.wav`);

                try {
                    await fs.writeFile(tempInput, Buffer.from(buffer));
                    // Convert to 24kHz mono WAV
                    execSync(`ffmpeg -y -i "${tempInput}" -ar 24000 -ac 1 -c:a pcm_s16le "${tempOutput}"`, { stdio: 'ignore' });

                    const wavBuffer = await fs.readFile(tempOutput);

                    // Cleanup
                    try { await fs.unlink(tempInput); } catch (e) { }
                    try { await fs.unlink(tempOutput); } catch (e) { }

                    return new Blob([wavBuffer], { type: 'audio/wav' });
                } catch (convError) {
                    console.error("[Pocket TTS] Conversion failed, fallback to original:", convError);
                    // Cleanup even on error
                    try { await fs.unlink(tempInput); } catch (e) { }
                    try { await fs.unlink(tempOutput); } catch (e) { }
                    return new Blob([buffer], { type: 'audio/mpeg' });
                }
            }

            const mimeType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';
            return new Blob([buffer], { type: mimeType });

        } catch (fetchError) {
            console.error(`[Pocket TTS] HTTP fetch failed details:`, fetchError);
            return null;
        }
    }

    /**
     * Synthesize speech using Pocket TTS with Failover
     */
    async synthesize(text: string, options: SynthesizeOptions = {}, retries = 3): Promise<PocketTtsResponse | null> {
        let lastError: any;

        // Try each server in order (Primary -> Backup)
        for (let i = 0; i < this.servers.length; i++) {
            const serverUrl = this.servers[i];
            const isBackup = i > 0;
            console.log(`[Pocket TTS] Attempting generation on ${isBackup ? 'BACKUP' : 'PRIMARY'} server: ${serverUrl}`);

            // Per-server Retry Loop
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    if (attempt > 1) {
                        console.log(`[Pocket TTS] Retry attempt ${attempt}/${retries} on ${serverUrl}...`);
                        // Linear backoff: 500ms, 1000ms, 1500ms
                        await new Promise(resolve => setTimeout(resolve, 500 * (attempt - 1)));
                    }

                    const formData = new FormData();

                    // Apply tone modifiers to adjust speed
                    let effectiveSpeed = options.speed || 1.0;
                    if (options.toneModifiers) {
                        const { aggression = 0, energy = 0.5 } = options.toneModifiers;
                        // Aggressive personas speak faster
                        if (aggression > 0.5) effectiveSpeed *= 1.0 + (aggression * 0.2);
                        // High energy = faster, low energy = slower
                        effectiveSpeed *= 0.9 + (energy * 0.2);
                        console.log(`[Pocket TTS] Tone modifiers applied: speed=${effectiveSpeed.toFixed(2)}`);
                    }

                    formData.append('text', text);
                    // Note: speed parameter would be passed if Pocket TTS server supports it
                    // formData.append('speed', effectiveSpeed.toString());

                    // Load and attach voice reference for cloning
                    if (options.voicePath) {
                        const voiceBlob = await this.loadReferenceAudio(options.voicePath);
                        if (!voiceBlob) {
                            throw new Error(`Could not load voice reference: ${options.voicePath}`);
                        }

                        // Get filename for the form field
                        const filename = path.basename(options.voicePath);
                        formData.append('voice_wav', voiceBlob, filename);

                        console.log(`[Pocket TTS] Synthesizing with cloned voice: ${filename}`);
                    } else {
                        console.log('[Pocket TTS] Synthesizing with default voice (no cloning)');
                    }

                    const response = await fetch(`${serverUrl}/tts`, {
                        method: 'POST',
                        body: formData,
                        signal: AbortSignal.timeout(60000), // 60s timeout for long texts
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`[Pocket TTS] API Error (${response.status}):`, errorText);
                        // If it's a 500 error from the python server, it might be the model crashing.
                        // We SHOULD failover to the next server in this case.
                        throw new Error(`API error: ${response.status} - ${errorText}`);
                    }

                    // Response is audio bytes (WAV format)
                    const audioBuffer = Buffer.from(await response.arrayBuffer());

                    console.log(`[Pocket TTS] Success on ${serverUrl} (${audioBuffer.length} bytes)`);

                    return {
                        audio: audioBuffer,
                        sampleRate: 24000,
                        format: 'wav',
                    };

                } catch (error: any) {
                    console.error(`[Pocket TTS] Error on ${serverUrl} (attempt ${attempt}):`, error.message);
                    lastError = error;

                    // If connection refused, break retry loop and go to next server immediately
                    if (error.cause?.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
                        break;
                    }
                }
            }

            console.log(`[Pocket TTS] Server ${serverUrl} failed. Checking next backup...`);
        }

        // If we get here, all servers failed
        console.error('[Pocket TTS] All backup servers failed.');
        throw lastError; // Throw the last error encountered
    }
}

// Export singleton instance
export const pocketTtsClient = new PocketTtsClient();
