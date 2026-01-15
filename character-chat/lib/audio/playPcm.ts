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
  fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'lib/audio/playPcm.ts:9', message: 'playPCM called', data: { sampleRate, playbackRate, hasAudioContext: !!audioContext, audioContextSampleRate: audioContext?.sampleRate }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'F' }) }).catch(() => { });
  // #endregion

  // Use provided audioContext or create new one with system default sample rate
  // We do NOT force sampleRate here to allow the OS/Browser to use its native rate (e.g. 48kHz)
  // This prevents low-quality OS resampling and allows decodeAudioData to upsample correctly
  const ctx = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();

  // Helper to convert base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Detect WAV header (RIFF)
  // "RIFF" in ASCII is [82, 73, 70, 70]
  const isWav = bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70;

  let audioBuffer: AudioBuffer | null = null;
  const source = ctx.createBufferSource();

  // Promise to handle async decoding if needed
  const prepareBuffer = async () => {
    if (isWav) {
      try {
        console.log('[playPcm] Detected WAV header, using decodeAudioData...');
        // Create a copy of the buffer because decodeAudioData detaches it
        const bufferCopy = bytes.buffer.slice(0);
        audioBuffer = await ctx.decodeAudioData(bufferCopy);
      } catch (e) {
        console.error('[playPcm] WAV decoding failed, falling back to raw PCM interpretation:', e);
        // Fallback to raw PCM logic below if decoding fails
      }
    }

    if (!audioBuffer) {
      // Raw PCM16 decoding (Gemini style)
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create audio buffer
      audioBuffer = ctx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);
    }

    source.buffer = audioBuffer;
  };

  // Set playback rate for speed control (1.0 = normal, 1.25 = 25% faster, etc.)
  // Clamp between 0.5x and 2.0x for safety
  const finalPlaybackRate = Math.max(0.5, Math.min(2.0, playbackRate));
  source.playbackRate.value = finalPlaybackRate;

  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'lib/audio/playPcm.ts:46', message: 'Audio source configured', data: { finalPlaybackRate, requestedPlaybackRate: playbackRate, isWav }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'G' }) }).catch(() => { });
  // #endregion

  source.connect(ctx.destination);

  let isStopped = false;
  let resolvePromise: (() => void) | null = null;
  let rejectPromise: ((error: any) => void) | null = null;
  let hasResolved = false;

  const playPromise = new Promise<void>(async (resolve, reject) => {
    resolvePromise = resolve;
    rejectPromise = reject;

    try {
      // Prepare buffer (Async decoding or fallback)
      await prepareBuffer();

      if (!audioBuffer) {
        throw new Error('Failed to create audio buffer');
      }

      // Calculate duration for timeout
      const duration = audioBuffer.duration;
      // Add 20% to duration + 2s padding to account for playback rate and hiccups
      const estimatedDuration = (duration / finalPlaybackRate) * 1000 + 2000;

      const timeoutId = setTimeout(() => {
        if (!hasResolved && !isStopped) {
          hasResolved = true;
          console.warn('Audio playback timeout - resolving promise as fallback');
          if (!audioContext) {
            ctx.close().catch(() => { });
          }
          resolve();
        }
      }, estimatedDuration);

      source.onended = () => {
        if (!hasResolved && !isStopped) {
          hasResolved = true;
          clearTimeout(timeoutId);
          if (!audioContext) {
            ctx.close().catch(() => { });
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
            ctx.close().catch(() => { });
          }
          resolve();
        }
      });

      // Ensure audio context is running
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (!isStopped) {
        source.start(0);
      } else {
        // Was stopped during preparation
        resolve();
      }
    } catch (error) {
      console.error('Error in playPCM:', error);
      if (!hasResolved) {
        hasResolved = true;
        // Resolve anyway to avoid hanging
        resolve();
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
        // Source may trigger error if not started, ignore
      }
      if (!audioContext) {
        ctx.close().catch(() => { });
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

