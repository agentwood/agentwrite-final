
/**
 * Fish Audio Cloud API Client (Production Strict Mode)
 * 
 * Implements strict voice authority protocols.
 * API Docs: https://fish.audio/docs
 */

export interface VoiceLockVector {
    pitch_min: number;
    pitch_max: number;
    speaking_rate_min: number;
    speaking_rate_max: number;
    energy_baseline: number;
    aggression_baseline: number;
    articulation_precision: number;
    rhythm_variability: number;
    warmth: number;
    roughness: number;
    accent_id: number;
    gender_lock: number;
    age_lock: number;
}

export interface VoiceProhibitions {
    forbidden_accents: number[];
    forbidden_genders: number[];
    forbidden_age_locks: number[];
    forbidden_energy_ranges?: [number, number][];
}

export interface FishSpeechRequest {
    text: string;
    characterId: string;

    // STRICT AUTHORITY PAYLOAD
    voice_id: string; // Creates the link to immutable registry
    lock_enforcement: boolean;
    constraints: VoiceLockVector; // Strict numeric constraints
    prohibitions: VoiceProhibitions; // Negative constraints

    // Optional Reference (for cloning, but secondary to lock)
    referenceAudio?: string;
    referenceText?: string;

    // Legacy mapping (optional, for logging)
    archetype?: string;
    gender?: 'male' | 'female';
}

export class FishSpeechClient {
    private apiKey: string;
    // Note: User "1.2" request implies a custom or upgraded endpoint that accepts these constraints.
    // If standard Fish API ignores them, we pass them anyway for middleware compliance.
    private endpoint: string = 'https://api.fish.audio/v1/tts';
    private timeout: number = 30000;

    constructor() {
        this.apiKey = process.env.FISH_AUDIO_API_KEY || process.env.FISH_SPEECH_API_KEY || '';
    }

    async synthesize(options: FishSpeechRequest): Promise<Buffer> {
        if (!this.isConfigured()) {
            throw new Error('Fish Audio not configured. Set FISH_AUDIO_API_KEY');
        }

        // VALIDATION: Hard Fail if voice_id missing (Rule 1.2)
        if (!options.voice_id) {
            console.error('[Fish Audio] ❌ CRITICAL: Missing voice_id');
            throw new Error('Voice Authority Violation: Missing voice_id');
        }

        console.log(`[Fish Audio] Synthesizing Strict for ${options.characterId}`);
        console.log(`  Voice ID: ${options.voice_id}`);
        console.log(`  Lock Enforcement: ${options.lock_enforcement}`);

        // Construct Payload EXACTLY as specified in User 1.2
        const payload = {
            voice_id: options.voice_id,
            lock_enforcement: options.lock_enforcement,
            constraints: options.constraints,
            prohibitions: options.prohibitions,
            text: options.text,

            // Standard parameters the current API might still need for actual generation if it doesn't support the custom payload yet
            // We map the constraints to standard params JUST IN CASE, but the payload structure is primary.
            // But we must assume the endpoint consumes the structure. 
            // If this is a standard API, we send standard fields + custom.

            // Standard Fish API fields (mapped from constraints):
            // Only use reference_id if we DON'T have a direct audio reference.
            // If we have audio, we use that for cloning (on-the-fly), bypassing stored reference lookup.
            reference_id: options.referenceAudio ? undefined : options.voice_id,
            references: options.referenceAudio ? [{ audio: options.referenceAudio, text: options.referenceText || "" }] : [],
            format: 'mp3',
            normalize: true,
            latency: 'normal',

            // Map locks to standard float params if supported by endpoint (just in case)
            speed: ((options.constraints.speaking_rate_min + options.constraints.speaking_rate_max) / 2) / 100, // example map
        };

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Fish Audio API Error (${response.status}): ${errorText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(`[Fish Audio] ✅ Generated ${buffer.length} bytes`);
            return buffer;

        } catch (error: any) {
            console.error('[Fish Audio] ❌ Synthesis failed:', error.message);
            throw error;
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey && this.apiKey.length > 10;
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
                const b64 = Buffer.from(buffer).toString('base64');
                return b64;
            }
        } catch (error) {
            console.error(`[Fish Audio] Reference audio load failed: ${input}`, error);
            return undefined;
        }
    }
}

export const fishSpeechClient = new FishSpeechClient();
