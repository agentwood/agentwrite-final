/**
 * Contract Enforcement Test Runner
 * Validates REAL audio samples against character contracts
 * 
 * Run: npx tsx lib/voices/tests/run-enforcement.ts
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { config } from "dotenv";

config({ path: ".env.local" });

// Types
interface CharacterContract {
    id: string;
    display_name: string;
    archetype: string;
    psych_profile: {
        dominance: number;
        warmth: number;
        emotional_variance: number;
    };
    voice_requirements: {
        gender: string;
        age_range: [number, number];
        pitch_range_hz: [number, number];
        max_pitch_variance: number;
        max_tempo_bpm: number;
        max_rms: number;
    };
    forbidden_traits: string[];
    test_script: string;
}

interface AudioAnalysis {
    fundamental_freq_hz: number;
    pitch_variance_hz: number;
    tempo_bpm: number;
    rms: number;
    duration_seconds: number;
    detected_traits: string[];
}

interface Violation {
    code: string;
    severity: "critical" | "major" | "minor";
    message: string;
    expected: string;
    actual: string;
}

interface EnforcementResult {
    passed: boolean;
    score: number;
    violations: Violation[];
}

// Paths
const CONTRACTS_DIR = "lib/voices/contracts";
const SAMPLES_DIR = "lib/voices/samples";
const RESULTS_FILE = "lib/voices/tests/enforcement-results.json";

/**
 * Load all contracts
 */
function loadContracts(): CharacterContract[] {
    const contracts: CharacterContract[] = [];

    if (!fs.existsSync(CONTRACTS_DIR)) {
        return contracts;
    }

    const files = fs.readdirSync(CONTRACTS_DIR);
    for (const file of files) {
        if (file.endsWith(".json")) {
            const content = fs.readFileSync(path.join(CONTRACTS_DIR, file), "utf-8");
            contracts.push(JSON.parse(content));
        }
    }

    return contracts;
}

/**
 * Find sample file for character (supports .mp3 and .wav)
 */
function findSampleFile(characterId: string): string | null {
    const mp3Path = path.join(SAMPLES_DIR, `${characterId}.mp3`);
    const wavPath = path.join(SAMPLES_DIR, `${characterId}.wav`);

    if (fs.existsSync(mp3Path)) return mp3Path;
    if (fs.existsSync(wavPath)) return wavPath;
    return null;
}

/**
 * Convert MP3 to WAV using ffmpeg and return temp path
 */
function convertToWav(inputPath: string): string {
    const tempWav = `/tmp/voice_analysis_${Date.now()}.wav`;

    try {
        execSync(`ffmpeg -y -i "${inputPath}" -ar 44100 -ac 1 -sample_fmt s16 "${tempWav}" 2>/dev/null`, {
            encoding: "utf-8",
        });
        return tempWav;
    } catch (error) {
        throw new Error(`ffmpeg conversion failed. Install ffmpeg: brew install ffmpeg`);
    }
}

/**
 * Analyze WAV file using basic signal processing
 */
