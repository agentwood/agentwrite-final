'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { resample48kTo16k } from '@/lib/audio/resample';
import { playPCM } from '@/lib/audio/playPcm';

interface Persona {
  id: string;
  name: string;
  avatarUrl: string;
  systemPrompt: string;
  voiceName: string;
}

interface CallUIProps {
  persona: Persona;
}

export default function CallUI({ persona }: CallUIProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const connectToLiveAPI = async () => {
    setIsLoading(true);
    try {
      // Get ephemeral token
      const tokenResponse = await fetch('/api/live-token', {
        method: 'POST',
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get live token');
      }

      const { token } = await tokenResponse.json();

      // Connect to Live API WebSocket
      // The WebSocket URL should include the API key as a query parameter
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService/BidiGenerateContent?key=${apiKey}`;
      
      // Note: In production, you should use the token from the server
      // For now, we'll use the API key directly (client-side requires NEXT_PUBLIC_ prefix)
      // Better approach: Use the token from /api/live-token endpoint
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsLoading(false);

        // Send setup message with token
        const setupMessage = {
          setup: {
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            generationConfig: {
              responseModalities: ['AUDIO'],
            },
            systemInstruction: {
              parts: [{ text: persona.systemPrompt }],
            },
            tools: [],
          },
          // Include token in setup (or use Authorization header)
          token: token,
        };

        ws.send(JSON.stringify(setupMessage));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.serverContent?.modelTurn?.parts) {
          // Received audio from model
          for (const part of data.serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
              // Play the audio
              try {
                await playPCM(part.inlineData.data, 24000);
              } catch (error) {
                console.error('Error playing audio:', error);
              }
            }
          }
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting to Live API:', error);
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (!isRecording || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const resampled = resample48kTo16k(new Float32Array(inputData));

        // Convert to PCM16 and send
        const int16Array = new Int16Array(resampled.length);
        for (let i = 0; i < resampled.length; i++) {
          int16Array[i] = Math.max(-32768, Math.min(32767, Math.round(resampled[i] * 32767)));
        }

        const bytes = new Uint8Array(int16Array.buffer);
        const base64 = btoa(String.fromCharCode(...bytes));

        wsRef.current.send(
          JSON.stringify({
            clientContent: {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/pcm',
                    data: base64,
                  },
                },
              ],
            },
          })
        );
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const endCall = () => {
    stopRecording();
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back
        </Link>
        <h1 className="font-bold text-lg">Audio Call</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Character Card */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white shadow-lg mx-auto mb-4">
            <Image
              src={persona.avatarUrl}
              alt={persona.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{persona.name}</h2>
          <p className="text-gray-600">
            {isConnected ? (isRecording ? 'Listening...' : 'Connected') : 'Not connected'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {!isConnected ? (
            <button
              onClick={connectToLiveAPI}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Call'
              )}
            </button>
          ) : (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <PhoneOff size={20} />
                End Call
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

