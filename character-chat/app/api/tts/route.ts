import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runpodF5Client } from '@/lib/audio/runpodF5Client';
import { TTSRouter } from '@/lib/audio/ttsRouter';

// Helper to sanitize text
function sanitizeText(text: string): string {
  return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // remove large emojis
    .replace(/[^\x00-\x7F]/g, '') // remove non-ascii
    .trim();
}

/**
 * TREE-0 VOICE CLUSTER PIPELINE
 * 
 * F5-TTS only - ensures all 29 characters maintain unique voices
 * via zero-shot cloning from reference audio.
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
      select: {
        id: true,
        name: true,
        featured: true,
        voiceSeedId: true,
        styleHint: true,
        voiceSpeed: true,
        voiceSeed: {
          select: {
            id: true,
            name: true,
            filePath: true,
            description: true,
            tone: true,
            energy: true,
            accent: true,
            referenceText: true,
          }
        }
      }
    });

    if (!character) {
      console.error(`[TTS] ❌ Character not found: ${targetCharId}`);
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    // 2. Validate VoiceSeed exists
    if (!character.voiceSeed) {
      console.error(`[TTS] ❌ No VoiceSeed linked to character: ${character.name} (${targetCharId})`);
      return NextResponse.json({
        error: 'Voice Pool Violation: Character has no linked voice seed.',
        details: `Character "${character.name}" must be assigned a voice from the Elite Voice Pool.`
      }, { status: 500 });
    }

    const voiceSeed = character.voiceSeed;
    console.log(`[TTS] Request for "${character.name}" using voice seed: ${voiceSeed.name}`);

    // 3. Input Cleaning
    const cleanedText = sanitizeText(text);

    if (!cleanedText) {
      return NextResponse.json({ error: 'No valid text after sanitization' }, { status: 400 });
    }

    // --- TREE-0 CLUSTER ROUTING ---
    // Currently F5-TTS only for unique voice cloning
    const decision = await TTSRouter.decide(character, {});
    console.log(`[TTS] Router Decision: ${decision.engine} (${decision.reason})`);

    // F5-TTS: Server-side synthesis
    // 4. Load Reference Audio from VoiceSeed
    let refAudioBase64: string | null = null;
    try {
      refAudioBase64 = await runpodF5Client.loadReferenceAudio(voiceSeed.filePath);
      if (refAudioBase64) {
        console.log(`[TTS] ✅ Loaded reference audio: ${voiceSeed.filePath}`);
      } else {
        console.error(`[TTS] ❌ Failed to load reference audio: ${voiceSeed.filePath}`);
      }
    } catch (e) {
      console.error(`[TTS] ❌ Error loading reference audio:`, e);
    }

    if (!refAudioBase64) {
      return NextResponse.json({
        error: 'Voice Generation Failed. Reference audio not accessible.',
        details: `Could not load reference file: ${voiceSeed.filePath}`
      }, { status: 500 });
    }

    // 5. Build Voice Description from seed metadata and persona traits
    const baseDescription = voiceSeed.description || `${voiceSeed.tone} ${voiceSeed.energy} voice`;
    const stylePrompt = character.styleHint ? `, ${character.styleHint}` : '';
    const voiceDescription = `${baseDescription}${stylePrompt}. Clear, high-quality audio. Natural pauses and intonation.`;

    // 5b. Calculate Speed based on Energy if not explicitly set
    let dynamicSpeed = character.voiceSpeed || 1.0;
    if (!character.voiceSpeed && voiceSeed.energy) {
      if (voiceSeed.energy.toLowerCase().includes('fast') || voiceSeed.energy.toLowerCase().includes('excited')) dynamicSpeed = 1.05;
      if (voiceSeed.energy.toLowerCase().includes('slow') || voiceSeed.energy.toLowerCase().includes('calm')) dynamicSpeed = 0.95;
    }

    // 6. Execute F5-TTS Synthesis
    try {
      const result = await runpodF5Client.synthesize(cleanedText, {
        voice_description: voiceDescription,
        ref_audio: refAudioBase64,
        ref_text: voiceSeed.referenceText || undefined,
        speed: dynamicSpeed,
        voice_name: voiceSeed.name,
      });

      if (!result) {
        throw new Error('F5-TTS Client returned null response.');
      }

      console.log(`[TTS] ✅ Generated ${result.audio.length} bytes for "${character.name}"`);

      return NextResponse.json({
        audio: result.audio.toString('base64'),
        format: 'wav',
        sampleRate: 24000,
        engine: 'f5-tts',
        voiceUsed: voiceSeed.name,
      });

    } catch (synthError: any) {
      console.error(`[TTS] ❌ Synthesis Failed:`, synthError);
      return NextResponse.json({
        error: 'Voice Generation Failed.',
        details: synthError.message,
        debug: {
          character: character.name,
          voiceSeed: voiceSeed.name,
          filePath: voiceSeed.filePath,
          backend: 'F5-TTS'
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[TTS] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
