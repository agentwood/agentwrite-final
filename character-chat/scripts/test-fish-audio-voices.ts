/**
 * Voice Testing Script for Fish Audio Characters
 * 
 * Tests all Fish Audio character voices to ensure they work correctly
 * and sound natural with the enhanced paralinguistic features.
 * 
 * Usage: npx ts-node scripts/test-fish-audio-voices.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Character to Fish Audio Model ID mapping (from fishAudioClient.ts)
const CHARACTER_VOICE_MAP: Record<string, { modelId: string; name: string; description: string }> = {
    // ORIGINAL UNIQUE-VOICE CHARACTERS
    'spongebob': { modelId: '54e3a85ac9594ffa83264b8a494b901b', name: 'SpongeBob', description: 'Energetic cartoon character' },
    'trap-a-holics': { modelId: '0b2e96151d67433d93891f15efc25dbd', name: 'DJ Trap-A-Holics', description: 'Hip-hop DJ voice' },
    'nico-awkward': { modelId: '68dbf91dff844e8eab1bb90fcf427582', name: 'Nico Awkward', description: 'Italian with comedic hesitation' },
    'mina-kwon': { modelId: 'a86d9eac550d4814b9b4f6fc53661930', name: 'Mina Kwon', description: 'Korean woman, dramatic' },
    'detective-jun': { modelId: '5c71ab35290241ed842d036e4bb0e5da', name: 'Detective Jun', description: 'Korean noir detective' },
    'hector-alvarez': { modelId: 'b0de63ec40a241abb0ba4b4dc7b222d8', name: 'Hector Alvarez', description: 'Mexican, warm rhythm' },

    // VOICE-FIRST CHARACTERS
    'isabella-reyes': { modelId: '26ff45fab722431c85eea2536e5c5197', name: 'Isabella Reyes', description: 'Poetic Mexican grandmother' },
    'sofia-vega': { modelId: 'f742629937b64075a7e7d21f1bec3c64', name: 'Sofia Vega', description: 'Latin American life coach' },
    'valentino-estrada': { modelId: 'a1fe2e1b6f324e27929d5088f2d09be3', name: 'Valentino Estrada', description: 'Spanish fashion consultant' },
    'bernard-quinn': { modelId: '65c0b8155c464a648161af8877404f11', name: 'Bernard Quinn', description: 'British stoic philosopher' },
    'liam-ashford': { modelId: '30c0f62e3e6d45d88387d1b8f84e1685', name: 'Liam Ashford', description: 'Calm British art curator' },
    'winston-morris': { modelId: '5e79e8f5d2b345f98baa8c83c947532d', name: 'Winston Morris', description: 'Warm British storyteller' },
    'edmund-blackwell': { modelId: 'e5f3047b09ab468da84ca21e3f511680', name: 'Edmund Blackwell', description: 'British history professor' },
    'yumi-nakamura': { modelId: '5161d41404314212af1254556477c17d', name: 'Yumi Nakamura', description: 'Energetic Japanese entertainer' },
    'mana-hayashi': { modelId: 'fbea303b64374bffb8843569404b095e', name: 'Mana Hayashi', description: 'Friendly hobby enthusiast' },
    'fuka-shimizu': { modelId: '46745543e52548238593a3962be77e3a', name: 'Fuka Shimizu', description: 'Japanese lifestyle influencer' },
    'hoshi-kim': { modelId: '561686c0427b4656b34b960b05b33e56', name: 'Hoshi Kim', description: 'K-pop trainee' },
    'taesung-lee': { modelId: '41fbe1068fab4c76aa51c8c16bbad2bd', name: 'Taesung Lee', description: 'Korean storyteller' },
    'jinwoo-park': { modelId: 'a9574d6184714eac96a0a892b719289f', name: 'Jinwoo Park', description: 'Korean drama writer' },
    'adelie-moreau': { modelId: '15799596f2c0443389c90607c7cb5414', name: 'Adelie Moreau', description: 'French language tutor' },
    'camille-beaumont': { modelId: '39ea65c267be4bd6a3ed301520625bb7', name: 'Camille Beaumont', description: 'French fashion stylist' },
    'alex-hype': { modelId: '52e0660e03fe4f9a8d2336f67cab5440', name: 'Alex Hype', description: 'WWE-style hype man' },
};

// Test phrases with different emotional contexts
const TEST_PHRASES: Record<string, { text: string; emotionalContext: string }> = {
    neutral: {
        text: "Hello there! It's nice to meet you. I've been looking forward to our conversation today.",
        emotionalContext: 'neutral'
    },
    excited: {
        text: "Oh my gosh, this is amazing! I can't believe we're finally doing this! This is going to be so much fun!",
        emotionalContext: 'playful'
    },
    thoughtful: {
        text: "Well, that's an interesting question. Let me think about that for a moment. There are several ways to look at this...",
        emotionalContext: 'calm'
    },
    sad: {
        text: "I understand how you feel. Sometimes life throws us challenges that seem overwhelming. But you're not alone in this.",
        emotionalContext: 'sad'
    },
    amused: {
        text: "Ha! That's hilarious! I didn't see that coming at all. You really got me there!",
        emotionalContext: 'amused'
    },
    long_response: {
        text: "Let me tell you a story. It was a warm summer evening when I first realized something important about myself. The sun was setting over the city, casting long shadows across the streets. I was walking home, lost in thought, when suddenly it hit me. Life isn't about waiting for the storm to pass. It's about learning to dance in the rain. And from that day forward, I decided to embrace every moment, good or bad, as part of my journey.",
        emotionalContext: 'wise'
    }
};

const FISH_AUDIO_API_KEY = process.env.FISH_AUDIO_API_KEY;
const FISH_AUDIO_BASE_URL = 'https://api.fish.audio';

/**
 * Naturalize text for TTS (mirrors the route.ts function for testing)
 */
