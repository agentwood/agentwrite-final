/**
 * Test Voice-Character Mapping
 * 
 * This script:
 * 1. Fetches real characters from the database
 * 2. Extracts gender, age, personality from descriptions
 * 3. Maps them to the test audio files we generated
 * 4. Creates a test report showing voice-character matches
 */

import { db } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CharacterMatch {
  character: {
    id: string;
    name: string;
    voiceName: string;
    description?: string;
    tagline?: string;
    category: string;
    archetype: string;
  };
  extracted: {
    gender?: string;
    age?: string;
    personality?: string;
  };
  audioFile?: string;
  matchQuality: 'good' | 'warning' | 'poor';
  issues: string[];
}

// Map test audio files to voice names
const TEST_AUDIO_MAP: Record<string, string> = {
  'kore': 'test-1.wav',      // Male, Professional
  'aoede': 'test-2.wav',     // Female, Friendly
  'charon': 'test-3.wav',    // Male, Energetic
  'pulcherrima': 'test-4.wav', // Female, Calm
  'rasalgethi': 'test-5.wav', // Male, Authoritative
};

// Voice gender mapping (from Gemini TTS documentation)
const VOICE_GENDER_MAP: Record<string, 'male' | 'female' | 'neutral'> = {
  'kore': 'male',
  'aoede': 'female',
  'charon': 'male',
  'pulcherrima': 'female',
  'rasalgethi': 'male',
  'callirrhoe': 'female',
  'despina': 'female',
  'enceladus': 'male',
  'erinome': 'female',
  'fenrir': 'male',
  'gacrux': 'male',
  'iapetus': 'male',
  'laomedeia': 'female',
  'leda': 'female',
  'orus': 'male',
  'puck': 'male',
  'sadachbia': 'female',
  'sadaltager': 'male',
  'schedar': 'male',
  'sulafat': 'female',
  'umbriel': 'male',
  'vindemiatrix': 'female',
  'zephyr': 'male',
  'zubenelgenubi': 'male',
  'achernar': 'male',
  'achird': 'female',
  'algenib': 'male',
  'algieba': 'male',
  'alnilam': 'male',
  'autonoe': 'female',
};

function extractGender(text: string): string | undefined {
  const lower = text.toLowerCase();
  
  // Direct mentions
  if (lower.includes('male') || lower.includes('man') || lower.includes('guy') || 
      lower.includes('he ') || lower.includes('his ') || lower.includes('him ')) {
    return 'male';
  }
  if (lower.includes('female') || lower.includes('woman') || lower.includes('girl') ||
      lower.includes('she ') || lower.includes('her ') || lower.includes('hers ')) {
    return 'female';
  }
  
  // Name-based heuristics (common patterns)
  const malePatterns = /\b(he|his|him|himself|mr\.|mister|sir|gentleman)\b/i;
  const femalePatterns = /\b(she|her|hers|herself|mrs\.|miss|ms\.|lady|woman)\b/i;
  
  if (malePatterns.test(text)) return 'male';
  if (femalePatterns.test(text)) return 'female';
  
  return undefined;
}

function extractAge(text: string): string | undefined {
  const lower = text.toLowerCase();
  
  // Age ranges
  if (lower.includes('young') || lower.includes('teen') || lower.includes('20s') || 
      lower.includes('early 20') || lower.includes('college')) {
    return 'young';
  }
  if (lower.includes('middle-aged') || lower.includes('40s') || lower.includes('50s') ||
      lower.includes('adult') || lower.includes('professional')) {
    return 'middle';
  }
  if (lower.includes('old') || lower.includes('elderly') || lower.includes('senior') ||
      lower.includes('70s') || lower.includes('80s') || lower.includes('retired')) {
    return 'elderly';
  }
  
  // Extract numeric age
  const ageMatch = text.match(/\b(\d{1,2})\s*(?:years?\s*old|age|aged)\b/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age < 30) return 'young';
    if (age < 60) return 'middle';
    return 'elderly';
  }
  
  return undefined;
}

function extractPersonality(text: string): string | undefined {
  const lower = text.toLowerCase();
  const traits: string[] = [];
  
  if (lower.includes('friendly') || lower.includes('warm') || lower.includes('kind')) {
    traits.push('friendly');
  }
  if (lower.includes('professional') || lower.includes('serious') || lower.includes('formal')) {
    traits.push('professional');
  }
  if (lower.includes('energetic') || lower.includes('enthusiastic') || lower.includes('excited')) {
    traits.push('energetic');
  }
  if (lower.includes('calm') || lower.includes('soothing') || lower.includes('peaceful')) {
    traits.push('calm');
  }
  if (lower.includes('authoritative') || lower.includes('confident') || lower.includes('strong')) {
    traits.push('authoritative');
  }
  
  return traits.length > 0 ? traits.join(', ') : undefined;
}

