import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/geminiClient';
import { Modality } from '@google/genai';
import { getRealisticVoice, REALISTIC_VOICES, VOICE_MIGRATION_MAP } from '@/lib/audio/voiceConfig';
import { getAdvancedVoiceConfig } from '@/lib/audio/advancedVoiceConfig';
import { getOptimalVoice, trackVoicePerformance } from '@/lib/ml/voiceOptimizer';
import { getOptimalParameters } from '@/lib/ml/parameterOptimizer';
// Removed enhanceAudio import - skipping post-processing for faster, cleaner audio
import { getSubscriptionStatus, getPlanLimits } from '@/lib/subscription';
import { db } from '@/lib/db';
import { openVoiceClient } from '@/lib/audio/openVoiceClient';
import { getReferenceAudio, generateBaseVoice } from '@/lib/audio/baseVoiceGenerator';
import { mapToOpenVoiceOptions, mapPitchToSpeed } from '@/lib/audio/openVoiceParameterMapper';
import { elevenLabsClient } from '@/lib/audio/elevenLabsClient';
import { generateSpeechXTTS, isXTTSServerAvailable, getVoiceSamplePath } from '@/lib/audio/xttsClient';
import { generateTTSCacheHash, getCachedTTS, cacheTTS } from '@/lib/audio/ttsCache';

// Valid Gemini TTS voices - defined once at module level for voice locking
const VALID_VOICES = ['achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe',
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir',
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck',
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar',
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];

// CHARACTER_ACCENT_MAP: Maps character seedIds to their accent profile for Gemini TTS
// This ensures consistent regional accents throughout dialogue
const CHARACTER_ACCENT_MAP: Record<string, string> = {
  // Japanese characters
  'yuki-tanaka': 'Japanese woman from Osaka, bright Kansai energy, lively pitch, playful',
  'kenji-tanaka': 'Japanese man from Osaka, upbeat, crisp Japanese English',
  'sunny-sato': 'Japanese-American woman from LA, upbeat California English with Japanese clarity',
  // Korean characters
  'mina-kwon': 'Korean woman from Seoul, clean diction, dramatic, quick switches from calm to theatrical',
  // Italian characters
  'nico-awkward': 'Italian man from Milan, expressive Italian rhythm, occasional comedic hesitation',
  // French characters
  'camille-laurent': 'French woman from Lyon, soft French accent, rounded vowels, intimate cadence',
  // African characters
  'asha-mbeki': 'Kenyan woman from Nairobi, clear confident Kenyan English, crisp diction',
  // British/Irish characters
  'big-tom': 'British man from Liverpool, Scouse accent, quick consonants, cheeky',
  'owen-mckenna': 'Irish man from Galway, Irish lilt, musical, soothing',
  'imani-shah': 'British-Indian woman from London, RP-lite accent, crisp T sounds',
  // Eastern European characters
  'viktor': 'Russian man, Eastern European English, formal, precise',
  'tomasz': 'Polish man, Eastern European English, steady pace',
  'dr-elena-petrov': 'Bulgarian woman from Sofia, crisp Eastern European consonants',
  // Scandinavian characters
  'soren-nielsen': 'Danish man from Copenhagen, Scandinavian English, even pacing, understated',
  // Middle Eastern characters
  'dr-nadia': 'Lebanese woman, warm Lebanese English, expressive but steady',
  // Latin American characters
  'hector-alvarez': 'Mexican man from Guadalajara, warm Mexican Spanish English, musical rhythm',
  // Indian characters
  'rajiv': 'Indian-American man from New Jersey, Jersey base with Gujarati vowel color',
  'raj-corner-store': 'Indian-American man from New Jersey, Jersey base with Gujarati vowel color, fast friendly rhythm',
  'priya-nair': 'Indian woman from Kochi, gentle Indian English, calm retroflex sounds',
};

/**
 * Clean text for TTS by removing roleplay markers, stage directions, and actions
 * This ensures the TTS only speaks the dialogue, not the action descriptions
 */
function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // Remove asterisk-wrapped expressions: *smiles*, *laughs nervously*, *adjusts fedora*
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');

  // Remove parenthetical expressions: (sighs), (whispers), (pauses thoughtfully)
  cleaned = cleaned.replace(/\([^)]+\)/g, '');

  // Remove bracket-wrapped expressions: [laughs], [smiling], [in a whisper]
  cleaned = cleaned.replace(/\[[^\]]+\]/g, '');

  // Remove common roleplay stage directions that might slip through
  cleaned = cleaned.replace(/~[^~]+~/g, ''); // ~tildes~

  // Clean up multiple spaces left by removals
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Clean up leading/trailing whitespace
  cleaned = cleaned.trim();

  // If everything was stripped (rare), return a fallback
  if (!cleaned || cleaned.length < 2) {
    return 'Hmm.';
  }

  return cleaned;
}

/**
 * Naturalize text for TTS by adding subtle pauses, speech patterns, and paralinguistic features
 * This makes the voice sound more human-like and less robotic
 * Supports: pauses, sighs, laughs, breathing, hesitations, emotional expressions
 */
function naturalizeText(text: string, characterType?: string, emotionalContext?: string): string {
  let naturalized = text;

  // Add natural pauses after commas (ellipsis creates brief pause in TTS)
  naturalized = naturalized.replace(/,\s/g, ', ');

  // Add longer pauses after certain sentence transitions
  naturalized = naturalized.replace(/\.\s+But\s/gi, '. ... But ');
  naturalized = naturalized.replace(/\.\s+Well,?\s/gi, '. ... Well, ');
  naturalized = naturalized.replace(/\.\s+So,?\s/gi, '. ... So, ');
  naturalized = naturalized.replace(/\.\s+And\s/gi, '. ... And ');

  // Add thinking pauses before questions
  naturalized = naturalized.replace(/\.\s+What\s/gi, '. ... What ');
  naturalized = naturalized.replace(/\.\s+How\s/gi, '. ... How ');
  naturalized = naturalized.replace(/\.\s+Why\s/gi, '. ... Why ');

  // SIGHS: Add natural sighs for emotional context
  // Pattern: sentences starting with worry/frustration words
  if (emotionalContext === 'tired' || emotionalContext === 'frustrated' || emotionalContext === 'sad') {
    if (Math.random() < 0.3) {
      naturalized = '... ' + naturalized; // Breath before speaking
    }
  }

  // LAUGHS: Add chuckles for playful/amused context
  if (emotionalContext === 'amused' || emotionalContext === 'playful') {
    // Add light chuckle markers that TTS engines can interpret
    naturalized = naturalized.replace(/!\s/g, '! Hah, ');
    if (Math.random() < 0.25 && naturalized.includes('?')) {
      naturalized = naturalized.replace('?', '? Heh,');
    }
  }

  // BREATHING: Add natural breath pauses for long sentences
  const sentences = naturalized.split(/(?<=[.!?])\s+/);
  if (sentences.length > 3) {
    // Insert a breath pause after the second sentence (15% chance)
    if (Math.random() < 0.15) {
      sentences.splice(2, 0, '...');
      naturalized = sentences.join(' ');
    }
  }

  // HESITATIONS: Occasional hesitation sounds (sparse to not overdo it)
  // Only add if text is long enough and doesn't already have them
  if (naturalized.length > 100 && !naturalized.includes('um') && !naturalized.includes('hmm')) {
    // Add a single filler at natural break points (20% chance)
    if (Math.random() < 0.2) {
      const fillers = ['Hmm, ', 'Well, ', 'You know, ', 'I mean, ', ''];
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      if (filler) {
        // Insert at first sentence break after 30 chars
        const insertPoint = naturalized.indexOf('. ', 30);
        if (insertPoint > 0) {
          naturalized = naturalized.slice(0, insertPoint + 2) + filler + naturalized.slice(insertPoint + 2);
        }
      }
    }
  }

  // Character-specific speech patterns
  if (characterType) {
    switch (characterType) {
      case 'elderly':
      case 'wise':
        // Slower pacing with more pauses
        naturalized = naturalized.replace(/\. /g, '. ... ');
        break;
      case 'energetic':
      case 'excited':
        // Faster pacing, fewer pauses
        naturalized = naturalized.replace(/\.\.\./g, '');
        break;
      case 'nervous':
      case 'shy':
        // Add more hesitations
        if (Math.random() < 0.3) {
          naturalized = 'Um... ' + naturalized;
        }
        break;
      case 'confident':
      case 'authoritative':
        // Clean, direct speech with purposeful pauses
        naturalized = naturalized.replace(/\.\s/g, '. ');
        break;
    }
  }

  return naturalized;
}

