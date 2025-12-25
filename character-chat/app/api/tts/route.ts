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

// Valid Gemini TTS voices - defined once at module level for voice locking
const VALID_VOICES = ['achernar', 'achird', 'algenib', 'algieba', 'alnilam', 'aoede', 'autonoe',
  'callirrhoe', 'charon', 'despina', 'enceladus', 'erinome', 'fenrir',
  'gacrux', 'iapetus', 'kore', 'laomedeia', 'leda', 'orus', 'puck',
  'pulcherrima', 'rasalgethi', 'sadachbia', 'sadaltager', 'schedar',
  'sulafat', 'umbriel', 'vindemiatrix', 'zephyr', 'zubenelgenubi'];

export async function POST(request: NextRequest) {
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

    const userId = request.headers.get('x-user-id') || null;

    // HARD LOCK: Query database DIRECTLY for voiceName, styleHint, speed, and pitch
    // This ensures we ALWAYS use the exact values from the database, never fallbacks or optimization
    let lockedVoiceName: string | null = null;
    let lockedStyleHint: string | null = null;
    let lockedSpeed: number | null = null;
    let lockedPitch: number | null = null;
    
    if (personaId) {
      const persona = await db.personaTemplate.findUnique({
        where: { id: personaId },
        select: { voiceName: true, styleHint: true, voiceSpeed: true, voicePitch: true },
      });
      
      if (persona) {
        lockedVoiceName = persona.voiceName;
        lockedStyleHint = persona.styleHint;
        lockedSpeed = persona.voiceSpeed;
        lockedPitch = persona.voicePitch;
        
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:45',message:'HARD LOCK - Queried DB directly',data:{personaId,lockedVoiceName,lockedStyleHint,lockedSpeed,lockedPitch},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:82',message:'TTS route entry - VOICE DEBUG',data:{voiceNameReceived:voiceName,lockedVoiceName,lockedStyleHint,characterName,personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // 1. HARD LOCK: Use ONLY database values, NO fallbacks
    // If we have a locked voice from DB, use it. Otherwise use provided voiceName as last resort.
    let baseVoiceName = (lockedVoiceName || voiceName || 'kore').toLowerCase();
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:90',message:'HARD VOICE LOCK - Using DB voiceName',data:{baseVoiceName,lockedVoiceName,requestVoiceName:voiceName,personaId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:78',message:'After initial voiceName processing - VOICE DEBUG',data:{baseVoiceName,originalVoiceName:voiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    // Validate voice name
    if (!VALID_VOICES.includes(baseVoiceName)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:87',message:'Invalid voiceName, defaulting to kore - VOICE DEBUG',data:{baseVoiceName,validVoices:VALID_VOICES},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:93',message:'Advanced config retrieved - VOICE DEBUG',data:{advancedConfigVoiceName:advancedConfig.voiceName,baseVoiceName,willUse:baseVoiceName,styleHintFromDB:styleHint,styleHintFromConfig:advancedConfig.styleHint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // HARD-CODE: Use stored voiceName from database, NEVER override
      // HARD LOCK: Use ONLY database styleHint, NO fallbacks to advanced config
      // Only use advanced config for speed/pitch/diction parameters
      voiceConfig = {
        voiceName: baseVoiceName, // HARD-CODED: Always from database, never changed - IGNORE advancedConfig.voiceName
        speed: advancedConfig.speed,
        pitch: advancedConfig.pitch,
        styleHint: lockedStyleHint || null, // HARD LOCK: ONLY database styleHint, NO fallback
        diction: advancedConfig.diction,
        emphasis: advancedConfig.emphasis,
      };
    } else {
      // Fallback: use stored voice with default parameters
      voiceConfig = {
        voiceName: baseVoiceName, // HARD-CODED: Always from database
        speed: 1.0, // Default speed (not 1.25)
        pitch: 1.0,
        styleHint: lockedStyleHint || null, // HARD LOCK: ONLY database styleHint, NO fallback
        diction: 'normal' as const,
        emphasis: 'medium' as const,
      };
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:125',message:'Voice config with locked styleHint - ACCENT DEBUG',data:{finalStyleHint:voiceConfig.styleHint,styleHintFromDB:styleHint,voiceName:baseVoiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:120',message:'Final voiceConfig - VOICE DEBUG',data:{finalVoiceName:voiceConfig.voiceName,baseVoiceName,originalVoiceName:voiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:184',message:'LOCKED params - no optimization',data:{speed:params.speed,pitch:params.pitch,lockedSpeed,lockedPitch},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:163',message:'Invalid final voice, using kore fallback - VOICE DEBUG',data:{finalVoiceName,validVoices:VALID_VOICES,lockedVoiceName,baseVoiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      finalVoiceName = 'kore'; // Fallback only if invalid
    }
    
    // Log final voice for debugging voice consistency issues
    if (personaId) {
      console.log(`[TTS] Voice locked for persona ${personaId}: ${finalVoiceName} (from DB: ${lockedVoiceName || 'N/A'})`);
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:168',message:'FINAL VOICE LOCK - VOICE DEBUG',data:{textLength:text.length,finalVoiceName,personaId,originalVoiceName:voiceName,baseVoiceName,voiceConfigVoiceName:voiceConfig.voiceName,usingBaseVoice:true,isValid:VALID_VOICES.includes(finalVoiceName)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // OpenVoice is now the PRIMARY TTS engine (free and better quality)
    // Only fall back to Gemini if OpenVoice is unavailable or persona has no reference audio
    const USE_OPENVOICE = process.env.USE_OPENVOICE !== 'false'; // Default to true unless explicitly disabled
    
    // Try OpenVoice first (primary TTS engine)
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
          
          // Adjust speed based on pitch (OpenVoice doesn't have direct pitch control)
          if (params.pitch !== undefined && params.pitch !== 1.0) {
            openVoiceOptions.speed = mapPitchToSpeed(
              params.pitch,
              openVoiceOptions.speed || 1.0
            );
          }
          
          // Synthesize with OpenVoice
          const audioResponse = await openVoiceClient.synthesize(
            text,
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
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:60',message:'Attempting TTS with gemini-2.5-flash-preview-tts',data:{model:'gemini-2.5-flash-preview-tts',voiceName:finalVoiceName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:212',message:'TTS request - ACCENT DEBUG',data:{finalVoiceName,styleHint:voiceConfig.styleHint,textLength:text.length,characterName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts', // Use TTS model directly
        contents: {
          parts: [{ text: text }]
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: speechConfig
        }
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:75',message:'TTS request successful',data:{hasCandidates:!!result.candidates,partsCount:result.candidates?.[0]?.content?.parts?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (ttsError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:77',message:'TTS request failed',data:{error:ttsError.message,code:ttsError.error?.error?.code,status:ttsError.error?.error?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/tts/route.ts:341',message:'TTS response prepared',data:{voiceUsed:finalVoiceName,playbackRate:params.speed,paramsSpeed:params.speed,paramsPitch:params.pitch,sampleRate:24000},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
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
        const limits = getPlanLimits(subscriptionStatus.planId);
        
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
