/**
 * Supertonic TTS Client - Browser WASM Implementation
 * 
 * Based on supertone-inc/supertonic reference implementation
 * Uses ONNX Runtime Web for client-side inference
 * 
 * @see https://github.com/supertone-inc/supertonic
 */

import * as ort from 'onnxruntime-web';
import { getSupertonicVoicePath } from './supertonicVoiceMap';

// ==================== TYPES ====================

interface VoiceStyle {
    style_ttl: {
        dims: number[];
        data: number[][][];
    };
    style_dp: {
        dims: number[];
        data: number[][][];
    };
}

interface Style {
    ttl: ort.Tensor;
    dp: ort.Tensor;
}

interface TTSConfig {
    text_encoder: { hidden_dim: number };
    duration_predictor: any;
    vocoder: { chunk_size: number; hop_size: number; sample_rate: number };
    vector_estimator: { latent_dim: number; chunk_compress: number };
}

interface UnicodeIndexer {
    start_token: number;
    end_token: number;
    pad_token: number;
    unk_token: number;
    iso639_1_to_lang_token: Record<string, number>;
    char_to_idx: Record<string, number>;
}

// ==================== UNICODE PROCESSOR ====================

class UnicodeProcessor {
    private indexer: UnicodeIndexer;

    constructor(indexer: UnicodeIndexer) {
        this.indexer = indexer;
    }

    processTexts(texts: string[], lang: string = 'en'): { inputIds: number[][]; textLengths: number[] } {
        const inputIds: number[][] = [];
        const textLengths: number[] = [];
        const langToken = this.indexer.iso639_1_to_lang_token[lang] || this.indexer.iso639_1_to_lang_token['en'];

        for (const text of texts) {
            const ids = [this.indexer.start_token, langToken];
            for (const char of text) {
                const idx = this.indexer.char_to_idx[char];
                ids.push(idx !== undefined ? idx : this.indexer.unk_token);
            }
            ids.push(this.indexer.end_token);
            inputIds.push(ids);
            textLengths.push(ids.length);
        }

        // Pad to max length
        const maxLen = Math.max(...textLengths);
        for (const ids of inputIds) {
            while (ids.length < maxLen) {
                ids.push(this.indexer.pad_token);
            }
        }

        return { inputIds, textLengths };
    }
}

// ==================== TEXT TO SPEECH CLASS ====================

class TextToSpeech {
    private cfgs: TTSConfig;
    private textProcessor: UnicodeProcessor;
    private dpOrt: ort.InferenceSession;
    private textEncOrt: ort.InferenceSession;
    private vectorEstOrt: ort.InferenceSession;
    private vocoderOrt: ort.InferenceSession;

    public sampleRate: number;

    constructor(
        cfgs: TTSConfig,
        textProcessor: UnicodeProcessor,
        dpOrt: ort.InferenceSession,
        textEncOrt: ort.InferenceSession,
        vectorEstOrt: ort.InferenceSession,
        vocoderOrt: ort.InferenceSession
    ) {
        this.cfgs = cfgs;
        this.textProcessor = textProcessor;
        this.dpOrt = dpOrt;
        this.textEncOrt = textEncOrt;
        this.vectorEstOrt = vectorEstOrt;
        this.vocoderOrt = vocoderOrt;
        this.sampleRate = cfgs.vocoder.sample_rate;
    }

