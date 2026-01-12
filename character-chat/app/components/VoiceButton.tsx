'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { audioManager } from '@/lib/audio/audioManager';

interface VoiceButtonProps {
  text: string;
  voiceName: string;
  messageId?: string; // Add messageId for tracking which message is playing
  disabled?: boolean;
  characterName?: string;
  archetype?: string;
  category?: string;
  tagline?: string | null;
  description?: string | null;
  personaId?: string;
  styleHint?: string | null;
  compact?: boolean; // Small button style for above messages
}

export default function VoiceButton({
  text,
  voiceName,
  messageId, // Add messageId parameter
  disabled,
  characterName,
  archetype,
  category,
  tagline,
  description,
  personaId,
  styleHint,
  compact = false, // Default to full-size button
}: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDuration, setLoadingDuration] = useState(0); // Track how long we've been loading
  const [audioData, setAudioData] = useState<string | null>(null);
  const [cachedPlaybackRate, setCachedPlaybackRate] = useState<number>(1.25); // Store playback rate with cached audio
  const [cachedSampleRate, setCachedSampleRate] = useState<number>(24000); // Store sample rate with cached audio
  const [cachedFormat, setCachedFormat] = useState<string | undefined>(undefined); // Store format (mp3, wav, pcm) with cached audio
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track loading duration for cold start feedback
  useEffect(() => {
    if (isLoading) {
      setLoadingDuration(0);
      loadingTimerRef.current = setInterval(() => {
        setLoadingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      setLoadingDuration(0);
    }
    return () => {
      if (loadingTimerRef.current) {
        clearInterval(loadingTimerRef.current);
      }
    };
  }, [isLoading]);

  // Extract dialogue for TTS by removing action descriptions (*actions*)
  // Character.AI style uses *asterisks* for actions/emotions, plain text for dialogue
  const extractDialogue = (text: string): string => {
    // Remove action descriptions (text between asterisks like *smiles*)
    let dialogueText = text.replace(/\*[^*]+\*/g, '');

    // Clean up extra whitespace created by removing actions
    dialogueText = dialogueText.replace(/\s+/g, ' ').trim();

    // If after stripping actions we have nothing, fall back to original text 
    // (to avoid silence if the message was only actions or malformed)
    if (!dialogueText) {
      return text.trim();
    }

    return dialogueText;
  };

  // Subscribe to audio manager state changes
  useEffect(() => {
    const unsubscribe = audioManager.subscribe((isPlayingAudio) => {
      // Only update playing state if this message is the currently playing one
      const currentMessageId = audioManager.getCurrentMessageId();
      if (currentMessageId === messageId || !isPlayingAudio) {
        setIsPlaying(isPlayingAudio);
      } else if (isPlayingAudio && currentMessageId !== messageId) {
        // Some other message is playing, this one should show "Play"
        setIsPlaying(false);
      }
    });
    return unsubscribe;
  }, [messageId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Stop audio if this component was playing
      audioManager.stop();
    };
  }, []);

  const handlePlay = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/VoiceButton.tsx:53', message: 'handlePlay called', data: { isPlaying, hasAudioData: !!audioData, voiceName, characterName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    // Debounce rapid clicks (50ms - reduced for responsiveness)
    debounceTimeoutRef.current = setTimeout(async () => {
      // If already playing, stop it first
      if (audioManager.isPlaying()) {
        audioManager.stop();
        setIsPlaying(false);
        return;
      }

      // If loading, don't allow another click
      if (isLoading) {
        return;
      }

      await executePlay();
    }, 50);
  };

  const executePlay = async () => {
    try {
      // Extract ONLY dialogue for TTS
      const dialogueText = extractDialogue(text);

      // If no dialogue found, silently skip (don't show alert - user can see formatted message)
      if (!dialogueText || dialogueText.trim().length === 0) {
        // Silently return - the formatted message already shows action descriptions
        return;
      }

      setIsLoading(true);

      // Stop any currently playing audio (including auto-play from ChatWindow)
      audioManager.stop();
      // If we don't have cached audio, fetch it
      if (!audioData) {
        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/VoiceButton.tsx:108', message: 'Fetching fresh TTS (first play)', data: { dialogueLength: dialogueText.length, voiceName, characterName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
        // #endregion

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal, // Add abort signal
          body: JSON.stringify({
            text: dialogueText, // ONLY dialogue, not action descriptions
            voiceName,
            // Pass personaId and styleHint for consistent voice/accent
            personaId,
            styleHint,
            // Pass character info for advanced voice config
            characterName,
            archetype,
            category,
            tagline,
            description,
          }),
        });

        if (!response.ok) {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            setIsLoading(false);
            return;
          }

          let errorData: any = {};
          const contentType = response.headers.get('content-type');

          // Try to parse error response
          try {
            if (contentType?.includes('application/json')) {
              errorData = await response.json();
            } else {
              const text = await response.text();
              errorData = { error: text || `HTTP ${response.status}` };
            }
          } catch (parseError) {
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }

          // Check if it's a quota error - handle gracefully
          if (errorData.quotaExceeded || response.status === 429 || errorData.error?.includes('quota')) {
            // Don't throw - just log and return (modal will be shown by ChatWindow)
            console.warn('TTS quota exceeded - audio disabled');
            setIsLoading(false);
            setIsPlaying(false);
            return;
          }

          // For other errors, show user-friendly message (don't throw - handle gracefully)
          const errorMessage = errorData.error || errorData.reason || `Failed to generate TTS (${response.status})`;
          console.error('TTS API Error:', {
            status: response.status,
            statusText: response.statusText,
            errorData: Object.keys(errorData).length > 0 ? errorData : 'Empty error response',
            url: '/api/tts',
          });

          // Don't throw - just show error and return
          setIsLoading(false);
          setIsPlaying(false);
          alert(`Audio error: ${errorMessage}. Please try again.`);
          return;
        }

        // Check if request was aborted before parsing
        if (abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
          return;
        }

        // Parse response JSON safely
        let data: any;
        try {
          data = await response.json();
        } catch (parseError: any) {
          console.error('Failed to parse TTS response:', parseError);
          setIsLoading(false);
          setIsPlaying(false);
          alert('Audio error: Invalid response from server. Please try again.');
          return;
        }

        // Check if audio data exists
        if (!data.audio) {
          console.error('No audio data in TTS response:', data);
          alert('Audio error: No audio data returned from API. Please try again.');
          setIsLoading(false);
          setIsPlaying(false);
          return;
        }

        // Check again after async operation
        if (abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
          return;
        }

        setAudioData(data.audio);

        // Calculate playback rate and clamp to reasonable range (0.8x to 1.5x to prevent squeaky sounds)
        // F5-TTS generates natural speech - enforce 1.0x playback rate
        const playbackRate = 1.0;
        const sampleRate = data.sampleRate || 24000;

        // Store playback rate, sample rate, and format with cached audio
        setCachedPlaybackRate(playbackRate);
        setCachedSampleRate(sampleRate);
        setCachedFormat(data.format);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/VoiceButton.tsx:163', message: 'TTS response received (first play)', data: { hasAudio: !!data.audio, sampleRate, playbackRate, voiceUsed: data.voiceUsed, format: data.format }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
        // #endregion

        // Use shared audio manager to play audio (automatically stops any currently playing audio)
        // Pass format parameter for MP3 vs PCM handling
        try {
          await audioManager.playAudio(data.audio, sampleRate, playbackRate, messageId, data.format);
        } catch (error) {
          console.error('Audio playback error:', error);
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/VoiceButton.tsx:177', message: 'Playing cached audio (second play)', data: { hasAudioData: !!audioData, cachedPlaybackRate, cachedSampleRate }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion

        // Use shared audio manager to play cached audio (automatically stops any currently playing audio)
        try {
          await audioManager.playAudio(audioData, cachedSampleRate, cachedPlaybackRate, messageId, cachedFormat);
        } catch (error) {
          console.error('Audio playback error:', error);
        }
      }
    } catch (error: any) {
      // Check if error is due to abort (user clicked again)
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
        return;
      }

      console.error('Error playing audio:', error);
      // Check if it's a quota error - show modal once, not alert every time
      const errorMsg = error.message || 'Failed to play audio';

      // For quota errors, show modal only once (component will handle state)
      if (errorMsg.includes('quota') || errorMsg.includes('Quota exceeded')) {
        // Don't show alert - let the QuotaExceededModal handle it
        // The modal is shown from ChatWindow when TTS fails
        console.warn('TTS quota exceeded - audio disabled');
      } else {
        // Only show alert for non-quota errors
        alert(`Audio error: ${errorMsg}`);
      }
    } finally {
      setIsLoading(false);
      // isPlaying state is managed by audio manager subscription
    }
  };

  // Compact style: small icon-only button
  // Full style: larger button with text
  const buttonClasses = compact
    ? 'flex items-center justify-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
    : 'flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg min-w-[120px]';

  const iconSize = compact ? 12 : 20;

  return (
    <button
      onClick={handlePlay}
      disabled={disabled || isLoading}
      className={buttonClasses}
      title={isPlaying ? 'Stop' : 'Play voice'}
    >
      {isLoading ? (
        <>
          <Loader2 size={iconSize} className="animate-spin" />
          {!compact && (
            <span>
              {loadingDuration >= 3
                ? `Warming up... ${loadingDuration}s`
                : 'Loading...'}
            </span>
          )}
        </>
      ) : isPlaying ? (
        <>
          <Pause size={iconSize} fill="currentColor" />
          {!compact && <span>Pause</span>}
        </>
      ) : (
        <>
          <Play size={iconSize} fill="currentColor" />
          {!compact && <span>Play</span>}
        </>
      )}
    </button>
  );
}
