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
      if (currentMessageId === messageId && isPlayingAudio) {
        setIsPlaying(true);
        setIsLoading(false); // Stop loading if playing started
      } else {
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
    setIsLoading(true);

    try {
      // Use audioManager.playVoice to handle deduplication and race conditions
      // fetcher function is passed to be executed only if needed
      await audioManager.playVoice(messageId || 'unknown', async () => {
        // If we have cached audio, return it immediately
        if (audioData) {
          return {
            audio: audioData,
            sampleRate: cachedSampleRate,
            format: cachedFormat
          };
        }

        // Otherwise fetch fresh
        // Cancel any previous request logic is now handled by audioManager effectively logic
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: extractDialogue(text),
            voiceName,
            personaId,
            styleHint,
            characterName,
            archetype,
            category,
            tagline,
            description,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('TTS quota exceeded');
            return null;
          }
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || err.reason || `TTS Error ${response.status}`);
        }

        const data = await response.json();
        if (!data.audio) throw new Error('No audio data received');

        // Cache the result
        setAudioData(data.audio);
        setCachedSampleRate(data.sampleRate || 24000);
        setCachedFormat(data.format);

        return {
          audio: data.audio,
          sampleRate: data.sampleRate,
          format: data.format
        };
      });

    } catch (error: any) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      // Alerts handled by UI mostly, but we can verify
      if (error.name !== 'AbortError') {
        // Optional alert
      }
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
