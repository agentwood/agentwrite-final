/**
 * ElevenLabs TTS Client
 * For accent-heavy characters that require voice cloning or multilingual voices
 * 
 * Free tier: 10,000 credits/month (~10 min audio)
 * Instant Voice Cloning: 10-60 second reference audio
 */

interface ElevenLabsVoice {
    voice_id: string;
    name: string;
}

interface ElevenLabsSynthesisOptions {
    stability?: number; // 0-1, lower = more expressive
    similarity_boost?: number; // 0-1, higher = more similar to reference
    style?: number; // 0-1, style exaggeration
    use_speaker_boost?: boolean;
}

// Character to ElevenLabs voice mapping
// NOTE: We tried cloning AI-generated voices but ElevenLabs flags them as "CAPTCHA voice"
// Using premade voices instead - they work reliably without being flagged
export const ELEVENLABS_VOICE_MAP: Record<string, { voice_id: string; accent: string }> = {
    // Using PREMADE voices (cloned voices from AI audio get flagged by ElevenLabs ToS)
    'asha': { voice_id: 'ThT5KcBeYPX3keUQqHPh', accent: 'African' },       // Nicole - African accent
    'eamon': { voice_id: 'jBpfuIE2acCO8z3wKNLl', accent: 'British' },       // Gigi - UK accent
    'viktor': { voice_id: 'N2lVS1w4EtoT3dr4eOWO', accent: 'Eastern European' }, // Callum
    'tomasz': { voice_id: 'N2lVS1w4EtoT3dr4eOWO', accent: 'Eastern European' }, // Callum
    'rajiv': { voice_id: 'TxGEqnHWrfWFTfGW9XjX', accent: 'American (styled)' },  // Josh
};

// Pre-made ElevenLabs voices with accents (use these initially before cloning)
export const ELEVENLABS_PREMADE_VOICES: Record<string, string> = {
    // These are ElevenLabs voice IDs for pre-made voices with accents
    'kenyan_female': 'ThT5KcBeYPX3keUQqHPh', // Nicole - African accent
    'scottish_male': 'jBpfuIE2acCO8z3wKNLl', // Gigi - UK accent (closest)
    'russian_male': 'N2lVS1w4EtoT3dr4eOWO', // Callum - Eastern European
    'polish_male': 'N2lVS1w4EtoT3dr4eOWO', // Callum - Eastern European
    'indian_male': 'TxGEqnHWrfWFTfGW9XjX', // Josh - can be styled
};

export class ElevenLabsClient {
    private apiKey: string;
    private baseUrl = 'https://api.elevenlabs.io/v1';

    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[ElevenLabs] API key not configured - accent TTS will fall back to Gemini');
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }

    /**
     * Synthesize speech using ElevenLabs
     */
    async synthesize(
        text: string,
        voiceId: string,
        options: ElevenLabsSynthesisOptions = {}
    ): Promise<{ audio: ArrayBuffer; contentType: string } | null> {
        if (!this.apiKey) {
            return null;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/text-to-speech/${voiceId}`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'audio/mpeg',
                        'Content-Type': 'application/json',
                        'xi-api-key': this.apiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: 'eleven_multilingual_v2', // Best for accents
                        voice_settings: {
                            stability: options.stability ?? 0.5,
                            similarity_boost: options.similarity_boost ?? 0.75,
                            style: options.style ?? 0.5,
                            use_speaker_boost: options.use_speaker_boost ?? true,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error(`[ElevenLabs] API error (${response.status}):`, error);
                return null;
            }

            const audio = await response.arrayBuffer();
            return { audio, contentType: 'audio/mpeg' };
        } catch (error) {
            console.error('[ElevenLabs] Synthesis failed:', error);
            return null;
        }
    }

    /**
     * Get voice ID for a character, using premade voices as fallback
     */
    getVoiceForCharacter(seedId: string): string | null {
        // First check if we have a cloned voice
        const clonedVoice = ELEVENLABS_VOICE_MAP[seedId];
        if (clonedVoice && clonedVoice.voice_id !== `ELEVENLABS_${seedId.toUpperCase()}_VOICE_ID`) {
            return clonedVoice.voice_id;
        }

        // Use premade voices as fallback
        switch (seedId) {
            case 'asha':
                return ELEVENLABS_PREMADE_VOICES.kenyan_female;
            case 'eamon':
                return ELEVENLABS_PREMADE_VOICES.scottish_male;
            case 'viktor':
                return ELEVENLABS_PREMADE_VOICES.russian_male;
            case 'tomasz':
                return ELEVENLABS_PREMADE_VOICES.polish_male;
            case 'rajiv':
                return ELEVENLABS_PREMADE_VOICES.indian_male;
            default:
                return null;
        }
    }

    /**
     * Clone a voice from reference audio
     * Requires 10-60 seconds of clean audio
     */
    async cloneVoice(
        name: string,
        description: string,
        audioFiles: { data: Buffer; filename: string }[]
    ): Promise<ElevenLabsVoice | null> {
        if (!this.apiKey) {
            return null;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);

            for (const file of audioFiles) {
                const uint8Array = new Uint8Array(file.data);
                const blob = new Blob([uint8Array], { type: 'audio/mpeg' });
                formData.append('files', blob, file.filename);
            }

            const response = await fetch(
                `${this.baseUrl}/voices/add`,
                {
                    method: 'POST',
                    headers: {
                        'xi-api-key': this.apiKey,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const error = await response.text();
                console.error(`[ElevenLabs] Clone error (${response.status}):`, error);
                return null;
            }

            const result = await response.json();
            return { voice_id: result.voice_id, name: result.name };
        } catch (error) {
            console.error('[ElevenLabs] Voice cloning failed:', error);
            return null;
        }
    }

    /**
     * Check remaining quota
     */
    async getQuota(): Promise<{ character_count: number; character_limit: number } | null> {
        if (!this.apiKey) {
            return null;
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/user/subscription`,
                {
                    headers: { 'xi-api-key': this.apiKey },
                }
            );

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return {
                character_count: data.character_count,
                character_limit: data.character_limit,
            };
        } catch (error) {
            return null;
        }
    }
}

// Singleton instance
export const elevenLabsClient = new ElevenLabsClient();
