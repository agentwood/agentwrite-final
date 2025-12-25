/**
 * Test script for OpenVoice migration
 * Tests OpenVoice integration with sample characters
 */

import { db } from '../lib/db';
import { openVoiceClient } from '../lib/audio/openVoiceClient';
import { getReferenceAudio } from '../lib/audio/baseVoiceGenerator';
import { mapToOpenVoiceOptions } from '../lib/audio/openVoiceParameterMapper';

interface TestResult {
  characterId: string;
  characterName: string;
  hasReferenceAudio: boolean;
  openVoiceSuccess: boolean;
  geminiFallback: boolean;
  error?: string;
  latency?: number;
}

async function testCharacter(characterId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Get character
    const character = await db.personaTemplate.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        voiceName: true,
        styleHint: true,
        archetype: true,
        category: true,
        referenceAudioBase64: true,
        openVoiceVoiceId: true,
      }
    });

    if (!character) {
      return {
        characterId,
        characterName: 'Unknown',
        hasReferenceAudio: false,
        openVoiceSuccess: false,
        geminiFallback: false,
        error: 'Character not found',
      };
    }

    // Check if has reference audio
    const hasReferenceAudio = !!character.referenceAudioBase64;

    if (!hasReferenceAudio) {
      return {
        characterId: character.id,
        characterName: character.name,
        hasReferenceAudio: false,
        openVoiceSuccess: false,
        geminiFallback: true,
        error: 'No reference audio - will use Gemini fallback',
      };
    }

    // Test OpenVoice health
    try {
      const health = await openVoiceClient.healthCheck();
      if (!health.openvoice_ready) {
        return {
          characterId: character.id,
          characterName: character.name,
          hasReferenceAudio: true,
          openVoiceSuccess: false,
          geminiFallback: true,
          error: 'OpenVoice server not ready',
        };
      }
    } catch (healthError: any) {
      return {
        characterId: character.id,
        characterName: character.name,
        hasReferenceAudio: true,
        openVoiceSuccess: false,
        geminiFallback: true,
        error: `OpenVoice health check failed: ${healthError.message}`,
      };
    }

    // Test synthesis with OpenVoice
    const testText = "Hello, this is a test of OpenVoice synthesis.";
    const referenceAudio = await getReferenceAudio(character.id);
    
    if (!referenceAudio) {
      return {
        characterId: character.id,
        characterName: character.name,
        hasReferenceAudio: false,
        openVoiceSuccess: false,
        geminiFallback: true,
        error: 'Failed to retrieve reference audio',
      };
    }

    // Map parameters
    const openVoiceOptions = mapToOpenVoiceOptions(
      {
        speed: 1.0,
        styleHint: character.styleHint || undefined,
      },
      character.name,
      character.archetype,
      character.category
    );

    // Try synthesis
    let voiceId: string | { referenceAudioBase64: string };
    if (character.openVoiceVoiceId) {
      voiceId = character.openVoiceVoiceId;
    } else {
      voiceId = { referenceAudioBase64: referenceAudio };
    }

    try {
      const audioResponse = await openVoiceClient.synthesize(
        testText,
        voiceId,
        openVoiceOptions
      );

      const latency = Date.now() - startTime;

      return {
        characterId: character.id,
        characterName: character.name,
        hasReferenceAudio: true,
        openVoiceSuccess: true,
        geminiFallback: false,
        latency,
      };
    } catch (synthesisError: any) {
      return {
        characterId: character.id,
        characterName: character.name,
        hasReferenceAudio: true,
        openVoiceSuccess: false,
        geminiFallback: true,
        error: `Synthesis failed: ${synthesisError.message}`,
        latency: Date.now() - startTime,
      };
    }
  } catch (error: any) {
    return {
      characterId,
      characterName: 'Unknown',
      hasReferenceAudio: false,
      openVoiceSuccess: false,
      geminiFallback: true,
      error: error.message || 'Unknown error',
      latency: Date.now() - startTime,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('OpenVoice Migration Test');
  console.log('='.repeat(60));

  try {
    // Get test characters (first 10 with reference audio)
    const characters = await db.personaTemplate.findMany({
      where: {
        referenceAudioBase64: { not: null }
      },
      select: { id: true, name: true },
      take: 10,
      orderBy: { name: 'asc' }
    });

    if (characters.length === 0) {
      console.log('\n⚠️  No characters with reference audio found.');
      console.log('   Run generate-base-voices.ts first to create reference audio.');
      return;
    }

    console.log(`\nTesting ${characters.length} characters with reference audio...\n`);

    const results: TestResult[] = [];

    for (const character of characters) {
      console.log(`Testing: ${character.name}...`);
      const result = await testCharacter(character.id);
      results.push(result);

      if (result.openVoiceSuccess) {
        console.log(`  ✅ OpenVoice success (${result.latency}ms)`);
      } else {
        console.log(`  ❌ OpenVoice failed: ${result.error || 'Unknown'}`);
        if (result.geminiFallback) {
          console.log(`  ⚠️  Will use Gemini TTS fallback`);
        }
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.openVoiceSuccess).length;
    const withReferenceAudio = results.filter(r => r.hasReferenceAudio).length;
    const willFallback = results.filter(r => r.geminiFallback).length;

    console.log(`Total tested: ${results.length}`);
    console.log(`With reference audio: ${withReferenceAudio}`);
    console.log(`OpenVoice successful: ${successful}`);
    console.log(`Will use Gemini fallback: ${willFallback}`);

    if (successful > 0) {
      const avgLatency = results
        .filter(r => r.latency)
        .reduce((sum, r) => sum + (r.latency || 0), 0) / successful;
      console.log(`Average latency: ${avgLatency.toFixed(0)}ms`);
    }

    // Failed tests
    const failed = results.filter(r => !r.openVoiceSuccess && r.hasReferenceAudio);
    if (failed.length > 0) {
      console.log('\nFailed tests:');
      failed.forEach(r => {
        console.log(`  - ${r.characterName}: ${r.error || 'Unknown error'}`);
      });
    }

    // Save results
    const fs = require('fs');
    const path = require('path');
    const resultsPath = path.join(process.cwd(), 'data', 'openvoice-test-results.json');
    const resultsDir = path.dirname(resultsPath);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    fs.writeFileSync(resultsPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      total: results.length,
      successful,
      failed: results.length - successful,
      results
    }, null, 2));

    console.log(`\nResults saved to: ${resultsPath}`);

    // Recommendations
    console.log('\n' + '='.repeat(60));
    console.log('Recommendations');
    console.log('='.repeat(60));

    if (successful === 0) {
      console.log('❌ OpenVoice not working. Check:');
      console.log('   1. OpenVoice server is running');
      console.log('   2. USE_OPENVOICE=true in environment');
      console.log('   3. Reference audio is generated');
    } else if (successful < results.length) {
      console.log('⚠️  Partial success. Some characters will use Gemini fallback.');
      console.log('   Review failed tests and fix issues.');
    } else {
      console.log('✅ All tests passed! OpenVoice is ready for production.');
      console.log('   Set USE_OPENVOICE=true to enable OpenVoice.');
    }

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

export { testCharacter };



