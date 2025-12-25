/**
 * Play PCM audio using Web Audio API with speed control
 */

/**
 * Play PCM16 audio at specified sample rate with optional playback speed
 * Returns an object with stop function to allow stopping playback
 */
export function playPCM(
  base64Audio: string,
  sampleRate: number = 24000,
  playbackRate: number = 1.25, // Default 25% faster for more natural, responsive feel
  audioContext?: AudioContext // Optional: use existing audio context
): { stop: () => void; promise: Promise<void> } {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/audio/playPcm.ts:9',message:'playPCM called',data:{sampleRate,playbackRate,hasAudioContext:!!audioContext,audioContextSampleRate:audioContext?.sampleRate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  // Use provided audioContext or create new one
  const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: sampleRate,
  });

  // Decode PCM16 to Float32Array
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16Array = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16Array.length);
  
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  // Create audio buffer
  const audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Array);

  // Play audio with speed control
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  
  // Set playback rate for speed control (1.0 = normal, 1.25 = 25% faster, etc.)
  // Clamp between 0.5x and 2.0x for safety
  const finalPlaybackRate = Math.max(0.5, Math.min(2.0, playbackRate));
  source.playbackRate.value = finalPlaybackRate;
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/audio/playPcm.ts:46',message:'Audio source configured',data:{finalPlaybackRate,requestedPlaybackRate:playbackRate,bufferSampleRate:audioBuffer.sampleRate,audioContextSampleRate:ctx.sampleRate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
  // #endregion
  
  source.connect(ctx.destination);

  let isStopped = false;
  let resolvePromise: (() => void) | null = null;
  let rejectPromise: ((error: any) => void) | null = null;
  let hasResolved = false;

  const playPromise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;

    // Set timeout as fallback - if onended doesn't fire, resolve after estimated duration
    const estimatedDuration = (float32Array.length / sampleRate) * (1.0 / finalPlaybackRate) * 1000;
    const timeoutId = setTimeout(() => {
      if (!hasResolved && !isStopped) {
        hasResolved = true;
        console.warn('Audio playback timeout - resolving promise as fallback');
        // Only close if we created the context
        if (!audioContext) {
          ctx.close().catch(() => {});
        }
        resolve();
      }
    }, estimatedDuration + 2000); // Add 2 second buffer

    source.onended = () => {
      if (!hasResolved && !isStopped) {
        hasResolved = true;
        clearTimeout(timeoutId);
        // Only close if we created the context
        if (!audioContext) {
          ctx.close().catch(() => {});
        }
        resolve();
      }
    };
    
    source.addEventListener('error', (error: Event) => {
      if (!hasResolved && !isStopped) {
        hasResolved = true;
        clearTimeout(timeoutId);
        console.error('Audio source error:', error);
        if (!audioContext) {
          ctx.close().catch(() => {});
        }
        // Resolve instead of reject to prevent unhandled promise rejection
        resolve();
      }
    });
    
    try {
      source.start(0);
    } catch (startError) {
      clearTimeout(timeoutId);
      if (!hasResolved) {
        hasResolved = true;
        console.error('Failed to start audio source:', startError);
        if (!audioContext) {
          ctx.close().catch(() => {});
        }
        resolve(); // Resolve instead of reject
      }
    }
  });

  const stop = () => {
    if (!isStopped) {
      isStopped = true;
      hasResolved = true;
      try {
        source.stop();
      } catch (e) {
        // Source may already be stopped - this is fine
      }
      if (!audioContext) {
        ctx.close().catch(() => {}); // Ignore errors
      }
      if (resolvePromise) {
        resolvePromise();
      }
    }
  };

  return { stop, promise: playPromise };
}

/**
 * Stop all audio playback
 */
export function stopAllAudio(): void {
  // Note: Web Audio API doesn't have a global stop method
  // This would need to be managed at a higher level
  // by tracking active AudioContext instances
}

