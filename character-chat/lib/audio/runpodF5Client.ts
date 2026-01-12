import fs from 'fs/promises';
import path from 'path';

interface RunPodF5Response {
    id: string;
    status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    output?: {
        audio: string;      // Base64
        format: string;     // wav
        sample_rate: number;
        seed_used: number;
        steps_used: number;
    };
    error?: string;
}

export class RunPodF5Client {
    private apiKey: string;
    private endpointId: string;
    private podId: string;
    private baseUrl: string;
    private timeout: number;

    constructor() {
        this.apiKey = '';
        this.endpointId = '';
        this.podId = '';
        this.baseUrl = 'https://api.runpod.ai/v2';
        this.timeout = 120000;
    }

    private initConfig() {
        if (!this.apiKey) this.apiKey = process.env.RUNPOD_API_KEY || '';
        if (!this.endpointId) this.endpointId = process.env.RUNPOD_F5_ENDPOINT_ID || '';
        if (!this.podId) this.podId = process.env.RUNPOD_F5_POD_ID || '';
    }

    isConfigured(): boolean {
        this.initConfig();
        return !!((this.apiKey && this.endpointId) || this.podId);
    }

    /**
     * Helper: Load reference audio from public folder or absolute path and return base64
     */
    async loadReferenceAudio(input: string): Promise<string | null> {
        try {
            let fullPath: string;

            // Check for public-style paths FIRST (e.g., "/voices/seeds/X.mp3")
            // These start with / but need the public/ prefix, not truly absolute
            if (input.startsWith('/voices/') || input.startsWith('/avatars/') || input.startsWith('/audio/')) {
                // Public folder path - prepend process.cwd()/public/
                fullPath = path.join(process.cwd(), 'public', input.slice(1));
            } else if (path.isAbsolute(input)) {
                // Truly absolute path (e.g., /Users/username/file.mp3)
                fullPath = input;
            } else {
                // Relative path - add public prefix
                fullPath = path.join(process.cwd(), 'public', input);
            }

            console.log(`[F5-TTS] Loading reference audio from: ${fullPath}`);
            const buffer = await fs.readFile(fullPath);
            return Buffer.from(buffer).toString('base64');
        } catch (error) {
            console.error(`[F5-TTS] Failed to load reference: ${input}`, error);
            return null;
        }
    }