function naturalizeText(text: string, characterType?: string, emotionalContext?: string): string {
    let naturalized = text;

    // Add natural pauses after commas
    naturalized = naturalized.replace(/,\s/g, ', ');

    // Add longer pauses after certain sentence transitions
    naturalized = naturalized.replace(/\.\s+But\s/gi, '. ... But ');
    naturalized = naturalized.replace(/\.\s+Well,?\s/gi, '. ... Well, ');
    naturalized = naturalized.replace(/\.\s+So,?\s/gi, '. ... So, ');

    // SIGHS for emotional context
    if (emotionalContext === 'tired' || emotionalContext === 'frustrated' || emotionalContext === 'sad') {
        naturalized = '... ' + naturalized;
    }

    // LAUGHS for playful context
    if (emotionalContext === 'amused' || emotionalContext === 'playful') {
        naturalized = naturalized.replace(/!\s/g, '! Hah, ');
    }

    return naturalized;
}

/**
 * Test a single voice with Fish Audio API
 */
async function testVoice(seedId: string, info: typeof CHARACTER_VOICE_MAP[string], phrase: typeof TEST_PHRASES[string]): Promise<{
    success: boolean;
    seedId: string;
    name: string;
    audioSize?: number;
    error?: string;
    duration?: number;
}> {
    const startTime = Date.now();

    try {
        const naturalizedText = naturalizeText(phrase.text, undefined, phrase.emotionalContext);

        const response = await fetch(`${FISH_AUDIO_BASE_URL}/v1/tts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: naturalizedText,
                reference_id: info.modelId,
                format: 'mp3',
                chunk_length: 300,
                normalize: true,
                mp3_bitrate: 128,
                latency: 'normal',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                seedId,
                name: info.name,
                error: `HTTP ${response.status}: ${errorText}`,
                duration: Date.now() - startTime
            };
        }

        const audioBuffer = await response.arrayBuffer();

        return {
            success: true,
            seedId,
            name: info.name,
            audioSize: audioBuffer.byteLength,
            duration: Date.now() - startTime
        };
    } catch (error: any) {
        return {
            success: false,
            seedId,
            name: info.name,
            error: error.message,
            duration: Date.now() - startTime
        };
    }
}

/**
 * Main test function
 */
async function runVoiceTests() {
    console.log('🎙️ Fish Audio Voice Testing Script');
    console.log('=====================================\n');

    if (!FISH_AUDIO_API_KEY) {
        console.error('❌ FISH_AUDIO_API_KEY environment variable not set');
        console.log('   Set it with: export FISH_AUDIO_API_KEY=your_key_here');
        process.exit(1);
    }

    const results: Awaited<ReturnType<typeof testVoice>>[] = [];
    const characters = Object.entries(CHARACTER_VOICE_MAP);

    console.log(`Testing ${characters.length} characters with neutral phrase...\n`);

    for (const [seedId, info] of characters) {
        process.stdout.write(`Testing ${info.name}... `);

        const result = await testVoice(seedId, info, TEST_PHRASES.neutral);
        results.push(result);

        if (result.success) {
            console.log(`✅ (${(result.audioSize! / 1024).toFixed(1)}KB, ${result.duration}ms)`);
        } else {
            console.log(`❌ ${result.error}`);
        }

        // Rate limiting - wait 500ms between requests
        await new Promise(r => setTimeout(r, 500));
    }

    // Summary
    console.log('\n=====================================');
    console.log('📊 Test Summary');
    console.log('=====================================');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);

    if (failed.length > 0) {
        console.log('\n🔴 Failed Characters:');
        for (const fail of failed) {
            console.log(`   - ${fail.name} (${fail.seedId}): ${fail.error}`);
        }
    }

    // Average response time
    const avgTime = results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length;
    console.log(`\n⏱️ Average Response Time: ${avgTime.toFixed(0)}ms`);

    // Save results to file
    const outputPath = path.join(__dirname, 'voice-test-results.json');
    fs.writeFileSync(outputPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
            averageResponseTime: avgTime
        },
        results
    }, null, 2));

    console.log(`\n💾 Results saved to: ${outputPath}`);
}

// Run if executed directly
runVoiceTests().catch(console.error);
