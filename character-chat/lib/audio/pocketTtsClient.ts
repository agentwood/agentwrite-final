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

class PocketTtsClient {
    private baseUrl: string;
    private configured: boolean;

    constructor() {
        this.baseUrl = process.env.POCKET_TTS_URL || 'http://localhost:8000';
        this.configured = !!process.env.POCKET_TTS_URL;
    }

    /**
     * Check if Pocket TTS server is configured
     */
    checkConfigured(): boolean {
        return this.configured;
    }

    /**
     * Check if the Pocket TTS server is healthy
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch (error) {
            console.error('[Pocket TTS] Health check failed:', error);
            return false;
        }
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
            const mimeType = ext === '.wav' ? 'audio/wav' : 'audio/mpeg';
            return new Blob([buffer], { type: mimeType });

        } catch (fetchError) {
            console.error(`[Pocket TTS] HTTP fetch failed details:`, fetchError);
            return null;
        }
    }

    /**
     * Synthesize speech using Pocket TTS
     * 
     * Uses POST /tts with multipart/form-data:
     * - text: The text to synthesize
     * - voice_wav: The reference audio file for voice cloning
     */
    async synthesize(text: string, options: SynthesizeOptions = {}): Promise<PocketTtsResponse | null> {
        try {
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

            const response = await fetch(`${this.baseUrl}/tts`, {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(60000), // 60s timeout for long texts
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Pocket TTS] API Error (${response.status}):`, errorText);
                throw new Error(`Pocket TTS API error: ${response.status} - ${errorText}`);
            }

            // Response is audio bytes (WAV format)
            const audioBuffer = Buffer.from(await response.arrayBuffer());

            console.log(`[Pocket TTS] Generated ${audioBuffer.length} bytes of audio`);

            return {
                audio: audioBuffer,
                sampleRate: 24000, // Pocket TTS default
                format: 'wav',
            };
        } catch (error: any) {
            console.error('[Pocket TTS] Synthesis error:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
export const pocketTtsClient = new PocketTtsClient();