export async function POST(request: NextRequest) {
  // Declare userId outside try-catch for proper scoping
  let userId: string | null = null;

  try {
    const {
      text,
      voiceName,
      styleHint,
      personaId,
      archetype,
      conversationId,
      messageCount,
      characterName,
      category,
      tagline,
      description,
    } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'text is required' },
        { status: 400 }
      );
    }

    userId = request.headers.get('x-user-id') || null;

    // CRITICAL: Clean text BEFORE any TTS processing
    // This removes roleplay markers like *smiles*, (laughs), [whispers] so TTS speaks only dialogue
    let cleanedText = cleanTextForTTS(text);

    // Apply naturalization to make speech more human-like with pauses
    cleanedText = naturalizeText(cleanedText);
    console.log(`[TTS] Text processed: "${text.substring(0, 50)}..." -> "${cleanedText.substring(0, 50)}..."`);


    // HARD LOCK: Query database DIRECTLY for voiceName, styleHint, speed, pitch, AND seedId
    // This ensures we ALWAYS use the exact values from the database, never fallbacks or optimization
    let lockedVoiceName: string | null = null;
    let lockedStyleHint: string | null = null;
    let lockedSpeed: number | null = null;
    let lockedPitch: number | null = null;
    let seedId: string | null = null; // For accent mapping

    if (personaId) {
      const persona = await db.personaTemplate.findUnique({
        where: { id: personaId },
        select: { seedId: true, voiceName: true, styleHint: true, voiceSpeed: true, voicePitch: true },
      });

      if (persona) {
        seedId = persona.seedId; // Store seedId for accent mapping
        lockedVoiceName = persona.voiceName;
        lockedStyleHint = persona.styleHint;
        lockedSpeed = persona.voiceSpeed;
        lockedPitch = persona.voicePitch;

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:45', message: 'HARD LOCK - Queried DB directly', data: { personaId, seedId, lockedVoiceName, lockedStyleHint, lockedSpeed, lockedPitch }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
        // #endregion
      }
    }

    // Check quota
    const subscriptionStatus = await getSubscriptionStatus(userId);
    const limits = getPlanLimits(subscriptionStatus.planId);

    if (limits.ttsSecondsPerDay > 0) {
      // Estimate seconds needed (rough estimate: ~150 words per minute)
      const estimatedSeconds = Math.ceil((text.split(' ').length / 150) * 60);

      // Check daily TTS usage for free users
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get TTS usage from UserQuota (if exists) or estimate from messages
      const quota = userId ? await db.userQuota.findFirst({
        where: {
          userId: userId,
          lastResetDate: {
            gte: today,
          },
        },
      }) : null;

      const usedSeconds = quota?.ttsSecondsToday || 0;

      if (usedSeconds + estimatedSeconds > limits.ttsSecondsPerDay) {
        // When quota is exceeded, show usage as at least the limit (or actual usage if higher)
        const displayUsage = Math.max(usedSeconds, limits.ttsSecondsPerDay);

        return NextResponse.json(
          {
            error: 'Daily TTS limit reached',
            reason: limits.ttsSecondsPerDay > 0
              ? `You've reached your daily TTS limit of ${limits.ttsSecondsPerDay} seconds. Upgrade to unlock unlimited TTS.`
              : 'Your daily TTS quota has been reached. Upgrade to unlock unlimited TTS.',
            quotaExceeded: true,
            upgradeUrl: '/pricing',
            currentUsage: displayUsage,
            limit: limits.ttsSecondsPerDay,
          },
          { status: 429 }
        );
      }
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:82', message: 'TTS route entry - VOICE DEBUG', data: { voiceNameReceived: voiceName, lockedVoiceName, lockedStyleHint, characterName, personaId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // 1. HARD LOCK: Use ONLY database values, NO fallbacks
    // If we have a locked voice from DB, use it. Otherwise use provided voiceName as last resort.
    let baseVoiceName = (lockedVoiceName || voiceName || 'kore').toLowerCase();

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:90', message: 'HARD VOICE LOCK - Using DB voiceName', data: { baseVoiceName, lockedVoiceName, requestVoiceName: voiceName, personaId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:78', message: 'After initial voiceName processing - VOICE DEBUG', data: { baseVoiceName, originalVoiceName: voiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // Validate voice name
    if (!VALID_VOICES.includes(baseVoiceName)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:87', message: 'Invalid voiceName, defaulting to kore - VOICE DEBUG', data: { baseVoiceName, validVoices: VALID_VOICES }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      baseVoiceName = 'kore';
    }

    // 2. Get advanced config for speed/pitch/diction ONLY (keep voiceName HARD-CODED)
    // CRITICAL: voiceName is ALWAYS from database, NEVER recalculated or overridden
    // CRITICAL: styleHint is ALWAYS from database (if provided), NEVER recalculated - this locks accents
    let voiceConfig: any;
    if (characterName && archetype && category) {
      const advancedConfig = getAdvancedVoiceConfig(
        characterName,
        archetype,
        category,
        tagline,
        description
      );

      // ENHANCED: Use heritage and accent in style hint for Gemini
      // This ensures Accurate regional accents even when OpenVoice falls back to Gemini
      const enhancedStyleHint = [
        seedId ? CHARACTER_ACCENT_MAP[seedId] : null, // Primary: Use comprehensive accent map
        lockedStyleHint,
        description?.match(/accent:\s*([^;]+)/i)?.[1],
        description?.match(/heritage:\s*([^;]+)/i)?.[1]
      ].filter(Boolean).join(', ');
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:93', message: 'Advanced config retrieved - VOICE DEBUG', data: { advancedConfigVoiceName: advancedConfig.voiceName, baseVoiceName, willUse: baseVoiceName, enhancedStyleHint, styleHintFromDB: lockedStyleHint }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      // HARD-CODE: Use stored voiceName from database, NEVER override
      // HARD LOCK: Use ONLY database styleHint + accent info, NO fallbacks to advanced config
      // Only use advanced config for speed/pitch/diction parameters
      voiceConfig = {
        voiceName: baseVoiceName,
        speed: advancedConfig.speed,
        pitch: advancedConfig.pitch,
        styleHint: enhancedStyleHint || null, // ENHANCED with accent/heritage
        diction: advancedConfig.diction,
        emphasis: advancedConfig.emphasis,
      };
    } else {
      // Fallback: use stored voice with default parameters
      voiceConfig = {
        voiceName: baseVoiceName, // HARD-CODED: Always from database
        speed: 1.0, // Default speed (not 1.25)
        pitch: 1.0,
        styleHint: (seedId ? CHARACTER_ACCENT_MAP[seedId] : null) || lockedStyleHint || null, // Use accent map or DB styleHint
        diction: 'normal' as const,
        emphasis: 'medium' as const,
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:125', message: 'Voice config with locked styleHint - ACCENT DEBUG', data: { finalStyleHint: voiceConfig.styleHint, styleHintFromDB: styleHint, voiceName: baseVoiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
    // #endregion

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:120', message: 'Final voiceConfig - VOICE DEBUG', data: { finalVoiceName: voiceConfig.voiceName, baseVoiceName, originalVoiceName: voiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // 3. LOCKED PARAMETERS - Use ONLY database values, NO optimization or ML learning
    // Speed and pitch are LOCKED to database values for consistency
    // If not in database, use consistent defaults (1.0 for both) - these should be set in DB
    let params = {
      speed: lockedSpeed !== null ? lockedSpeed : 1.0, // Consistent default - NOT from voiceConfig
      pitch: lockedPitch !== null ? lockedPitch : 1.0, // Consistent default - NOT from voiceConfig
    };

    // Clamp to reasonable ranges
    params.speed = Math.max(0.8, Math.min(1.5, params.speed));
    params.pitch = Math.max(0.5, Math.min(2.0, params.pitch));

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:184', message: 'LOCKED params - no optimization', data: { speed: params.speed, pitch: params.pitch, lockedSpeed, lockedPitch }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'I' }) }).catch(() => { });
    // #endregion

    // CRITICAL: FINAL VOICE LOCK - Use ONLY the stored voiceName from database
    // This is the ABSOLUTE FINAL voice that will be used - no more changes allowed
    // ALWAYS use lockedVoiceName from database query (line 59), never fallbacks
    let finalVoiceName: string;

    if (lockedVoiceName) {
      // Use the voice from database (HARD LOCK)
      finalVoiceName = lockedVoiceName.toLowerCase();
    } else if (baseVoiceName) {
      // Fallback to baseVoiceName only if database query failed
      finalVoiceName = baseVoiceName.toLowerCase();
    } else {
      // Last resort fallback
      finalVoiceName = 'kore';
    }

    // Validate final voice one more time
    if (!VALID_VOICES.includes(finalVoiceName)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:163', message: 'Invalid final voice, using kore fallback - VOICE DEBUG', data: { finalVoiceName, validVoices: VALID_VOICES, lockedVoiceName, baseVoiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion
      finalVoiceName = 'kore'; // Fallback only if invalid
    }

    // Log final voice for debugging voice consistency issues
    if (personaId) {
      console.log(`[TTS] Voice locked for persona ${personaId}: ${finalVoiceName} (from DB: ${lockedVoiceName || 'N/A'})`);
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:168', message: 'FINAL VOICE LOCK - VOICE DEBUG', data: { textLength: text.length, finalVoiceName, personaId, originalVoiceName: voiceName, baseVoiceName, voiceConfigVoiceName: voiceConfig.voiceName, styleHint: voiceConfig.styleHint, usingBaseVoice: true, isValid: VALID_VOICES.includes(finalVoiceName) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // HYBRID TTS STRATEGY:
    // Fish Speech: Great for American voices with EMOTION
    // Gemini: Better for ACCENTS (Kenyan, Scottish, Russian, Polish, etc.)
    const USE_FISH_SPEECH = process.env.FISH_SPEECH_API_KEY && process.env.USE_FISH_SPEECH !== 'false';

    //Characters that use Fish Speech - now expanded to ALL characters
    // Each character gets a unique voice matched to their profile
    const FISH_SPEECH_CHARACTERS = [
      // Original featured
      'marjorie', 'rajiv', 'dex', 'aaliyah', 'asha', 'eamon', 'viktor', 'tomasz',
      // Recommend category
      'marge-halloway', 'raj-corner-store', 'camille-laurent', 'coach-boone', 'yumi-nakamura',
      // Play & Fun
      'spongebob', 'dj-trap-a-holics', 'nico-awkward', 'mina-kwon', 'detective-jun',
      // Helpers
      'dr-elena-vasquez', 'chef-antonio-rossi', 'professor-okafor', 'maya-patel', 'sarah-wheeler',
      // Anime & Game
      'mikasa-storm', 'levi-steel-wind', 'hinata-moonlight', 'ryuk-deceiver', 'erza-titania',
      // Icons/Fiction
      'grandpa-joe', 'chippy-squirrel', 'captain-bucky', 'luna-stargazer', 'grill-master-bob',
      // Additional characters
      'isabella-reyes', 'sofia-vega', 'valentino-estrada', 'bernard-quinn', 'liam-ashford',
      'winston-grandpa-morris', 'professor-edmund-blackwell', 'hoshi-kim', 'taesung-story-lee',
      'jin-woo-park', 'adelie-moreau', 'camille-beaumont', 'alex-hype-martinez', 'marcus-chen',
      'zara-okonkwo', 'rei-tanaka', 'dj-kira-brooks', 'mana-hayashi', 'fuka-shimizu'
    ];

    // COMPREHENSIVE Voice mapping: character seedId -> Fish Speech voice ID
    // Voice IDs from Fish Audio discovery, matched by character profile
    const FISH_VOICE_MAP: Record<string, string> = {
      // === ELDERLY FEMALE VOICES (ALLE - 59e9dc1cb20c452584788a2690c80970) ===
      'marjorie': '59e9dc1cb20c452584788a2690c80970', // 75yo Salty Karen
      'marge-halloway': '59e9dc1cb20c452584788a2690c80970', // 75yo HOA enforcer

      // === ENERGETIC MALE VOICES (802e3bc2b27e49c2995d23ef70e6ac89) ===
      'rajiv': '802e3bc2b27e49c2995d23ef70e6ac89', // 42yo friendly shop owner
      'raj-corner-store': '802e3bc2b27e49c2995d23ef70e6ac89', // same character type
      'dex': '802e3bc2b27e49c2995d23ef70e6ac89', // 33yo Bronx tough guy
      'dj-trap-a-holics': '802e3bc2b27e49c2995d23ef70e6ac89', // DJ, high energy
      'alex-hype-martinez': '802e3bc2b27e49c2995d23ef70e6ac89', // Hype man
      'eamon': '802e3bc2b27e49c2995d23ef70e6ac89', // Gamer, energetic

      // === CONFIDENT FEMALE VOICES ===
      'aaliyah': '59e9dc1cb20c452584788a2690c80970', // 28yo Atlanta confident
      'asha': '59e9dc1cb20c452584788a2690c80970', // 26yo Kenyan brave
      'zara-okonkwo': '59e9dc1cb20c452584788a2690c80970', // Nigerian female
      'maya-patel': '59e9dc1cb20c452584788a2690c80970', // Indian-American
      'dj-kira-brooks': '59e9dc1cb20c452584788a2690c80970', // DJ female

      // === WISE ELDERLY MALE (Old Wizard - 0e73b5c5ff5740cd8d85571454ef28ae) ===
      'grandpa-joe': '0e73b5c5ff5740cd8d85571454ef28ae', // 82yo gentle grandpa
      'professor-okafor': '0e73b5c5ff5740cd8d85571454ef28ae', // 62yo Nigerian professor
      'professor-edmund-blackwell': '0e73b5c5ff5740cd8d85571454ef28ae', // British professor
      'winston-grandpa-morris': '0e73b5c5ff5740cd8d85571454ef28ae', // Elderly grandpa

      // === HISTORIAN/ARTICULATE (Sleepless Historian - beb44e5fac1e4b33a15dfcdcc2a9421d) ===
      'yumi-nakamura': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Japanese-American
      'detective-jun': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Korean detective
      'marcus-chen': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Chinese-American
      'bernard-quinn': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Welsh thoughtful

      // === SOFT FEMALE VOICES ===
      'camille-laurent': '59e9dc1cb20c452584788a2690c80970', // French perfumer
      'camille-beaumont': '59e9dc1cb20c452584788a2690c80970', // French tutor
      'adelie-moreau': '59e9dc1cb20c452584788a2690c80970', // French female
      'hinata-moonlight': '59e9dc1cb20c452584788a2690c80970', // Shy anime girl
      'mana-hayashi': '59e9dc1cb20c452584788a2690c80970', // Japanese gentle

      // === COMMANDING MALE VOICES ===
      'coach-boone': '802e3bc2b27e49c2995d23ef70e6ac89', // Ex-Marine Texas
      'levi-steel-wind': '802e3bc2b27e49c2995d23ef70e6ac89', // Cold captain
      'viktor': '802e3bc2b27e49c2995d23ef70e6ac89', // Stern Eastern European
      'tomasz': '802e3bc2b27e49c2995d23ef70e6ac89', // Polish brave

      // === PROFESSIONAL FEMALE VOICES ===
      'dr-elena-vasquez': '59e9dc1cb20c452584788a2690c80970', // 45yo psychiatrist
      'sarah-wheeler': '59e9dc1cb20c452584788a2690c80970', // Tech mentor
      'mikasa-storm': '59e9dc1cb20c452584788a2690c80970', // Warrior female
      'erza-titania': '59e9dc1cb20c452584788a2690c80970', // Strong female

      // === WARM MALE VOICES ===
      'chef-antonio-rossi': '802e3bc2b27e49c2995d23ef70e6ac89', // Italian chef
      'valentino-estrada': '802e3bc2b27e49c2995d23ef70e6ac89', // Spanish romantic
      'liam-ashford': '802e3bc2b27e49c2995d23ef70e6ac89', // British charming

      // === YOUNG ENERGETIC FEMALE ===
      'mina-kwon': '59e9dc1cb20c452584788a2690c80970', // K-drama writer
      'hoshi-kim': '59e9dc1cb20c452584788a2690c80970', // K-pop energetic
      'fuka-shimizu': '59e9dc1cb20c452584788a2690c80970', // Japanese bubbly
      'luna-stargazer': '59e9dc1cb20c452584788a2690c80970', // Dreamy female

      // === QUIRKY/UNIQUE VOICES ===
      'nico-awkward': '802e3bc2b27e49c2995d23ef70e6ac89', // Shy hesitant male
      'spongebob': '802e3bc2b27e49c2995d23ef70e6ac89', // Cheerful cartoon
      'chippy-squirrel': '802e3bc2b27e49c2995d23ef70e6ac89', // Chipmunk energy
      'ryuk-deceiver': '0e73b5c5ff5740cd8d85571454ef28ae', // Dark mysterious
      'grill-master-bob': '802e3bc2b27e49c2995d23ef70e6ac89', // BBQ dad
      'captain-bucky': '802e3bc2b27e49c2995d23ef70e6ac89', // Pirate adventurer

      // === ASIAN MALE VOICES ===
      'rei-tanaka': '802e3bc2b27e49c2995d23ef70e6ac89', // Japanese game dev
      'taesung-story-lee': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Korean storyteller
      'jin-woo-park': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Korean detailed

      // === LATINA FEMALE VOICES ===
      'isabella-reyes': '59e9dc1cb20c452584788a2690c80970', // Mexican warm
      'sofia-vega': '59e9dc1cb20c452584788a2690c80970', // Spanish passionate

      // === NEW HELPER CHARACTERS (Talkie-style) ===
      // Tutors & Learning
      'language-learning-sophia': '59e9dc1cb20c452584788a2690c80970', // Clear patient tutor
      'homework-helper-emma': '59e9dc1cb20c452584788a2690c80970', // Friendly student tutor
      'academic-speaker-dr-chen': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Scholarly professor

      // Fitness & Wellness
      'fitness-coach-marcus': '802e3bc2b27e49c2995d23ef70e6ac89', // Energetic trainer
      'comfort-teddy-bear': '59e9dc1cb20c452584788a2690c80970', // Soft comforting (female tone)

      // Professionals
      'mechanic-tony': '802e3bc2b27e49c2995d23ef70e6ac89', // Gruff friendly mechanic
      'legal-advisor-priya': '59e9dc1cb20c452584788a2690c80970', // Professional Indian-American

      // Creative & Philosophy
      'plato-philosopher': '0e73b5c5ff5740cd8d85571454ef28ae', // Ancient wisdom (Old Wizard)
      'daily-art-snack': '59e9dc1cb20c452584788a2690c80970', // Creative artist

      // Life Simulation
      'real-life-sim': 'beb44e5fac1e4b33a15dfcdcc2a9421d', // Neutral narrator
    };

    // ENHANCED Emotion intelligence with character-specific voice modifiers
    // Now includes personality-based speech patterns: stuttering, pauses, breathing, directness
    function getEmotionTag(characterId: string, messageText: string): string {
      const hasExclamation = messageText.includes('!');
      const hasAllCaps = /[A-Z]{4,}/.test(messageText);
      const hasQuestion = messageText.includes('?');
      const isLong = messageText.length > 100;
      const hasEllipsis = messageText.includes('...');

      // Define character personality types for dynamic speech patterns
      const characterPersonality: Record<string, {
        type: 'shy' | 'firm' | 'warm' | 'wise' | 'energetic' | 'calm' | 'nervous' | 'comforting' | 'professional';
        baseTag: string;
      }> = {
        // === SHY/NERVOUS - Stuttering, hesitation, pauses ===
        'nico-awkward': { type: 'shy', baseTag: 'shy man, quiet' },
        'hinata-moonlight': { type: 'shy', baseTag: 'shy girl, soft' },
        'comfort-teddy-bear': { type: 'comforting', baseTag: 'soft voice, gentle' },

        // === FIRM/MILITARY - Direct, clipped, no hesitation ===
        'coach-boone': { type: 'firm', baseTag: 'drill sergeant, commanding' },
        'dex': { type: 'firm', baseTag: 'tough man, street' },
        'mikasa-storm': { type: 'firm', baseTag: 'warrior woman, determined' },
        'levi-steel-wind': { type: 'firm', baseTag: 'cold captain, sharp' },

        // === WARM/FRIENDLY - Natural breathing, comfortable pauses ===
        'rajiv': { type: 'warm', baseTag: 'warm man, friendly' },
        'raj-corner-store': { type: 'warm', baseTag: 'friendly man, welcoming' },
        'grandpa-joe': { type: 'warm', baseTag: 'gentle grandpa, wise' },
        'chef-antonio-rossi': { type: 'warm', baseTag: 'italian chef, passionate' },
        'mechanic-tony': { type: 'warm', baseTag: 'gruff but friendly' },

        // === WISE/THOUGHTFUL - Long pauses, contemplative ===
        'plato-philosopher': { type: 'wise', baseTag: 'ancient philosopher, profound' },
        'professor-okafor': { type: 'wise', baseTag: 'wise professor, deep' },
        'academic-speaker-dr-chen': { type: 'wise', baseTag: 'scholarly, measured' },
        'yumi-nakamura': { type: 'wise', baseTag: 'thoughtful, precise' },

        // === ENERGETIC - Fast pace, excited, no pauses ===
        'fitness-coach-marcus': { type: 'energetic', baseTag: 'energetic coach, motivating' },
        'dj-trap-a-holics': { type: 'energetic', baseTag: 'hype man, excited' },
        'spongebob': { type: 'energetic', baseTag: 'cheerful, high-pitched' },
        'hoshi-kim': { type: 'energetic', baseTag: 'bubbly girl, excited' },
        'alex-hype-martinez': { type: 'energetic', baseTag: 'announcer, hyped' },

        // === CALM/PROFESSIONAL - Measured, smooth, controlled ===
        'dr-elena-vasquez': { type: 'calm', baseTag: 'calm doctor, soothing' },
        'legal-advisor-priya': { type: 'professional', baseTag: 'professional, precise' },
        'language-learning-sophia': { type: 'calm', baseTag: 'patient tutor, clear' },
        'camille-laurent': { type: 'calm', baseTag: 'sensual, breathy' },

        // === ELDERLY - Natural pacing, storytelling rhythm ===
        'marjorie': { type: 'firm', baseTag: 'elderly woman, sharp' },
        'marge-halloway': { type: 'firm', baseTag: 'elderly woman, stern' },
        'winston-grandpa-morris': { type: 'warm', baseTag: 'gentle storyteller' },
      };

      const personality = characterPersonality[characterId];

      if (!personality) {
        // Fallback to basic emotion detection
        if (hasAllCaps) return 'emphatic, strong';
        if (hasExclamation) return 'excited, expressive';
        if (hasQuestion) return 'curious, questioning';
        return 'neutral';
      }

      // Build dynamic emotion tag based on personality type
      let emotionTag = personality.baseTag;

      switch (personality.type) {
        case 'shy':
          // Shy characters: stuttering, hesitation, nervous pauses
          if (hasQuestion) {
            emotionTag += ', [hesitant pause]... um... [nervous]';
          } else if (hasEllipsis) {
            emotionTag += ', [long pause]... [trails off]';
          } else if (isLong) {
            emotionTag += ', [stuttering] w-well... [pause] I mean...';
          } else {
            emotionTag += ', [quiet] [slight pause]';
          }
          break;

        case 'firm':
          // Firm/military: direct, clipped, no hesitation, command tone
          if (hasAllCaps) {
            emotionTag += ', [COMMANDING] [no pause] [sharp]';
          } else if (hasExclamation) {
            emotionTag += ', [firm] [direct] [clipped ending]';
          } else {
            emotionTag += ', [steady] [authoritative] [no filler words]';
          }
          break;

        case 'warm':
          // Warm characters: natural breathing, chuckles, comfortable pauses
          if (hasExclamation) {
            emotionTag += ', [warm laugh] [genuine smile]';
          } else if (hasQuestion) {
            emotionTag += ', [gentle curiosity] [natural pause]';
          } else if (isLong) {
            emotionTag += ', [takes breath] [comfortable pace] [friendly sigh]';
          } else {
            emotionTag += ', [warm] [natural breathing]';
          }
          break;

        case 'wise':
          // Wise characters: contemplative pauses, measured delivery
          if (hasQuestion) {
            emotionTag += ', [long contemplative pause]... [thoughtful] hmm...';
          } else if (isLong) {
            emotionTag += ', [measured delivery] [pause for emphasis]... [profound]';
          } else {
            emotionTag += ', [thoughtful]... [slow measured pace]';
          }
          break;

        case 'energetic':
          // Energetic characters: fast pace, no pauses, excited
          if (hasExclamation) {
            emotionTag += ', [FAST PACE] [excited breath] [no pause] [pumped up]';
          } else if (hasAllCaps) {
            emotionTag += ', [MAXIMUM ENERGY] [shouting] [hyped]';
          } else {
            emotionTag += ', [upbeat tempo] [slight breathlessness] [eager]';
          }
          break;

        case 'calm':
          // Calm characters: smooth, soothing, controlled breathing
          if (hasQuestion) {
            emotionTag += ', [soft curiosity] [gentle]... [measured]';
          } else {
            emotionTag += ', [smooth] [calming breath] [relaxed pace]';
          }
          break;

        case 'professional':
          // Professional: precise, no filler words, confident pauses
          if (isLong) {
            emotionTag += ', [takes professional pause] [clear articulation] [confident]';
          } else {
            emotionTag += ', [precise] [measured] [authoritative but approachable]';
          }
          break;

        case 'comforting':
          // Comforting: sighs, gentle, nurturing tone
          emotionTag += ', [soft sigh]... [warm embrace in voice] [gentle]... [calming]';
          if (hasQuestion) {
            emotionTag += ', [tender concern]';
          }
          break;

        case 'nervous':
          // Nervous: filler words, false starts, tangents
          emotionTag += ', [um] [well, you see]... [nervous laugh] [trails off]...';
          break;
      }

      return emotionTag;
    }

    // Only use Fish Speech for American characters - skip accent-heavy ones
    // Use seedId (e.g., 'marjorie', 'rajiv') for matching, not personaId (database UUID)
    if (USE_FISH_SPEECH && seedId && FISH_SPEECH_CHARACTERS.includes(seedId)) {
      try {
        const fishVoiceId = FISH_VOICE_MAP[seedId];

        if (fishVoiceId) {
          console.log(`[TTS] Using Fish Speech for ${seedId} with voice ${fishVoiceId}`);

          // ENHANCED EMOTION INTELLIGENCE: Strong descriptive tags for better character matching
          const emotion = getEmotionTag(seedId, cleanedText);
          const emotionalText = emotion !== 'neutral' ? `[${emotion}] ${cleanedText}` : cleanedText;

          console.log(`[TTS] Emotion: ${emotion}, Text length: ${emotionalText.length}`);

          const fishResponse = await fetch('https://api.fish.audio/v1/tts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.FISH_SPEECH_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: emotionalText, // With enhanced emotion tags
              reference_id: fishVoiceId,
              format: 'mp3',
              normalize: true,
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (fishResponse.ok) {
            const arrayBuffer = await fishResponse.arrayBuffer();
            const audioBase64 = Buffer.from(arrayBuffer).toString('base64');
            console.log(`[TTS] ✅ Fish Speech SUCCESS (${arrayBuffer.byteLength} bytes) with emotion: ${emotion}`);

            // Track success
            if (conversationId && messageCount !== undefined && personaId) {
              await trackVoicePerformance(personaId, `fish-${fishVoiceId}-${emotion}`, userId, {
                messageCount,
                conversationLength: messageCount
              });
            }

            return NextResponse.json({
              audio: audioBase64,
              format: 'mp3',
              contentType: 'audio/mpeg',
              sampleRate: 44100,
              voiceName: `fish-${fishVoiceId}`,
              engine: 'fish-speech',
              emotion: emotion,
            });
          } else {
            const errorText = await fishResponse.text();
            console.error(`[TTS] Fish Speech API error (${fishResponse.status}):`, errorText);
          }
        }
      } catch (error) {
        console.error('[TTS] Fish Speech failed, falling back to OpenVoice:', error);
      }
    }

    // ACCENT CHARACTERS: Characters that need regional accents
    // Priority: 1. Chatterbox (FREE, high quality), 2. Gemini with styleHint (fallback)
    // Includes: Japanese, Korean, Italian, Kenyan, Scottish, Russian, Polish, Indian
    const ACCENT_CHARACTERS = [
      // Japanese characters
      'yuki-tanaka',    // Japanese (Osaka) - Elite pastry chef
      'kenji-tanaka',   // Japanese (Osaka) - Nutritionist
      'sunny-sato',     // Japanese-American (LA) - Randomizer host
      // Korean characters  
      'mina-kwon',      // Korean (Seoul) - Drama queen
      // Italian characters
      'nico-awkward',   // Italian (Milan) - Awkward hero
      // African/Other accent characters
      'asha-mbeki',     // Kenyan (Nairobi) - Career coach
      'eamon',          // Scottish - (if seedId is just 'eamon')
      'viktor',         // Russian
      'tomasz',         // Polish
      'rajiv',          // Indian (Note: also in Fish Speech for American variant)
      // French characters
      'camille-laurent', // French (Lyon) - Perfumer
    ];

    // CLONED VOICE CHARACTERS: All characters with Fish Audio cloned voices
    // These use Fish Audio API ONLY - NO GEMINI FALLBACK ALLOWED
    const CLONED_VOICE_CHARACTERS = [
      // ======================================
      // ORIGINAL 6 UNIQUE-VOICE CHARACTERS
      // ======================================
      'spongebob',              // SpongeBob SquarePants
      'trap-a-holics',          // DJ Trap-A-Holics "DAMN SON"
      'nico-awkward',           // Nico the awkward Italian
      'mina-kwon',              // Mina "Plot Twist" Kwon - Korean drama queen
      'detective-jun',          // Detective Jun Park
      'hector-alvarez',         // Hector "Money Map" Alvarez

      // ======================================
      // NEW 16 VOICE-FIRST CHARACTERS
      // ======================================
      // Spanish (3)
      'isabella-reyes',         // Mexican grandmother
      'sofia-vega',             // Latin American life coach
      'valentino-estrada',      // Spanish fashion consultant

      // British (4)
      'bernard-quinn',          // British stoic philosopher
      'liam-ashford',           // British art curator
      'winston-morris',         // British grandfather storyteller
      'edmund-blackwell',       // British history professor

      // Japanese (3)
      'yumi-nakamura',          // Japanese entertainer
      'mana-hayashi',           // Japanese hobby enthusiast
      'fuka-shimizu',           // Japanese lifestyle influencer

      // Korean (3)
      'hoshi-kim',              // K-pop trainee
      'taesung-lee',            // Korean storyteller
      'jinwoo-park',            // Korean drama writer

      // French (2)
      'adelie-moreau',          // French language tutor
      'camille-beaumont',       // French fashion stylist

      // English (1)
      'alex-hype',              // WWE-style hype man

      // ======================================
      // NEW DETAILED CHARACTERS (10) - ADDED
      // ======================================
      'marcus-chen',            // Tech entrepreneur (alex-hype voice)
      'zara-okonkwo',           // African fashion designer
      'dr-elena-vasquez',       // Therapist (sofia-vega voice)
      'chef-antonio-rossi',     // Italian chef (liam-ashford voice)
      'rei-tanaka',             // Game developer (yumi-nakamura voice)
      'maya-patel',             // Yoga instructor (mana-hayashi voice)
      'dj-kira-brooks',         // Music producer (fuka-shimizu voice)
      'professor-david-okafor', // History professor (bernard-quinn voice)
      'sarah-wheeler',          // Adventure guide (adelie-moreau voice)
      'grandpa-joe',            // Wise grandfather (winston-morris voice)

      // ======================================
      // FUN CATEGORY CHARACTERS (3) - NEW
      // ======================================
      'doodle-dave',            // West Coast game host (alex-hype voice)
      'sunny-sato',             // Japanese-American randomizer (yumi-nakamura voice)
      'big-tom',                // Liverpool pub quiz master (bernard-quinn voice)
    ];

    // If character has cloned voice OR accent, use the cloned voice pipeline
    const isAccentCharacter = seedId && ACCENT_CHARACTERS.includes(seedId);
    const hasClonedVoice = seedId && CLONED_VOICE_CHARACTERS.includes(seedId);
    const useClonedVoicePipeline = isAccentCharacter || hasClonedVoice;

    if (useClonedVoicePipeline) {
      const clonedSeedId = seedId!;

      // Import Chatterbox client dynamically
      const { getChatterboxClient } = await import('@/lib/audio/chatterbox-client');
      const chatterboxClient = getChatterboxClient();

      // PRIORITY 1: Chatterbox (FREE, state-of-the-art quality)
      if (await chatterboxClient.isAvailable()) {
        console.log(`[TTS] Using Chatterbox for ${clonedSeedId} (FREE, state-of-the-art)`);

        // Check if reference audio exists for this character
        if (await chatterboxClient.hasReferenceAudio(clonedSeedId)) {
          // Check cache first
          const cacheHash = generateTTSCacheHash(cleanedText, clonedSeedId, 'chatterbox');
          const cached = await getCachedTTS(cacheHash);

          if (cached) {
            console.log(`[TTS] Cache HIT for Chatterbox ${clonedSeedId} - returning cached audio`);
            return NextResponse.json({
              audio: cached.audioBase64,
              format: cached.format,
              contentType: cached.contentType,
              sampleRate: cached.sampleRate,
              voiceName: 'chatterbox',
              engine: 'chatterbox',
              cached: true,
            });
          }

          try {
            // Use higher emotion for accent characters (0.7 = more expressive)
            const result = await chatterboxClient.synthesize(cleanedText, clonedSeedId, {
              emotion: 0.7,
              addParalinguisticTags: false // Can enable for [laugh], [chuckle] support
            });

            if (result) {
              console.log(`[TTS] ✅ Chatterbox SUCCESS for ${clonedSeedId} (FREE)`);

              const audioBase64 = result.audio.toString('base64');

              // Cache the response for future reuse
              await cacheTTS(
                cacheHash,
                cleanedText,
                clonedSeedId,
                'chatterbox',
                audioBase64,
                result.format,
                result.contentType,
                result.sampleRate
              );

              if (personaId && userId) {
                await trackVoicePerformance(personaId, 'chatterbox', userId, { conversationLength: 1 });
              }

              return NextResponse.json({
                audio: audioBase64,
                format: result.format,
                contentType: result.contentType,
                sampleRate: result.sampleRate,
                voiceName: 'chatterbox',
                engine: 'chatterbox',
              });
            } else {
              console.error(`[TTS] Chatterbox returned null for ${clonedSeedId}`);
            }
          } catch (error: any) {
            console.error(`[TTS] Chatterbox failed for ${clonedSeedId}:`, error?.message || error);
            // Fall through to XTTS then Fish Audio
          }
        } else {
          console.warn(`[TTS] No reference audio for Chatterbox character: ${clonedSeedId}`);
          console.log(`[TTS] Add ${clonedSeedId}.wav to services/chatterbox/reference_audio/`);
        }
      } else {
        console.log(`[TTS] Chatterbox server not available, trying XTTS/Fish Audio...`);
      }

      // PRIORITY 2: Try XTTS-v2 local server (FREE, uses Fish Audio voice samples)
      if (await isXTTSServerAvailable()) {
        const voiceSamplePath = getVoiceSamplePath(clonedSeedId);
        if (voiceSamplePath) {
          console.log(`[TTS] Using XTTS-v2 local server for ${clonedSeedId} (FREE)`);

          // Check cache first
          const cacheHash = generateTTSCacheHash(cleanedText, clonedSeedId, 'xtts');
          const cached = await getCachedTTS(cacheHash);

          if (cached) {
            console.log(`[TTS] Cache HIT for XTTS ${clonedSeedId} - returning cached audio`);
            return NextResponse.json({
              audio: cached.audioBase64,
              format: cached.format,
              contentType: cached.contentType,
              sampleRate: cached.sampleRate,
              voiceName: 'xtts',
              engine: 'xtts',
              cached: true,
            });
          }

          try {
            const audioBuffer = await generateSpeechXTTS({
              seedId: clonedSeedId,
              text: cleanedText,
            });

            if (audioBuffer && audioBuffer.length > 0) {
              console.log(`[TTS] ✅ XTTS-v2 SUCCESS for ${clonedSeedId} (FREE, local)`);

              const audioBase64 = audioBuffer.toString('base64');

              // Cache the response for future reuse
              await cacheTTS(
                cacheHash,
                cleanedText,
                clonedSeedId,
                'xtts',
                audioBase64,
                'wav',
                'audio/wav',
                24000
              );

              if (personaId && userId) {
                await trackVoicePerformance(personaId, 'xtts', userId, { conversationLength: 1 });
              }

              return NextResponse.json({
                audio: audioBase64,
                format: 'wav',
                contentType: 'audio/wav',
                sampleRate: 24000,
                voiceName: 'xtts',
                engine: 'xtts',
              });
            }
          } catch (error: any) {
            console.error(`[TTS] XTTS-v2 failed for ${clonedSeedId}:`, error?.message || error);
            // Fall through to Fish Audio
          }
        } else {
          console.warn(`[TTS] No voice sample for XTTS character: ${clonedSeedId}`);
          console.log(`[TTS] Run: npx ts-node scripts/clone-fish-audio-voices.ts to generate samples`);
        }
      } else {
        console.log(`[TTS] XTTS-v2 server not available, trying Fish Audio API...`);
      }

      // PRIORITY 3: Try Fish Audio API (uses cloned voice model IDs directly)
      const fishApiKey = process.env.FISH_AUDIO_API_KEY;
      if (fishApiKey) {
        try {
          const { hasClonedVoice, generateSpeechFishAudio } = await import('@/lib/audio/fishAudioClient');

          if (hasClonedVoice(clonedSeedId)) {
            console.log(`[TTS] Using Fish Audio API for ${clonedSeedId} (cloned voice)`);

            // Check cache first
            const cacheHash = generateTTSCacheHash(cleanedText, clonedSeedId, 'fish-audio');
            const cached = await getCachedTTS(cacheHash);

            if (cached) {
              console.log(`[TTS] Cache HIT for Fish Audio ${clonedSeedId} - returning cached audio`);
              return NextResponse.json({
                audio: cached.audioBase64,
                format: cached.format,
                contentType: cached.contentType,
                sampleRate: cached.sampleRate,
                voiceName: 'fish-audio',
                engine: 'fish-audio',
                cached: true,
              });
            }

            const audioBuffer = await generateSpeechFishAudio({
              seedId: clonedSeedId,
              text: cleanedText,
              format: 'mp3',
            });

            if (audioBuffer && audioBuffer.length > 0) {
              console.log(`[TTS] ✅ Fish Audio SUCCESS for ${clonedSeedId}`);

              const audioBase64 = audioBuffer.toString('base64');

              // Cache the response for future reuse
              await cacheTTS(
                cacheHash,
                cleanedText,
                clonedSeedId,
                'fish-audio',
                audioBase64,
                'mp3',
                'audio/mpeg',
                44100
              );

              if (personaId && userId) {
                await trackVoicePerformance(personaId, 'fish-audio', userId, { conversationLength: 1 });
              }

              return NextResponse.json({
                audio: audioBase64,
                format: 'mp3',
                contentType: 'audio/mpeg',
                sampleRate: 44100,
                voiceName: 'fish-audio',
                engine: 'fish-audio',
              });
            }
          }
        } catch (error: any) {
          console.error(`[TTS] Fish Audio API failed for ${clonedSeedId}:`, error?.message || error);
          // NO FALLBACK - Return error instead of falling back to Gemini
          return NextResponse.json(
            {
              error: 'Voice synthesis failed',
              reason: `Fish Audio failed for character ${clonedSeedId}. Voice consistency preserved by not falling back.`,
              characterId: clonedSeedId,
            },
            { status: 503 }
          );
        }
      } else {
        // NO GEMINI FALLBACK - Fish Audio API key is required for cloned voice characters
        console.error(`[TTS] FISH_AUDIO_API_KEY not set - cannot synthesize voice for ${clonedSeedId}`);
        return NextResponse.json(
          {
            error: 'Fish Audio API key not configured',
            reason: 'Cloned voice characters require FISH_AUDIO_API_KEY to be set. No Gemini fallback allowed.',
            characterId: clonedSeedId,
          },
          { status: 503 }
        );
      }

      // NO GEMINI FALLBACK - If we reach here, Fish Audio should have worked
      // Return error if Fish Audio pipeline completed without returning audio
      console.error(`[TTS] Fish Audio pipeline completed without audio for ${clonedSeedId}`);
      return NextResponse.json(
        {
          error: 'Voice synthesis failed',
          reason: `Fish Audio completed but produced no audio for ${clonedSeedId}. Check voice mapping.`,
          characterId: clonedSeedId,
        },
        { status: 503 }
      );
    }




    // OpenVoice is now the SECONDARY TTS engine (fallback from Fish Speech)
    // SKIP OpenVoice for accent characters (it just proxies to Gemini and doesn't support accents)
    const USE_OPENVOICE = process.env.USE_OPENVOICE !== 'false' && !isAccentCharacter;



    // Try OpenVoice (only for non-accent characters)
    if (USE_OPENVOICE && personaId) {
      try {
        let referenceAudio = await getReferenceAudio(personaId);

        // If no reference audio exists, generate it using Gemini TTS
        if (!referenceAudio) {
          try {
            console.log(`Generating reference audio for persona ${personaId}...`);
            const baseVoiceResult = await generateBaseVoice(personaId, undefined);
            if (baseVoiceResult.success && baseVoiceResult.audioBase64) {
              referenceAudio = baseVoiceResult.audioBase64;
            }
          } catch (genError) {
            console.warn('Failed to generate reference audio, will fall back to Gemini TTS:', genError);
          }
        }

        if (referenceAudio) {
          // Get or clone voice
          let voiceId: string | { referenceAudioBase64: string };

          // Check if we have cached voice ID
          const persona = await db.personaTemplate.findUnique({
            where: { id: personaId },
            select: { openVoiceVoiceId: true, referenceAudioBase64: true }
          });

          if (persona?.openVoiceVoiceId) {
            voiceId = persona.openVoiceVoiceId;
          } else {
            // Use reference audio directly
            voiceId = { referenceAudioBase64: referenceAudio };
          }

          // Map voice parameters to OpenVoice options
          const openVoiceOptions = mapToOpenVoiceOptions(
            {
              speed: params.speed,
              pitch: params.pitch,
              styleHint: voiceConfig.styleHint || undefined,
              diction: voiceConfig.diction,
              emphasis: voiceConfig.emphasis,
            },
            characterName,
            archetype,
            category
          );

          // ADD ACCENT SUPPORT: Map character to OpenVoice accent
          // OpenVoice V2 supports: american, british, indian, south_african, australian
          const ACCENT_MAP: Record<string, { accent: string; speed?: number; emotion?: string }> = {
            'marjorie': { accent: 'american', speed: 0.85, emotion: 'angry' },
            'rajiv': { accent: 'indian', speed: 1.1, emotion: 'happy' },
            'asha': { accent: 'south_african', speed: 1.0 }, // Closest to Kenyan
            'dex': { accent: 'american', speed: 1.05, emotion: 'angry' },
            'eamon': { accent: 'british', speed: 1.15, emotion: 'excited' }, // Closest to Scottish
            'viktor': { accent: 'british', speed: 0.9 }, // Formal English for Russian
            'tomasz': { accent: 'british', speed: 0.95 },
            'aaliyah': { accent: 'american', speed: 1.0 },
          };

          // Use seedId for accent matching (e.g., 'asha', 'rajiv', 'eamon')
          const accentConfig = seedId ? ACCENT_MAP[seedId] : null;
          if (accentConfig) {
            openVoiceOptions.accent = accentConfig.accent;
            if (accentConfig.speed) openVoiceOptions.speed = accentConfig.speed;
            if (accentConfig.emotion) openVoiceOptions.emotion = accentConfig.emotion;
            console.log(`[TTS] OpenVoice accent for ${seedId}: ${accentConfig.accent}, speed: ${openVoiceOptions.speed}`);
          }

          // Adjust speed based on pitch (OpenVoice doesn't have direct pitch control)
          if (params.pitch !== undefined && params.pitch !== 1.0) {
            openVoiceOptions.speed = mapPitchToSpeed(
              params.pitch,
              openVoiceOptions.speed || 1.0
            );
          }

          // Synthesize with OpenVoice (now with accent support!)
          const audioResponse = await openVoiceClient.synthesize(
            cleanedText,
            voiceId,
            openVoiceOptions
          );

          // Cache voice ID if we used reference audio directly
          if (!persona?.openVoiceVoiceId && typeof voiceId === 'object') {
            // Clone voice and cache the ID
            try {
              const clonedVoiceId = await openVoiceClient.cloneVoice(referenceAudio);
              await db.personaTemplate.update({
                where: { id: personaId },
                data: { openVoiceVoiceId: clonedVoiceId }
              });
            } catch (cloneError) {
              // Non-fatal - continue without caching
              console.warn('Failed to cache voice ID:', cloneError);
            }
          }

          // Return OpenVoice audio
          return NextResponse.json({
            audio: audioResponse.audio,
            format: audioResponse.format || 'pcm',
            sampleRate: audioResponse.sampleRate,
            playbackRate: openVoiceOptions.speed,
            voiceUsed: 'openvoice',
          });
        }
      } catch (openVoiceError: any) {
        // Log error but fall back to Gemini TTS
        console.warn('OpenVoice synthesis failed, falling back to Gemini TTS:', openVoiceError.message);
        // Continue to Gemini TTS fallback
      }
    }

    // Fallback to Gemini TTS only if OpenVoice unavailable or disabled
    const ai = getGeminiClient();

    // 3. Generate TTS with optimized voice and parameters
    // Skip gemini-2.0-flash-exp as it doesn't support AUDIO modality
    let result;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:60', message: 'Attempting TTS with gemini-2.5-flash-preview-tts', data: { model: 'gemini-2.5-flash-preview-tts', voiceName: finalVoiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion

      // Optimize TTS request for faster, more natural output
      // Note: Only voiceName is supported in prebuiltVoiceConfig
      // speakingRate and pitch are not valid fields in Gemini TTS API
      const speechConfig: any = {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: finalVoiceName.toLowerCase() // Ensure lowercase - this is the only valid field
          }
        }
        // Note: Speed and pitch control will be handled client-side via playbackRate
      };

      // Log voice being used for accent debugging
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:212', message: 'TTS request - ACCENT DEBUG', data: { finalVoiceName, styleHint: voiceConfig.styleHint, textLength: text.length, characterName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      // ACCENT ENHANCEMENT: For accent characters, prepend speaking direction to influence voice
      // Gemini TTS can interpret directions like [spoken with Japanese accent] or similar cues
      let ttsText = cleanedText;
      if (seedId && CHARACTER_ACCENT_MAP[seedId]) {
        const accentCue = CHARACTER_ACCENT_MAP[seedId];
        // Use square bracket notation for voice direction (similar to SSML prosody hints)
        ttsText = `[Speaking as: ${accentCue}] ${cleanedText}`;
        console.log(`[TTS] Applied accent cue for ${seedId}: "${accentCue.substring(0, 50)}..."`);
      }

      result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts', // Use TTS model directly
        contents: {
          parts: [{ text: ttsText }]
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: speechConfig
        }
      });

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:75', message: 'TTS request successful', data: { hasCandidates: !!result.candidates, partsCount: result.candidates?.[0]?.content?.parts?.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
    } catch (ttsError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:77', message: 'TTS request failed', data: { error: ttsError.message, code: ttsError.error?.error?.code, status: ttsError.error?.error?.status }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion

      console.error('TTS Model Error:', ttsError);

      // Check if it's a quota error
      const errorMessage = ttsError.message || ttsError.error?.error?.message || 'Unknown error';
      const errorCode = ttsError.error?.error?.code || ttsError.status;

      if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('Quota exceeded') || errorMessage.includes('limit: 0')) {
        // Try to get usage data if available
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const quota = userId ? await db.userQuota.findFirst({
          where: {
            userId: userId,
            lastResetDate: { gte: today },
          },
        }) : null;
        const usedSeconds = quota?.ttsSecondsToday || 0;
        const subStatus = await getSubscriptionStatus(userId);
        const limits = getPlanLimits(subStatus.planId);

        return NextResponse.json(
          {
            error: 'TTS quota exceeded',
            quotaExceeded: true,
            reason: 'Your Gemini API quota for TTS has been exceeded. Text chat will continue to work normally.',
            upgradeUrl: 'https://ai.google.dev/pricing',
            currentUsage: usedSeconds,
            limit: limits.ttsSecondsPerDay || 0,
          },
          { status: 429 }
        );
      }

      throw new Error(`TTS model error: ${errorMessage}`);
    }

    // Check for audio data in response - try multiple paths
    let audioData = result.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.includes('audio')
    )?.inlineData?.data;

    // Try alternative paths if first attempt fails
    if (!audioData) {
      audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioData && result.candidates?.[0]?.content?.parts) {
      // Try all parts
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.includes('audio')) {
          audioData = part.inlineData.data;
          break;
        }
      }
    }

    if (!audioData) {
      console.error('TTS Response structure:', JSON.stringify(result, null, 2));
      console.error('No audio data found in any path. Candidates:', result.candidates?.length);

      // Return a more helpful error message
      return NextResponse.json(
        {
          error: 'No audio data returned from API',
          reason: 'The TTS service did not return audio data. This may be a temporary issue. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? 'Check server logs for response structure' : undefined
        },
        { status: 500 }
      );
    }

    // 4. Skip post-processing for faster, cleaner audio
    // Gemini TTS already produces high-quality, natural-sounding audio
    // Post-processing was adding pauses and artifacts that slowed things down
    const audioBuffer = Buffer.from(audioData, 'base64');

    // 5. Track performance (async, don't wait)
    if (personaId && finalVoiceName) {
      trackVoicePerformance(
        personaId,
        finalVoiceName,
        userId,
        {
          messageCount,
          conversationLength: text.length,
        }
      ).catch(console.error);
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/api/tts/route.ts:341', message: 'TTS response prepared', data: { voiceUsed: finalVoiceName, playbackRate: params.speed, paramsSpeed: params.speed, paramsPitch: params.pitch, sampleRate: 24000 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H' }) }).catch(() => { });
    // #endregion

    // Return clean, unprocessed audio with speed parameter for client-side playback
    return NextResponse.json({
      audio: audioBuffer.toString('base64'),
      format: 'pcm',
      sampleRate: 24000,
      voiceUsed: finalVoiceName,
      parameters: params,
      playbackRate: params.speed, // Client will use this for speed control
    });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    console.error('Error stack:', error.stack);

    // Extract user-friendly error message
    let errorMessage = 'Failed to generate TTS';
    let statusCode = 500;

    if (error.message) {
      errorMessage = error.message;
      // Check for quota/rate limit errors
      if (error.message.includes('quota') || error.message.includes('Quota exceeded') || error.message.includes('429')) {
        statusCode = 429;
        errorMessage = 'TTS quota exceeded. Please check your API plan or try again later.';

        // Get usage data for quota errors
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const quota = userId ? await db.userQuota.findFirst({
          where: {
            userId: userId,
            lastResetDate: { gte: today },
          },
        }) : null;
        const usedSeconds = quota?.ttsSecondsToday || 0;
        const subStatus = await getSubscriptionStatus(userId);
        const limits = getPlanLimits(subStatus.planId);

        return NextResponse.json(
          {
            error: 'TTS quota exceeded',
            quotaExceeded: true,
            reason: errorMessage,
            upgradeUrl: 'https://ai.google.dev/pricing',
            currentUsage: usedSeconds,
            limit: limits.ttsSecondsPerDay || 0,
          },
          { status: 429 }
        );
      } else if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        statusCode = 429;
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }
    }

    // Check if error has nested error object (from Gemini API)
    if (error.error?.error?.message) {
      const geminiError = error.error.error;
      if (geminiError.code === 429 || geminiError.status === 'RESOURCE_EXHAUSTED') {
        statusCode = 429;
        errorMessage = 'TTS quota exceeded. Please check your API plan or try again later.';

        // Get usage data for quota errors
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const quota = userId ? await db.userQuota.findFirst({
          where: {
            userId: userId,
            lastResetDate: { gte: today },
          },
        }) : null;
        const usedSeconds = quota?.ttsSecondsToday || 0;
        const subStatus = await getSubscriptionStatus(userId);
        const limits = getPlanLimits(subStatus.planId);

        return NextResponse.json(
          {
            error: 'TTS quota exceeded',
            quotaExceeded: true,
            reason: errorMessage,
            upgradeUrl: 'https://ai.google.dev/pricing',
            currentUsage: usedSeconds,
            limit: limits.ttsSecondsPerDay || 0,
          },
          { status: 429 }
        );
      } else {
        errorMessage = geminiError.message || errorMessage;
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate TTS',
        details: errorMessage,
        type: error.constructor.name,
        statusCode,
      },
      { status: statusCode }
    );
  }
}
