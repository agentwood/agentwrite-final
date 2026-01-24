/**
 * F5-TTS Client (formerly Pocket TTS)
 * 
 * Connects to the local F5-TTS server running on port 8000.
 * Matches `server.py` API contract: POST /run
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface F5TtsResponse {
    audio: Buffer; // WAV buffer
    sampleRate: number;
    format: string;
}

interface SynthesizeOptions {
    /** Path to reference audio for voice cloning (relative to public/) */
    voicePath?: string;
    /** Speed multiplier (default 1.0) */
    speed?: number;
    /** Reference text (optional transcript of ref audio) */
    refText?: string;
}

class F5TtsClient {
    private baseUrl: string;
    private configured: boolean;

    constructor() {
        this.baseUrl = process.env.F5_TTS_URL || 'http://localhost:8000';
        // Assume configured if running locally, or check env
        this.configured = true;
    }

    /**
     * Check if the F5 TTS server is healthy
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000),
            });
            return response.ok;
        } catch (error) {
            console.error('[F5 TTS] Health check failed:', error);
            return false;
        }
    }

    /**
     * Load reference audio file as Base64
     */
    private async loadReferenceAudioBase64(voicePath: string): Promise<string | null> {
        try {
            // 1. Try Local File System
            let fullPath = voicePath;
            if (voicePath.startsWith('/')) {
                fullPath = path.join(process.cwd(), 'public', voicePath);
            }

            // Verify file exists
            try {
                await fs.access(fullPath);
            } catch {
                // Try fetching if file not found locally (serverless fallback)
                return this.fetchAudioBase64(voicePath);
            }

            console.log(`[F5 TTS] Loading ref audio (FS): ${fullPath}`);
            const buffer = await fs.readFile(fullPath);
            return buffer.toString('base64');

        } catch (error) {
            console.warn(`[F5 TTS] FS load failed, failing over to fetch: ${voicePath}`);
            return this.fetchAudioBase64(voicePath);
        }
    }

    private async fetchAudioBase64(urlPath: string): Promise<string | null> {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            const fetchUrl = urlPath.startsWith('http') ? urlPath : `${baseUrl}${urlPath}`;

            const response = await fetch(fetchUrl);
            if (!response.ok) return null;

            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer).toString('base64');
        } catch (e) {
            console.error('[F5 TTS] Fetch failed:', e);
            return null;
        }
    }

    /**
     * Synthesize speech using F5-TTS Server
     */
    async synthesize(text: string, options: SynthesizeOptions = {}): Promise<F5TtsResponse | null> {
        try {
            if (!options.voicePath) {
                console.error('[F5 TTS] Reference audio path is required for F5-TTS');
                return null;
            }

            const refAudioBase64 = await this.loadReferenceAudioBase64(options.voicePath);
            if (!refAudioBase64) {
                throw new Error(`Could not load reference audio: ${options.voicePath}`);
            }

            console.log(`[F5 TTS] Generating: "${text.substring(0, 20)}..." using ${path.basename(options.voicePath)}`);

            // F5-TTS Server /run payload
            const payload = {
                input: {
                    text: text,
                    ref_audio: refAudioBase64,
                    ref_text: options.refText || "",
                    speed: options.speed || 1.0,
                    steps: 32 // Default steps
                }
            };

            const response = await fetch(`${this.baseUrl}/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(60000)
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`F5 API Error ${response.status}: ${err}`);
            }

            const data = await response.json();

            if (data.status === "COMPLETED" && data.output && data.output.audio) {
                return {
                    audio: Buffer.from(data.output.audio, 'base64'),
                    sampleRate: data.output.sample_rate || 24000,
                    format: 'wav'
                };
            } else {
                console.error('[F5 TTS] Invalid response format:', data);
                return null;
            }

        } catch (error: any) {
            console.error('[F5 TTS] Synthesis error:', error.message);
            throw error;
        }
    }

    checkConfigured(): boolean {
        return this.configured;
    }
}

// Export singleton instance (renaming to match existing import to avoid refactoring everything)
export const pocketTtsClient = new F5TtsClient();

