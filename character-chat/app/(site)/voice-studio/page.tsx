'use client';

import { useState, useEffect } from 'react';
import { Mic2, Play, Volume2, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import LockedFeature from '@/app/components/LockedFeature';
import { getSubscriptionStatus } from '@/lib/subscription';

export default function VoiceStudioPage() {
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [testText, setTestText] = useState('Hello, this is a test of the voice system.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionStatus(null).then(status => {
      setIsPremium(status.planId !== 'free');
      setLoading(false);
    });
  }, []);

  const voices = [
    { name: 'Puck', description: 'Energetic and playful' },
    { name: 'Kore', description: 'Calm and soothing' },
    { name: 'Charon', description: 'Deep and mysterious' },
    { name: 'Aoede', description: 'Warm and friendly' },
    { name: 'Fenrir', description: 'Strong and confident' },
  ];

  const handleTestVoice = async () => {
    if (!testText.trim() || isPlaying) return;
    
    setIsPlaying(true);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText, voiceName: selectedVoice }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to generate TTS');
      }

      const data = await response.json();
      const { playPCM } = await import('@/lib/audio/playPcm');
      await playPCM(data.audio, data.sampleRate || 24000);
    } catch (error: any) {
      console.error('Error playing voice:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900">Voice Studio</h1>
          </div>
          <p className="text-zinc-600">Test and customize character voices</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isPremium ? (
          <LockedFeature
            featureName="Voice Studio"
            planRequired="starter"
            className="min-h-[400px]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Voice Selection */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-zinc-900 mb-4">Available Voices</h2>
                  <div className="space-y-2">
                    {voices.map((voice) => (
                      <div
                        key={voice.name}
                        className="w-full text-left p-4 rounded-xl border-2 border-zinc-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-zinc-900">{voice.name}</div>
                            <div className="text-sm text-zinc-500">{voice.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-zinc-200 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-zinc-900 mb-4">Test Voice</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Enter text to test
                      </label>
                      <textarea
                        placeholder="Type something to hear the voice..."
                        className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-xl resize-none"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </LockedFeature>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Voice Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Available Voices</h2>
              <div className="space-y-2">
                {voices.map((voice) => (
                  <button
                    key={voice.name}
                    onClick={() => setSelectedVoice(voice.name)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedVoice === voice.name
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-zinc-900">{voice.name}</div>
                        <div className="text-sm text-zinc-500">{voice.description}</div>
                      </div>
                      {selectedVoice === voice.name && (
                        <Volume2 className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Test Voice</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Enter text to test
                  </label>
                  <textarea
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Type something to hear the voice..."
                    className="w-full h-32 px-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleTestVoice}
                    disabled={!testText.trim() || isPlaying}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Playing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Play Voice
                      </>
                    )}
                  </button>
                  
                  <div className="text-sm text-zinc-500">
                    Selected: <span className="font-semibold text-zinc-900">{selectedVoice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Settings */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-zinc-600" />
                <h2 className="text-lg font-semibold text-zinc-900">Voice Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Speed
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Pitch
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    defaultValue="1"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
