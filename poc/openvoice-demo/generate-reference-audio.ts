/**
 * Generate test reference audio for OpenVoice POC
 * Uses Gemini TTS to generate 3-6 second reference audio samples for test characters
 */

import { GoogleGenAI } from '@google/genai';
import { Modality } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in environment variables");
  }
  return new GoogleGenAI({ apiKey });
}

interface TestCharacter {
  id: string;
  name: string;
  voiceName: string;
  styleHint?: string;
  referenceText: string; // 3-6 second speech sample
}

// Test characters for POC
const TEST_CHARACTERS: TestCharacter[] = [
  {
    id: 'test-1',
    name: 'Test Character 1 - Male, Professional',
    voiceName: 'kore',
    styleHint: 'professional, clear',
    referenceText: 'Hello, I am a professional character with a clear speaking voice. This is a test for OpenVoice voice cloning.'
  },
  {
    id: 'test-2',
    name: 'Test Character 2 - Female, Friendly',
    voiceName: 'aoede',
    styleHint: 'friendly, warm',
    referenceText: 'Hi there! I am a friendly character with a warm voice. This sample will be used for voice cloning testing.'
  },
  {
    id: 'test-3',
    name: 'Test Character 3 - Male, Energetic',
    voiceName: 'charon',
    styleHint: 'energetic, enthusiastic',
    referenceText: 'Hey! I am an energetic character with an enthusiastic voice. This is perfect for testing voice synthesis quality.'
  },
  {
    id: 'test-4',
    name: 'Test Character 4 - Female, Calm',
    voiceName: 'pulcherrima',
    styleHint: 'calm, soothing',
    referenceText: 'Hello. I am a calm character with a soothing voice. This reference audio will help test OpenVoice capabilities.'
  },
  {
    id: 'test-5',
    name: 'Test Character 5 - Male, Authoritative',
    voiceName: 'rasalgethi',
    styleHint: 'authoritative, confident',
    referenceText: 'Good day. I am an authoritative character with a confident speaking style. This sample tests voice cloning accuracy.'
  }
];

async function generateReferenceAudio(character: TestCharacter): Promise<string | null> {
  try {
    console.log(`\nGenerating reference audio for: ${character.name}`);
    console.log(`Voice: ${character.voiceName}, Style: ${character.styleHint || 'default'}`);
    console.log(`Text: "${character.referenceText}"`);

    const ai = getGeminiClient();
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: character.referenceText }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: character.voiceName.toLowerCase()
            }
          }
        }
      }
    });

    // Extract audio data
    const audioData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('audio')
    )?.inlineData?.data;

    if (!audioData) {
      console.error(`❌ No audio data returned for ${character.name}`);
      return null;
    }

    // Save to file
    const outputDir = path.join(__dirname, 'sample-reference-audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${character.id}.wav`);
    
    // Convert base64 to buffer and save as WAV
    const audioBuffer = Buffer.from(audioData, 'base64');
    fs.writeFileSync(outputPath, audioBuffer);

    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   Size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);

    // Also save metadata
    const metadataPath = path.join(outputDir, `${character.id}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify({
      character,
      outputPath,
      generatedAt: new Date().toISOString(),
      audioSize: audioBuffer.length
    }, null, 2));

    return outputPath;
  } catch (error: any) {
    console.error(`❌ Error generating audio for ${character.name}:`, error.message);
    if (error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
      console.error('   ⚠️  TTS quota exceeded. Please check your Gemini API quota.');
    }
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('OpenVoice POC - Reference Audio Generation');
  console.log('='.repeat(60));
  console.log(`Generating ${TEST_CHARACTERS.length} reference audio samples...\n`);

  const results: Array<{ character: TestCharacter; success: boolean; path?: string }> = [];

  for (const character of TEST_CHARACTERS) {
    const path = await generateReferenceAudio(character);
    results.push({
      character,
      success: path !== null,
      path: path || undefined
    });

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Generation Summary');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${TEST_CHARACTERS.length}`);
  console.log(`❌ Failed: ${TEST_CHARACTERS.length - successful}/${TEST_CHARACTERS.length}`);

  if (successful > 0) {
    console.log('\nGenerated files:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  - ${r.character.name}: ${r.path}`);
    });
  }

  // Save summary
  const summaryPath = path.join(__dirname, 'sample-reference-audio', 'generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    total: TEST_CHARACTERS.length,
    successful,
    failed: TEST_CHARACTERS.length - successful,
    results
  }, null, 2));

  console.log(`\nSummary saved to: ${summaryPath}`);
  console.log('\nNext steps:');
  console.log('1. Verify audio files in sample-reference-audio/');
  console.log('2. Test voice cloning: python test-clone.py');
  console.log('3. Test synthesis: python test-synthesize.py');
}

// Run if executed directly
main().catch(console.error);

export { generateReferenceAudio, TEST_CHARACTERS };


