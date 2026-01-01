import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { generateFishSpeech } from '../lib/audio/fishSpeechClient';

/**
 * A/B Test: Fish Speech vs Current Stack (OpenVoice/Gemini)
 * 
 * This script generates the SAME text with both TTS engines
 * and saves them for side-by-side comparison.
 */

const TEST_CHARACTER = 'Salty Marjorie';
const TEST_TEXT = "Excuse me, I've been a resident of this community for THIRTY years, and I will NOT tolerate this kind of behavior. Do you have any idea who you're talking to?";
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'tts-test');

async function testCurrentStack() {
    console.log('🎤 Testing Current Stack (OpenVoice/Gemini)...');

    // Call the existing TTS API endpoint
    const response = await fetch('http://localhost:3000/api/tts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: TEST_TEXT,
            personaId: 'marjorie', // Salty Marjorie's ID
        }),
    });

    if (!response.ok) {
        throw new Error(`Current TTS API failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const outputPath = path.join(OUTPUT_DIR, 'current-stack.mp3');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ Current Stack audio saved to: ${outputPath}`);
    return outputPath;
}

async function testFishSpeech() {
    console.log('🐟 Testing Fish Speech...');

    try {
        const buffer = await generateFishSpeech({
            text: TEST_TEXT,
            emotion: 'irritated', // Marjorie's typical mood
            speed: 1.1, // Slightly faster for "impatient" feel
        });

        const outputPath = path.join(OUTPUT_DIR, 'fish-speech.mp3');
        fs.writeFileSync(outputPath, buffer);

        console.log(`✅ Fish Speech audio saved to: ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error('❌ Fish Speech test failed:', error);
        throw error;
    }
}

async function generateComparisonPage(currentPath: string, fishPath: string) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TTS A/B Test - Salty Marjorie</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      background: white;
      border-radius: 2rem;
      padding: 3rem;
      max-width: 900px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
    }
    .test-text {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 1rem;
      margin-bottom: 2rem;
      border-left: 4px solid #667eea;
    }
    .test-text p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #333;
      font-style: italic;
    }
    .comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .audio-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 2rem;
      border-radius: 1.5rem;
      text-align: center;
      transition: transform 0.3s ease;
    }
    .audio-card:hover {
      transform: translateY(-5px);
    }
    .audio-card h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #333;
    }
    .audio-card.current {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }
    .audio-card.fish {
      background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
    }
    audio {
      width: 100%;
      margin-top: 1rem;
    }
    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .badge.current-badge {
      background: #ff7675;
      color: white;
    }
    .badge.fish-badge {
      background: #74b9ff;
      color: white;
    }
    .criteria {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 1rem;
    }
    .criteria h3 {
      margin-bottom: 1rem;
      color: #333;
    }
    .criteria ul {
      list-style: none;
      padding-left: 0;
    }
    .criteria li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    .criteria li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎭 TTS A/B Test</h1>
    <p class="subtitle">Character: <strong>${TEST_CHARACTER}</strong></p>
    
    <div class="test-text">
      <p>"${TEST_TEXT}"</p>
    </div>
    
    <div class="comparison">
      <div class="audio-card current">
        <span class="badge current-badge">Current Stack</span>
        <h2>OpenVoice + Gemini</h2>
        <audio controls>
          <source src="/tts-test/current-stack.mp3" type="audio/mpeg">
        </audio>
      </div>
      
      <div class="audio-card fish">
        <span class="badge fish-badge">Fish Speech</span>
        <h2>Fish Speech API</h2>
        <audio controls>
          <source src="/tts-test/fish-speech.mp3" type="audio/mpeg">
        </audio>
      </div>
    </div>
    
    <div class="criteria">
      <h3>📊 Evaluation Criteria:</h3>
      <ul>
        <li>Naturalness (breathing, pauses, rhythm)</li>
        <li>Emotional expression (irritation, entitlement)</li>
        <li>Accent accuracy (Sunbelt American)</li>
        <li>Overall "wow factor" / believability</li>
      </ul>
    </div>
  </div>
</body>
</html>`;

    const htmlPath = path.join(OUTPUT_DIR, 'comparison.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`✅ Comparison page created: ${htmlPath}`);
    console.log(`\n🌐 Open http://localhost:3000/tts-test/comparison.html in your browser\n`);
}

async function main() {
    console.log('🚀 Starting TTS A/B Test...\n');

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    try {
        // Test both engines
        const currentPath = await testCurrentStack();
        const fishPath = await testFishSpeech();

        // Generate comparison page
        await generateComparisonPage(currentPath, fishPath);

        console.log('\n✅ A/B Test Complete!');
        console.log('Open the comparison page to listen side-by-side.');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

main();