    async call(
        text: string,
        lang: string,
        style: Style,
        totalStep: number = 8,
        speed: number = 1.0,
        cfgScale: number = 0.3,
        progressCallback?: (step: number, total: number) => void
    ): Promise<{ wav: Float32Array; duration: number[] }> {
        const texts = [text];
        const bsz = texts.length;

        // 1. Text Processing
        const { inputIds, textLengths } = this.textProcessor.processTexts(texts, lang);
        const textLen = inputIds[0].length;

        // 2. Create tensors
        const inputIdsTensor = new ort.Tensor('int64', BigInt64Array.from(inputIds.flat().map(x => BigInt(x))), [bsz, textLen]);
        const textLengthsTensor = new ort.Tensor('int64', BigInt64Array.from(textLengths.map(x => BigInt(x))), [bsz]);
        const textMask = this.lengthToMask(textLengths, textLen);
        const textMaskTensor = new ort.Tensor('float32', Float32Array.from(textMask.flat(2)), [bsz, 1, textLen]);

        // 3. Duration prediction
        const dpInputs = {
            input_ids: inputIdsTensor,
            text_lengths: textLengthsTensor,
            style: style.dp,
        };
        const dpOutputs = await this.dpOrt.run(dpInputs);
        const durations = dpOutputs['durations'].data as Float32Array;

        // 4. Calculate wav lengths
        const wavLengths: number[] = [];
        for (let b = 0; b < bsz; b++) {
            let dur = 0;
            for (let t = 0; t < textLengths[b]; t++) {
                dur += durations[b * textLen + t];
            }
            wavLengths.push(Math.round(dur * this.cfgs.vocoder.hop_size / speed));
        }

        // 5. Text encoding
        const attentionMask = new ort.Tensor('float32', Float32Array.from(textMask.flat(2)), [bsz, 1, textLen]);
        const textEncInputs = {
            input_ids: inputIdsTensor,
            attention_mask: attentionMask,
            style: style.ttl,
            durations: dpOutputs['durations'],
        };
        const textEncOutputs = await this.textEncOrt.run(textEncInputs);

        // 6. Setup latent space
        const { xt, latentMask } = this.setupLatent(wavLengths, bsz);
        const latentLen = xt[0][0].length;
        const latentDimVal = xt[0].length;

        const xtTensor = new ort.Tensor('float32', Float32Array.from(xt.flat(3)), [bsz, latentDimVal, latentLen]);
        const latentMaskTensor = new ort.Tensor('float32', Float32Array.from(latentMask.flat(2)), [bsz, 1, latentLen]);

        // 7. Flow matching (denoising)
        let currentXt = xtTensor;
        const dt = 1.0 / totalStep;

        for (let step = 0; step < totalStep; step++) {
            const t = step / totalStep;
            const tTensor = new ort.Tensor('float32', new Float32Array([t]), [1]);

            const vectorEstInputs = {
                xt: currentXt,
                t: tTensor,
                cond: textEncOutputs['text_encoded'],
                cond_mask: latentMaskTensor,
            };

            const vectorEstOutputs = await this.vectorEstOrt.run(vectorEstInputs);
            const vt = vectorEstOutputs['vt'].data as Float32Array;

            // Euler step
            const newXt = new Float32Array(vt.length);
            const xtData = currentXt.data as Float32Array;
            for (let i = 0; i < vt.length; i++) {
                newXt[i] = xtData[i] + vt[i] * dt;
            }

            currentXt = new ort.Tensor('float32', newXt, currentXt.dims);

            if (progressCallback) {
                progressCallback(step + 1, totalStep);
            }
        }

        // 8. Vocoder
        const vocoderInputs = {
            latent: currentXt,
        };
        const vocoderOutputs = await this.vocoderOrt.run(vocoderInputs);
        const wav = vocoderOutputs['wav'].data as Float32Array;

        return {
            wav,
            duration: wavLengths.map(len => len / this.sampleRate)
        };
    }

    private lengthToMask(lengths: number[], maxLen: number): number[][][] {
        return lengths.map(len => {
            const row = new Array(maxLen).fill(0.0);
            for (let j = 0; j < Math.min(len, maxLen); j++) {
                row[j] = 1.0;
            }
            return [row];
        });
    }

