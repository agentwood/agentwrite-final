import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pocketTtsClient } from '@/lib/audio/pocketTtsClient';
// import { fishAudioClient } from '@/lib/audio/fishAudioClient'; // Disabled

// Helper to sanitize text
function sanitizeText(text: string): string {
  return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // remove large emojis
    .replace(/[^\x00-\x7F]/g, '') // remove non-ascii
    .trim();
}

/**
 * TTS API - Pocket TTS Primary
 * 
 * Primary: Pocket TTS (CPU-based, zero-shot voice cloning on DigitalOcean)
 * Fallback: Fish Audio (when Pocket TTS unavailable)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, personaId, characterId } = body;

    // Support either parameter name
    const targetCharId = personaId || characterId;

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    if (!targetCharId) {
      return NextResponse.json({ error: 'Missing characterId or personaId' }, { status: 400 });
    }

    // 1. Load Character with VoiceSeed
    const character = await db.personaTemplate.findUnique({
      where: { id: targetCharId },
      include: {
        voiceSeed: {
          select: {
            id: true,
            name: true,
            filePath: true,
            description: true,
          }
        }
      }
    });

    if (!character) {
      console.error(`[TTS] ❌ Character not found: ${targetCharId}`);
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    let voiceSeed = character.voiceSeed;

    // FALLBACK: If relation is missing, try to find VoiceSeed by string name
    if (!voiceSeed && character.voiceName) {
      console.log(`[TTS] ⚠️ Relation missing. Looking up VoiceSeed by name: "${character.voiceName}"`);
      const seedByName = await db.voiceSeed.findUnique({
        where: { name: character.voiceName }
      });
      if (seedByName) {
        voiceSeed = seedByName;
      }
    }

    if (!voiceSeed) {
      console.error(`[TTS] ❌ No VoiceSeed found for: ${character.name} (voiceName: ${character.voiceName})`);
      return NextResponse.json({ error: 'No voice configured for this character' }, { status: 500 });
    }
    console.log(`[TTS] Request for "${character.name}" using voice: ${voiceSeed.name}`);

    // 2. Sanitize text
    const cleanedText = sanitizeText(text);
    if (!cleanedText) {
      return NextResponse.json({ error: 'No valid text after sanitization' }, { status: 400 });
    }

    let lastError: string | null = null;
    let audioResult = null;

    // ============================================
    // PRIMARY: Pocket TTS (CPU-based, DigitalOcean)
    // ============================================
    // ============================================
    // PRIMARY: Pocket TTS (CPU-based, DigitalOcean)
    // ============================================
    // Note: We skip checkHealth() to avoid double-latency. 
    // The synthesize() method handles failover to backup servers internally.

    console.log(`[TTS] 🎯 Routing: Pocket TTS - Voice: ${voiceSeed.name}`);

    try {
      const result = await pocketTtsClient.synthesize(cleanedText, {
        voicePath: voiceSeed.filePath,
        speed: 1.0,
      });

      if (result) {
        audioResult = {
          audio: result.audio.toString('base64'),
          format: result.format,
          sampleRate: result.sampleRate,
          engine: 'pocket-tts',
          voiceUsed: voiceSeed.name,
        };
      } else {
        // Should happen if synthesize returns null (which it shouldn't really, it throws)
        lastError = 'Pocket TTS returned no audio.';
      }
    } catch (pocketError: any) {
      console.error(`[TTS] ❌ Pocket TTS Failed (All Servers):`, pocketError.message);
      lastError = `Pocket TTS: ${pocketError.message}`;
    }

    // ============================================
    // FALLBACK: Fish Audio (REMOVED)
    // ============================================
    // User requested to remove Fish Audio dependency.
    // Pocket TTS is now the single source of truth with internal retries.


    // ============================================
    // SUCCESS
    // ============================================
    if (audioResult) {
      // LOG USAGE FOR REWARDS (Fire and forget)
      // Check if this character is using a contributed voice
      const { logVoiceUsageEvent, getContributedVoiceForCharacter } = await import('@/lib/voice/usageLogger');
      // const { getUserIdFromRequest } = await import('@/lib/auth'); // Removed: Invalid and unused

      const contributedVoiceId = await getContributedVoiceForCharacter(character.id);

      if (contributedVoiceId) {
        logVoiceUsageEvent({
          voiceContributionId: contributedVoiceId,
          characterId: character.id,
          userId: request.headers.get('x-user-id') || 'anonymous',
          durationSeconds: audioResult.audio.length / 1000, // Roughly estimate or use actual duration if available
          textLength: text.length,
        });
      }

      return NextResponse.json(audioResult);
    }

    // ============================================
    // ALL ENGINES FAILED
    // ============================================
    return NextResponse.json({
      error: 'Voice Generation Failed.',
      details: lastError || 'All TTS engines unavailable.',
      debug: {
        character: character.name,
        voiceSeed: voiceSeed.name,
        pocketTtsConfigured: pocketTtsClient.checkConfigured(),
        // fishConfigured: fishAudioClient.isConfigured(), // Disabled
      }
    }, { status: 503 });

  } catch (error: any) {
    console.error('[TTS] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