function assessMatch(character: any, extracted: any): { quality: 'good' | 'warning' | 'poor'; issues: string[] } {
  const issues: string[] = [];
  
  const voiceGender = VOICE_GENDER_MAP[character.voiceName.toLowerCase()];
  const charGender = extracted.gender;
  
  // Gender mismatch
  if (voiceGender && charGender) {
    if (voiceGender === 'male' && charGender !== 'male') {
      issues.push(`Gender mismatch: Voice is male but character appears ${charGender}`);
    } else if (voiceGender === 'female' && charGender !== 'female') {
      issues.push(`Gender mismatch: Voice is female but character appears ${charGender}`);
    }
  }
  
  // Age-voice appropriateness (rough heuristic)
  const voiceName = character.voiceName.toLowerCase();
  if (extracted.age === 'elderly' && (voiceName.includes('energetic') || voiceName === 'charon')) {
    issues.push(`Age mismatch: Elderly character with energetic voice`);
  }
  
  // Personality-voice match
  const personality = extracted.personality?.toLowerCase() || '';
  if (personality.includes('energetic') && voiceName !== 'charon') {
    // Could be okay, just a note
  }
  if (personality.includes('calm') && voiceName !== 'pulcherrima') {
    // Could be okay, just a note
  }
  
  let quality: 'good' | 'warning' | 'poor' = 'good';
  if (issues.length > 0) {
    quality = issues.some(i => i.includes('Gender mismatch')) ? 'poor' : 'warning';
  }
  
  return { quality, issues };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Voice-Character Mapping Test');
  console.log('='.repeat(60));
  console.log();
  
  // Fetch characters that use the test voices
  const testVoices = Object.keys(TEST_AUDIO_MAP);
  const characters = await db.personaTemplate.findMany({
    where: {
      voiceName: {
        in: testVoices.map(v => v.toLowerCase())
      }
    },
    select: {
      id: true,
      name: true,
      voiceName: true,
      description: true,
      tagline: true,
      category: true,
      archetype: true,
    },
    take: 20, // Limit for testing
  });
  
  console.log(`Found ${characters.length} characters using test voices\n`);
  
  const matches: CharacterMatch[] = [];
  
  for (const char of characters) {
    const fullText = [char.description, char.tagline].filter(Boolean).join(' ');
    
    const extracted = {
      gender: extractGender(fullText),
      age: extractAge(fullText),
      personality: extractPersonality(fullText),
    };
    
    const audioFile = TEST_AUDIO_MAP[char.voiceName.toLowerCase()];
    const { quality, issues } = assessMatch(char, extracted);
    
    matches.push({
      character: char,
      extracted,
      audioFile,
      matchQuality: quality,
      issues,
    });
  }
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(matches);
  const reportPath = path.join(__dirname, '../../poc/openvoice-demo/voice-character-mapping-report.html');
  fs.writeFileSync(reportPath, htmlReport);
  
  // Generate console report
  console.log('='.repeat(60));
  console.log('Mapping Results');
  console.log('='.repeat(60));
  console.log();
  
  const good = matches.filter(m => m.matchQuality === 'good').length;
  const warning = matches.filter(m => m.matchQuality === 'warning').length;
  const poor = matches.filter(m => m.matchQuality === 'poor').length;
  
  console.log(`✅ Good matches: ${good}`);
  console.log(`⚠️  Warnings: ${warning}`);
  console.log(`❌ Poor matches: ${poor}`);
  console.log();
  
  // Show poor matches
  if (poor > 0) {
    console.log('Poor Matches:');
    console.log('-'.repeat(60));
    matches.filter(m => m.matchQuality === 'poor').forEach(m => {
      console.log(`\n${m.character.name} (${m.character.voiceName})`);
      console.log(`  Gender: ${m.extracted.gender || 'unknown'}`);
      console.log(`  Age: ${m.extracted.age || 'unknown'}`);
      console.log(`  Issues: ${m.issues.join(', ')}`);
    });
  }
  
  console.log(`\n📄 HTML Report: ${reportPath}`);
  console.log(`\nOpen the HTML file in your browser to see the full report and play audio files.`);
}