    private setupLatent(wavLengths: number[], bsz: number) {
        const chunkSize = this.cfgs.vocoder.chunk_size;
        const latentDim = this.cfgs.vector_estimator.latent_dim;
        const chunkCompress = this.cfgs.vector_estimator.chunk_compress;

        const latentLengths = wavLengths.map(len => Math.ceil((len + chunkSize - 1) / chunkSize));
        const latentLen = Math.max(...latentLengths);
        const latentDimVal = latentDim * chunkCompress;

        const xt: number[][][] = [];
        for (let b = 0; b < bsz; b++) {
            const batch: number[][] = [];
            for (let d = 0; d < latentDimVal; d++) {
                const row: number[] = [];
                for (let t = 0; t < latentLen; t++) {
                    // Box-Muller transform for Gaussian noise
                    const u1 = Math.max(0.0001, Math.random());
                    const u2 = Math.random();
                    const val = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                    row.push(val);
                }
                batch.push(row);
            }
            xt.push(batch);
        }

        const latentMask = this.lengthToMask(latentLengths, latentLen);

        // Apply mask
        for (let b = 0; b < bsz; b++) {
            for (let d = 0; d < latentDimVal; d++) {
                for (let t = 0; t < latentLen; t++) {
                    xt[b][d][t] *= latentMask[b][0][t];
                }
            }
        }

        return { xt, latentMask };
    }
}

// ==================== LOADER FUNCTIONS ====================

async function loadCfgs(onnxDir: string): Promise<TTSConfig> {
    const response = await fetch(`${onnxDir}/tts.json`);
    return response.json();
}

async function loadTextProcessor(onnxDir: string): Promise<UnicodeProcessor> {
    const response = await fetch(`${onnxDir}/unicode_indexer.json`);
    const indexer = await response.json();
    return new UnicodeProcessor(indexer);
}

async function loadOnnx(onnxPath: string, options: ort.InferenceSession.SessionOptions): Promise<ort.InferenceSession> {
    return await ort.InferenceSession.create(onnxPath, options);
}

async function loadVoiceStyle(stylePath: string): Promise<Style> {
    const response = await fetch(stylePath);
    const voiceStyle: VoiceStyle = await response.json();

    const ttlDims = voiceStyle.style_ttl.dims;
    const dpDims = voiceStyle.style_dp.dims;

    const ttlFlat = new Float32Array(voiceStyle.style_ttl.data.flat(Infinity) as number[]);
    const dpFlat = new Float32Array(voiceStyle.style_dp.data.flat(Infinity) as number[]);

    const ttlTensor = new ort.Tensor('float32', ttlFlat, [1, ttlDims[1], ttlDims[2]]);
    const dpTensor = new ort.Tensor('float32', dpFlat, [1, dpDims[1], dpDims[2]]);

    return { ttl: ttlTensor, dp: dpTensor };
}

// ==================== MAIN GENERATOR CLASS ====================

export class SupertonicVoiceGenerator {
    private static instance: SupertonicVoiceGenerator;
    private textToSpeech: TextToSpeech | null = null;
    private cfgs: TTSConfig | null = null;
    private currentStyle: Style | null = null;
    private isLoaded = false;
    private isLoading = false;
    private modelBasePath = '/models/supertonic/onnx';
    private defaultStylePath = '/models/supertonic/voice_styles/M1.json';

    private constructor() { }

    static getInstance(): SupertonicVoiceGenerator {
        if (!SupertonicVoiceGenerator.instance) {
            SupertonicVoiceGenerator.instance = new SupertonicVoiceGenerator();
        }
        return SupertonicVoiceGenerator.instance;
    }

