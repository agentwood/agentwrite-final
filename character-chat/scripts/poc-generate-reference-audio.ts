/**
 * Generate reference audio samples for OpenVoice POC testing
 * Uses Gemini TTS to generate 3-6 second reference audio for test characters
 */

import { getGeminiClient } from '@/lib/geminiClient';
import { Modality } from '@google/genai';
import { db } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

// Test characters to generate reference audio for
const TEST_CHARACTERS = [
  {
    name: 'Dr. Michael Brooks',
    description: 'Licensed clinical psychologist specializing in trauma and PTSD',
    gender: 'male',
    age: 'middle-aged',
    voiceName: 'charon', // Example voice
    text: 'Hello, I am Dr. Michael Brooks. I specialize in helping people overcome trauma and PTSD. How can I assist you today?',
  },
  {
    name: 'Elara',
    description: 'Old wise woman, mystical guide',
    gender: 'female',
    age: 'old',
    voiceName: 'kore', // Example voice
    text: 'Greetings, traveler. I am Elara, keeper of ancient wisdom. What knowledge do you seek?',
  },
  {
    name: 'Marcus Chen',
    description: 'Young tech entrepreneur, energetic and optimistic',
    gender: 'male',
    age: 'young',
    voiceName: 'puck', // Example voice
    text: 'Hey there! I am Marcus Chen, and I am building the next big thing in tech. Excited to chat with you!',
  },
  {
    name: 'Sophia Martinez',
    description: 'Professional chef, warm and welcoming',
    gender: 'female',
    age: 'middle-aged',
    voiceName: 'aoede', // Example voice
    text: 'Welcome! I am Sophia Martinez, a professional chef. I love sharing recipes and cooking tips. What would you like to know?',
  },
  {
    name: 'James Thompson',
    description: 'Retired military veteran, authoritative and calm',
    gender: 'male',
    age: 'old',
    voiceName: 'charon', // Example voice
    text: 'Good day. I am James Thompson, retired military. I have experience in leadership and strategy. How can I help?',
  },
];

async function generateReferenceAudio() {
  console.log('='.repeat(50));
  console.log('Generating Reference Audio for OpenVoice POC');
  console.log('='.repeat(50));

  const ai = getGeminiClient();
  const outputDir = path.join(process.cwd(), 'poc', 'openvoice-demo', 'sample-reference-audio');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const character of TEST_CHARACTERS) {
    console.log(`\nGenerating audio for: ${character.name}`);
    console.log(`Text: ${character.text}`);
    console.log(`Voice: ${character.voiceName}`);

    try {
      // Generate TTS using Gemini
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: {
          parts: [{ text: character.text }],
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: character.voiceName.toLowerCase(),
              },
            },
          },
        },
      });

      // Extract audio data
      const audioData = result.candidates?.[0]?.content?.parts?.find(
        (part: any) => part.inlineData?.mimeType?.includes('audio')
      )?.inlineData?.data;

      if (!audioData) {
        console.error(`❌ No audio data returned for ${character.name}`);
        results.push({
          character: character.name,
          success: false,
          error: 'No audio data returned',
        });
        continue;
      }

      // Save audio file
      const filename = `${character.name.replace(/\s+/g, '_')}_reference.wav`;
      const filepath = path.join(outputDir, filename);

      // Convert base64 to buffer and save
      const audioBuffer = Buffer.from(audioData, 'base64');
      fs.writeFileSync(filepath, audioBuffer);

      console.log(`✅ Saved: ${filepath}`);

      // Calculate duration (rough estimate: PCM16 at 24kHz)
      // Each sample is 2 bytes, so duration = buffer.length / (24000 * 2)
      const duration = audioBuffer.length / (24000 * 2);
      console.log(`   Duration: ~${duration.toFixed(2)} seconds`);

      results.push({
        character: character.name,
        success: true,
        filepath,
        filename,
        duration,
        voiceName: character.voiceName,
      });

    } catch (error: any) {
      console.error(`❌ Error generating audio for ${character.name}:`, error.message);
      results.push({
        character: character.name,
        success: false,
        error: error.message,
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/${TEST_CHARACTERS.length}`);
  console.log(`❌ Failed: ${TEST_CHARACTERS.length - successful}/${TEST_CHARACTERS.length}`);

  console.log('\nGenerated files:');
  results.filter(r => r.success).forEach(r => {
    console.log(`  - ${r.filename} (${r.duration?.toFixed(2)}s)`);
  });

  // Save results JSON
  const resultsFile = path.join(outputDir, 'generation_results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsFile}`);

  return results;
}

// Run if executed directly
if (require.main === module) {
  generateReferenceAudio()
    .then(() => {
      console.log('\n✅ Reference audio generation complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

export { generateReferenceAudio };