    /**
     * Synthesize speech using F5-TTS / FastMaya (Zero-Shot Cloning)
     */
    async synthesize(
        text: string,
        options: {
            voice_description?: string;
            ref_audio?: string; // Base64
            ref_text?: string;
            speed?: number;
            voice_name?: string; // REQUIRED for Pod mode
        }
    ): Promise<{ audio: Buffer; contentType: string; seed: number } | null> {
        this.initConfig();

        // MODE 1: Direct Pod Connect (Preferred if podId set)
        if (this.podId) {
            return this.synthesizeViaPod(text, options);
        }

        // MODE 2: Serverless Endpoint
        if (!this.endpointId || !this.apiKey) {
            throw new Error('F5-TTS Configuration Missing: RUNPOD_F5_POD_ID or (RUNPOD_API_KEY + RUNPOD_F5_ENDPOINT_ID) required.');
        }

        const url = `${this.baseUrl}/${this.endpointId}/runsync`;

        console.log(`[F5-TTS] Sending request to Serverless Endpoint: ${this.endpointId}`);
        console.log(`[F5-TTS] Payload: text="${text.substring(0, 50)}...", ref_audio=${options.ref_audio ? 'Yes (Base64)' : 'No'}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                input: {
                    gen_text: text,
                    ref_audio: options.ref_audio,
                    ref_text: options.ref_text || "",
                    model: "F5-TTS",
                    remove_silence: true,
                    speed: options.speed || 1.0
                }
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`RunPod API Error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        let finalResponse: RunPodF5Response;

        // Normalize response
        if (data.status === 'COMPLETED') {
            finalResponse = {
                id: data.id,
                status: 'COMPLETED',
                output: {
                    audio: data.output.audio || data.output,
                    format: 'wav',
                    sample_rate: 24000,
                    seed_used: 0,
                    steps_used: 0
                }
            };
        } else if (data.status === 'FAILED') {
            throw new Error(`F5-TTS Task Failed: ${data.error}`);
        } else if (data.status === 'IN_QUEUE' || data.status === 'IN_PROGRESS') {
            console.log(`[F5-TTS] Job ${data.id} in queue/progress provided by runsync. Polling...`);
            finalResponse = await this.pollStatus(data.id);
        } else {
            finalResponse = { id: data.id, status: data.status };
        }

        // Return object compatible with TTS route
        if (finalResponse.status === 'COMPLETED' && finalResponse.output?.audio) {
            return {
                audio: Buffer.from(finalResponse.output.audio, 'base64'),
                contentType: 'audio/wav',
                seed: 0
            };
        }
        return null;
    }

    /**
     * MODE 1: Direct Pod Logic (Upload -> Synthesize)
     */
    private async synthesizeViaPod(text: string, options: any): Promise<{ audio: Buffer; contentType: string; seed: number } | null> {
        const podBaseUrl = `https://${this.podId}-7860.proxy.runpod.net`;
        const voiceName = options.voice_name || 'default_voice';

        console.log(`[F5-TTS] Using Pod: ${this.podId} (Voice: ${voiceName})`);

        // Step 1: Upload Reference Audio (if provided)
        if (options.ref_audio) {
            try {
                // Convert Base64 to Blob for upload
                const audioBuffer = Buffer.from(options.ref_audio, 'base64');
                const formData = new FormData();
                const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });

                // Filename is required for upload
                formData.append('file', blob, `${voiceName}.mp3`);
                formData.append('audio_file_label', voiceName);

                console.log(`[F5-TTS] Uploading reference audio to ${podBaseUrl}/upload_audio/`);
                const uploadRes = await fetch(`${podBaseUrl}/upload_audio/`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.text();
                    console.error(`[F5-TTS] Upload failed: ${err}`);
                } else {
                    const uploadData = await uploadRes.json().catch(() => ({}));
                    console.log(`[F5-TTS] ✅ Upload successful for voice: ${voiceName}`, uploadData);
                }
            } catch (e) {
                console.error('[F5-TTS] Error uploading reference audio:', e);
            }
        }

        // Step 2: Synthesize via GET
        const synthUrl = new URL(`${podBaseUrl}/synthesize_speech/`);
        synthUrl.searchParams.append('text', text);
        synthUrl.searchParams.append('voice', voiceName);
        synthUrl.searchParams.append('speed', (options.speed || 1.0).toString());

        console.log(`[F5-TTS] Synthesizing via GET: ${synthUrl.toString()}`);

        const synthRes = await fetch(synthUrl.toString());

        if (!synthRes.ok) {
            const err = await synthRes.text();
            throw new Error(`Pod Synthesis Failed (${synthRes.status}): ${err}`);
        }

        // Step 3: Response is the audio file (Blob/Buffer)
        const arrayBuffer = await synthRes.arrayBuffer();

        return {
            audio: Buffer.from(arrayBuffer),
            contentType: 'audio/wav',
            seed: 0
        };
    }

    private async pollStatus(id: string): Promise<RunPodF5Response> {
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 5000)); // 5s wait

            const url = `${this.baseUrl}/${this.endpointId}/status/${id}`;
            console.log(`[F5-TTS] Polling (${(attempts + 1) * 5}s)... Status Check: ${url}`);

            try {
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${this.apiKey}` }
                });

                const data = await response.json();

                if (data.status === 'COMPLETED') {
                    return {
                        id: data.id,
                        status: 'COMPLETED',
                        output: {
                            audio: data.output.audio || data.output,
                            format: 'wav',
                            sample_rate: 24000,
                            seed_used: 0,
                            steps_used: 0
                        }
                    };
                } else if (data.status === 'FAILED') {
                    throw new Error(data.error || 'Unknown error');
                }

                attempts++;
            } catch (e: any) {
                console.error(`[F5-TTS] Polling error: ${e.message}`);
                attempts++;
            }
        }

        throw new Error('Timeout waiting for F5-TTS task');
    }
}

export const runpodF5Client = new RunPodF5Client();