function generateHTMLReport(matches: CharacterMatch[]): string {
  // Load audio files as base64 for embedding
  const audioBasePath = path.join(__dirname, '../../poc/openvoice-demo/sample-reference-audio');
  const audioBase64Map: Record<string, string> = {};
  
  // Load all test audio files
  for (const [voice, filename] of Object.entries(TEST_AUDIO_MAP)) {
    const audioPath = path.join(audioBasePath, filename);
    if (fs.existsSync(audioPath)) {
      const audioBuffer = fs.readFileSync(audioPath);
      audioBase64Map[filename] = audioBuffer.toString('base64');
    }
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voice-Character Mapping Test</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 10px;
    }
    .character-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #ddd;
    }
    .character-card.good { border-left-color: #4CAF50; }
    .character-card.warning { border-left-color: #FF9800; }
    .character-card.poor { border-left-color: #F44336; }
    .character-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .character-name {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
    }
    .match-badge {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: bold;
    }
    .match-badge.good { background: #4CAF50; color: white; }
    .match-badge.warning { background: #FF9800; color: white; }
    .match-badge.poor { background: #F44336; color: white; }
    .character-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 15px 0;
    }
    .detail-item {
      background: #f9f9f9;
      padding: 10px;
      border-radius: 4px;
    }
    .detail-label {
      font-weight: bold;
      color: #666;
      font-size: 0.9em;
      margin-bottom: 5px;
    }
    .detail-value {
      color: #333;
    }
    .audio-player {
      margin: 15px 0;
      padding: 15px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .audio-player audio {
      width: 100%;
      margin-top: 10px;
    }
    .issues {
      margin-top: 15px;
      padding: 10px;
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      border-radius: 4px;
    }
    .issues ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-stats {
      display: flex;
      gap: 20px;
      margin-top: 15px;
    }
    .stat {
      text-align: center;
    }
    .stat-number {
      font-size: 2em;
      font-weight: bold;
    }
    .stat-label {
      color: #666;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>🎤 Voice-Character Mapping Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-stats">
      <div class="stat">
        <div class="stat-number" style="color: #4CAF50;">${matches.filter(m => m.matchQuality === 'good').length}</div>
        <div class="stat-label">Good Matches</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: #FF9800;">${matches.filter(m => m.matchQuality === 'warning').length}</div>
        <div class="stat-label">Warnings</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: #F44336;">${matches.filter(m => m.matchQuality === 'poor').length}</div>
        <div class="stat-label">Poor Matches</div>
      </div>
      <div class="stat">
        <div class="stat-number" style="color: #333;">${matches.length}</div>
        <div class="stat-label">Total Characters</div>
      </div>
    </div>
  </div>
  
  ${matches.map(match => `
    <div class="character-card ${match.matchQuality}">
      <div class="character-header">
        <div class="character-name">${match.character.name}</div>
        <span class="match-badge ${match.matchQuality}">${match.matchQuality.toUpperCase()}</span>
      </div>
      
      <div class="character-details">
        <div class="detail-item">
          <div class="detail-label">Voice</div>
          <div class="detail-value">${match.character.voiceName}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Category</div>
          <div class="detail-value">${match.character.category}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Archetype</div>
          <div class="detail-value">${match.character.archetype}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Extracted Gender</div>
          <div class="detail-value">${match.extracted.gender || 'unknown'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Extracted Age</div>
          <div class="detail-value">${match.extracted.age || 'unknown'}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Personality</div>
          <div class="detail-value">${match.extracted.personality || 'unknown'}</div>
        </div>
      </div>
      
      ${match.audioFile && audioBase64Map[match.audioFile] ? `
        <div class="audio-player">
          <div class="detail-label">Reference Audio</div>
          <audio controls>
            <source src="data:audio/wav;base64,${audioBase64Map[match.audioFile]}" type="audio/wav">
            Your browser does not support the audio element.
          </audio>
        </div>
      ` : '<p style="color: #999;">No audio file available</p>'}
      
      ${match.character.description ? `
        <div class="detail-item" style="margin-top: 15px;">
          <div class="detail-label">Description</div>
          <div class="detail-value">${match.character.description.substring(0, 200)}${match.character.description.length > 200 ? '...' : ''}</div>
        </div>
      ` : ''}
      
      ${match.issues.length > 0 ? `
        <div class="issues">
          <strong>⚠️ Issues Found:</strong>
          <ul>
            ${match.issues.map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      ` : '<div style="color: #4CAF50; margin-top: 15px;">✅ No issues detected</div>'}
    </div>
  `).join('')}
</body>
</html>`;
}

main().catch(console.error);

