/**
 * Centralized Audio Manager
 * Ensures only one audio instance plays at a time across all components
 */

import { playPCM } from './playPcm';

interface AudioInstance {
  stop: () => void;
  promise: Promise<void>;
  audioContext: AudioContext;
  messageId?: string;
}

class AudioManager {
  private currentAudio: AudioInstance | null = null;
  private listeners: Set<(isPlaying: boolean) => void> = new Set();
  private lastStopTime: number = 0;
  private readonly STOP_COOLDOWN_MS = 200; // Cooldown after stopping audio before allowing new playback (increased to prevent double-talking)
  private isStopping: boolean = false; // Flag to prevent new audio from starting during stop operation

  /**
   * Play audio and stop any currently playing audio
   * Supports both PCM (Gemini) and MP3 (ElevenLabs) formats
   */
  async playAudio(
    base64Audio: string,
    sampleRate: number = 24000,
    playbackRate: number = 1.25,
    messageId?: string,
    format?: string
  ): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'audioManager.ts:playAudio', message: 'playAudio called', data: { messageId, hasCurrentAudio: !!this.currentAudio, currentMessageId: this.currentAudio?.messageId, sampleRate, playbackRate, audioLength: base64Audio?.length, isStopping: this.isStopping, format }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    // Wait if we're currently stopping audio to prevent double-talking
    while (this.isStopping) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Stop any currently playing audio
    this.stop();

    // Wait for cooldown period if audio was just stopped to prevent double-talking
    const timeSinceStop = Date.now() - this.lastStopTime;
    if (timeSinceStop < this.STOP_COOLDOWN_MS) {
      const waitTime = this.STOP_COOLDOWN_MS - timeSinceStop;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // If format is MP3 (ElevenLabs), use HTMLAudioElement
    if (format === 'mp3') {
      // Create audio element
      const audio = new Audio();
      audio.src = `data:audio/mpeg;base64,${base64Audio}`;
      audio.playbackRate = playbackRate;

      // Create promise for playback
      const promise = new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => reject(e);
        audio.play().catch(reject);
      });

      // Store current audio instance
      this.currentAudio = {
        stop: () => {
          audio.pause();
          audio.currentTime = 0;
        },
        promise,
        audioContext: null as any, // MP3 doesn't use AudioContext
        messageId,
      };

      // Notify listeners that audio started
      this.notifyListeners(true);

      // Wait for playback to complete
      try {
        await promise;
      } catch (error) {
        console.error('MP3 Audio playback error:', error);
      } finally {
        // Clear if this is still the current audio
        if (this.currentAudio?.messageId === messageId || this.currentAudio?.promise === promise) {
          this.currentAudio = null;
          this.notifyListeners(false);
        }
      }

      return;
    }

    // Otherwise, use PCM playback (Gemini TTS)
    // Create new audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: sampleRate,
    });

    // Play audio
    const { stop, promise } = playPCM(base64Audio, sampleRate, playbackRate, audioContext);

    // Store current audio instance
    this.currentAudio = {
      stop,
      promise,
      audioContext,
      messageId,
    };

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'audioManager.ts:audioStarted', message: 'Audio playback started', data: { messageId, audioContextSampleRate: audioContext.sampleRate }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    // Notify listeners that audio started
    this.notifyListeners(true);

    // Wait for playback to complete
    try {
      await promise;
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      // Clear if this is still the current audio
      if (this.currentAudio?.messageId === messageId || this.currentAudio?.promise === promise) {
        this.currentAudio = null;
        this.notifyListeners(false);
      }
    }
  }

  /**
   * Stop currently playing audio
   */
  stop(): void {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'audioManager.ts:stop', message: 'stop called', data: { hasCurrentAudio: !!this.currentAudio, currentMessageId: this.currentAudio?.messageId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    if (this.currentAudio) {
      this.isStopping = true; // Set flag to prevent new audio from starting

      try {
        this.currentAudio.stop();
      } catch (e) {
        // Ignore errors when stopping
      }

      try {
        this.currentAudio.audioContext.close().catch(() => { });
      } catch (e) {
        // Ignore errors when closing context
      }

      this.currentAudio = null;
      this.lastStopTime = Date.now(); // Record when audio was stopped
      this.notifyListeners(false);

      // Clear stopping flag after a brief delay to ensure cleanup completes
      setTimeout(() => {
        this.isStopping = false;
      }, 50);
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null;
  }

  /**
   * Get current playing message ID
   */
  getCurrentMessageId(): string | undefined {
    return this.currentAudio?.messageId;
  }

  /**
   * Subscribe to audio state changes
   */
  subscribe(listener: (isPlaying: boolean) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(isPlaying: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(isPlaying);
      } catch (e) {
        console.error('Error in audio state listener:', e);
      }
    });
  }
}

// Singleton instance
export const audioManager = new AudioManager();