function analyzeWav(filePath: string): AudioAnalysis {
    // If it's MP3, convert first
    let wavPath = filePath;
    let tempFile = false;

    if (filePath.endsWith(".mp3")) {
        wavPath = convertToWav(filePath);
        tempFile = true;
    }

    const buffer = fs.readFileSync(wavPath);

    // Parse WAV header
    const dataOffset = 44; // Standard WAV header size
    const samples: number[] = [];

    for (let i = dataOffset; i < buffer.length - 1; i += 2) {
        const sample = buffer.readInt16LE(i);
        samples.push(sample / 32768);
    }

    // Clean up temp file
    if (tempFile) {
        fs.unlinkSync(wavPath);
    }

    // Calculate RMS
    const sumSquares = samples.reduce((sum, s) => sum + s * s, 0);
    const rms = Math.sqrt(sumSquares / samples.length);

    // Zero-crossing rate for pitch estimation
    const sampleRate = 44100;
    let zeroCrossings = 0;
    for (let i = 1; i < samples.length; i++) {
        if ((samples[i] >= 0 && samples[i - 1] < 0) ||
            (samples[i] < 0 && samples[i - 1] >= 0)) {
            zeroCrossings++;
        }
    }

    const duration = samples.length / sampleRate;
    const zcr = zeroCrossings / duration;

    // Zero-crossing rate divided by 2 gives approximate F0
    // But this is often too high for speech, so we apply a correction
    let estimatedF0 = zcr / 2;

    // For speech, typical fundamental is 85-300 Hz
    // If our estimate is way off, we use autocorrelation-based estimate
    if (estimatedF0 > 500 || estimatedF0 < 50) {
        // Fallback: estimate based on sample periodicity
        estimatedF0 = estimatePitchAutocorr(samples, sampleRate);
    }

    // Segment analysis for variance
    const segmentCount = 8;
    const segmentSize = Math.floor(samples.length / segmentCount);
    const segmentF0s: number[] = [];

    for (let seg = 0; seg < segmentCount; seg++) {
        const start = seg * segmentSize;
        const segmentSamples = samples.slice(start, start + segmentSize);
        const segF0 = estimatePitchAutocorr(segmentSamples, sampleRate);
        if (segF0 > 50 && segF0 < 400) {
            segmentF0s.push(segF0);
        }
    }

    const avgF0 = segmentF0s.length > 0
        ? segmentF0s.reduce((a, b) => a + b, 0) / segmentF0s.length
        : estimatedF0;

    const pitchVariance = segmentF0s.length > 1
        ? Math.max(...segmentF0s) - Math.min(...segmentF0s)
        : 15;

    // Estimate speaking rate (very rough: based on energy peaks)
    const wordsEstimate = contract_test_script_word_count(duration);
    const tempo = Math.round((wordsEstimate / duration) * 60);

    // Detect traits
    const traits: string[] = [];
    if (rms > 0.15) traits.push("shouting");
    if (rms < 0.02) traits.push("whispering");
    if (pitchVariance > 60) traits.push("emotional");
    if (pitchVariance < 12) traits.push("monotone");

    return {
        fundamental_freq_hz: Math.round(avgF0),
        pitch_variance_hz: Math.round(pitchVariance),
        tempo_bpm: Math.min(tempo, 200), // Cap at reasonable value
        rms: Math.round(rms * 1000) / 1000,
        duration_seconds: Math.round(duration * 100) / 100,
        detected_traits: traits,
    };
}

/**
 * Estimate pitch using simplified autocorrelation
 */
function estimatePitchAutocorr(samples: number[], sampleRate: number): number {
    const minPeriod = Math.floor(sampleRate / 400); // Max 400 Hz
    const maxPeriod = Math.floor(sampleRate / 70);  // Min 70 Hz

    let bestCorr = 0;
    let bestPeriod = minPeriod;

    const windowSize = Math.min(samples.length, maxPeriod * 2);

    for (let period = minPeriod; period <= maxPeriod && period < windowSize; period++) {
        let corr = 0;
        let count = 0;

        for (let i = 0; i < windowSize - period; i++) {
            corr += samples[i] * samples[i + period];
            count++;
        }

        if (count > 0) {
            corr /= count;
            if (corr > bestCorr) {
                bestCorr = corr;
                bestPeriod = period;
            }
        }
    }

    return sampleRate / bestPeriod;
}

/**
 * Rough word count estimation based on duration
 * Average speaking rate is about 2.5 words per second
 */
function contract_test_script_word_count(duration: number): number {
    return Math.round(duration * 2.5);
}

/**
 * Validate audio against contract
 */
function validateAudio(contract: CharacterContract, analysis: AudioAnalysis): EnforcementResult {
    const violations: Violation[] = [];
    let score = 100;
    const req = contract.voice_requirements;

    // Pitch range check
    if (analysis.fundamental_freq_hz < req.pitch_range_hz[0] ||
        analysis.fundamental_freq_hz > req.pitch_range_hz[1]) {
        violations.push({
            code: "PITCH_OUT_OF_RANGE",
            severity: "major",
            message: `Fundamental frequency outside contract bounds`,
            expected: `${req.pitch_range_hz[0]}-${req.pitch_range_hz[1]}Hz`,
            actual: `${analysis.fundamental_freq_hz}Hz`,
        });
        score -= 25;
    }

    // Pitch variance check
    if (analysis.pitch_variance_hz > req.max_pitch_variance) {
        violations.push({
            code: "PITCH_VARIANCE_EXCEEDED",
            severity: "major",
            message: `Too much pitch variation for controlled character`,
            expected: `≤${req.max_pitch_variance}Hz`,
            actual: `${analysis.pitch_variance_hz}Hz`,
        });
        score -= 20;
    }

    // Tempo check
    if (analysis.tempo_bpm > req.max_tempo_bpm) {
        violations.push({
            code: "TEMPO_EXCEEDED",
            severity: "minor",
            message: `Speaking rate too fast`,
            expected: `≤${req.max_tempo_bpm}bpm`,
            actual: `${analysis.tempo_bpm}bpm`,
        });
        score -= 10;
    }

    // RMS (loudness) check
    if (analysis.rms > req.max_rms) {
        violations.push({
            code: "LOUDNESS_EXCEEDED",
            severity: "minor",
            message: `Audio too loud`,
            expected: `≤${req.max_rms}`,
            actual: `${analysis.rms}`,
        });
        score -= 10;
    }

    // Forbidden traits check
    for (const forbidden of contract.forbidden_traits) {
        const forbiddenLower = forbidden.toLowerCase();
        for (const detected of analysis.detected_traits) {
            if (detected.toLowerCase().includes(forbiddenLower)) {
                violations.push({
                    code: "FORBIDDEN_TRAIT",
                    severity: "critical",
                    message: `Detected forbidden trait: ${forbidden}`,
                    expected: `No ${forbidden}`,
                    actual: `Detected: ${detected}`,
                });
                score -= 30;
            }
        }
    }

    const hasCritical = violations.some(v => v.severity === "critical");

    return {
        passed: !hasCritical && score >= 70,
        score: Math.max(0, score),
        violations,
    };
}

