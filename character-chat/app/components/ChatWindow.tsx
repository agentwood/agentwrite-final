'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MessageList from './MessageList';
import Composer from './Composer';
import VoiceButton from './VoiceButton';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp?: number;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string;
  greeting?: string | null;
  voiceName: string;
}

interface ChatWindowProps {
  persona: Persona;
  conversationId: string;
}

export default function ChatWindow({ persona, conversationId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add greeting message
    if (persona.greeting && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          text: persona.greeting,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [persona.greeting, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          characterId: persona.id,
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.filtered) {
          // Content was filtered
          const errorMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            text: errorData.reason || "I'm sorry, I can't discuss that topic. Please keep our conversation appropriate.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.messageId || Date.now().toString(),
        role: 'assistant',
        text: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={persona.avatarUrl}
              alt={persona.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900">{persona.name}</h1>
            <p className="text-xs text-gray-500">Character Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              voiceEnabled
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Voice Replies
          </button>
          <Link
            href={`/call/${persona.id}`}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Phone size={18} />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          voiceEnabled={voiceEnabled}
          voiceName={persona.voiceName}
        />
        {isLoading && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <Composer onSend={handleSend} disabled={isLoading} />
    </div>
  );
}

