/**
 * Fish Audio TTS Client
 * Fallback TTS provider when F5-TTS (RunPod) is unavailable
 * 
 * API: https://fish.audio/docs/text-to-speech
 */

interface FishAudioSynthOptions {
    voiceId: string;
    speed?: number;
    format?: 'wav' | 'mp3' | 'opus';
    sampleRate?: number;
}

export class FishAudioClient {
    private apiKey: string | null = null;
    private baseUrl = 'https://api.fish.audio';

    private getApiKey(): string {
        if (!this.apiKey) {
            this.apiKey = process.env.FISH_AUDIO_API_KEY || process.env.FISH_SPEECH_API_KEY || '';
        }
        return this.apiKey;
    }

    isConfigured(): boolean {
        return !!this.getApiKey();
    }

    /**
     * Synthesize speech using Fish Audio TTS
     */
    async synthesize(
        text: string,
        options: FishAudioSynthOptions
    ): Promise<{ audio: Buffer; contentType: string; format: string } | null> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            console.error('[Fish Audio] API key not configured');
            return null;
        }

        const { voiceId, speed = 1.0, format = 'wav', sampleRate = 24000 } = options;

        try {
            console.log(`[Fish Audio] Synthesizing with voice: ${voiceId}`);

            const response = await fetch(`${this.baseUrl}/v1/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    reference_id: voiceId,
                    text: text,
                    speed: speed,
                    format: format,
                    sample_rate: sampleRate,
                    latency: 'balanced', // Good balance of speed and quality
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Fish Audio] API Error (${response.status}):`, errorText);
                return null;
            }

            const audioBuffer = await response.arrayBuffer();

            return {
                audio: Buffer.from(audioBuffer),
                contentType: format === 'mp3' ? 'audio/mpeg' : 'audio/wav',
                format: format,
            };
        } catch (error: any) {
            console.error('[Fish Audio] Synthesis failed:', error);
            // Re-throw with details so the route knows WHY it failed
            throw new Error(`Fish Audio Synthesis Failed: ${error.message || 'Unknown Error'}`);
        }
    }

    /**
     * Check API health/quota
     */
    async checkHealth(): Promise<boolean> {
        const apiKey = this.getApiKey();
        if (!apiKey) return false;

        try {
            const response = await fetch(`${this.baseUrl}/v1/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const fishAudioClient = new FishAudioClient();
