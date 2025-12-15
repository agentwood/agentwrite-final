'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { playPCM } from '@/lib/audio/playPcm';

interface VoiceButtonProps {
  text: string;
  voiceName: string;
  disabled?: boolean;
}

export default function VoiceButton({ text, voiceName, disabled }: VoiceButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);

  const handlePlay = async () => {
    if (isPlaying) {
      // Stop playback (would need to implement stop functionality)
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    try {
      // If we don't have cached audio, fetch it
      if (!audioData) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceName }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate TTS');
        }

        const data = await response.json();
        setAudioData(data.audio);

        // Play the audio
        await playPCM(data.audio, data.sampleRate || 24000);
      } else {
        // Play cached audio
        await playPCM(audioData, 24000);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={disabled || isLoading}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
      title={isPlaying ? 'Stop' : 'Play voice'}
    >
      {isLoading ? (
        <Loader2 size={18} className="animate-spin text-indigo-600" />
      ) : isPlaying ? (
        <VolumeX size={18} className="text-indigo-600" />
      ) : (
        <Volume2 size={18} className="text-gray-400" />
      )}
    </button>
  );
}

