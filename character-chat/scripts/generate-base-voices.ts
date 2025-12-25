/**
 * Generate base reference audio for all characters
 * Uses Gemini TTS to generate 3-6 second reference audio samples
 * These will be used by OpenVoice for voice cloning
 */

import { getGeminiClient } from '../lib/geminiClient';
import { Modality } from '@google/genai';
import { db } from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

interface CharacterVoice {
  id: string;
  name: string;
  voiceName: string;
  styleHint?: string;
  referenceText: string; // 3-6 second speech sample
}

// Generate reference text based on character description
function generateReferenceText(character: any): string {
  // Create a 3-6 second speech sample that represents the character
  const name = character.name.split(' ')[0]; // First name only
  const profession = character.description?.match(/(\w+)\s+(?:who|that|with)/i)?.[1] || 'person';
  const personality = character.styleHint || character.tagline || '';
  
  // Generate appropriate reference text
  const templates = [
    `Hello, I'm ${name}. ${character.tagline || `I'm a ${profession} with a unique perspective.`}`,
    `Hi there, my name is ${name}. ${character.description?.substring(0, 100) || 'I have an interesting story to tell.'}`,
    `Greetings, I am ${name}. ${character.greeting || 'Welcome to our conversation.'}`,
  ];
  
  // Select template based on character type
  const template = templates[0]; // Use first template for consistency
  
  // Ensure text is 3-6 seconds (roughly 15-30 words at normal speech rate)
  const words = template.split(' ');
  if (words.length < 15) {
    // Add more context
    return `${template} This is a reference audio sample for voice cloning.`;
  } else if (words.length > 30) {
    // Trim to fit
    return words.slice(0, 30).join(' ') + '.';
  }
  
  return template;
}

async function generateReferenceAudio(character: any): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    console.log(`\n[${character.id}] Generating reference audio for: ${character.name}`);
    console.log(`  Voice: ${character.voiceName}, Style: ${character.styleHint || 'default'}`);

    const referenceText = generateReferenceText(character);
    console.log(`  Reference text: "${referenceText}"`);

    const ai = getGeminiClient();
    
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: {
        parts: [{ text: referenceText }]
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
      console.error(`  ❌ No audio data returned`);
      return { success: false, error: 'No audio data returned from API' };
    }

    // Convert to base64 for database storage
    const audioBase64 = audioData;

    // Also save to file for backup
    const outputDir = path.join(process.cwd(), 'data', 'reference-audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${character.id}.wav`);
    const audioBuffer = Buffer.from(audioData, 'base64');
    fs.writeFileSync(outputPath, audioBuffer);

    // Update database
    await db.personaTemplate.update({
      where: { id: character.id },
      data: {
        referenceAudioBase64: audioBase64,
        referenceAudioUrl: `/data/reference-audio/${character.id}.wav`,
      }
    });

    console.log(`  ✅ Generated: ${outputPath}`);
    console.log(`     Size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`     Database updated`);

    return { success: true, path: outputPath };
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    if (error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
      return { success: false, error: 'TTS quota exceeded' };
    }
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Generate Base Reference Audio for All Characters');
  console.log('='.repeat(60));

  try {
    // Get all characters
    const characters = await db.personaTemplate.findMany({
      select: {
        id: true,
        name: true,
        voiceName: true,
        styleHint: true,
        tagline: true,
        description: true,
        greeting: true,
        referenceAudioBase64: true, // Check if already generated
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\nFound ${characters.length} characters`);
    
    // Filter out characters that already have reference audio
    const charactersNeedingAudio = characters.filter(c => !c.referenceAudioBase64);
    console.log(`${charactersNeedingAudio.length} characters need reference audio`);
    console.log(`${characters.length - charactersNeedingAudio.length} already have reference audio\n`);

    if (charactersNeedingAudio.length === 0) {
      console.log('✅ All characters already have reference audio!');
      return;
    }

    const results: Array<{ character: string; success: boolean; error?: string }> = [];
    let successCount = 0;
    let failCount = 0;

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < charactersNeedingAudio.length; i += batchSize) {
      const batch = charactersNeedingAudio.slice(i, i + batchSize);
      console.log(`\nProcessing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(charactersNeedingAudio.length / batchSize)}`);
      
      for (const character of batch) {
        const result = await generateReferenceAudio(character);
        results.push({
          character: character.name,
          success: result.success,
          error: result.error
        });

        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }

        // Small delay between characters
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Longer delay between batches
      if (i + batchSize < charactersNeedingAudio.length) {
        console.log('\nWaiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Generation Summary');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}/${charactersNeedingAudio.length}`);
    console.log(`❌ Failed: ${failCount}/${charactersNeedingAudio.length}`);

    if (failCount > 0) {
      console.log('\nFailed characters:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.character}: ${r.error || 'Unknown error'}`);
      });
    }

    // Save summary
    const summaryPath = path.join(process.cwd(), 'data', 'reference-audio', 'generation-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      total: charactersNeedingAudio.length,
      successful: successCount,
      failed: failCount,
      results
    }, null, 2));

    console.log(`\nSummary saved to: ${summaryPath}`);
    console.log('\n✅ Base voice generation complete!');
    console.log('Next steps:');
    console.log('1. Verify audio files in data/reference-audio/');
    console.log('2. Test OpenVoice integration');
    console.log('3. Update /api/tts route to use OpenVoice');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateReferenceAudio, generateReferenceText };




