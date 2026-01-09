/**
 * RunPod Serverless Chatterbox TTS Client
 * 
 * Calls RunPod serverless endpoint for TTS synthesis.
 * Configure RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID in .env.local
 */

interface RunPodTTSResult {
    audio_base64: string;
    sample_rate: number;
    format: string;
    text_length: number;
}

interface RunPodResponse {
    id: string;
    status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    output?: RunPodTTSResult;
    error?: string;
}

export class RunPodChatterboxClient {
    private apiKey: string;
    private endpointId: string;
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.apiKey = process.env.RUNPOD_API_KEY || '';
        this.endpointId = process.env.RUNPOD_ENDPOINT_ID || '';
        this.baseUrl = 'https://api.runpod.ai/v2';
        this.timeout = 60000; // 60 second timeout
    }

    /**
     * Check if RunPod is configured
     */
    isConfigured(): boolean {
        return !!(this.apiKey && this.endpointId);
    }

    /**
     * Synthesize speech using RunPod serverless Chatterbox
     */
    async synthesize(
        text: string,
        options: {
            language?: string;
            accentHint?: string;
            exaggeration?: number;
            temperature?: number;
            archetype?: string;     // 20 canonical archetypes
            gender?: string;
            // Audio Profile Parameters
            pitch?: number;
            speed?: number;
            pause_density?: number;
            intonation_variance?: number;
            emphasis_strength?: number;
        } = {}
    ): Promise<{ audio: Buffer; contentType: string } | null> {
        if (!this.isConfigured()) {
            console.log('[RunPod] Not configured - missing RUNPOD_API_KEY or RUNPOD_ENDPOINT_ID');
            return null;
        }

        const exaggeration = options.exaggeration ?? 0.5;
        const temperature = options.temperature ?? 0.8;
        const language = options.language ?? 'en';
        const accent_hint = options.accentHint ?? '';
        const archetype = options.archetype ?? '';
        const gender = options.gender ?? '';
        const pitch = options.pitch ?? 0.0;
        const speed = options.speed ?? 1.0;
        const pause_density = options.pause_density ?? 0.5;
        const intonation_variance = options.intonation_variance ?? 0.5;
        const emphasis_strength = options.emphasis_strength ?? 0.5;

        console.log(`[RunPod] Synthesizing: "${text.substring(0, 50)}..." (arch=${archetype}, gender=${gender})`);
        console.log(`[RunPod]   Audio: pitch=${pitch}, speed=${speed}, pauses=${pause_density}, intonation=${intonation_variance}`);

        try {
            // Use runsync for synchronous response (waits for completion)
            const response = await fetch(`${this.baseUrl}/${this.endpointId}/runsync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: {
                        text: text.substring(0, 400),
                        language,
                        accent_hint,
                        archetype,
                        gender,
                        exaggeration,
                        temperature,
                        pitch,
                        speed,
                        pause_density,
                        intonation_variance,
                        emphasis_strength
                    },
                }),
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                console.error(`[RunPod] API error: ${response.status}`);
                return null;
            }

            const result: RunPodResponse = await response.json();

            if (result.status === 'FAILED' || result.error) {
                console.error(`[RunPod] Synthesis failed:`, result.error);
                return null;
            }

            if (result.status === 'COMPLETED' && result.output?.audio_base64) {
                const audioBuffer = Buffer.from(result.output.audio_base64, 'base64');
                console.log(`[RunPod] ✅ Generated ${audioBuffer.length} bytes`);

                return {
                    audio: audioBuffer,
                    contentType: 'audio/wav',
                };
            }

            console.error(`[RunPod] Unexpected status: ${result.status}`);
            return null;

        } catch (error: any) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                console.error('[RunPod] Request timed out');
            } else {
                console.error('[RunPod] Error:', error.message);
            }
            return null;
        }
    }

    /**
     * Check endpoint health
     */
    async isAvailable(): Promise<boolean> {
        if (!this.isConfigured()) return false;

        try {
            const response = await fetch(`${this.baseUrl}/${this.endpointId}/health`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const runpodChatterboxClient = new RunPodChatterboxClient();
