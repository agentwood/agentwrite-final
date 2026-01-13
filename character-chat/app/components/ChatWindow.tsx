'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Volume2, VolumeX, MoreVertical, RefreshCw, MessageCircle, Heart, Share2, Plus, Settings, ChevronRight, Sparkles, Image as ImageIcon, Mic } from 'lucide-react';
import Link from 'next/link';
import ChatSidebar from './ChatSidebar';
import VoiceButton from './VoiceButton';
import VoiceFeedbackButton from './VoiceFeedbackButton';
import QuotaExceededModal from './QuotaExceededModal';
import CuratingModal from './CuratingModal';
import AdBanner from './AdBanner';
import SafeImage from './SafeImage';
import { getAuthHeaders } from '@/lib/auth';
import { audioManager } from '@/lib/audio/audioManager';
import { supertonicGenerator } from '@/lib/audio/supertonicGenerator';

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
  initialMessages?: Message[];
  initialMessage?: string; // Optional starter message to auto-send
  onBack?: () => void;
}

export function extractDialogueForTTS(text: string): string {
  // Remove action descriptions (text between asterisks like *smiles*)
  // This ensures we ONLY read the spoken dialogue
  let dialogueText = text.replace(/\*[^*]+\*/g, '');

  // Clean up extra whitespace created by removing actions
  dialogueText = dialogueText.replace(/\s+/g, ' ').trim();

  // If after stripping actions we have nothing, fall back to original text 
  // (to avoid silence if the message was only actions or malformed)
  if (!dialogueText) {
    return text.trim();
  }

  return dialogueText;
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

export default function ChatWindow({ persona, conversationId, initialMessages = [], initialMessage, onBack }: ChatWindowProps) {
  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:42', message: 'ChatWindow render - VOICE DEBUG', data: { personaId: persona?.id, personaName: persona?.name, conversationId, hasGreeting: !!persona?.greeting, hasVoiceName: !!persona?.voiceName, voiceNameReceived: persona?.voiceName, voiceNameType: typeof persona?.voiceName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
  }
  // #endregion

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCuratingModal, setShowCuratingModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Default to enabled (speech-first)
  const [isMuted, setIsMuted] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false); // DEBUG: Track history load status
  const [quotaModal, setQuotaModal] = useState<{
    isOpen: boolean;
    type: 'messages' | 'tts' | 'calls';
    currentUsage: number;
    limit: number;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        try {
          const formData = new FormData();
          formData.append('file', audioBlob, 'recording.webm');

          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          if (data.text) {
            // Auto-send the transcribed text
            handleSendMessage(data.text);
          }
        } catch (error) {
          console.error('STT Error:', error);
          alert('Failed to process voice input. Please try again.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Ref to prevent double-fire of greeting auto-play (React Strict Mode)
  const greetingPlayedRef = useRef<boolean>(false);
  // Ref to track last auto-played message to prevent VoiceButton from re-fetching
  const lastAutoPlayedMessageRef = useRef<string | null>(null);
  // Ref to prevent multiple simultaneous playVoiceForMessage calls
  const isPlayingVoiceRef = useRef<boolean>(false);

  // Sidebar State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(persona.followerCount || 0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<{ id: number; user: string; time: string; text: string }[]>([
    // Start empty to avoid dummy data confusion
  ]);

  useEffect(() => {
    // Check follow status on load
    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/personas/${persona.id}/follow/status`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.following);
        }
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };
    checkFollowStatus();
  }, [persona.id]);

  const handleFollow = async () => {
    try {
      // Optimistic update
      const newStatus = !isFollowing;
      setIsFollowing(newStatus);
      setFollowerCount(prev => newStatus ? prev + 1 : prev - 1);

      const response = await fetch(`/api/personas/${persona.id}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        // Revert on failure
        setIsFollowing(!newStatus);
        setFollowerCount(prev => !newStatus ? prev + 1 : prev - 1);
        console.error('Follow failed');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert on error
      setIsFollowing(!isFollowing);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    const newCommentText = commentText.trim();
    setCommentText(''); // Clear input immediately

    // Optimistic update
    const tempId = Date.now();
    const newComment = {
      id: tempId,
      user: 'You',
      time: 'Just now',
      text: newCommentText
    };

    setComments(prev => [newComment, ...prev]);

    try {
      const response = await fetch(`/api/personas/${persona.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newCommentText }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      // Ideally replace temp ID with real ID from response, but for now this is fine
    } catch (error) {
      console.error('Error posting comment:', error);
      // Revert optimistic update
      setComments(prev => prev.filter(c => c.id !== tempId));
      alert('Failed to post comment. Please try again.');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `Chat with ${persona.name}`,
      text: `Check out this character: ${persona.name} - ${persona.tagline}`,
      url: url,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };



  // Safety timeout: Ensure modal never stays open more than 5 minutes (cold start protection)
  // RunPod F5-TTS can take 2-3 mins to spin up from cold
  useEffect(() => {
    if (showCuratingModal) {
      const timer = setTimeout(() => {
        console.log('[ChatWindow] Curating modal safety timeout (5 min) - voice generation may have failed');
        setShowCuratingModal(false);
      }, 300000); // 5 minutes max for cold start scenarios
      return () => clearTimeout(timer);
    }
  }, [showCuratingModal]);

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
      // Show curating modal for first-time cold start masking
      // Only if it's the first message and voice is enabled
      if (messages.length <= 1) {
        setShowCuratingModal(true);
      }

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
        clientSupportsSupertonic: true, // Signal that we can handle local WASM generation
      };

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/components/ChatWindow.tsx:188', message: 'Sending TTS request - VOICE DEBUG', data: { voiceNameInRequest: requestBody.voiceName, styleHint: requestBody.styleHint, personaId: requestBody.personaId, characterName: requestBody.characterName, dialogueLength: dialogueText.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check for specific error status codes
        if (response.status === 429) {
          setQuotaModal({
            isOpen: true,
            type: 'tts',
            currentUsage: errorData.currentUsage || 0,
            limit: errorData.limit || 0
          });
          isPlayingVoiceRef.current = false;
          setShowCuratingModal(false);
          return;
        }

        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // --- HYBRID CLUSTER HANDLING ---
      if (data.engine === 'supertonic' && data.instruction === 'GENERATE_LOCALLY') {
        console.log(`[TTS] ⚡ Switching to Supertonic Local (Reason: ${data.reason})`);
        try {
          // Use the preset voice returned by the router (or derived from character)
          const voiceStyle = data.voiceName || 'F1';
          const localAudioBuffer = await supertonicGenerator.synthesize(dialogueText, { voiceName: voiceStyle });

          // Convert ArrayBuffer to base64 for audioManager
          const base64Audio = btoa(
            new Uint8Array(localAudioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );

          setShowCuratingModal(false);
          await audioManager.playAudio(
            base64Audio,
            24000, // Supertonic default
            1.0,
            messageId,
            'wav'
          );
          return; // Success
        } catch (localError) {
          console.warn('[TTS] ⚠️ Local Supertonic failed, falling back to server F5...', localError);
          // Potential fallback: re-call API with clientSupportsSupertonic: false 
          // but for now we'll just log and continue if data.audio exists
        }
      }
      // -------------------------------

      if (!data.audio) {
        throw new Error('No audio data received from TTS API');
      }

      // Play audio using shared audio manager
      // Hide modal right before starting playback for smooth transition
      setShowCuratingModal(false);

      await audioManager.playAudio(
        data.audio,
        data.sampleRate || 24000,
        1.0, // playbackRate
        messageId,
        data.format
      );

    } catch (error: any) {
      console.error('[TTS] Voice generation failed:', error);
      setShowCuratingModal(false);
      // NO FALLBACKS: Silence is better than robotic voices
      // User requested: if the voice fails, better there is no voice than a generic one
    } finally {
      // Always reset the playing flag
      isPlayingVoiceRef.current = false;
    }
  }, [persona, isMuted, messages.length]);

  // Generate unique message ID
  const generateMessageId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // IMPORTANT: Stop any currently playing audio immediately
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

        // Show user-friendly error message - WITH DEBUG INFO for the user
        const errorMessage: Message = {
          id: generateMessageId(),
          role: 'assistant',
          text: `[SYSTEM ERROR] ${errorData.error || errorData.reason || "Unknown API Error"}`,
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

  // Fetch conversation history on load
  useEffect(() => {
    const fetchHistory = async () => {
      if (!conversationId) return;

      try {
        const response = await fetch(`/api/conversations/${conversationId}/history`, {
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`[ChatWindow] History fetch successful. Found ${data.messages?.length || 0} messages.`);
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
            setLastMessageId(data.messages[data.messages.length - 1].id);
            // Mark greeting as played if there's history
            greetingPlayedRef.current = true;
          } else {
            // No history, trigger greeting if available
            triggerGreeting();
          }
          setIsHistoryLoaded(true);
        } else {
          console.error(`[ChatWindow] History fetch failed with status ${response.status}`);
          // Fallback to greeting on error
          triggerGreeting();
          setIsHistoryLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        triggerGreeting();
        setIsHistoryLoaded(true); // Ensure badge shows even on error
      }
    };

    const triggerGreeting = () => {
      console.log('triggerGreeting called', {
        personaGreeting: persona.greeting,
        messageCount: messages.length,
        greetingPlayed: greetingPlayedRef.current,
        initialMessage
      });

      // Don't auto-greet if there's a starter message pending
      if (persona.greeting && messages.length === 0 && !greetingPlayedRef.current && !initialMessage) {
        const greetingMessage: Message = {
          id: 'greeting',
          role: 'assistant',
          text: persona.greeting,
          timestamp: Date.now(),
        };
        setMessages([greetingMessage]);

        // Auto-play greeting voice (speech-first)
        if (persona.voiceName && !isMuted) {
          greetingPlayedRef.current = true;
          setTimeout(() => {
            lastAutoPlayedMessageRef.current = 'greeting';
            playVoiceForMessage(persona.greeting!, 'greeting');
          }, 800);
        }
      }
    };

    fetchHistory();
  }, [conversationId, persona.id]); // Run once when conversationId or persona Changes

  useEffect(() => {
    // Check for chat starter message from URL OR prop
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const starterMessage = urlParams.get('message') || initialMessage;

      if (starterMessage && messages.length === 0) {
        // Auto-send the chat starter message
        setTimeout(() => {
          handleSendMessage(starterMessage);
        }, 500);
        return;
      }
    }
  }, [messages.length, handleSendMessage, initialMessage]);

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
      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Chat Header - Matches Screenshot 3 */}
        {/* Ad Banner for Free Users - NOW AT TOP */}
        <AdBanner variant="banner" className="sticky top-0 z-50" />

        {/* Curating/Waiting Modal */}
        {showCuratingModal && (
          <CuratingModal
            isOpen={showCuratingModal}
            characterName={persona.name}
          />
        )}

        {/* Chat Header - Matches Screenshot 3 */}
        <header className="sticky top-[52px] z-40 flex h-16 items-center justify-between border-b border-white/5 bg-[#121212]/80 px-6 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            {onBack ? (
              <button onClick={onBack} className="xl:hidden p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
            ) : (
              <Link href="/home" className="xl:hidden p-2 -ml-2 text-white/40 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
            )}
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {persona.name}
                <Sparkles size={12} className="text-amber-400" />
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">ONLINE (v1.3)</span>
                {isHistoryLoaded && (
                  <span className="ml-2 text-[8px] font-black text-purple-500 uppercase tracking-widest bg-purple-500/10 px-1 rounded">V1.2 HISTORY ACTIVE</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-white/40 hover:text-white transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </header>

        {/* Chat Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32 px-4 md:px-0 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Empty State / Welcome Info */}
            {messages.length <= 1 && (
              <div className="flex flex-col items-center justify-center text-center py-24 animate-fade-in">
                <h1 className="text-[52px] font-serif italic text-white mb-4 tracking-tight leading-none">Start a new story</h1>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">
                  TYPE BELOW TO BEGIN
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-12 pt-10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role === 'assistant' && (
                    <>
                      {/* Header with avatar and name */}
                      <div className="flex items-center gap-2.5 mb-3 ml-1">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 ring-2 ring-white/5">
                          <SafeImage
                            src={persona.avatarUrl}
                            className="w-full h-full object-cover"
                            alt={persona.name}
                            fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white/80 uppercase tracking-wider">{persona.name}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.1em]">AI COMPANION</p>
                        </div>
                      </div>

                      {/* Character.AI style audio badge */}
                      <div className="flex items-center gap-2 mb-3 ml-2">
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
                        <div className="px-2 py-1 rounded-full bg-white/[0.03] border border-white/5 flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            <span className="w-0.5 h-2 bg-white/20 rounded-full"></span>
                            <span className="w-0.5 h-3 bg-white/40 rounded-full animate-pulse"></span>
                            <span className="w-0.5 h-2 bg-white/20 rounded-full"></span>
                          </div>
                          <span className="text-[9px] font-black text-white/30">{Math.max(3, Math.ceil(msg.text.length / 15))}s</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Message bubble */}
                  <div className={`max-w-[85%] px-6 py-5 rounded-[24px] text-[16px] leading-[1.6] ${msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-none ml-auto shadow-lg shadow-purple-600/10 font-medium'
                    : 'bg-white/[0.03] text-white/90 border border-white/5 rounded-tl-none font-normal'
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
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center bg-gradient-to-t from-[#121212] via-[#121212] to-transparent pointer-events-none">
          <div className="w-full max-w-3xl flex items-center gap-3 pointer-events-auto">
            <div className="flex-1 relative">
              <div className="bg-[#1a1a1a] rounded-2xl p-1.5 pl-4 flex items-center gap-3 border border-white/5 shadow-2xl">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // TODO: Handle image upload - for now show alert
                      alert(`Image upload coming soon! Selected: ${file.name}`);
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="p-2 text-white/20 hover:text-white/40 transition-colors"
                  title="Upload image"
                >
                  <ImageIcon size={20} />
                </button>

                {/* Voice Input Button */}
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={isRecording ? stopRecording : undefined}
                  disabled={isLoading || isTranscribing}
                  className={`p-2 transition-all duration-200 rounded-full ${isRecording
                    ? 'bg-red-500/20 text-red-500 scale-110 animate-pulse'
                    : isTranscribing
                      ? 'text-white/40 animate-spin'
                      : 'text-white/20 hover:text-white/60'
                    }`}
                  title="Hold to Speak"
                >
                  {isTranscribing ? (
                    <Loader2 size={20} />
                  ) : (
                    <div className="relative">
                      <Mic size={20} className={isRecording ? "fill-current" : ""} />
                      {isRecording && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      )}
                    </div>
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={isRecording ? "Listening..." : "Type message..."}
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-white/10 text-sm py-3"
                  autoComplete="off"
                  disabled={isRecording || isTranscribing}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading || isRecording}
                  className={`p-3 rounded-xl transition-all ${inputText.trim() && !isLoading ? 'bg-white text-black hover:bg-white/90' : 'text-white/10 bg-white/5'}`}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <Send size={18} fill={inputText.trim() && !isLoading ? "currentColor" : "none"} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/10 font-black uppercase tracking-widest mt-4">
            AGENTWOOD AI CAN MAKE MISTAKES. CHECK IMPORTANT INFO.
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



      {/* Right Panel - Character Profile & Comments (Desktop only) */}
      <div className="hidden xl:flex flex-col w-[380px] h-full relative shrink-0 border-l border-white/5 bg-[#0a0a0a]">
        {/* Character Profile Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Large Image */}
          <div className="w-full aspect-square relative bg-white/5">
            <SafeImage
              src={persona.avatarUrl}
              className="w-full h-full object-cover"
              alt={persona.name}
              fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
          </div>

          <div className="px-6 -mt-12 relative z-10">
            <h3 className="text-3xl font-serif italic text-white mb-4 leading-tight">{persona.name}</h3>

            <div className="flex items-center gap-6 mb-6">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none">{(persona.viewCount || 0).toFixed(1)}K</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">VIEWS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none">{(persona.saveCount || 0).toFixed(1)}K</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">LIKES</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">CREATED BY</p>
                <p className="text-xs font-bold text-white/60">@{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all"
                >
                  <Share2 size={16} className="text-white/60" />
                </button>
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isFollowing ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-black hover:bg-white/90'}`}
                >
                  {isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </button>
              </div>
            </div>

            {/* Profile Tabs/Tools */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/5 mb-8">
              <button className="flex-1 py-1.5 flex items-center justify-center rounded-full bg-white/10 text-white">
                <MessageCircle size={16} />
              </button>
              <button
                onClick={() => window.location.href = '/create'}
                className="flex-1 py-1.5 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
                title="Create new character"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => alert('Settings coming soon! Use the mute button in the header to control audio.')}
                className="flex-1 py-1.5 flex items-center justify-center rounded-full text-white/40 hover:text-white transition-colors"
                title="Chat settings"
              >
                <Settings size={16} />
              </button>
            </div>

            {/* Comments Section */}
            <div className="pb-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">COMMENTS ({comments.length})</h4>
                <ChevronRight size={14} className="text-white/20" />
              </div>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-white/80">{comment.user}</span>
                        <span className="text-[9px] font-medium text-white/20">{comment.time}</span>
                      </div>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Input at Bottom */}
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/10"
            />
            <button
              onClick={handlePostComment}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-50"
              disabled={!commentText.trim()}
            >
              <Send size={14} />
            </button>
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
    </div >
  );
}