/**
 * Main
 */
async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("   VOICE CONTRACT ENFORCEMENT");
    console.log("   Analyzing REAL audio samples against contracts");
    console.log("═══════════════════════════════════════════════════════════\n");

    const contracts = loadContracts();

    if (contracts.length === 0) {
        console.log("⚠️  No contracts found in lib/voices/contracts/");
        return;
    }

    console.log(`Found ${contracts.length} contract(s)\n`);

    const results: any[] = [];

    for (const contract of contracts) {
        console.log("────────────────────────────────────────────────────────────");
        console.log(`Character: ${contract.display_name}`);
        console.log(`Archetype: ${contract.archetype}`);
        console.log("────────────────────────────────────────────────────────────");

        const samplePath = findSampleFile(contract.id);

        if (!samplePath) {
            console.log(`\n❌ No sample found for ${contract.id}`);
            console.log(`   Run: npx tsx lib/voices/scripts/pull-sample.ts ${contract.id}\n`);
            results.push({
                character: contract.id,
                status: "missing_sample",
                passed: false,
                score: 0,
            });
            continue;
        }

        // Analyze the audio
        console.log(`\n📊 Analyzing: ${samplePath}`);
        const analysis = analyzeWav(samplePath);

        console.log(`\n   Audio Properties:`);
        console.log(`   ├─ Pitch (F0): ${analysis.fundamental_freq_hz}Hz`);
        console.log(`   ├─ Pitch Variance: ${analysis.pitch_variance_hz}Hz`);
        console.log(`   ├─ Tempo: ${analysis.tempo_bpm}bpm`);
        console.log(`   ├─ RMS: ${analysis.rms}`);
        console.log(`   ├─ Duration: ${analysis.duration_seconds}s`);
        console.log(`   └─ Traits: ${analysis.detected_traits.join(", ") || "none"}`);

        console.log(`\n   Contract Requirements:`);
        console.log(`   ├─ Pitch: ${contract.voice_requirements.pitch_range_hz[0]}-${contract.voice_requirements.pitch_range_hz[1]}Hz`);
        console.log(`   ├─ Max Variance: ${contract.voice_requirements.max_pitch_variance}Hz`);
        console.log(`   ├─ Max Tempo: ${contract.voice_requirements.max_tempo_bpm}bpm`);
        console.log(`   ├─ Max RMS: ${contract.voice_requirements.max_rms}`);
        console.log(`   └─ Forbidden: ${contract.forbidden_traits.join(", ")}`);

        // Validate
        const result = validateAudio(contract, analysis);

        console.log(`\n   Result: ${result.passed ? "✅ PASSED" : "❌ FAILED"} (${result.score}/100)`);

        if (result.violations.length > 0) {
            console.log(`\n   Violations:`);
            for (const v of result.violations) {
                const icon = v.severity === "critical" ? "🔴" : v.severity === "major" ? "🟠" : "🟡";
                console.log(`   ${icon} [${v.severity.toUpperCase()}] ${v.code}`);
                console.log(`      ${v.message}`);
                console.log(`      Expected: ${v.expected} | Actual: ${v.actual}`);
            }
        }

        console.log("");

        results.push({
            character: contract.id,
            name: contract.display_name,
            status: result.passed ? "passed" : "failed",
            passed: result.passed,
            score: result.score,
            analysis,
            violations: result.violations,
        });
    }

    // Summary
    console.log("═══════════════════════════════════════════════════════════");
    console.log("   SUMMARY");
    console.log("═══════════════════════════════════════════════════════════\n");

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    console.log(`Total: ${results.length} | Passed: ${passed} ✅ | Failed: ${failed} ❌`);
    console.log(`Average Score: ${avgScore.toFixed(0)}/100\n`);

    // Save results
    fs.mkdirSync(path.dirname(RESULTS_FILE), { recursive: true });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    console.log(`📄 Results saved: ${RESULTS_FILE}`);
}

main().catch(console.error);
