/**
 * Audio Validator
 * 
 * Validates uploaded voice samples for quality, noise, and format compliance.
 */

export interface ValidationResult {
    valid: boolean;
    qualityScore: number; // 0-100
    noiseScore: number;   // 0-100 (lower is better)
    errors: string[];
    warnings: string[];
}

export interface AudioMetadata {
    durationSeconds: number;
    format: string;
    sampleRate: number;
    channels: number;
    bitDepth: number;
    fileSize: number;
}

// Constraints
const MIN_DURATION_SECONDS = 10;
const MAX_DURATION_SECONDS = 60;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm'];
const MIN_SAMPLE_RATE = 16000;

/**
 * Validate an uploaded audio file for voice contribution.
 */
export async function validateAudioFile(
    file: File | Blob,
    metadata?: Partial<AudioMetadata>
): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;
    let noiseScore = 0;

    // 1. Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
        qualityScore -= 30;
    }

    // 2. Check format (MIME type)
    if (file.type && !ALLOWED_FORMATS.includes(file.type)) {
        errors.push(`Invalid format: ${file.type}. Allowed: WAV, MP3, WebM.`);
        qualityScore -= 50;
    }

    // 3. Check duration (if provided in metadata)
    if (metadata?.durationSeconds) {
        if (metadata.durationSeconds < MIN_DURATION_SECONDS) {
            errors.push(`Audio too short. Minimum duration is ${MIN_DURATION_SECONDS} seconds.`);
            qualityScore -= 40;
        }
        if (metadata.durationSeconds > MAX_DURATION_SECONDS) {
            errors.push(`Audio too long. Maximum duration is ${MAX_DURATION_SECONDS} seconds.`);
            qualityScore -= 20;
        }
    }

    // 4. Check sample rate (if provided)
    if (metadata?.sampleRate && metadata.sampleRate < MIN_SAMPLE_RATE) {
        warnings.push(`Low sample rate: ${metadata.sampleRate}Hz. Recommended: 44100Hz or higher.`);
        qualityScore -= 10;
    }

    // 5. Mono vs Stereo
    if (metadata?.channels && metadata.channels > 2) {
        warnings.push('Multi-channel audio detected. Will be converted to mono.');
    }

    // Clamp score
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
        valid: errors.length === 0,
        qualityScore,
        noiseScore,
        errors,
        warnings,
    };
}

/**
 * Extract metadata from audio file using Web Audio API.
 * This runs client-side.
 */
export async function extractAudioMetadata(file: File | Blob): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                resolve({
                    durationSeconds: audioBuffer.duration,
                    format: file.type || 'unknown',
                    sampleRate: audioBuffer.sampleRate,
                    channels: audioBuffer.numberOfChannels,
                    bitDepth: 16, // Assumed for web audio
                    fileSize: file.size,
                });

                audioContext.close();
            } catch (err) {
                reject(new Error('Failed to decode audio file.'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read audio file.'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Server-side noise detection (placeholder).
 * In production, this would use a model like Silero VAD or similar.
 */
export async function analyzeNoiseLevel(audioPath: string): Promise<number> {
    // TODO: Integrate actual noise detection model
    // For now, return a random score between 10-40 (simulating good quality)
    return Math.floor(Math.random() * 30) + 10;
}

/**
 * Determine if voice should be auto-approved based on quality.
 */
export function shouldAutoApprove(qualityScore: number, noiseScore: number): boolean {
    // Auto-approve if quality >= 70 and noise <= 40
    return qualityScore >= 70 && noiseScore <= 40;
}

export const AUDIO_CONSTRAINTS = {
    MIN_DURATION_SECONDS,
    MAX_DURATION_SECONDS,
    MAX_FILE_SIZE_BYTES,
    ALLOWED_FORMATS,
    MIN_SAMPLE_RATE,
    AUTO_APPROVE_QUALITY_THRESHOLD: 70,
    AUTO_APPROVE_NOISE_THRESHOLD: 40,
};
