'use client';

import { useState } from 'react';
import { Volume2, Star, X } from 'lucide-react';

interface VoiceFeedbackButtonProps {
  messageId: string;
  personaId: string;
  voiceName: string;
  currentParams: {
    speed: number;
    pitch: number;
  };
}

export default function VoiceFeedbackButton({
  messageId,
  personaId,
  voiceName,
  currentParams,
}: VoiceFeedbackButtonProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [ratings, setRatings] = useState({
    voice: 0,
    speed: 0,
    pitch: 0,
    naturalness: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (type: 'voice' | 'speed' | 'pitch' | 'naturalness', value: number) => {
    setRatings({ ...ratings, [type]: value });
  };

  const handleSubmit = async () => {
    try {
      await fetch('/api/voice/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          personaId,
          voiceName,
          voiceRating: ratings.voice || undefined,
          speedRating: ratings.speed || undefined,
          pitchRating: ratings.pitch || undefined,
          naturalnessRating: ratings.naturalness || undefined,
          currentParams,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        setShowFeedback(false);
        setSubmitted(false);
        setRatings({ voice: 0, speed: 0, pitch: 0, naturalness: 0 });
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className="text-xs text-green-600 font-medium px-2 py-1">
        ✓ Saved!
      </div>
    );
  }

  if (!showFeedback) {
    return (
      <button
        onClick={() => setShowFeedback(true)}
        className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        title="Rate voice quality"
      >
        <Volume2 size={14} />
      </button>
    );
  }

  return (
    <div className="absolute right-0 top-0 bg-white border border-zinc-200 rounded-xl p-4 shadow-lg z-50 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-zinc-900">Rate Voice Quality</div>
        <button
          onClick={() => {
            setShowFeedback(false);
            setRatings({ voice: 0, speed: 0, pitch: 0, naturalness: 0 });
          }}
          className="p-1 hover:bg-zinc-100 rounded"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="text-xs text-zinc-600 mb-1">Voice Quality</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating('voice', star)}
                className={`p-1 ${ratings.voice >= star ? 'text-yellow-400' : 'text-zinc-300'} hover:scale-110 transition-transform`}
              >
                <Star size={12} fill={ratings.voice >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-600 mb-1">Speed</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating('speed', star)}
                className={`p-1 ${ratings.speed >= star ? 'text-yellow-400' : 'text-zinc-300'} hover:scale-110 transition-transform`}
              >
                <Star size={12} fill={ratings.speed >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-600 mb-1">Pitch</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating('pitch', star)}
                className={`p-1 ${ratings.pitch >= star ? 'text-yellow-400' : 'text-zinc-300'} hover:scale-110 transition-transform`}
              >
                <Star size={12} fill={ratings.pitch >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs text-zinc-600 mb-1">Naturalness</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating('naturalness', star)}
                className={`p-1 ${ratings.naturalness >= star ? 'text-yellow-400' : 'text-zinc-300'} hover:scale-110 transition-transform`}
              >
                <Star size={12} fill={ratings.naturalness >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSubmit}
          disabled={ratings.voice === 0 && ratings.speed === 0 && ratings.pitch === 0 && ratings.naturalness === 0}
          className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
        <button
          onClick={() => {
            setShowFeedback(false);
            setRatings({ voice: 0, speed: 0, pitch: 0, naturalness: 0 });
          }}
          className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-lg hover:bg-zinc-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}




