'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Volume2, VolumeX, MoreVertical, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import ChatSidebar from './ChatSidebar';
import VoiceButton from './VoiceButton';
import VoiceFeedbackButton from './VoiceFeedbackButton';
import QuotaExceededModal from './QuotaExceededModal';
import AdBanner from './AdBanner';
import SafeImage from './SafeImage';
import { getAuthHeaders } from '@/lib/auth';
import { audioManager } from '@/lib/audio/audioManager';

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
  styleHint?: string | null; // For accent locking
  archetype?: string | null; // For better voice config
  tagline?: string | null;
  description?: string | null;
  category: string;
  followerCount?: number;
  viewCount?: number;
  interactionCount?: number;
  saveCount?: number;
  commentCount?: number;
}

interface ChatWindowProps {
  persona: Persona;
  conversationId: string;
}

// Extract dialogue for TTS by removing action descriptions (*actions*)
// Character.AI style uses *asterisks* for actions/emotions, plain text for dialogue
function extractDialogueForTTS(text: string): string {
  // Remove action descriptions (text between asterisks like *smiles*)
  let dialogueText = text.replace(/\*[^*]+\*/g, '');

  // Clean up extra whitespace created by removing actions
  dialogueText = dialogueText.replace(/\s+/g, ' ').trim();

  // If after removing actions there's still text, use it
  if (dialogueText.length > 0) {
    console.log('[TTS] Dialogue extracted for TTS', {
      originalLength: text.length,
      dialogueLength: dialogueText.length,
      extracted: dialogueText.substring(0, 100) + (dialogueText.length > 100 ? '...' : ''),
    });
    return dialogueText;
  }

  // If the message is ONLY actions (no dialogue), return empty
  console.log('[TTS] No dialogue found in message - skipping action descriptions', {
    originalLength: text.length,
    hasAsterisks: text.includes('*'),
  });
  return '';
}

// Component to format messages with action descriptions and emphasis
function FormattedMessage({ text }: { text: string }) {
  // Parse text with emphasis (*text*) and dialogue ('text')
  // Process in order to avoid conflicts
  const parts: Array<{ type: 'text' | 'emphasis' | 'dialogue'; content: string }> = [];
  let remaining = text;
  let key = 0;

  // Process all matches, handling nested/overlapping patterns
  while (remaining.length > 0) {
    // Find next emphasis or dialogue (whichever comes first)
    const emphasisMatch = remaining.match(/^\*([^*]+)\*/);
    const dialogueMatch = remaining.match(/^'([^']+)'/);

    if (emphasisMatch) {
      // Add emphasis
      parts.push({ type: 'emphasis', content: emphasisMatch[1] });
      remaining = remaining.substring(emphasisMatch[0].length);
    } else if (dialogueMatch) {
      // Add dialogue
      parts.push({ type: 'dialogue', content: dialogueMatch[1] });
      remaining = remaining.substring(dialogueMatch[0].length);
    } else {
      // Find next special marker
      const nextEmphasis = remaining.indexOf('*');
      const nextDialogue = remaining.indexOf("'");

      let nextMarker = -1;
      if (nextEmphasis !== -1 && nextDialogue !== -1) {
        nextMarker = Math.min(nextEmphasis, nextDialogue);
      } else if (nextEmphasis !== -1) {
        nextMarker = nextEmphasis;
      } else if (nextDialogue !== -1) {
        nextMarker = nextDialogue;
      }

      if (nextMarker > 0) {
        // Add text before marker
        parts.push({ type: 'text', content: remaining.substring(0, nextMarker) });
        remaining = remaining.substring(nextMarker);
      } else if (nextMarker === 0) {
        // Skip single marker (unmatched)
        parts.push({ type: 'text', content: remaining[0] });
        remaining = remaining.substring(1);
      } else {
        // No more markers, add remaining text
        if (remaining.length > 0) {
          parts.push({ type: 'text', content: remaining });
        }
        break;
      }
    }
  }

  // If no special formatting found, return original text
  if (parts.length === 0 || (parts.length === 1 && parts[0].type === 'text')) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, idx) => {
        if (part.type === 'emphasis') {
          return <em key={`${idx}-${key++}`} className="italic font-semibold">{part.content}</em>;
        } else if (part.type === 'dialogue') {
          return <span key={`${idx}-${key++}`} className="font-medium">'{part.content}'</span>;
        } else {
          return <span key={`${idx}-${key++}`}>{part.content}</span>;
        }
      })}
    </span>
  );
}

