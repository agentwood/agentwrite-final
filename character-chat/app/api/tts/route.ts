import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runpodF5Client } from '@/lib/audio/runpodF5Client';

// Helper to sanitize text
function sanitizeText(text: string): string {
  return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '') // remove large emojis
    .replace(/[^\x00-\x7F]/g, '') // remove non-ascii
    .trim();
}

/**
 * ELITE VOICE POOL PIPELINE (v5)
 * 
 * 1. Resolve VoiceSeed from Character (via voiceSeedId)
 * 2. Load Reference Audio from VoiceSeed.filePath
 * 3. Execute F5-TTS with strict reference
 * 4. No Fallback - Hard fail if voice missing
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
        voiceSeedId: true,
        voiceSeed: {
          select: {
            id: true,
            name: true,
            filePath: true,
            description: true,
            tone: true,
            energy: true,
            accent: true,
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
    // Combine seed metadata (tone, energy) with persona specific styleHint
    const baseDescription = voiceSeed.description || `${voiceSeed.tone} ${voiceSeed.energy} voice`;
    const stylePrompt = character.styleHint ? `, ${character.styleHint}` : '';
    const voiceDescription = `${baseDescription}${stylePrompt}. Clear, high-quality audio. Natural pauses and intonation.`;

    // 5b. Calculate Speed based on Energy if not explicitly set
    let dynamicSpeed = character.voiceSpeed || 1.0;
    if (!character.voiceSpeed && voiceSeed.energy) {
      // adjust speed slightly based on energy tag
      if (voiceSeed.energy.toLowerCase().includes('fast') || voiceSeed.energy.toLowerCase().includes('excited')) dynamicSpeed = 1.05;
      if (voiceSeed.energy.toLowerCase().includes('slow') || voiceSeed.energy.toLowerCase().includes('calm')) dynamicSpeed = 0.95;
    }

    // 6. Execute F5-TTS Synthesis
    try {
      const result = await runpodF5Client.synthesize(cleanedText, {
        voice_description: voiceDescription,
        ref_audio: refAudioBase64,
        ref_text: voiceSeed.referenceText || undefined, // Use stored transcript to prevent robotic output
        speed: dynamicSpeed,
        voice_name: voiceSeed.name, // Pass voice name specifically for Pod uploading
      });

      if (!result) {
        throw new Error('F5-TTS Client returned null response.');
      }

      console.log(`[TTS] ✅ Generated ${result.audio.length} bytes for "${character.name}"`);

      console.log(`[TTS] ✅ Generated ${result.audio.length} bytes for "${character.name}"`);

      // Return JSON with Base64 Audio (Client expects JSON)
      return NextResponse.json({
        audio: result.audio.toString('base64'),
        format: 'wav',
        sampleRate: 24000,
        voiceUsed: voiceSeed.name,
      });

    } catch (synthError: any) {
      console.error(`[TTS] ❌ Synthesis Failed:`, synthError);
      return NextResponse.json({
        error: 'Voice Generation Failed. No fallback permitted.',
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

