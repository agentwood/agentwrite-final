/**
 * Contract Enforcement System
 * Tests are ENFORCEMENT - validating that voice assets meet character contracts
 */

import { VoiceAsset, calculateVoiceCompatibility, findVoicesBySpec } from './assets';
import { CharacterContract, VoiceRequirements } from './contracts';

/**
 * Violation severity levels
 */
export type ViolationSeverity = 'critical' | 'major' | 'minor';

/**
 * A specific contract violation
 */
export interface ContractViolation {
    code: string;
    message: string;
    severity: ViolationSeverity;
    expected: string | number;
    actual: string | number;
}

/**
 * Result of contract enforcement
 */
export interface EnforcementResult {
    passed: boolean;
    score: number;  // 0-100
    violations: ContractViolation[];
    warnings: string[];
    recommended_voice?: string;
}

/**
 * Acoustic analysis of generated audio
 */
export interface AcousticAnalysis {
    fundamental_freq_hz: number;  // F0, base pitch
    pitch_variance_hz: number;    // How much pitch varies
    tempo_bpm: number;            // Speaking rate (words per min approx)
    rms: number;                  // Loudness (0-1)
    detected_traits: string[];    // e.g., ['shouting', 'whispering']
}

/**
 * Validate a voice asset against a character contract
 * This is STATIC validation - checking the voice profile matches requirements
 */
export function validateVoiceForContract(
    contract: CharacterContract,
    voice: VoiceAsset
): EnforcementResult {
    const violations: ContractViolation[] = [];
    const warnings: string[] = [];
    let score = 100;

    const req = contract.voice_requirements;

    // === CRITICAL CHECKS ===

    // Gender check
    if (req.gender !== 'neutral' && voice.gender !== req.gender && voice.gender !== 'neutral') {
        violations.push({
            code: 'GENDER_MISMATCH',
            message: `Contract requires ${req.gender} voice`,
            severity: 'critical',
            expected: req.gender,
            actual: voice.gender,
        });
        score -= 50;
    }

    // === MAJOR CHECKS ===

    // Age range check
    const ageOverlap = Math.max(0,
        Math.min(voice.age_range[1], req.age_range[1]) -
        Math.max(voice.age_range[0], req.age_range[0])
    );
    if (ageOverlap === 0) {
        violations.push({
            code: 'AGE_RANGE_VIOLATION',
            message: `Voice age range ${voice.age_range[0]}-${voice.age_range[1]} doesn't overlap with required ${req.age_range[0]}-${req.age_range[1]}`,
            severity: 'major',
            expected: `${req.age_range[0]}-${req.age_range[1]}`,
            actual: `${voice.age_range[0]}-${voice.age_range[1]}`,
        });
        score -= 25;
    }

    // Pitch range check
    if (voice.pitch_range_hz[0] < req.pitch_range_hz[0] - 30 ||
        voice.pitch_range_hz[1] > req.pitch_range_hz[1] + 30) {
        violations.push({
            code: 'PITCH_RANGE_VIOLATION',
            message: `Voice pitch range outside contract bounds`,
            severity: 'major',
            expected: `${req.pitch_range_hz[0]}-${req.pitch_range_hz[1]}Hz`,
            actual: `${voice.pitch_range_hz[0]}-${voice.pitch_range_hz[1]}Hz`,
        });
        score -= 20;
    }

    // Pitch variance (control) check
    const voicePitchVariance = voice.pitch_range_hz[1] - voice.pitch_range_hz[0];
    if (voicePitchVariance > req.max_pitch_variance) {
        violations.push({
            code: 'PITCH_VARIANCE_VIOLATION',
            message: `Voice has too much pitch variance for this controlled character`,
            severity: 'major',
            expected: `≤${req.max_pitch_variance}Hz`,
            actual: `${voicePitchVariance}Hz`,
        });
        score -= 20;
    }

    // === MINOR CHECKS ===

    // Tempo check
    if (voice.typical_tempo_bpm > req.max_tempo_bpm) {
        violations.push({
            code: 'TEMPO_VIOLATION',
            message: `Voice speaks too fast for this character`,
            severity: 'minor',
            expected: `≤${req.max_tempo_bpm}bpm`,
            actual: `${voice.typical_tempo_bpm}bpm`,
        });
        score -= 10;
    }

    // RMS (loudness) check
    if (voice.typical_rms > req.max_rms) {
        violations.push({
            code: 'LOUDNESS_VIOLATION',
            message: `Voice is too loud for this character`,
            severity: 'minor',
            expected: `≤${req.max_rms}`,
            actual: `${voice.typical_rms}`,
        });
        score -= 10;
    }

    // === FORBIDDEN TRAITS CHECK ===

    // Check if voice capabilities conflict with forbidden traits
    for (const forbidden of contract.forbidden_traits) {
        const forbiddenLower = forbidden.toLowerCase();

        if (forbiddenLower === 'shouting' && voice.can_shout) {
            warnings.push(`Voice CAN shout but character forbids shouting - ensure TTS never triggers shout mode`);
        }

        if (forbiddenLower === 'laughter' && voice.emotional_range === 'wide') {
            warnings.push(`Voice has wide emotional range but character forbids laughter - monitor output carefully`);
        }
    }

    // Determine pass/fail
    const hasCritical = violations.some(v => v.severity === 'critical');
    const hasMajor = violations.some(v => v.severity === 'major');
    const passed = !hasCritical && score >= 70;

    return {
        passed,
        score: Math.max(0, score),
        violations,
        warnings,
    };
}