export default function ChatWindow({ persona, conversationId }: ChatWindowProps) {
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:42', message: 'ChatWindow render - VOICE DEBUG', data: { personaId: persona?.id, personaName: persona?.name, conversationId, hasGreeting: !!persona?.greeting, hasVoiceName: !!persona?.voiceName, voiceNameReceived: persona?.voiceName, voiceNameType: typeof persona?.voiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
  }
  // #endregion

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Default to enabled (speech-first)
  const [isMuted, setIsMuted] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [quotaModal, setQuotaModal] = useState<{
    isOpen: boolean;
    type: 'messages' | 'tts' | 'calls';
    currentUsage: number;
    limit: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ref to prevent double-fire of greeting auto-play (React Strict Mode)
  const greetingPlayedRef = useRef<boolean>(false);
  // Ref to track last auto-played message to prevent VoiceButton from re-fetching
  const lastAutoPlayedMessageRef = useRef<string | null>(null);
  // Ref to prevent multiple simultaneous playVoiceForMessage calls
  const isPlayingVoiceRef = useRef<boolean>(false);

  // Auto-play voice for assistant messages (defined first so handleSendMessage can use it)
  const playVoiceForMessage = useCallback(async (text: string, messageId: string) => {
    if (!persona.voiceName || isMuted) return;

    // Prevent multiple simultaneous calls - check BEFORE any async operations
    if (isPlayingVoiceRef.current) {
      console.log('Voice playback already in progress, skipping duplicate call');
      return;
    }

    // Mark as playing IMMEDIATELY to prevent race conditions (synchronous operation)
    isPlayingVoiceRef.current = true;

    // Extract ONLY dialogue (quoted text) for TTS - never read action descriptions
    const dialogueText = extractDialogueForTTS(text);

    // If no dialogue found, don't play anything (action descriptions should not be read)
    if (!dialogueText || dialogueText.trim().length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:163', message: 'No dialogue found, skipping TTS', data: { messageId, originalTextLength: text.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
      isPlayingVoiceRef.current = false; // Reset flag before returning
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:171', message: 'playVoiceForMessage called - VOICE DEBUG', data: { messageId, originalTextLength: text.length, dialogueTextLength: dialogueText.length, personaVoiceName: persona.voiceName, personaName: persona.name, isMuted }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
    // #endregion

    // Stop any currently playing audio (using shared audio manager)
    // The audioManager will handle cooldown internally to prevent double-talking
    audioManager.stop();

    // Wait for audio context cleanup and cooldown (audioManager has built-in cooldown, but extra delay ensures smooth transition)
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const requestBody = {
        text: dialogueText, // ONLY dialogue, not action descriptions
        voiceName: persona.voiceName, // HARD-CODED: Always use stored voiceName from database
        styleHint: persona.styleHint, // LOCKED: Always use stored styleHint for accent consistency
        personaId: persona.id,
        characterName: persona.name,
        archetype: persona.archetype || persona.category, // Use archetype if available
        category: persona.category,
        tagline: persona.tagline,
        description: persona.description,
      };

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:188', message: 'Sending TTS request - VOICE DEBUG', data: { voiceNameInRequest: requestBody.voiceName, styleHint: requestBody.styleHint, personaId: requestBody.personaId, characterName: requestBody.characterName, dialogueLength: dialogueText.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        // Check if audio data exists
        if (!data.audio) {
          console.error('No audio data in TTS response:', data);
          // Show user-friendly error
          alert('Audio error: No audio data returned from API. Please try again.');
          return;
        }

        const playbackRate = Math.max(0.8, Math.min(1.5, data.playbackRate || data.parameters?.speed || 1.0));

        // Use shared audio manager to play audio (automatically stops any currently playing audio)
        try {
          await audioManager.playAudio(
            data.audio,
            data.sampleRate || 24000,
            playbackRate,
            messageId,
            data.format // Pass format (mp3, wav, pcm) for proper playback handling
          );
        } catch (error) {
          // Log but don't throw - audio errors shouldn't break the UI
          console.error('Audio playback error:', error);
          alert(`Audio error: ${error instanceof Error ? error.message : 'Failed to play audio'}`);
        }
      } else {
        // Handle TTS quota errors gracefully
        const errorData = await response.json().catch(() => ({}));
        if (errorData.quotaExceeded || response.status === 429) {
          // Show quota modal only once (use state to track)
          if (!quotaModal?.isOpen) {
            // If currentUsage is not provided, use limit as currentUsage (quota is exceeded)
            const currentUsage = errorData.currentUsage !== undefined
              ? errorData.currentUsage
              : (errorData.limit || 0);
            const limit = errorData.limit || 0;

            setQuotaModal({
              isOpen: true,
              type: 'tts',
              currentUsage: currentUsage,
              limit: limit,
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Error auto-playing voice:', error);
      // Don't show alert for auto-play failures, just log
      // Audio manager will handle cleanup automatically
    } finally {
      // Always reset the playing flag
      isPlayingVoiceRef.current = false;
    }
  }, [persona, isMuted]);

  // Generate unique message ID
  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // IMPORTANT: Stop any currently playing audio immediately when user sends a new message
    audioManager.stop();

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      text: messageText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
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

        // Handle quota exceeded
        if (errorData.quotaExceeded) {
          setQuotaModal({
            isOpen: true,
            type: 'messages',
            currentUsage: errorData.currentUsage || 50,
            limit: errorData.limit || 50,
          });
          setIsLoading(false);
          return;
        }

        if (errorData.filtered) {
          const errorMessage: Message = {
            id: generateMessageId(),
            role: 'assistant',
            text: errorData.reason || "I'm sorry, I can't discuss that topic. Please keep our conversation appropriate.",
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }

        // Show user-friendly error message
        const errorMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          text: errorData.error || errorData.reason || "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.messageId || generateMessageId(),
        role: 'assistant',
        text: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastMessageId(assistantMessage.id);

      // Auto-play voice for assistant message (speech-first)
      if (!isMuted && persona.voiceName) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChatWindow.tsx:newMsgAutoPlay', message: 'Auto-playing new assistant message', data: { messageId: assistantMessage.id, voiceName: persona.voiceName, textLength: assistantMessage.text.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
        // #endregion
        lastAutoPlayedMessageRef.current = assistantMessage.id;
        playVoiceForMessage(assistantMessage.text, assistantMessage.id);
      }

      // Clear URL param after sending
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, persona.id, messages, isLoading, isMuted, playVoiceForMessage]);

  useEffect(() => {
    // Check for chat starter message from URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const starterMessage = urlParams.get('message');

      if (starterMessage && messages.length === 0) {
        // Auto-send the chat starter message
        setTimeout(() => {
          handleSendMessage(starterMessage);
        }, 500);
        return;
      }
    }

    // Add greeting message and auto-play voice
    if (persona.greeting && messages.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChatWindow.tsx:greetingEffect', message: 'Greeting effect triggered', data: { hasGreeting: !!persona.greeting, messagesLength: messages.length, isMuted, hasVoiceName: !!persona.voiceName, personaName: persona.name, alreadyPlayed: greetingPlayedRef.current }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
      // #endregion

      const greetingMessage: Message = {
        id: 'greeting',
        role: 'assistant',
        text: persona.greeting,
        timestamp: Date.now(),
      };
      setMessages([greetingMessage]);

      // Auto-play greeting voice (speech-first) - ONLY if not already played (prevent Strict Mode double-fire)
      if (!isMuted && persona.voiceName && !greetingPlayedRef.current) {
        greetingPlayedRef.current = true; // Mark as played IMMEDIATELY to prevent double-fire

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChatWindow.tsx:greetingAutoPlay', message: 'Scheduling greeting auto-play (first time only)', data: { voiceName: persona.voiceName, personaName: persona.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
        // #endregion

        setTimeout(() => {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'ChatWindow.tsx:greetingTimeout', message: 'Greeting timeout fired - calling playVoiceForMessage', data: { voiceName: persona.voiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' }) }).catch(() => { });
          // #endregion
          lastAutoPlayedMessageRef.current = 'greeting';
          playVoiceForMessage(persona.greeting!, 'greeting');
        }, 500);
      }
    }
  }, [persona.greeting, messages.length, handleSendMessage, isMuted, persona.voiceName, playVoiceForMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup: Stop audio when component unmounts or user leaves chat
  useEffect(() => {
    return () => {
      // Stop any playing audio when component unmounts
      // Stop any currently playing audio using shared audio manager
      audioManager.stop();
    };
  }, []);

  const handleSend = async () => {
    await handleSendMessage(inputText);
    setInputText('');
  };

  const handleRegenerate = async () => {
    if (!lastMessageId || messages.length < 2) return;

    // Remove last assistant message
    const newMessages = messages.filter(m => m.id !== lastMessageId);
    setMessages(newMessages);
    setIsLoading(true);

    // Get last user message
    const lastUserMessage = [...newMessages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          characterId: persona.id,
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: data.messageId || generateMessageId(),
          role: 'assistant',
          text: data.text,
          timestamp: Date.now(),
        };
        setMessages([...newMessages, assistantMessage]);
        setLastMessageId(assistantMessage.id);

        // Auto-play voice for regenerated message (speech-first)
        if (!isMuted && persona.voiceName) {
          playVoiceForMessage(assistantMessage.text, assistantMessage.id);
        }
      }
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#121212] overflow-hidden fade-in text-white">
      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Ad Banner for Free Users */}
        <AdBanner variant="banner" className="sticky top-0 z-10" />

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pt-12 pb-32 px-4 md:px-0">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Header Profile Info */}
            <div className="flex flex-col items-center text-center mb-16">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl mb-6 p-0.5 bg-black/50">
                <SafeImage
                  src={persona.avatarUrl}
                  alt={persona.name}
                  className="w-full h-full rounded-full object-cover"
                  fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{persona.name}</h1>
              <p className="text-sm text-gray-400 max-w-md font-medium px-6">
                {persona.tagline || ''}
              </p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-3">
                By @{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}
              </p>
            </div>

            {/* Messages */}
            <div className="space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'assistant' && (
                    <>
                      {/* Header with avatar and name */}
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <SafeImage
                          src={persona.avatarUrl}
                          className="w-6 h-6 rounded-full object-cover border border-white/10"
                          alt={persona.name}
                          fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                        />
                        <span className="text-xs font-bold text-gray-300">{persona.name}</span>
                        <span className="px-1.5 py-0.5 bg-black/30 text-gray-500 text-[9px] font-black rounded uppercase">AI</span>
                      </div>

                      {/* Small play button ABOVE message - Character.AI style */}
                      <div className="flex items-center gap-1.5 mb-2 ml-1">
                        <VoiceButton
                          text={msg.text}
                          voiceName={persona.voiceName}
                          messageId={msg.id}
                          personaId={persona.id}
                          styleHint={persona.styleHint}
                          characterName={persona.name}
                          archetype={persona.archetype || persona.category}
                          category={persona.category}
                          tagline={persona.tagline}
                          description={persona.description}
                          compact={true}
                        />
                        <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-bold rounded">Free</span>
                      </div>
                    </>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none ml-auto'
                    : 'bg-[#1e1e1e] text-gray-200 border border-white/5 rounded-tl-none'
                    }`}>
                    <FormattedMessage text={msg.text} />
                  </div>

                  {/* Bottom actions for assistant messages */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-3 mt-2 ml-2 text-gray-500">
                      <VoiceFeedbackButton
                        messageId={msg.id}
                        personaId={persona.id}
                        voiceName={persona.voiceName}
                        currentParams={{ speed: 1.0, pitch: 1.0 }}
                      />
                      <button className="p-1 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5 10h2a2 2 0 002-2v-6a2 2 0 00-2-2h-2.5"></path></svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-2 ml-1">
                    <SafeImage
                      src={persona.avatarUrl}
                      className="w-6 h-6 rounded-full object-cover"
                      alt={persona.name}
                      fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                    />
                    <span className="text-xs font-bold text-gray-300">{persona.name}</span>
                  </div>
                  <div className="bg-[#1e1e1e] px-6 py-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Floating Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center bg-gradient-to-t from-[#121212] via-[#121212]/95 to-transparent">
          <div className="w-full max-w-3xl flex items-center gap-3">
            <div className="flex-1 relative">
              <div className="bg-[#1e1e1e] rounded-3xl p-2 pl-4 flex items-center gap-3 border border-white/10 shadow-2xl">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Message ${persona.name}...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-gray-500 text-sm py-3"
                  autoComplete="off"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading}
                  className={`p-2.5 rounded-full transition-all ${inputText.trim() && !isLoading ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' : 'text-gray-500'}`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 font-medium mt-3">
            AI characters can make mistakes. Please double-check facts.
          </p>
        </div>
      </div>

      {/* Quota Exceeded Modal */}
      {quotaModal && (
        <QuotaExceededModal
          isOpen={quotaModal.isOpen}
          onClose={() => setQuotaModal(null)}
          type={quotaModal.type}
          currentUsage={quotaModal.currentUsage}
          limit={quotaModal.limit}
        />
      )}

      {/* Right Panel - Character Art (Desktop only) */}
      <div className="hidden xl:flex flex-col w-[380px] h-full relative shrink-0 border-l border-white/5 bg-black">
        {/* Character Full Art */}
        <div className="relative flex-1 overflow-hidden">
          <SafeImage
            src={persona.avatarUrl}
            className="w-full h-full object-cover opacity-80"
            alt={persona.name}
            fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#121212]/20 to-[#121212]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />

          {/* Image gallery thumbnails */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/30 hover:border-white/60 transition-colors cursor-pointer">
              <SafeImage
                src={persona.avatarUrl}
                className="w-full h-full object-cover"
                alt="variant"
              />
            </div>
          </div>
        </div>

        {/* Character Info Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#121212] to-transparent">
          <h3 className="text-2xl font-bold text-white/90 drop-shadow-xl mb-1">{persona.name}</h3>
          <p className="text-white/60 text-sm backdrop-blur-sm bg-black/30 inline-block px-2 py-0.5 rounded">
            @{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Online
            </span>
            <span>|</span>
            <span>{persona.archetype || 'Character'}</span>
          </div>

          {/* Tabs placeholder */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-white/80 text-sm font-medium hover:text-white transition-colors"
              title="Chat"
            >💬</button>
            <button
              onClick={() => alert('Stats coming soon!')}
              className="text-white/50 text-sm font-medium hover:text-white transition-colors"
              title="Statistics"
            >📊</button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="text-white/50 text-sm font-medium hover:text-white transition-colors"
              title="Settings"
            >⚙️</button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (kept for settings) */}
      <div className="xl:hidden">
        <ChatSidebar
          persona={persona}
          conversationId={conversationId}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
        />
      </div>
    </div>
  );
}