    /**
     * Initialize the Supertonic engine, loading config and models.
     */
    async init(progressCallback?: (message: string) => void): Promise<void> {
        if (this.isLoaded) return;
        if (this.isLoading) {
            // Wait for existing initialization
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return;
        }

        this.isLoading = true;

        try {
            progressCallback?.('[Supertonic] Loading configuration...');

            // Load config
            this.cfgs = await loadCfgs(this.modelBasePath);

            // Load text processor
            const textProcessor = await loadTextProcessor(this.modelBasePath);

            // Load ONNX models
            const sessionOptions: ort.InferenceSession.SessionOptions = {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all' as any,
            };

            progressCallback?.('[Supertonic] Loading Duration Predictor...');
            const dpOrt = await loadOnnx(`${this.modelBasePath}/duration_predictor.onnx`, sessionOptions);

            progressCallback?.('[Supertonic] Loading Text Encoder...');
            const textEncOrt = await loadOnnx(`${this.modelBasePath}/text_encoder.onnx`, sessionOptions);

            progressCallback?.('[Supertonic] Loading Vector Estimator...');
            const vectorEstOrt = await loadOnnx(`${this.modelBasePath}/vector_estimator.onnx`, sessionOptions);

            progressCallback?.('[Supertonic] Loading Vocoder...');
            const vocoderOrt = await loadOnnx(`${this.modelBasePath}/vocoder.onnx`, sessionOptions);

            // Create TTS instance
            this.textToSpeech = new TextToSpeech(
                this.cfgs,
                textProcessor,
                dpOrt,
                textEncOrt,
                vectorEstOrt,
                vocoderOrt
            );

            // Load default voice style
            progressCallback?.('[Supertonic] Loading default voice style...');
            this.currentStyle = await loadVoiceStyle(this.defaultStylePath);

            this.isLoaded = true;
            progressCallback?.('[Supertonic] Engine ready!');
            console.log('[Supertonic] WASM Engine initialized successfully');
        } catch (error) {
            console.error('[Supertonic] Initialization failed:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Check if the engine is ready
     */
    isReady(): boolean {
        return this.isLoaded && this.textToSpeech !== null;
    }

    /**
     * Load a specific voice style based on voice seed name
     */
    async loadVoice(voiceSeedName: string): Promise<void> {
        const stylePath = getSupertonicVoicePath(voiceSeedName);
        try {
            this.currentStyle = await loadVoiceStyle(stylePath);
            console.log(`[Supertonic] Loaded voice style for "${voiceSeedName}" -> ${stylePath}`);
        } catch (error) {
            console.error(`[Supertonic] Failed to load voice ${voiceSeedName}:`, error);
            throw error;
        }
    }

    /**
     * Generate speech from text using the current voice style.
     */
    async synthesize(
        text: string,
        options: {
            voiceName?: string;
            speed?: number;
            steps?: number;
            lang?: string;
        } = {}
    ): Promise<ArrayBuffer> {
        if (!this.isReady()) {
            await this.init();
        }

        if (!this.textToSpeech || !this.currentStyle) {
            throw new Error('[Supertonic] Engine not initialized');
        }

        // Load voice if specified
        if (options.voiceName) {
            await this.loadVoice(options.voiceName);
        }

        const { speed = 1.0, steps = 8, lang = 'en' } = options;

        console.log(`[Supertonic] Synthesizing: "${text.substring(0, 50)}..." (speed=${speed}, steps=${steps})`);

        const startTime = performance.now();

        const { wav, duration } = await this.textToSpeech.call(
            text,
            lang,
            this.currentStyle,
            steps,
            speed,
            0.3,
            (step, total) => {
                console.log(`[Supertonic] Denoising step ${step}/${total}`);
            }
        );

        const endTime = performance.now();
        console.log(`[Supertonic] Synthesis completed in ${((endTime - startTime) / 1000).toFixed(2)}s`);

        // Convert to WAV ArrayBuffer
        return this.createWavBuffer(wav, this.textToSpeech.sampleRate);
    }

    /**
     * Create a WAV file buffer from audio data
     */
    private createWavBuffer(audioData: Float32Array, sampleRate: number): ArrayBuffer {
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * bitsPerSample / 8;
        const blockAlign = numChannels * bitsPerSample / 8;
        const dataSize = audioData.length * 2;

        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);

        // Write WAV header
        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);

        // Write audio data
        const dataOffset = 44;
        for (let i = 0; i < audioData.length; i++) {
            const clamped = Math.max(-1.0, Math.min(1.0, audioData[i]));
            const int16 = Math.floor(clamped * 32767);
            view.setInt16(dataOffset + i * 2, int16, true);
        }

        return buffer;
    }
}

export const supertonicGenerator = SupertonicVoiceGenerator.getInstance();