/**
 * Validate generated audio against a character contract
 * This is DYNAMIC validation - checking actual output matches requirements
 */
export function validateAudioForContract(
    contract: CharacterContract,
    analysis: AcousticAnalysis
): EnforcementResult {
    const violations: ContractViolation[] = [];
    const warnings: string[] = [];
    let score = 100;

    const req = contract.voice_requirements;

    // === PITCH CHECKS ===

    // Fundamental frequency in range
    if (analysis.fundamental_freq_hz < req.pitch_range_hz[0] ||
        analysis.fundamental_freq_hz > req.pitch_range_hz[1]) {
        violations.push({
            code: 'AUDIO_PITCH_VIOLATION',
            message: `Generated audio pitch outside contract bounds`,
            severity: 'major',
            expected: `${req.pitch_range_hz[0]}-${req.pitch_range_hz[1]}Hz`,
            actual: `${analysis.fundamental_freq_hz}Hz`,
        });
        score -= 25;
    }

    // Pitch variance check
    if (analysis.pitch_variance_hz > req.max_pitch_variance) {
        violations.push({
            code: 'AUDIO_VARIANCE_VIOLATION',
            message: `Generated audio has too much pitch variation`,
            severity: 'major',
            expected: `≤${req.max_pitch_variance}Hz`,
            actual: `${analysis.pitch_variance_hz}Hz`,
        });
        score -= 20;
    }

    // === TEMPO CHECK ===

    if (analysis.tempo_bpm > req.max_tempo_bpm) {
        violations.push({
            code: 'AUDIO_TEMPO_VIOLATION',
            message: `Generated audio speaks too fast`,
            severity: 'minor',
            expected: `≤${req.max_tempo_bpm}bpm`,
            actual: `${analysis.tempo_bpm}bpm`,
        });
        score -= 15;
    }

    // === LOUDNESS CHECK ===

    if (analysis.rms > req.max_rms) {
        violations.push({
            code: 'AUDIO_LOUDNESS_VIOLATION',
            message: `Generated audio is too loud`,
            severity: 'minor',
            expected: `≤${req.max_rms}`,
            actual: `${analysis.rms}`,
        });
        score -= 10;
    }

    // === FORBIDDEN TRAITS CHECK ===

    for (const forbidden of contract.forbidden_traits) {
        const forbiddenLower = forbidden.toLowerCase();

        for (const detected of analysis.detected_traits) {
            if (detected.toLowerCase().includes(forbiddenLower)) {
                violations.push({
                    code: 'FORBIDDEN_TRAIT_DETECTED',
                    message: `Detected forbidden trait: ${forbidden}`,
                    severity: 'critical',
                    expected: `No ${forbidden}`,
                    actual: `Detected: ${detected}`,
                });
                score -= 30;
            }
        }
    }

    const hasCritical = violations.some(v => v.severity === 'critical');
    const passed = !hasCritical && score >= 70;

    return {
        passed,
        score: Math.max(0, score),
        violations,
        warnings,
    };
}

/**
 * Find the best matching voice for a contract
 */
export function findBestVoiceForContract(
    contract: CharacterContract,
    availableVoices: VoiceAsset[]
): { voice: VoiceAsset | null; result: EnforcementResult } {
    let bestVoice: VoiceAsset | null = null;
    let bestResult: EnforcementResult = {
        passed: false,
        score: 0,
        violations: [],
        warnings: [],
    };

    for (const voice of availableVoices) {
        const result = validateVoiceForContract(contract, voice);

        if (result.score > bestResult.score) {
            bestVoice = voice;
            bestResult = result;
        }
    }

    return { voice: bestVoice, result: bestResult };
}

/**
 * Generate enforcement report for a contract
 */
export function generateEnforcementReport(
    contract: CharacterContract,
    voice: VoiceAsset,
    audioAnalysis?: AcousticAnalysis
): string {
    const staticResult = validateVoiceForContract(contract, voice);
    const dynamicResult = audioAnalysis
        ? validateAudioForContract(contract, audioAnalysis)
        : null;

    let report = `# Contract Enforcement Report\n`;
    report += `## Character: ${contract.display_name}\n`;
    report += `## Voice: ${voice.name}\n\n`;

    report += `### Static Validation (Voice Profile)\n`;
    report += `- **Status**: ${staticResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `- **Score**: ${staticResult.score}/100\n`;

    if (staticResult.violations.length > 0) {
        report += `\n#### Violations:\n`;
        for (const v of staticResult.violations) {
            report += `- [${v.severity.toUpperCase()}] ${v.code}: ${v.message}\n`;
            report += `  - Expected: ${v.expected}\n`;
            report += `  - Actual: ${v.actual}\n`;
        }
    }

    if (staticResult.warnings.length > 0) {
        report += `\n#### Warnings:\n`;
        for (const w of staticResult.warnings) {
            report += `- ⚠️ ${w}\n`;
        }
    }

    if (dynamicResult) {
        report += `\n### Dynamic Validation (Generated Audio)\n`;
        report += `- **Status**: ${dynamicResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
        report += `- **Score**: ${dynamicResult.score}/100\n`;

        if (dynamicResult.violations.length > 0) {
            report += `\n#### Audio Violations:\n`;
            for (const v of dynamicResult.violations) {
                report += `- [${v.severity.toUpperCase()}] ${v.code}: ${v.message}\n`;
            }
        }
    }

    return report;
}
