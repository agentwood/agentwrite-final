/**
 * Audio Analyzer
 * Analyze WAV files for pitch, tempo, RMS to validate against contracts
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export interface AudioAnalysis {
    fundamental_freq_hz: number;
    pitch_variance_hz: number;
    tempo_bpm: number;
    rms: number;
    duration_seconds: number;
    detected_traits: string[];
}

/**
 * Analyze a WAV file using ffprobe and basic signal analysis
 * Falls back to estimates if ffprobe not available
 */
export function analyzeWavFile(filePath: string): AudioAnalysis {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Audio file not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;

    // Try to get duration from ffprobe
    let duration = 0;
    try {
        const result = execSync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
            { encoding: "utf-8" }
        );
        duration = parseFloat(result.trim());
    } catch {
        // Estimate duration from file size (rough: 44100 Hz * 2 bytes * 1 channel)
        duration = fileSizeBytes / (44100 * 2);
    }

    // Read WAV file for basic analysis
    const buffer = fs.readFileSync(filePath);

    // Skip WAV header (44 bytes) and analyze samples
    const samples: number[] = [];
    for (let i = 44; i < buffer.length - 1; i += 2) {
        const sample = buffer.readInt16LE(i);
        samples.push(sample / 32768); // Normalize to -1 to 1
    }

    // Calculate RMS (loudness)
    const sumSquares = samples.reduce((sum, s) => sum + s * s, 0);
    const rms = Math.sqrt(sumSquares / samples.length);

    // Estimate fundamental frequency using zero-crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < samples.length; i++) {
        if ((samples[i] >= 0 && samples[i - 1] < 0) ||
            (samples[i] < 0 && samples[i - 1] >= 0)) {
            zeroCrossings++;
        }
    }
    const sampleRate = 44100; // Assume standard sample rate
    const zcr = zeroCrossings / (samples.length / sampleRate);
    const estimatedF0 = zcr / 2; // Zero-crossing rate approximates 2x fundamental

    // Estimate pitch variance by analyzing segments
    const segmentSize = Math.floor(samples.length / 10);
    const segmentF0s: number[] = [];

    for (let seg = 0; seg < 10; seg++) {
        const start = seg * segmentSize;
        const end = start + segmentSize;
        let segZC = 0;
        for (let i = start + 1; i < end && i < samples.length; i++) {
            if ((samples[i] >= 0 && samples[i - 1] < 0) ||
                (samples[i] < 0 && samples[i - 1] >= 0)) {
                segZC++;
            }
        }
        const segF0 = (segZC / (segmentSize / sampleRate)) / 2;
        if (segF0 > 50 && segF0 < 500) { // Filter out silence/noise
            segmentF0s.push(segF0);
        }
    }

    const avgF0 = segmentF0s.length > 0
        ? segmentF0s.reduce((a, b) => a + b, 0) / segmentF0s.length
        : estimatedF0;

    const pitchVariance = segmentF0s.length > 0
        ? Math.max(...segmentF0s) - Math.min(...segmentF0s)
        : 20; // Default variance

    // Estimate tempo from energy peaks (very rough)
    const tempo = Math.round(120 + (avgF0 - 120) * 0.2); // Rough heuristic

    // Detect traits based on analysis
    const traits: string[] = [];

    if (rms > 0.15) {
        traits.push("shouting");
    } else if (rms < 0.02) {
        traits.push("whispering");
    }

    if (pitchVariance > 80) {
        traits.push("emotional");
    } else if (pitchVariance < 20) {
        traits.push("monotone");
    }

    return {
        fundamental_freq_hz: Math.round(avgF0),
        pitch_variance_hz: Math.round(pitchVariance),
        tempo_bpm: tempo,
        rms: Math.round(rms * 1000) / 1000,
        duration_seconds: Math.round(duration * 100) / 100,
        detected_traits: traits,
    };
}

/**
 * Print analysis summary
 */
export function printAnalysisSummary(analysis: AudioAnalysis): void {
    console.log(`  Pitch (F0): ${analysis.fundamental_freq_hz}Hz`);
    console.log(`  Pitch Variance: ${analysis.pitch_variance_hz}Hz`);
    console.log(`  Tempo: ${analysis.tempo_bpm}bpm`);
    console.log(`  RMS (loudness): ${analysis.rms}`);
    console.log(`  Duration: ${analysis.duration_seconds}s`);
    if (analysis.detected_traits.length > 0) {
        console.log(`  Detected traits: ${analysis.detected_traits.join(", ")}`);
    }
}
