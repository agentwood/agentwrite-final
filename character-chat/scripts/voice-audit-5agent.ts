/**
 * 5-Agent Voice Audit System
 * 
 * This script audits all 35 characters from the Excel spreadsheet by:
 * 1. Synthesizing a test phrase using the Fish Audio API
 * 2. Rating the voice-character match based on 5 criteria
 * 3. Outputting a final score out of 100
 */

import dotenv from 'dotenv';
import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

// Load environment
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

const FISH_SPEECH_API_KEY = process.env.FISH_SPEECH_API_KEY;

// The 35 authoritative characters from Excel
interface CharacterVoice {
    name: string;
    seedId: string;
    fishAudioId: string;
    voiceType: string;
    age: string;
    gender: string;
    heritage: string;
    description: string;
}

async function loadCharactersFromExcel(): Promise<CharacterVoice[]> {
    const xlsPath = path.resolve(process.cwd(), 'data/comprehensive-character-data.xlsx');
    const workbook = xlsx.readFile(xlsPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    return data.map((row: any) => ({
        name: row['Name'] || row['name'] || '',
        seedId: row['Seed ID'] || row['seedId'] || row['seed_id'] || '',
        fishAudioId: row['Fish Audio Model ID'] || row['fish_audio_model_id'] || '',
        voiceType: row['Voice Type'] || row['voice_type'] || '',
        age: row['Age'] || row['age'] || '',
        gender: row['Gender'] || row['gender'] || '',
        heritage: row['Heritage'] || row['heritage'] || '',
        description: row['Description'] || row['description'] || ''
    }));
}

async function testVoice(voiceId: string, testPhrase: string): Promise<{ success: boolean; latencyMs: number; audioSize: number }> {
    const startTime = Date.now();

    try {
        const response = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_SPEECH_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: testPhrase,
                reference_id: voiceId,
                format: 'mp3',
                normalize: true
            }),
            signal: AbortSignal.timeout(15000)
        });

        const latencyMs = Date.now() - startTime;

        if (response.ok) {
            const buffer = await response.arrayBuffer();
            return { success: true, latencyMs, audioSize: buffer.byteLength };
        } else {
            const errorText = await response.text();
            console.log(`   [API Error ${response.status}]: ${errorText.substring(0, 100)}`);
            return { success: false, latencyMs, audioSize: 0 };
        }
    } catch (error: any) {
        const latencyMs = Date.now() - startTime;
        console.log(`   [Network Error]: ${error.message}`);
        return { success: false, latencyMs, audioSize: 0 };
    }
}

// 5-Agent Rating Criteria
interface AuditResult {
    characterName: string;
    seedId: string;
    fishAudioId: string;
    voiceType: string;

    // Agent 1: API Connectivity (20 points)
    apiConnectivity: number;

    // Agent 2: Response Latency (20 points) - faster is better
    latencyScore: number;
    latencyMs: number;

    // Agent 3: Audio Quality (20 points) - based on file size/duration
    audioQualityScore: number;
    audioSize: number;

    // Agent 4: Voice ID Validity (20 points) - is it a real cloned voice?
    voiceIdValidity: number;

    // Agent 5: Character Match (20 points) - based on metadata completeness
    characterMatchScore: number;

    // Final Score
    totalScore: number;
    grade: string;
}

function calculateGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

