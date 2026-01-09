/**
 * Fish Speech 1.5 Client for Tree-0 Engine
 * Premium TTS - Outperforms ElevenLabs & MiniMax
 * Deployed on RunPod Serverless for zero-shot voice cloning
 */

export interface FishSpeechRequest {
    text: string;
    referenceAudio?: string; // Base64 encoded WAV
    pitch?: number;          // Semitones (-3 to +3)
    speed?: number;          // Multiplier (0.7 to 1.5)
    characterId: string;
    archetype: string;
    pause_density?: number;
    intonation_variance?: number;
    emphasis_strength?: number;
}

interface FishSpeechResponse {
    audio: string;           // Base64 encoded WAV
    format: string;
    sample_rate: number;
    duration: number;
    character_id: string;
    engine: string;
}

export class FishSpeechClient {
    private endpoint: string;
    private apiKey: string;
    private timeout: number = 60000; // 60s

    constructor() {
        this.endpoint = process.env.RUNPOD_FISH_ENDPOINT || '';
        this.apiKey = process.env.RUNPOD_API_KEY || '';
    }

    async synthesize(options: FishSpeechRequest): Promise<Buffer> {
        if (!this.isConfigured()) {
            throw new Error('Fish Speech not configured. Set RUNPOD_FISH_ENDPOINT and RUNPOD_API_KEY');
        }

        console.log(`[Fish Speech] Synthesizing for ${options.characterId} (Archetype: ${options.archetype})`);

        const startTime = Date.now();

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    input: {
                        text: options.text,
                        reference_audio: options.referenceAudio,
                        pitch: options.pitch || 0.0,
                        speed: options.speed || 1.0,
                        character_id: options.characterId,
                        archetype: options.archetype,
                        pause_density: options.pause_density || 0.5,
                        intonation_variance: options.intonation_variance || 0.5,
                        emphasis_strength: options.emphasis_strength || 0.5
                    }
                }),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fish Speech API Error (${response.status}): ${errorText}`);
            }

            const data: { output: FishSpeechResponse; error?: string } = await response.json();

            if (data.error) {
                throw new Error(`Fish Speech Error: ${data.error}`);
            }

            const latency = Date.now() - startTime;
            console.log(`[Fish Speech] ✅ Generated in ${latency}ms (${data.output.duration?.toFixed(2)}s audio)`);

            return Buffer.from(data.output.audio, 'base64');

        } catch (error: any) {
            console.error('[Fish Speech] ❌ Synthesis failed:', error.message);
            throw error;
        }
    }

    isConfigured(): boolean {
        return !!this.endpoint && !!this.apiKey && (this.endpoint.includes('/run') || this.endpoint.includes('/runsync'));
    }

    /**
     * Load reference audio from URL, file path, or base64 string
     */
    async loadReferenceAudio(input: string): Promise<string | undefined> {
        try {
            if (!input) return undefined;

            // If it's already base64 (approx check)
            if (input.startsWith('data:audio') || input.length > 2000) {
                return input.includes(',') ? input.split(',')[1] : input;
            }

            if (input.startsWith('http')) {
                const response = await fetch(input);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                const buffer = await response.arrayBuffer();
                return Buffer.from(buffer).toString('base64');
            } else {
                const fs = await import('fs/promises');
                const path = await import('path');

                let relPath = input;
                if (input.startsWith('/public/')) {
                    relPath = input.replace('/public/', '');
                } else if (input.startsWith('/')) {
                    relPath = input.slice(1);
                }

                const fullPath = path.join(process.cwd(), 'public', relPath);
                const buffer = await fs.readFile(fullPath);
                return buffer.toString('base64');
            }
        } catch (error) {
            console.error(`[Fish Speech] Reference audio load failed: ${input}`, error);
            return undefined;
        }
    }
}

export const fishSpeechClient = new FishSpeechClient();
