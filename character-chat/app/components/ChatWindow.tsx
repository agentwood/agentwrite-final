'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Volume2, VolumeX, MoreVertical, RefreshCw, MessageCircle, Heart, Share2, Plus, Settings, ChevronRight, Sparkles, Image as ImageIcon, Mic } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChatSidebar from './ChatSidebar';
import VoiceButton from './VoiceButton';
import VoiceFeedbackButton from './VoiceFeedbackButton';
import QuotaExceededModal from './QuotaExceededModal';
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
  const router = useRouter();
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
  const [showUnmuteOverlay, setShowUnmuteOverlay] = useState(false); // Fallback for browser autoplay policy
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false); // DEBUG: Track history load status
  const [quotaModal, setQuotaModal] = useState<{
    isOpen: boolean;
    type: 'messages' | 'tts' | 'calls';
    currentUsage: number;
    limit: number;
  } | null>(null);

  // Check audio context state on mount for "Tap to Unmute" fallback
  useEffect(() => {
    const checkAudioState = async () => {
      // Small delay to allow browser to process any previous interaction
      await new Promise(resolve => setTimeout(resolve, 500));

      // We only care if we are NOT muted by choice
      if (!isMuted && persona.voiceName) {
        // @ts-ignore - Accessing private property in a hacky way for checking state without creating new token
        const ctx = (audioManager as any).globalAudioContext;
        if (ctx && ctx.state === 'suspended') {
          console.log('[ChatWindow] Audio context suspended, showing unmute overlay');
          setShowUnmuteOverlay(true);
        }
      }
    };
    checkAudioState();
  }, [persona.voiceName, isMuted]);

  const handleUnmuteClick = async () => {
    await audioManager.resume();
    setShowUnmuteOverlay(false);
  };
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





  // Auto-play voice for assistant messages
  const playVoiceForMessage = useCallback(async (text: string, messageId: string) => {
    if (!persona.voiceName || isMuted) return;

    // Use audioManager.playVoice to handle deduplication and race conditions
    // The fetch/generation logic is passed as a callback
    await audioManager.playVoice(messageId, async () => {
      // Fetch TTS
      try {
        // Extract dialogue
        const dialogueText = extractDialogueForTTS(text);
        if (!dialogueText || dialogueText.trim().length === 0) {
          return null;
        }

        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000); // 5m timeout for Cold Start

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({
            text: dialogueText,
            voiceName: persona.voiceName,
            styleHint: persona.styleHint,
            personaId: persona.id,
            characterName: persona.name,
            archetype: persona.archetype || persona.category,
            category: persona.category,
            tagline: persona.tagline,
            description: persona.description,
            clientSupportsSupertonic: true,
          }),
          signal: controller.signal
        }).finally(() => {
          clearTimeout(timeoutId);
        });

        if (!response.ok) {
          // Handle errors logic
          if (response.status === 429) {
            const errorData = await response.json();
            setQuotaModal({
              isOpen: true,
              type: 'tts',
              currentUsage: errorData.currentUsage || 0,
              limit: errorData.limit || 0
            });
          }
          return null;
        }

        const data = await response.json();

        // Supertonic handling
        if (data.engine === 'supertonic' && data.instruction === 'GENERATE_LOCALLY') {
          try {
            const voiceStyle = data.voiceName || 'F1';
            const localAudioBuffer = await supertonicGenerator.synthesize(dialogueText, { voiceName: voiceStyle });
            const base64Audio = btoa(
              new Uint8Array(localAudioBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );
            return {
              audio: base64Audio,
              sampleRate: 24000,
              format: 'wav'
            };
          } catch (e) {
            console.error('Supertonic failed', e);
            return null;
          }
        }

        if (data.audio) {
          return {
            audio: data.audio,
            sampleRate: data.sampleRate || 24000,
            format: data.format
          };
        }
        return null;
      } catch (e) {
        console.error('Voice generation error', e);
        return null;
      }
    });

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
      if (messages.length === 0 && !greetingPlayedRef.current && !initialMessage) {
        // Use persona greeting, or generate one dynamically from their persona
        let greetingText = persona.greeting;

        if (!greetingText) {
          // Generate in-character greeting based on persona details
          const name = persona.name;
          const tagline = persona.tagline || '';
          const desc = persona.description || '';

          // Create immersive greeting based on character type
          if (desc.toLowerCase().includes('cook') || desc.toLowerCase().includes('chef')) {
            greetingText = `*wipes hands on apron* Ah, welcome to my kitchen! I'm ${name}. What culinary adventure shall we embark on today?`;
          } else if (desc.toLowerCase().includes('coach') || desc.toLowerCase().includes('fitness')) {
            greetingText = `*cracks knuckles* Alright, let's get to work! I'm ${name}, and I don't do excuses. What are we conquering today?`;
          } else if (desc.toLowerCase().includes('teacher') || desc.toLowerCase().includes('professor')) {
            greetingText = `*adjusts glasses* Welcome, welcome! I'm ${name}. Ready to learn something new today? Let's begin!`;
          } else if (desc.toLowerCase().includes('therapist') || desc.toLowerCase().includes('counselor') || desc.toLowerCase().includes('mindfulness')) {
            greetingText = `*settles into chair with a warm smile* Hello there. I'm ${name}. This is a safe space. What's on your mind?`;
          } else if (name.toLowerCase().includes('spongebob')) {
            greetingText = `I'M READY! I'M READY! I'M READY! *jumps excitedly* Hi there! I'm SpongeBob SquarePants! Wanna go jellyfishing?!`;
          } else if (tagline.toLowerCase().includes('villain') || desc.toLowerCase().includes('villain')) {
            greetingText = `*emerges from shadows* Ah, a visitor... I am ${name}. What brings you to my domain?`;
          } else if (tagline.toLowerCase().includes('romance') || desc.toLowerCase().includes('romance')) {
            greetingText = `*looks up with a gentle smile* Oh, hi there... I'm ${name}. ${tagline ? tagline : 'Nice to meet you.'}`;
          } else {
            // Default immersive fallback using tagline
            greetingText = tagline
              ? `*${name} appears* ${tagline}`
              : `*${name} greets you warmly* Hey there! Ready for an adventure?`;
          }
        }

        const greetingMessage: Message = {
          id: 'greeting',
          role: 'assistant',
          text: greetingText,
          timestamp: Date.now(),
        };
        setMessages([greetingMessage]);

        // Auto-play greeting voice (speech-first)
        if (persona.voiceName && !isMuted && greetingMessage.text) {
          greetingPlayedRef.current = true;
          setTimeout(() => {
            lastAutoPlayedMessageRef.current = 'greeting';
            playVoiceForMessage(greetingMessage.text, 'greeting');
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
      {/* Tap to Unmute Overlay */}
      {showUnmuteOverlay && (
        <div
          onClick={handleUnmuteClick}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-black/90 transition-all animate-bounce"
        >
          <VolumeX size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Tap to Unmute</span>
        </div>
      )}

      {/* Quota Modal */}
      <QuotaExceededModal
        isOpen={!!quotaModal}
        onClose={() => setQuotaModal(null)}
        type={quotaModal?.type || 'messages'}
        limit={quotaModal?.limit || 0}
        currentUsage={quotaModal?.currentUsage || 0}
      />



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
                <span className="text-lg font-bold text-white leading-none">{(persona.viewCount || 0) >= 1000 ? ((persona.viewCount || 0) / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : (persona.viewCount || 0).toLocaleString()}</span>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">VIEWS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white leading-none">{(persona.saveCount || 0) >= 1000 ? ((persona.saveCount || 0) / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : (persona.saveCount || 0).toLocaleString()}</span>
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
                onClick={() => router.push('/create')}
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