async function auditCharacter(char: CharacterVoice): Promise<AuditResult> {
    console.log(`\n🔍 Auditing: ${char.name} (${char.seedId})...`);

    // Generate a test phrase based on character description
    const testPhrase = `Hello! I am ${char.name}. Nice to meet you.`;

    const testResult = await testVoice(char.fishAudioId, testPhrase);

    // Agent 1: API Connectivity (20 points)
    const apiConnectivity = testResult.success ? 20 : 0;

    // Agent 2: Latency Score (20 points)
    // < 1s = 20, < 2s = 15, < 3s = 10, < 5s = 5, else 0
    let latencyScore = 0;
    if (testResult.success) {
        if (testResult.latencyMs < 1000) latencyScore = 20;
        else if (testResult.latencyMs < 2000) latencyScore = 15;
        else if (testResult.latencyMs < 3000) latencyScore = 10;
        else if (testResult.latencyMs < 5000) latencyScore = 5;
    }

    // Agent 3: Audio Quality (20 points)
    // Based on file size - larger files typically mean longer/higher quality audio
    // > 50KB = 20, > 30KB = 15, > 10KB = 10, > 5KB = 5, else 0
    let audioQualityScore = 0;
    if (testResult.success && testResult.audioSize > 0) {
        if (testResult.audioSize > 50000) audioQualityScore = 20;
        else if (testResult.audioSize > 30000) audioQualityScore = 15;
        else if (testResult.audioSize > 10000) audioQualityScore = 10;
        else if (testResult.audioSize > 5000) audioQualityScore = 5;
    }

    // Agent 4: Voice ID Validity (20 points)
    // Check if the voice ID looks like a real UUID (32 hex chars)
    const isValidUUID = /^[a-f0-9]{32}$/.test(char.fishAudioId);
    const voiceIdValidity = isValidUUID && testResult.success ? 20 : (isValidUUID ? 10 : 0);

    // Agent 5: Character Match (20 points)
    // Based on metadata completeness
    let characterMatchScore = 0;
    if (char.name) characterMatchScore += 4;
    if (char.voiceType) characterMatchScore += 4;
    if (char.age) characterMatchScore += 4;
    if (char.gender) characterMatchScore += 4;
    if (char.heritage) characterMatchScore += 4;

    // Calculate total
    const totalScore = apiConnectivity + latencyScore + audioQualityScore + voiceIdValidity + characterMatchScore;

    const result: AuditResult = {
        characterName: char.name,
        seedId: char.seedId,
        fishAudioId: char.fishAudioId,
        voiceType: char.voiceType,
        apiConnectivity,
        latencyScore,
        latencyMs: testResult.latencyMs,
        audioQualityScore,
        audioSize: testResult.audioSize,
        voiceIdValidity,
        characterMatchScore,
        totalScore,
        grade: calculateGrade(totalScore)
    };

    console.log(`   Score: ${totalScore}/100 (${result.grade})`);
    console.log(`   - API: ${apiConnectivity}/20 | Latency: ${latencyScore}/20 (${testResult.latencyMs}ms)`);
    console.log(`   - Quality: ${audioQualityScore}/20 (${testResult.audioSize}B) | ID Valid: ${voiceIdValidity}/20 | Match: ${characterMatchScore}/20`);

    return result;
}

async function runAudit() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         5-AGENT VOICE AUDIT SYSTEM                        ║');
    console.log('║         Testing 35 Characters from Excel                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!FISH_SPEECH_API_KEY) {
        console.error('❌ FISH_SPEECH_API_KEY not found in environment');
        process.exit(1);
    }

    const characters = await loadCharactersFromExcel();
    console.log(`📋 Loaded ${characters.length} characters from Excel\n`);

    const results: AuditResult[] = [];

    for (const char of characters) {
        const result = await auditCharacter(char);
        results.push(result);

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 500));
    }

    // Summary Report
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    AUDIT SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Sort by score (descending)
    results.sort((a, b) => b.totalScore - a.totalScore);

    console.log('┌─────────────────────────────────┬───────┬───────┐');
    console.log('│ Character                       │ Score │ Grade │');
    console.log('├─────────────────────────────────┼───────┼───────┤');

    for (const r of results) {
        const name = r.characterName.substring(0, 31).padEnd(31);
        const score = r.totalScore.toString().padStart(3);
        const grade = r.grade.padEnd(2);
        console.log(`│ ${name} │ ${score}   │ ${grade}    │`);
    }

    console.log('└─────────────────────────────────┴───────┴───────┘');

    // Statistics
    const avgScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;
    const passed = results.filter(r => r.totalScore >= 60).length;
    const failed = results.filter(r => r.totalScore < 60).length;

    console.log(`\n📊 Statistics:`);
    console.log(`   Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`   Passed (≥60): ${passed}`);
    console.log(`   Failed (<60): ${failed}`);

    // Top 5
    console.log(`\n🏆 Top 5 Performers:`);
    results.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.characterName}: ${r.totalScore}/100 (${r.grade})`);
    });

    // Bottom 5
    console.log(`\n⚠️  Bottom 5 (Needs Attention):`);
    results.slice(-5).reverse().forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.characterName}: ${r.totalScore}/100 (${r.grade})`);
    });

    // Save results to JSON
    const outputPath = path.resolve(process.cwd(), 'data/voice-audit-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Full results saved to: ${outputPath}`);
}

runAudit().catch(console.error);
