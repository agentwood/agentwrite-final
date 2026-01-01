/**
 * XTTS-v2 Local TTS Client
 * 
 * This client calls a local XTTS-v2 server for text-to-speech synthesis.
 * Uses voice samples as speaker references for zero-shot voice cloning.
 * 
 * Server: docker run -d -p 8080:8080 ghcr.io/coqui-ai/xtts-streaming-server
 */

import * as fs from 'fs';
import * as path from 'path';

const XTTS_SERVER_URL = process.env.XTTS_SERVER_URL || 'http://localhost:8080';
const SAMPLES_DIR = path.join(process.cwd(), 'public/voice-samples');

// Language mapping for XTTS-v2
const LANGUAGE_MAP: Record<string, string> = {
    // Japanese characters
    'yuki-tanaka': 'ja',
    'kenji-tanaka': 'ja',
    'sunny-sato': 'en', // Japanese-American, speaks English

    // Korean characters
    'mina-kwon': 'ko',
    'detective-jun': 'en', // Korean-American, speaks English

    // Italian characters
    'nico-awkward': 'it',

    // French characters
    'camille-laurent': 'fr',

    // Spanish/Portuguese characters
    'captain-mireya': 'es',
    'hector-alvarez': 'es',
    'unshakeable-optimist': 'pt',

    // German/Nordic characters
    'soren-nielsen': 'da', // Danish (fallback to English if not supported)

    // Default to English for all other characters
};

export interface XTTSConfig {
    seedId: string;
    text: string;
    language?: string;
}

/**
 * Get the voice sample path for a character
 */
export function getVoiceSamplePath(seedId: string): string | null {
    const charDir = path.join(SAMPLES_DIR, seedId);

    if (!fs.existsSync(charDir)) {
        return null;
    }

    // Look for the first sample file
    const files = fs.readdirSync(charDir).filter(f => f.endsWith('.wav'));
    if (files.length === 0) {
        return null;
    }

    return path.join(charDir, files[0]);
}

/**
 * Get the language code for a character
 */
export function getLanguageForCharacter(seedId: string): string {
    return LANGUAGE_MAP[seedId] || 'en';
}

/**
 * Check if XTTS server is available
 */
export async function isXTTSServerAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${XTTS_SERVER_URL}/`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Generate speech using XTTS-v2 local server
 */
export async function generateSpeechXTTS(config: XTTSConfig): Promise<Buffer> {
    const samplePath = getVoiceSamplePath(config.seedId);

    if (!samplePath) {
        throw new Error(`No voice sample found for character: ${config.seedId}`);
    }

    const language = config.language || getLanguageForCharacter(config.seedId);

    // Read the voice sample file
    const sampleBuffer = fs.readFileSync(samplePath);
    const sampleBase64 = sampleBuffer.toString('base64');

    // Call XTTS-v2 server
    const response = await fetch(`${XTTS_SERVER_URL}/tts_to_audio`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: config.text,
            speaker_wav: sampleBase64,
            language: language,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`XTTS generation failed: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Generate streaming speech using XTTS-v2
 */
export async function* generateSpeechStreamXTTS(config: XTTSConfig): AsyncGenerator<Buffer> {
    const samplePath = getVoiceSamplePath(config.seedId);

    if (!samplePath) {
        throw new Error(`No voice sample found for character: ${config.seedId}`);
    }

    const language = config.language || getLanguageForCharacter(config.seedId);

    // Read the voice sample file
    const sampleBuffer = fs.readFileSync(samplePath);
    const sampleBase64 = sampleBuffer.toString('base64');

    // Call XTTS-v2 streaming endpoint
    const response = await fetch(`${XTTS_SERVER_URL}/tts_stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: config.text,
            speaker_wav: sampleBase64,
            language: language,
            add_wav_header: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`XTTS streaming failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('No response body reader');
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield Buffer.from(value);
    }
}

/**
 * Get available characters with voice samples
 */
export function getAvailableVoiceCharacters(): string[] {
    if (!fs.existsSync(SAMPLES_DIR)) {
        return [];
    }

    return fs.readdirSync(SAMPLES_DIR).filter(dir => {
        const charDir = path.join(SAMPLES_DIR, dir);
        if (!fs.statSync(charDir).isDirectory()) {
            return false;
        }
        const files = fs.readdirSync(charDir).filter(f => f.endsWith('.wav'));
        return files.length > 0;
    });
}
