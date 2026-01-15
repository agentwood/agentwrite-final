"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Bell, Plus, Compass, Brain, PenTool,
  Award, Settings, ChevronRight, Star,
  Sparkle, ChevronLeft,
  MessageSquare, Play, Send, Image as ImageIcon,
  PlayCircle,
  Zap, Wand2, Loader2, Music,
  ChevronDown, BookOpen, Share2, Instagram, Twitter,
  User, CreditCard, Sliders, VolumeX, Volume2, ShieldCheck, DollarSign,
  Globe, Moon, Sun, Monitor, Laptop, Check, X, ShieldAlert,
  Link, BarChart, Users, ThumbsUp, ThumbsDown, Bookmark,
  MoreHorizontal, Headphones, Smile, Heart, ZapOff, Info,
  Feather, History, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon, ArrowRight, Mic, Pause,
  RotateCcw, Map, Eye, Trophy, Target, Clock, Lock, Unlock,
  Flame, TrendingUp, Pencil, Smartphone, Gamepad2
} from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import { AuthModal } from './AuthModal';
import { OnboardingModal } from './OnboardingModal';
import { SubscriptionModal } from './SubscriptionModal';
import { SkeletonCard, SkeletonRow } from './SkeletonLoaders';
import { getShowcaseCharacters, FALLBACK_CHARACTERS } from '@/lib/master/geminiService';
import { CharacterProfile, Category, View } from '@/lib/master/types';
import { LandingPage } from './LandingPage';
import { Footer } from './Footer';
import ChatWindow from '../ChatWindow';
import SafeImage from '../SafeImage';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { isAuthenticated, getSession, setSession } from '@/lib/auth';

const SidebarLink: React.FC<{ active?: boolean; icon: React.ReactNode; label: string; badge?: string; onClick?: () => void }> = ({ active, icon, label, badge, onClick }) => (
  <button
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
  >
    <div className="flex items-center gap-3">
      <span className={active ? 'text-white' : 'text-white/40'}>{icon}</span>
      <span className="font-sans">{label}</span>
    </div>
    {badge && (
      <span className="rounded-[4px] bg-[#a855f7] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-tighter font-sans">
        {badge}
      </span>
    )}
  </button>
);

const SearchView: React.FC<{
  onSelectCharacter: (char: CharacterProfile) => void;
  characters: CharacterProfile[];
}> = ({ onSelectCharacter, characters }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeMood, setActiveMood] = useState('All');

  const tabs = ['Trending', 'Rising', 'New', 'Editors Choice'];
  const moods = ['All', 'Helpful', 'Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn', 'Wholesome', 'Adventurous'];

  // Filter based on query and mood
  const results = characters.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.tagline.toLowerCase().includes(query.toLowerCase());

    // Normalize category comparison
    const charCategory = (c.category || '').toLowerCase();
    const matchesMood = activeMood === 'All' || charCategory === activeMood.toLowerCase();

    return matchesQuery && matchesMood;
  });

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6 md:p-12 animate-fade-in pb-32">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Search Input */}
        <div className="flex flex-col items-center space-y-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif italic text-white text-center">Explore the Woods</h1>

          <div className="relative group w-full max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            <div className="relative flex items-center bg-[#161616] border border-white/10 rounded-full px-6 py-4 focus-within:border-white/30 transition-all shadow-2xl">
              <Search className="text-white/40 mr-4" size={22} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-lg text-white placeholder:text-white/20 w-full font-sans"
                placeholder="Search characters, stories, or creators..."
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X size={18} className="text-white/40" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mood Filter */}
        <div className="flex items-center justify-center gap-6 mb-8 overflow-x-auto py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 shrink-0">MOOD</span>
          <div className="flex items-center gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => setActiveMood(mood)}
                className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${activeMood === mood
                  ? 'bg-[#d4b595] text-black border-[#d4b595] shadow-[0_0_15px_rgba(212,181,149,0.2)]'
                  : 'bg-[#1a1a1a] text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-3 flex-wrap border-b border-white/5 pb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${activeTab === tab
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                : 'bg-transparent text-white/40 border-transparent hover:bg-white/5 hover:text-white'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results Grid - Trending Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((char, index) => (
            <div
              key={char.id} /* Use ID instead of index for better key stability */
              onClick={() => onSelectCharacter(char)}
              className="group relative flex items-center gap-4 p-4 rounded-2xl bg-[#161616] border border-white/5 hover:bg-[#1f1b19] hover:border-white/10 transition-all cursor-pointer overflow-hidden"
            >
              {/* Rank Number - Only show if strict ranking is implied, otherwise maybe just index in list */}
              <div className="flex-shrink-0 w-8 text-center z-10">
                <span className={`text-2xl font-black font-serif italic ${index === 0 ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]' :
                  index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-700' :
                      'text-white/10 group-hover:text-white/20'
                  }`}>
                  {index + 1}
                </span>
              </div>

              {/* Avatar */}
              <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 relative z-10 group-hover:scale-105 transition-transform duration-500">
                <SafeImage src={char.avatarUrl} alt={char.name} className="w-full h-full" />
                {index < 3 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 z-10 space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white font-bold text-sm truncate">{char.name}</h3>
                  {index < 3 && <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />}
                </div>
                <p className="text-white/40 text-[11px] line-clamp-1">{char.tagline}</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-[9px] text-white/30 font-bold uppercase tracking-wider">
                    <Eye size={10} /> {char.viewCount >= 1000 ? `${(char.viewCount / 1000).toFixed(1).replace(/\.0$/, '')}k` : char.viewCount}
                  </span>
                  {/* Category Pill Mini */}
                  {char.category && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/5 uppercase tracking-wider">
                      {char.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}

          {results.length === 0 && (
            <div className="col-span-full text-center py-20 text-white/30 italic font-serif text-xl">
              No characters found for this mood.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ... BlogPage, CharacterProfileView, ImmersiveChatView, CreateView, RewardsView, SettingsView, CraftStoryView (ensure CraftStoryView is defined) ...

const BlogPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState(["ALL", "WELLNESS", "STORYTELLING", "RELATIONSHIPS", "CULTURE"]);
  const [featuredPost, setFeaturedPost] = useState<any>(null);

  useEffect(() => {
    fetch('/api/blog')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setFeaturedPost(data[0]);
          setPosts(data.slice(1));

          // helper to map random categories if not present
          // or ideally we use tags
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#0c0c0c] fade-in">
      <div className="px-16 py-24 text-center space-y-8">
        <h1 className="text-9xl font-serif italic text-white tracking-tighter">The Blog.</h1>
        <div className="flex justify-center gap-10 border-t border-b border-white/5 py-8">
          {categories.map(cat => <button key={cat} className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors">{cat}</button>)}
        </div>
      </div>

      {featuredPost && (
        <section className="px-16 mb-32">
          <div className="relative rounded-[60px] overflow-hidden aspect-[21/9] border border-white/10 group cursor-pointer">
            <img src={featuredPost.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute bottom-16 left-16 max-w-2xl space-y-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-dipsea-accent">{featuredPost.tags?.[0] || 'FEATURED'}</span>
              <h2 className="text-7xl font-serif italic text-white leading-none">{featuredPost.title}</h2>
              <p className="text-white/40 text-sm font-sans italic">By {featuredPost.author} — {featuredPost.date}</p>
            </div>
          </div>
        </section>
      )}

      <section className="px-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 mb-32">
        {posts.map((post, i) => (
          <div key={i} className="group cursor-pointer space-y-8">
            <div className="aspect-[16/9] rounded-[48px] overflow-hidden border border-white/5 relative">
              <img src={post.image} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" />
            </div>
            <div className="space-y-4 px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-dipsea-accent">{post.category}</span>
              <h3 className="text-4xl font-serif italic text-white group-hover:text-dipsea-accent transition-colors">{post.title}</h3>
              <p className="text-white/20 text-sm font-sans italic">Read Story — 6 min read</p>
            </div>
          </div>
        ))}
      </section>

      <section className="px-16 mb-32">
        <div className="bg-[#1a1a1a] rounded-[80px] p-32 text-center space-y-10 border border-white/5 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-6xl font-serif italic text-white">Join the woods.</h2>
            <p className="text-white/30 text-xl font-sans italic max-w-xl mx-auto">Get exclusive editorial insights, stories, and connection tips delivered to your inbox.</p>
            <div className="max-w-md mx-auto relative mt-12">
              <input type="email" placeholder="email@address.com" className="w-full bg-transparent border-b border-white/10 py-5 px-4 text-2xl italic outline-none focus:border-dipsea-accent transition-colors font-sans text-white" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-dipsea-accent"><ArrowRight size={32} /></button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-dipsea-accent/5 blur-[100px] rounded-full"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const CharacterProfileView: React.FC<{
  character: CharacterProfile;
  onBack: () => void;
  onChat: (starterMessage?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}> = ({ character, onBack, onChat, isFavorite, onToggleFavorite }) => {
  // Generate voice description from character properties
  const getVoiceDescription = () => {
    const name = character.name.toLowerCase();
    const category = character.category?.toLowerCase() || '';
    const styleHint = character.styleHint || '';
    const description = character.description?.toLowerCase() || '';

    // Character-specific voice descriptions - PRIORITY CHECKS FIRST
    if (name.includes('sergeant') || name.includes('briggs') || name.includes('drill')) return 'Commanding & Intense';
    if (name.includes('victor') && name.includes('hale')) return 'Analytical & Detached';
    if (name.includes('spongebob')) return 'Energetic & Cartoon';
    if (name.includes('trap') || name.includes('dj')) return 'Deep & Hype';
    if (name.includes('grandpa') || name.includes('winston')) return 'Warm & Wise';
    if (name.includes('coach') || name.includes('boone') || name.includes('tyler')) return 'Commanding & Strong';
    if (name.includes('hype')) return 'Energetic & Motivating';
    if (description.includes('military') || description.includes('trainer') || description.includes('discipline')) return 'Commanding & Direct';
    if (styleHint.includes('Japanese')) return 'Energetic & Clear';
    if (styleHint.includes('Korean')) return 'Smooth & Dramatic';
    if (styleHint.includes('French')) return 'Soft & Alluring';
    if (styleHint.includes('Italian')) return 'Expressive & Warm';
    if (styleHint.includes('British')) return 'Refined & Clear';
    if (category.includes('romance')) return 'Sensual & Warm';
    if (category.includes('fun') || category.includes('play')) return 'Playful & Bright';
    if (category.includes('help')) return 'Calm & Supportive';
    return 'Natural & Engaging';
  };
  return (
    <div className="min-h-screen bg-[#0c0c0c] animate-fade-in-up">
      <div className="relative h-[60vh] w-full">
        <img src={character.avatarUrl} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c]/20 to-transparent"></div>
        <button onClick={onBack} className="absolute top-8 left-8 p-3 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all z-50">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="px-8 md:px-16 lg:px-32 -mt-32 relative z-10 pb-32">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-dipsea-accent">{character.category}</span>
              <div className="flex items-center gap-1 text-white/40 text-xs font-bold uppercase tracking-wider">
                <Eye size={12} /> {character.viewCount >= 1000 ? `${(character.viewCount / 1000).toFixed(1).replace(/\.0$/, '')}k` : character.viewCount}
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-serif italic text-white mb-2">{character.name}</h1>
            <p className="text-xl text-white/60 font-sans">{character.tagline}</p>
          </div>

          <div className="flex gap-4">
            <button onClick={onToggleFavorite} className="p-4 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
              <Heart size={24} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button
              onClick={() => onChat()}
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              <MessageSquare size={18} /> Start Chatting
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-white/10">
          <div className="md:col-span-2 space-y-10">
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6">About</h3>
              <p className="text-2xl font-serif text-white/80 leading-relaxed">
                {character.description}
              </p>
            </section>

            {/* Conversation Starters removed per user request */}
          </div>

          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-[#161616] border border-white/5 space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-sm">Handle</span>
                  <span className="text-white text-sm font-medium">{character.handle}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-sm">Voice</span>
                  <span className="text-white text-sm font-medium">{getVoiceDescription()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-white/40 text-sm">Language</span>
                  <span className="text-white text-sm font-medium">English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImmersiveChatView: React.FC<{
  character: CharacterProfile;
  onBack: () => void;
  onUpgrade: () => void;
}> = ({ character, onBack, onUpgrade }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'similar' | 'persona'>('comments');
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);

  const [conversationId] = useState(() => crypto.randomUUID());

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          characterId: character.id,
          messages: newMessages
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        // Trigger TTS
        playVoice(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const playVoice = async (text: string) => {
    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          characterId: character.id,
        })
      });
      const data = await response.json();

      if (data.audio) {
        // Use the format from the response or default to wav
        const mimeType = data.format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
        const audio = new Audio(`data:${mimeType};base64,${data.audio}`);

        currentAudioRef.current = audio;

        audio.onended = () => {
          currentAudioRef.current = null;
        };

        await audio.play();
      }
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-send greeting on mount
  useEffect(() => {
    const greeting = character.greeting || `Hello! I'm ${character.name}. ${character.tagline || 'How can I help you today?'}`;
    setMessages([{ role: 'model', text: greeting }]);
    playVoice(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.id]);

  return (
    <div className="flex h-screen w-full bg-[#12100e] text-white overflow-hidden animate-fade-in">

      {/* LEFT: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 bg-[#12100e]">

        {/* Header - Transparent/Minimal */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#12100e] z-20">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/60 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="font-serif italic text-xl leading-none text-white">{character.name}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onUpgrade} className="p-2 rounded-full hover:bg-white/5 text-purple-400">
              <Zap size={18} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-[#12100e]" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none pb-20">
              <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 opacity-80 border border-white/10">
                <img src={character.avatarUrl} className="w-full h-full object-cover grayscale" />
              </div>
              <p className="font-serif italic text-3xl mb-2 text-white">Start a new story</p>
              <p className="text-xs font-sans text-white/50 uppercase tracking-widest">Type below to begin</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              {msg.role === 'model' && (
                <div className="h-8 w-8 rounded-full overflow-hidden mr-3 mt-1 flex-shrink-0 border border-white/10">
                  <img src={character.avatarUrl} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                {msg.role === 'model' && (
                  <button
                    onClick={() => playVoice(msg.text)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2520] rounded-full text-[10px] text-white/70 hover:bg-[#3a3530] hover:text-white transition-colors self-start border border-white/10"
                  >
                    <Play size={10} fill="currentColor" /> <span className="text-white/50">2s</span>
                  </button>
                )}
                <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-[#fcf9f7] text-black rounded-tr-sm'
                  : 'bg-[#1c1816] border border-white/10 text-white/90 rounded-tl-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="h-8 w-8 rounded-full overflow-hidden mr-3 mt-1 flex-shrink-0 border border-white/10">
                <img src={character.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div className="bg-[#1c1816] border border-white/10 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-[#12100e] border-t border-white/5">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-[#1c1816] p-2 rounded-[24px] border border-white/10 focus-within:border-white/20 transition-all shadow-lg">
            <button className="p-3 rounded-full text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <ImageIcon size={20} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message ${character.name}...`}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 py-3 max-h-32 resize-none scrollbar-hide font-sans text-sm"
              rows={1}
            />
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                <Sparkle size={18} />
              </button>
              <button className="p-2 rounded-full text-white/30 hover:text-white hover:bg-white/5 transition-colors">
                <Settings size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-3 rounded-full transition-all duration-300 ${input.trim()
                  ? 'bg-white text-black hover:scale-105 shadow-md'
                  : 'bg-white/5 text-white/20'
                  }`}
              >
                <Send size={18} fill={input.trim() ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Enhanced Sidebar */}
      <div className="hidden xl:flex w-[400px] flex-col h-full border-l border-white/5 bg-[#0c0c0c] flex-shrink-0">
        {/* Character Image Area - Top 60% */}
        <div className="relative flex-1 min-h-0 w-full group overflow-hidden">
          <img src={character.avatarUrl} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent opacity-90"></div>

          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4 z-10">
            <div className="space-y-1">
              <h2 className="text-4xl font-serif italic text-white leading-none">{character.name}</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold text-white/60 font-sans tracking-wide">
                <span className="flex items-center gap-1"><Eye size={12} /> {character.viewCount >= 1000 ? `${(character.viewCount / 1000).toFixed(1).replace(/\.0$/, '')}k` : character.viewCount}</span>
                <span className="flex items-center gap-1"><User size={12} /> {character.chatCount >= 1000 ? `${(character.chatCount / 1000).toFixed(1).replace(/\.0$/, '')}k` : character.chatCount}</span>
                <span className="opacity-50">|</span>
                <span>By {character.handle.replace('@', '')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-white text-black py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 shadow-lg transform active:scale-95 transition-all">Follow</button>
              <button className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/5"><Share2 size={16} /></button>
            </div>
          </div>

          {/* Top Right Options */}
          <div className="absolute top-6 right-6 z-10">
            <button className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/5"><MoreHorizontal size={16} /></button>
          </div>
        </div>

        {/* Bottom/Tabs/Comments Section - Fixed Height */}
        <div className="h-[320px] flex flex-col bg-[#0c0c0c] border-t border-white/5 relative z-20">
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setSidebarTab('comments')}
              className={`flex-1 py-4 transition-colors relative ${sidebarTab === 'comments' ? 'text-white border-b-2 border-white' : 'text-white/30 hover:text-white'}`}
            >
              <MessageSquare size={18} className="mx-auto" />
              {sidebarTab === 'comments' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/10 blur-lg rounded-full"></span>}
            </button>
            <button
              onClick={() => setSidebarTab('similar')}
              className={`flex-1 py-4 transition-colors relative ${sidebarTab === 'similar' ? 'text-white border-b-2 border-white' : 'text-white/30 hover:text-white'}`}
            >
              <Sparkle size={18} className="mx-auto" />
              {sidebarTab === 'similar' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/10 blur-lg rounded-full"></span>}
            </button>
            <button
              onClick={() => setSidebarTab('persona')}
              className={`flex-1 py-4 transition-colors relative ${sidebarTab === 'persona' ? 'text-white border-b-2 border-white' : 'text-white/30 hover:text-white'}`}
            >
              <Settings size={18} className="mx-auto" />
              {sidebarTab === 'persona' && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/10 blur-lg rounded-full"></span>}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
            {/* Comments Tab */}
            {sidebarTab === 'comments' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">Comments <span className="text-white">0</span></div>
                  <ChevronRight size={14} className="text-white/20" />
                </div>
                <div className="space-y-4">
                  <p className="text-[11px] text-white/40 text-center py-4 italic">Be the first to comment!</p>
                </div>
              </>
            )}

            {/* Similar Talkies Tab */}
            {sidebarTab === 'similar' && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">Similar Talkies</div>
                <div className="space-y-3">
                  <p className="text-[11px] text-white/40 text-center py-4 italic">No similar characters found yet.</p>
                </div>
              </>
            )}

            {/* Persona Card Tab */}
            {sidebarTab === 'persona' && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mb-4">Persona Card</div>
                <div className="bg-[#161616] rounded-xl border border-white/5 divide-y divide-white/5">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <img src={character.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-[11px] text-white/70">Customize Persona for this chat exclusively</span>
                    </div>
                    <ChevronRight size={14} className="text-white/20" />
                  </div>
                  <div className="flex justify-between p-4">
                    <span className="text-[11px] text-white/50">Name</span>
                    <span className="text-[11px] text-white/30">Set your nickname</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span className="text-[11px] text-white/50">My Pronoun</span>
                    <span className="text-[11px] text-white/30">Select your pronoun</span>
                  </div>
                  <div className="flex justify-between p-4">
                    <span className="text-[11px] text-white/50">My Persona</span>
                    <span className="text-[11px] text-white/30">Set your persona</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-widest text-white/40 mt-6 mb-4">Sound Settings</div>
                <div className="bg-[#161616] rounded-xl border border-white/5 divide-y divide-white/5">
                  <div className="flex justify-between items-center p-4">
                    <span className="text-[11px] text-white/70">Auto-play dialogue voice</span>
                    <button
                      onClick={() => setAutoPlayVoice(!autoPlayVoice)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${autoPlayVoice ? 'bg-amber-400' : 'bg-white/20'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${autoPlayVoice ? 'right-0.5' : 'left-0.5'}`}></span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Comment Input (only show on comments tab) */}
          {sidebarTab === 'comments' && (
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center gap-3 bg-[#161616] rounded-full pl-2 pr-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md">Y</div>
                <input type="text" placeholder="Type your comment..." className="bg-transparent border-none outline-none text-[12px] text-white flex-1 placeholder:text-white/20 font-sans" />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

const CreateView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [intro, setIntro] = useState('');
  const [opening, setOpening] = useState('');
  const [gender, setGender] = useState('Female');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // AI-powered features state
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [suggestedVoice, setSuggestedVoice] = useState<string | null>(null);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ Skill: false, Image: false, Voice: false });

  // Skills state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Voice selection state
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voicePreviewPlaying, setVoicePreviewPlaying] = useState<string | null>(null);

  // Image Generation Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Available skills
  const availableSkills = [
    { id: 'image_gen', name: 'Image Generation', icon: '🎨', desc: 'Generate images during conversation' },
    { id: 'song_creation', name: 'Song Creation', icon: '🎵', desc: 'Create music and songs' },
    { id: 'code_assist', name: 'Code Assistant', icon: '💻', desc: 'Help with programming tasks' },
    { id: 'roleplay', name: 'Advanced Roleplay', icon: '🎭', desc: 'Enhanced roleplay capabilities' },
  ];

  // Handle publishing character (placeholder)
  const handlePublish = async () => {
    setIsAiLoading('publishing');
    try {
      // TODO: Implement actual publish logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Character published (stub)');
    } finally {
      setIsAiLoading(null);
    }
  };

  // Available voices
  const availableVoices = [
    { id: 'alloy', name: 'Alloy', gender: 'Neutral', preview: 'Modern and balanced' },
    { id: 'echo', name: 'Echo', gender: 'Male', preview: 'Deep and resonant' },
    { id: 'fable', name: 'Fable', gender: 'Female', preview: 'Warm and expressive' },
    { id: 'onyx', name: 'Onyx', gender: 'Male', preview: 'Rich and authoritative' },
    { id: 'nova', name: 'Nova', gender: 'Female', preview: 'Bright and energetic' },
    { id: 'shimmer', name: 'Shimmer', gender: 'Female', preview: 'Soft and soothing' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // AI Generator function for persona/tagline/voice/greeting
  const callAiGenerator = async (type: string) => {
    setIsAiLoading(type);
    try {
      const response = await fetch('/api/generate-character-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, description, gender })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      if (type === 'expand_persona' && data.persona) setDescription(data.persona);
      if (type === 'suggest_tagline' && data.tagline) setTagline(data.tagline);
      if (type === 'suggest_voice' && data.suggestedVoice) setSuggestedVoice(data.suggestedVoice);
      if (type === 'suggest_greeting' && data.greeting) setOpening(data.greeting);
    } catch (e) {
      console.error('AI generation failed:', e);
    } finally {
      setIsAiLoading(null);
    }
  };

  // Open image modal with pre-filled prompt
  const openImageModal = () => {
    const defaultPrompt = name ? `${name}, ${gender}, anime character portrait` : 'anime character portrait';
    setImagePrompt(defaultPrompt);
    setGeneratedImages([]);
    setShowImageModal(true);
  };

  // Generate 4 images using Gemini API (fallback since Pollinations moved)
  const generateMultipleImages = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImages(true);
    setGeneratedImages([]);

    const stylePrefix = 'High-quality anime style digital illustration, detailed character portrait, vibrant colors, visual novel art, expressive face, professional concept art';
    const fullPrompt = `${stylePrefix}. ${imagePrompt}`;

    try {
      // Generate 4 images using Gemini
      const imagePromises = Array.from({ length: 4 }, async (_, i) => {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: `${fullPrompt}, variation ${i + 1}` })
        });
        const data = await response.json();
        if (data.data) {
          return `data:${data.mimeType};base64,${data.data}`;
        }
        return null;
      });

      const results = await Promise.all(imagePromises);
      setGeneratedImages(results.filter(Boolean) as string[]);
    } catch (e) {
      console.error('Image generation failed:', e);
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const selectImage = (url: string) => {
    setAvatarUrl(url);
    setShowImageModal(false);
  };

  const generateAvatar = async () => {
    if (!description && !name) return;
    setIsGeneratingImage(true);

    try {
      const prompt = `Professional high-fidelity realistic digital illustration, cinematic concept art. A detailed character portrait of a ${gender} named ${name}. 
          Character Details: ${description}. 
          Artistic Style: Highly detailed realistic facial features, expressive eyes, realistic skin textures (natural tones), professional studio lighting with rim lights and soft fill, rich atmospheric background, textured clothing. Masterwork quality, trending on ArtStation, 8k ultra-detailed. Realistic proportion and sophisticated palette. Close-up or waist-up composition.`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (data.data) {
        setAvatarUrl(`data:${data.mimeType};base64,${data.data}`);
      }
    } catch (e) {
      console.error("Failed to generate image", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0c0c0c] overflow-hidden animate-fade-in relative z-50">
      <button
        onClick={onBack}
        className="absolute top-6 right-8 z-[60] p-3 rounded-full bg-[#1c1816] text-white/60 hover:text-white hover:bg-[#25201d] transition-all border border-white/10 hover:border-white/30 shadow-2xl group"
      >
        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <div className="flex-1 overflow-y-auto border-r border-white/5 p-6 md:p-12 scrollbar-hide bg-[#0c0c0c]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white font-sans tracking-tight">Create a Character</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-8 pb-20">
          <div className="space-y-3 bg-[#161616] p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Name <span className="text-red-500">*</span></label>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-colors border border-white/5">
                <Sparkle size={10} /> AI Writer
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-white/20 transition-colors font-sans text-sm"
              placeholder="e.g. Homework Helper"
            />
            <div className="text-right text-[10px] text-white/20">{name.length}/18</div>
          </div>

          <div className="space-y-3 bg-[#161616] p-5 rounded-2xl border border-white/5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              Gender <Info size={12} /> <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6 pt-1">
              {['Male', 'Female', 'Non-Binary'].map((g) => (
                <label key={g} className="flex items-center gap-2.5 cursor-pointer group select-none">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${gender === g ? 'border-white' : 'border-white/20 group-hover:border-white/40'}`}>
                    {gender === g && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                  <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} className="hidden" />
                  <span className={`text-sm font-medium ${gender === g ? 'text-white' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 bg-[#161616] p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Settings (Persona) <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">Update</span>
            </div>
            <p className="text-[10px] text-white/30 -mt-1 mb-2">Can't be seen by the user, only affects the dialogue effect</p>
            <div className="bg-[#0c0c0c] border border-white/10 rounded-xl p-3">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-40 bg-transparent text-white/80 text-sm leading-relaxed outline-none resize-none placeholder:text-white/20 font-sans scrollbar-hide"
                placeholder="# Roles and Goals:&#10;1. Your name and role should align with user expectations...&#10;&#10;# Output Format:&#10;1. Present the answer and three related options..."
              />
            </div>
            <div className="text-right text-[10px] text-white/20">{description.length}/4000</div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded">Mention</span>
              <span className="flex items-center gap-1 text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded border border-white/5"><User size={10} /> User</span>
              <span className="flex items-center gap-1 text-[10px] bg-white/5 text-white/60 px-2 py-1 rounded border border-white/5"><User size={10} /> {name || 'Character'}</span>
            </div>
          </div>

          <div className="space-y-3 bg-[#161616] p-5 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Intro (No impact on reply) <span className="text-red-500">*</span></label>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">Update</span>
            </div>
            <p className="text-[10px] text-white/30 -mt-1 mb-2">Introduction of your character doesn't affect the dialogue effect</p>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="w-full h-20 bg-[#0c0c0c] border border-white/10 rounded-xl p-3 text-white/80 text-sm outline-none resize-none focus:border-white/20 transition-colors placeholder:text-white/20"
              placeholder="Just like the name says, feed me your homework by typing/picture I'll give the answer"
            />
            <div className="text-right text-[10px] text-white/20">{intro.length}/2000</div>
          </div>

          <div className="space-y-3 bg-[#161616] p-5 rounded-2xl border border-white/5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Opening <span className="text-red-500">*</span></label>
            <textarea
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              className="w-full h-16 bg-[#0c0c0c] border border-white/10 rounded-xl p-3 text-white/80 text-sm outline-none resize-none focus:border-white/20 transition-colors placeholder:text-white/20"
              placeholder="Show me your homework"
            />
            <div className="text-right text-[10px] text-white/20">{opening.length}/500</div>
          </div>

          {/* Skill Section */}
          <div className="p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('Skill')}>
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className={`text-white/40 transition-transform ${expandedSections.Skill ? 'rotate-180' : ''}`} />
                <h3 className="text-sm font-bold text-white">Skill</h3>
                {selectedSkills.length > 0 && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{selectedSkills.length} selected</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowSkillModal(true); }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all">
                <Plus size={10} /> Add
              </button>
            </div>
            <p className="text-[11px] text-white/30 pl-6">Supports additional capabilities like Image Generation and Song Creation.</p>
            {expandedSections.Skill && (
              <div className="mt-4 ml-6 space-y-2">
                {selectedSkills.length === 0 ? (
                  <div className="h-20 bg-[#0c0c0c] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-white/20">
                    <Sparkle size={20} />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skillId => {
                      const skill = availableSkills.find(s => s.id === skillId);
                      return skill ? (
                        <div key={skillId} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
                          <span>{skill.icon}</span>
                          <span className="text-xs text-white">{skill.name}</span>
                          <button onClick={() => setSelectedSkills(prev => prev.filter(s => s !== skillId))} className="text-white/40 hover:text-red-400"><X size={12} /></button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image Section */}
          <div className="p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('Image')}>
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className={`text-white/40 transition-transform ${expandedSections.Image ? 'rotate-180' : ''}`} />
                <h3 className="text-sm font-bold text-white">Image</h3>
                {avatarUrl && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Added</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); openImageModal(); }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all">
                <Plus size={10} /> Add
              </button>
            </div>
            <p className="text-[11px] text-white/30 pl-6">Add image to make your Character more engaging.</p>
            {expandedSections.Image && (
              <div className="mt-4 ml-6 p-4 bg-[#0c0c0c] border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-white/20">
                {avatarUrl ? (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden group/img">
                    <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                    <button onClick={(e) => { e.stopPropagation(); openImageModal(); }} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <RotateCcw size={20} className="mr-2" /> Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 w-full">
                    <ImageIcon size={24} className="mb-2" />
                    <p className="text-xs text-white/40 mb-3">No image selected</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); openImageModal(); }}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-white/90"
                    >
                      <Wand2 size={12} />
                      Generate with AI
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voice Section */}
          <div className="p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('Voice')}>
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className={`text-white/40 transition-transform ${expandedSections.Voice ? 'rotate-180' : ''}`} />
                <h3 className="text-sm font-bold text-white">Voice</h3>
                {selectedVoice && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{availableVoices.find(v => v.id === selectedVoice)?.name}</span>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setShowVoiceModal(true); }} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all">
                <Plus size={10} /> Add
              </button>
            </div>
            <p className="text-[11px] text-white/30 pl-6">Choose a voice for your Character.</p>
            {expandedSections.Voice && (
              <div className="mt-4 ml-6">
                {!selectedVoice ? (
                  <div className="h-20 bg-[#0c0c0c] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-white/20">
                    <VolumeX size={20} />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Volume2 size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{availableVoices.find(v => v.id === selectedVoice)?.name}</p>
                      <p className="text-[10px] text-white/40">{availableVoices.find(v => v.id === selectedVoice)?.preview}</p>
                    </div>
                    <button onClick={() => setSelectedVoice(null)} className="text-white/40 hover:text-red-400"><X size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      <div className="hidden lg:flex w-[45%] flex-col border-l border-white/5 bg-[#0e0e0e] relative z-20">
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#0e0e0e]">
          <span className="text-[13px] font-bold text-white">Preview and Testing</span>
          <div className="flex gap-3">
            <button
              onClick={handlePublish}
              disabled={isAiLoading === 'publishing'}
              className="px-6 py-2 bg-[#1c1816] text-white/60 rounded-lg font-bold text-[11px] hover:text-white hover:bg-[#25201d] transition-all disabled:opacity-50"
            >
              {isAiLoading === 'publishing' ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handlePublish}
              disabled={isAiLoading === 'publishing'}
              className="px-6 py-2 bg-white text-black rounded-lg font-bold text-[11px] hover:bg-white/90 transition-all shadow-lg disabled:opacity-50"
            >
              {isAiLoading === 'publishing' ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative bg-[#0e0e0e]">
          <div className="absolute top-4 left-6 z-10">
            <p className="text-[9px] text-white/20 uppercase tracking-widest">Notice: Everything Characters say is made up by AI!</p>
          </div>

          <div className="flex-1 flex items-center justify-center select-none pointer-events-none overflow-hidden relative">
            {avatarUrl ? (
              <div className="absolute inset-0">
                <img src={avatarUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] to-transparent"></div>
              </div>
            ) : (
              <div className="text-[300px] font-serif font-bold text-white leading-none opacity-[0.03]">A</div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 w-full z-10">
            {(opening || intro) && (
              <div className="mb-8 flex gap-4 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 overflow-hidden border border-white/10">
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1c1816] text-white/40">
                      <User size={14} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-white">{name || 'Character'}</span>
                  </div>
                  <div className="bg-[#1c1816] p-4 rounded-2xl rounded-tl-sm border border-white/10 shadow-sm inline-block max-w-[90%]">
                    <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{opening || intro}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-3 px-1">
              <button className="text-white/20 hover:text-white transition-colors">
                <RotateCcw size={14} />
                <span className="sr-only">Reset</span>
              </button>
            </div>

            <div className="relative group">
              <input
                type="text"
                disabled
                placeholder="Preview is read-only in this demo"
                className="w-full bg-[#1c1816] border border-white/10 rounded-full py-4 pl-5 pr-14 text-sm text-white/40 outline-none cursor-not-allowed"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="p-2 text-white/20"><Plus size={18} /></button>
                <button className="p-2 bg-white/10 rounded-full text-white/40"><Send size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Generation Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex animate-fade-in">
          <div className="w-[220px] bg-[#0c0c0c] border-r border-white/10 p-5 flex flex-col gap-6">
            <button onClick={() => setShowImageModal(false)} className="flex items-center gap-2 text-white/60 hover:text-white text-sm">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Model Selection</h3>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">AI</div>
                <span className="text-xs text-white">Anime Model</span>
              </div>
            </div>
            <p className="text-[10px] text-white/30 mt-auto">Powered by Pollinations.ai</p>
          </div>
          <div className="flex-1 flex flex-col p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Image Creation</h2>
              <button onClick={() => setShowImageModal(false)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">Prompt</span>
              <div className="relative">
                <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder="Describe your character's appearance..." className="w-full h-24 bg-[#161616] border border-white/10 rounded-xl p-4 text-white text-sm resize-none outline-none focus:border-white/20" />
                <button onClick={generateMultipleImages} disabled={!imagePrompt.trim() || isGeneratingImages} className="absolute right-3 bottom-3 px-5 py-2 bg-white text-black rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 flex items-center gap-2">
                  {isGeneratingImages ? <Loader2 size={14} className="animate-spin" /> : null}Generate
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {generatedImages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{imagePrompt.substring(0, 50)}...</span>
                    <button onClick={generateMultipleImages} className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white"><RotateCcw size={12} /> Regenerate</button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {generatedImages.map((url, i) => (
                      <button key={i} onClick={() => selectImage(url)} className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all group relative bg-[#1a1a1a]">
                        <img src={url} className="w-full h-full object-cover" alt={`Generated ${i + 1}`} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full">Select</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {generatedImages.length === 0 && !isGeneratingImages && (
                <div className="flex items-center justify-center h-64 text-white/20">
                  <div className="text-center"><ImageIcon size={48} className="mx-auto mb-4 opacity-50" /><p className="text-sm">Enter a prompt and click Generate</p></div>
                </div>
              )}
              {isGeneratingImages && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center"><Loader2 size={48} className="mx-auto mb-4 animate-spin text-purple-500" /><p className="text-sm text-white/60">Generating 4 variations...</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Skill Selection Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-[#161616] rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Skills</h2>
              <button onClick={() => setShowSkillModal(false)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {availableSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => {
                    if (selectedSkills.includes(skill.id)) {
                      setSelectedSkills(prev => prev.filter(s => s !== skill.id));
                    } else {
                      setSelectedSkills(prev => [...prev, skill.id]);
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedSkills.includes(skill.id) ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <span className="text-2xl">{skill.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white">{skill.name}</p>
                    <p className="text-[10px] text-white/40">{skill.desc}</p>
                  </div>
                  {selectedSkills.includes(skill.id) && <Check size={18} className="text-purple-400" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSkillModal(false)}
              className="w-full mt-6 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center animate-fade-in">
          <div className="bg-[#161616] rounded-2xl border border-white/10 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Choose Voice</h2>
              <button onClick={() => setShowVoiceModal(false)} className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {availableVoices.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => {
                    setSelectedVoice(voice.id);
                    setShowVoiceModal(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedVoice === voice.id ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Volume2 size={18} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-white">{voice.name}</p>
                    <p className="text-[10px] text-white/40">{voice.gender} • {voice.preview}</p>
                  </div>
                  {selectedVoice === voice.id && <Check size={18} className="text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Training & Data View - Comprehensive training interface
const TrainingView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [behavioralSliders, setBehavioralSliders] = useState({
    empathyLogic: 50,
    agreeableChallenging: 40,
    chaosOrder: 60,
    pessimismOptimism: 45
  });
  const [stylisticSliders, setStylisticSliders] = useState({
    conciseVerbose: 55,
    casualFormal: 60
  });
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Stoic', 'Playful']);
  const [constraints, setConstraints] = useState({
    refuseEmotional: false,
    avoidSlang: false,
    neverSpeculate: false,
    limitResponse: false,
    stayInCharacter: false,
    rejectFlirtation: false
  });
  const [archetype, setArchetype] = useState('Mythical Narrator');
  const [simulationMessages, setSimulationMessages] = useState([
    { role: 'assistant', content: 'Systems online. My neural pathways are malleable. How shall I be shaped today?' },
    { role: 'user', content: 'lets start' },
    { role: 'assistant', content: '[Training Mode] Acknowledged. Adjusting baseline parameters to incorporate: "lets start". Deviation recorded.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const allTraits = ['Stoic', 'Playful', 'Dark', 'Optimistic', 'Sarcastic', 'Polite', 'Mysterious', 'Energetic'];

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    setSimulationMessages(prev => [
      ...prev,
      { role: 'user', content: inputMessage },
      { role: 'assistant', content: `[Training Mode] Processing: "${inputMessage}". Behavioral parameters adjusted.` }
    ]);
    setInputMessage('');
  };

  const SliderComponent: React.FC<{ leftLabel: string; rightLabel: string; value: number; onChange: (v: number) => void }> =
    ({ leftLabel, rightLabel, value, onChange }) => (
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb"
          style={{ accentColor: '#a855f7' }}
        />
      </div>
    );

  return (
    <div className="flex h-screen bg-[#0c0c0c] animate-fade-in overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[320px] flex-shrink-0 border-r border-white/5 bg-[#0c0c0c] flex flex-col overflow-y-auto">
        <div className="p-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Back</span>
          </button>
          <h1 className="text-2xl font-serif italic text-white mb-1">Training & Data</h1>
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Secure Environment
          </p>

          {/* Live Parameters */}
          <div className="bg-[#1c1816] border border-white/5 rounded-2xl p-5 space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/40">Live Parameters</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40">
                <Info size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Archetype</span>
              </div>
              <p className="text-lg font-serif text-white">{archetype}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/40">
                <Info size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Constraints</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {constraints.avoidSlang && <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">No Slang</span>}
                {constraints.refuseEmotional && <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">Refuse Comfort</span>}
                {Object.values(constraints).every(v => !v) && <span className="text-white/30 text-[11px] italic">None active</span>}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Guided Sessions</span>
              <div className="space-y-2">
                <button className="flex items-center gap-2 text-[12px] text-green-400 hover:text-green-300">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  "Correct this flawed argument"
                </button>
                <button className="flex items-center gap-2 text-[12px] text-green-400 hover:text-green-300">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  "Explain this concept coldly"
                </button>
              </div>
            </div>

            <button className="w-full py-3 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-colors">
              Save & Lock Model
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#0c0c0c]">
        <div className="max-w-5xl p-12 space-y-10">
          {/* Training Sections Row */}
          <div className="grid grid-cols-2 gap-8">
            {/* Behavioral Training */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif italic text-white">Behavioral Training</h2>
              <div className="bg-[#1c1816] border border-white/5 rounded-2xl p-6 space-y-6">
                <SliderComponent leftLabel="Empathy" rightLabel="Logic" value={behavioralSliders.empathyLogic} onChange={(v) => setBehavioralSliders(p => ({ ...p, empathyLogic: v }))} />
                <SliderComponent leftLabel="Agreeable" rightLabel="Challenging" value={behavioralSliders.agreeableChallenging} onChange={(v) => setBehavioralSliders(p => ({ ...p, agreeableChallenging: v }))} />
                <SliderComponent leftLabel="Chaos" rightLabel="Order" value={behavioralSliders.chaosOrder} onChange={(v) => setBehavioralSliders(p => ({ ...p, chaosOrder: v }))} />
                <SliderComponent leftLabel="Pessimism" rightLabel="Optimism" value={behavioralSliders.pessimismOptimism} onChange={(v) => setBehavioralSliders(p => ({ ...p, pessimismOptimism: v }))} />
              </div>
            </div>

            {/* Stylistic Training */}
            <div className="space-y-6">
              <h2 className="text-xl font-serif italic text-white">Stylistic Training</h2>
              <div className="bg-[#1c1816] border border-white/5 rounded-2xl p-6 space-y-6">
                <SliderComponent leftLabel="Concise" rightLabel="Verbose" value={stylisticSliders.conciseVerbose} onChange={(v) => setStylisticSliders(p => ({ ...p, conciseVerbose: v }))} />
                <SliderComponent leftLabel="Casual" rightLabel="Formal" value={stylisticSliders.casualFormal} onChange={(v) => setStylisticSliders(p => ({ ...p, casualFormal: v }))} />
              </div>

              {/* Personality Matrix */}
              <h3 className="text-lg font-serif italic text-white pt-4">Personality Matrix</h3>
              <div className="flex flex-wrap gap-2">
                {allTraits.map(trait => (
                  <button
                    key={trait}
                    onClick={() => toggleTrait(trait)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${selectedTraits.includes(trait)
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {selectedTraits.includes(trait) && <Check size={12} />}
                      {trait}
                    </span>
                  </button>
                ))}
                <button className="px-4 py-2 rounded-full text-[11px] font-bold bg-white/5 text-white/40 hover:bg-white/10 border border-dashed border-white/20">
                  + Add Custom
                </button>
              </div>
            </div>
          </div>

          {/* Constraint Training */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif italic text-white">
              Constraint Training <span className="text-red-400 text-sm ml-2">(Hard Limits)</span>
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'refuseEmotional', label: 'Refuse emotional reassurance' },
                { key: 'avoidSlang', label: 'Avoid modern slang' },
                { key: 'neverSpeculate', label: 'Never speculate without evidence' },
                { key: 'limitResponse', label: 'Limit response length' },
                { key: 'stayInCharacter', label: 'Stay in period character' },
                { key: 'rejectFlirtation', label: 'Reject flirtation' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 bg-[#1c1816] border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={constraints[key as keyof typeof constraints]}
                    onChange={() => setConstraints(p => ({ ...p, [key]: !p[key as keyof typeof constraints] }))}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 accent-purple-500"
                  />
                  <span className="text-[12px] text-white/70">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Domain Knowledge */}
          <div className="space-y-4">
            <h2 className="text-xl font-serif italic text-white">Domain Knowledge</h2>
            <div className="bg-[#1c1816] border border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-white/20 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <BookOpen size={24} className="text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold mb-1">Upload Knowledge Base</p>
                <p className="text-[11px] text-white/40">PDF, TXT, or JSON. Max 50MB.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Panel */}
      <div className="w-[400px] flex-shrink-0 border-l border-white/5 bg-[#0c0c0c] flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Simulation Mode</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {simulationMessages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-xl ${msg.role === 'user' ? 'bg-purple-500/20 ml-8' : 'bg-white/5 mr-8'}`}>
              <p className="text-[13px] text-white/80 font-mono">{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Test your constraints..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-white/20"
            />
            <button onClick={handleSend} className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [stats, setStats] = useState({ level: 0, credits: 0, chatHours: 0, customChars: 0, streak: 0, stories: 0 });

  useEffect(() => {
    // Load stats from API if user exists
    const fetchStats = async () => {
      // Get user from parent or auth
      const { data } = await supabase?.auth.getUser() ?? { data: { user: null } };
      const user = data.user;
      if (user) {
        try {
          const res = await fetch(`/api/user/rewards?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            setStats(data);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Fallback to local storage if API fails or no user
      const savedStats = localStorage.getItem('agentwood_rewards_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    };

    fetchStats();
  }, []);

  const milestones = [
    { level: 1, title: "First Whisper", desc: "Spend 1 hour talking to any character.", progress: stats.chatHours * 60, total: 60, completed: stats.chatHours >= 1, reward: "50 Credits", icon: <Clock size={20} /> },
    { level: 2, title: "Storyteller", desc: "Create your first custom character.", progress: stats.customChars, total: 1, completed: stats.customChars >= 1, reward: "Voice Pack", icon: <PenTool size={20} /> },
    { level: 3, title: "Deep Dive", desc: "Reach a 7-day streak.", progress: stats.streak, total: 7, completed: stats.streak >= 7, reward: "Badge", icon: <Trophy size={20} /> },
    { level: 4, title: "World Builder", desc: "Craft 5 unique stories.", progress: stats.stories, total: 5, completed: stats.stories >= 5, reward: "200 Credits", icon: <Map size={20} /> },
    { level: 5, title: "Legend Status", desc: "Create a character that reaches 1,000 users.", progress: 124, total: 1000, completed: false, reward: "Pro (1 Month)", icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0c0c0c] animate-fade-in overflow-hidden">
      {/* Left Sidebar - Consistent with Settings */}
      <div className="w-[280px] flex-shrink-0 border-r border-white/5 bg-[#0c0c0c] flex flex-col">
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Back</span>
          </button>
          <h1 className="text-2xl font-serif italic text-white mb-6">Rewards</h1>

          {/* Stats Summary */}
          <div className="space-y-4 mb-8">
            <div className="bg-[#1c1816] border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500"><Trophy size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">Level</p>
                <p className="text-xl font-serif text-white">{stats.level}</p>
              </div>
            </div>
            <div className="bg-[#1c1816] border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Sparkle size={18} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">Credits</p>
                <p className="text-xl font-serif text-white">{stats.credits}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 space-y-3 border-t border-white/5">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-white/10">
            <p className="text-sm font-serif italic text-white mb-2">Invite Friends, Earn Credits</p>
            <p className="text-[11px] text-white/50 mb-3">Get 500 credits for every friend who joins and crafts their first story.</p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + '?ref=user');
                alert('Invite link copied!');
              }}
              className="w-full py-2.5 rounded-lg bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              Copy Invite Link
            </button>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto bg-[#0c0c0c]">
        <div className="max-w-3xl p-12">
          <h2 className="text-4xl font-serif italic text-white mb-2">Achievements</h2>
          <p className="text-white/40 text-sm mb-10">Complete milestones to earn rewards.</p>

          <div className="space-y-4">
            {milestones.map((milestone, i) => (
              <div key={i} className={`flex gap-5 p-5 rounded-2xl border transition-all duration-300 ${milestone.completed ? 'bg-white/5 border-white/10' : 'bg-[#1c1816] border-white/5'}`}>
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-white/40'}`}>
                  {milestone.completed ? <Check size={20} strokeWidth={3} /> : milestone.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className={`text-lg font-bold ${milestone.completed ? 'text-white' : 'text-white/70'}`}>{milestone.title}</h3>
                      <p className="text-sm text-white/40">{milestone.desc}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${milestone.completed ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/50'}`}>
                      {milestone.completed ? <Unlock size={11} /> : <Lock size={11} />}
                      {milestone.reward}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-white/30">
                      <span>Progress</span>
                      <span>{milestone.progress} / {milestone.total}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${milestone.completed ? 'bg-green-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, (milestone.progress / milestone.total) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ onBack: () => void; user: any; onUpdateUser: (u: any) => void; onLogout?: () => void }> = ({ onBack, user, onUpdateUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Public profile');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile State
  const [profile, setProfile] = useState({
    username: user?.username || '',
    displayName: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatarUrl || '' // TODO: Handle file upload
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    autoPlayVoice: false, // Default off as requested
    autoPlayMusic: true,
    volume: 80,
    theme: 'Dark'
  });

  // Load preferences from local storage on mount
  useEffect(() => {
    const savedAudio = localStorage.getItem('audio_settings');
    if (savedAudio) {
      setPreferences(p => ({ ...p, ...JSON.parse(savedAudio) }));
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL immediately
      const url = URL.createObjectURL(file);
      setProfile(p => ({ ...p, avatar: url }));

      // In a real app, we'd upload this to S3/Supabase Storage here
      // For now, we'll assume the API can accept a base64 string or we handle it in save
      // We will just simulate success for the UI feedback
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: profile.username,
          name: profile.displayName,
          bio: profile.bio,
          // avatarUrl: profile.avatar // We need a real upload endpoint for this
        })
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdateUser({ ...user, ...updated }); // formatting might vary
        alert("Profile updated!");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('audio_settings', JSON.stringify({
      autoPlayVoice: preferences.autoPlayVoice,
      autoPlayMusic: preferences.autoPlayMusic,
      volume: preferences.volume
    }));
    alert("Preferences saved!");
  };

  const tabs = [
    'Public profile',
    'Account',
    'Preferences',
    'Muted words',
    'Parental Insights',
    'Advanced'
  ];

  return (
    <div className="flex h-screen bg-[#0c0c0c] animate-fade-in overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-[280px] flex-shrink-0 border-r border-white/5 bg-[#0c0c0c] flex flex-col">
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Back</span>
          </button>
          <h1 className="text-2xl font-serif italic text-white mb-6">Settings</h1>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-3 border-t border-white/5">
          <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-[#5865F2]/10 text-[#5865F2] hover:bg-[#5865F2]/20 transition-colors group">
            <Gamepad2 size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Join Community</span>
          </button>
          <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors group">
            <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Get the App</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors group"
            >
              <X size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xs uppercase tracking-wider">Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto bg-[#0c0c0c]">
        <div className="max-w-2xl p-12">
          <h2 className="text-4xl font-serif italic text-white mb-12">{activeTab}</h2>

          {activeTab === 'Public profile' && (
            <div className="space-y-10">
              {/* Avatar */}
              <div className="relative inline-block group cursor-pointer" onClick={handleAvatarClick}>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffaa40] to-[#9c40ff] p-1">
                  <div className="w-full h-full rounded-full bg-[#1c1816] flex items-center justify-center relative overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-6xl font-bold text-white">{profile.displayName?.[0] || 'A'}</div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Pencil size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <button className="absolute bottom-1 right-1 p-2 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Pencil size={14} />
                </button>
              </div>

              {/* Forms */}
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 focus-within:border-white/30 transition-colors group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 group-focus-within:text-dipsea-accent transition-colors">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-white font-sans text-base placeholder:text-white/20"
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">{profile.username.length}/20</div>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 focus-within:border-white/30 transition-colors group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 group-focus-within:text-dipsea-accent transition-colors">Display Name</label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-white font-sans text-base placeholder:text-white/20"
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">{profile.displayName.length}/20</div>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 focus-within:border-white/30 transition-colors group h-40">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-dipsea-accent transition-colors">Description</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full h-[calc(100%-24px)] bg-transparent border-none outline-none text-white font-sans text-base resize-none placeholder:text-white/20"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">{profile.bio.length}/500</div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Account' && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Email Address</h3>
                <p className="text-white/40 text-sm mb-4">Your email is visible only to you.</p>
                <input type="email" defaultValue={user?.email || "user@example.com"} className="bg-black/20 w-full p-3 rounded-lg text-white border border-white/10 focus:border-white/30 outline-none" disabled />
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Password</h3>
                <p className="text-white/40 text-sm mb-4">Update your password for security.</p>
                <input type="password" placeholder="••••••••" className="bg-black/20 w-full p-3 rounded-lg text-white border border-white/10 focus:border-white/30 outline-none" />
              </div>
              <button className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors">
                Save Changes
              </button>
              <button className="w-full py-4 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/5 rounded-xl transition-colors border border-red-500/20">
                Log Out
              </button>
            </div>
          )}

          {activeTab === 'Preferences' && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Theme</h3>
                <div className="flex gap-3">
                  {['Dark', 'Light', 'System'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => setPreferences(p => ({ ...p, theme }))}
                      className={`flex-1 py-3 rounded-xl border transition-all ${preferences.theme === theme ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Settings */}
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Sound Settings</h3>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-medium text-white">Auto-play dialogue voice</h3>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, autoPlayVoice: !p.autoPlayVoice }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${preferences.autoPlayVoice ? 'bg-[#ffaa40]' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${preferences.autoPlayVoice ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-medium text-white">Auto-play background music</h3>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, autoPlayMusic: !p.autoPlayMusic }))}
                    className={`w-12 h-6 rounded-full relative transition-colors ${preferences.autoPlayMusic ? 'bg-[#ffaa40]' : 'bg-white/20'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${preferences.autoPlayMusic ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={preferences.volume}
                    onChange={(e) => setPreferences(p => ({ ...p, volume: parseInt(e.target.value) }))}
                    className="w-full accent-[#ffaa40] h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Notifications</h3>
                    <p className="text-white/40 text-sm">Receive push notifications</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-white/20 relative">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow"></span>
                  </button>
                </div>
              </div>
              <button
                onClick={handleSavePreferences}
                className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors"
              >
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'Muted words' && (
            <div className="space-y-6">
              <p className="text-white/40">Posts containing muted words won't appear in your timeline. Manage your muted words below.</p>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Add Muted Word</h3>
                <div className="flex gap-3">
                  <input type="text" placeholder="Enter word or phrase..." className="flex-1 bg-black/20 p-3 rounded-lg text-white border border-white/10 focus:border-white/30 outline-none" />
                  <button className="px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-white/90">Add</button>
                </div>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Muted Words List</h3>
                <div className="space-y-2">
                  <p className="text-white/30 text-sm italic">No muted words yet. Add words above to filter content.</p>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'Parental Insights' && (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck size={24} className="text-amber-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Family Safety Features</h3>
                    <p className="text-white/60 text-sm">Monitor and manage content access for a safer experience.</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Content Filter</h3>
                    <p className="text-white/40 text-sm">Block mature or sensitive content</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-purple-500 relative">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow"></span>
                  </button>
                </div>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Daily Time Limit</h3>
                <select className="w-full bg-black/20 p-3 rounded-lg text-white border border-white/10 outline-none">
                  <option value="none">No Limit</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Usage Stats This Week</h3>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white">2.5h</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Time</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white">12</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Sessions</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl">
                    <p className="text-2xl font-bold text-white">5</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Characters</p>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors">
                Save Parental Settings
              </button>
            </div>
          )}

          {activeTab === 'Advanced' && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Developer Mode</h3>
                    <p className="text-white/40 text-sm">Enable advanced debugging features</p>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-white/20 relative">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow"></span>
                  </button>
                </div>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 opacity-60">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">API Access</h3>
                  <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
                </div>
                <p className="text-white/40 text-sm">
                  Developer API access and key management will be available in a future update.
                </p>
              </div>
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Data Export</h3>
                <p className="text-white/40 text-sm mb-4">Download all your data including chat history, preferences, and created characters.</p>
                <button className="w-full py-3 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 rounded-lg transition-colors">
                  Request Data Export
                </button>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-red-400 mb-2">Danger Zone</h3>
                <p className="text-white/40 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button className="w-full py-3 bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest hover:bg-red-500/30 rounded-lg transition-colors border border-red-500/30">
                  Delete Account
                </button>
              </div>
              <button className="w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-white/90 rounded-xl transition-colors">
                Save Advanced Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface World {
  id: string;
  name: string;
  description: string;
  image: string;
}

const WORLDS: World[] = [
  { id: 'cyberpunk', name: 'Neon Synapse', description: 'A high-tech, low-life future where rain never stops and neon reflects off wet pavement.', image: '/worlds/cyberpunk.png' },
  { id: 'fantasy', name: 'Ethereal Glade', description: 'Ancient magic permeates the mist-shrouded forests. Beasts and beauty coexist.', image: '/worlds/fantasy.png' },
  { id: 'noir', name: 'Velvet Shadows', description: '1920s aesthetic, jazz clubs, smoke, and secrets whispered in dark corners.', image: '/worlds/noir.png' },
  { id: 'modern', name: 'Urban Loft', description: 'Contemporary city life. Coffee shops, art galleries, and modern romance.', image: '/worlds/modern.png' },
];

const CraftStoryView: React.FC<{ onBack: () => void; characters: CharacterProfile[]; onStartStory?: (data: any) => void }> = ({ onBack, characters, onStartStory }) => {
  const [step, setStep] = useState(0); // 0: Selection, 1: Type, 2: Idea, 3: Ready
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<CharacterProfile[]>([]);
  const [storyType, setStoryType] = useState<string | null>(null);
  const [storyIdea, setStoryIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Existing logic for connection
  const toggleCharacter = (char: CharacterProfile) => {
    if (selectedCharacters.find(c => c.name === char.name)) {
      setSelectedCharacters(prev => prev.filter(c => c.name !== char.name));
    } else {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters(prev => [...prev, char]);
      }
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBackStep = () => setStep(prev => prev - 1);

  const startStory = () => {
    if (onStartStory) {
      onStartStory({
        world: selectedWorld,
        characters: selectedCharacters,
        type: storyType,
        idea: storyIdea
      });
    } else {
      // Fallback or todo
      console.log("Start story:", { selectedWorld, selectedCharacters, storyType, storyIdea });
    }
  };

  const STORY_TYPES = [
    { id: 'fun', emoji: '✨', label: 'Short fun story', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'adventure', emoji: '⚔️', label: 'Fantasy adventure', color: 'text-red-400', bg: 'bg-red-400/10' },
    { id: 'romance', emoji: '💕', label: 'Romance', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { id: 'comedy', emoji: '😂', label: 'Comedy', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'dark', emoji: '🌙', label: 'Dark / dramatic', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { id: 'mystery', emoji: '🔍', label: 'Mystery', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  // Helper to render steps
  const renderStepContent = () => {
    switch (step) {
      case 0: // Selection (Existing)
        return (
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-dipsea-accent">
                <Map size={14} /> Select a World
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {WORLDS.map((world) => (
                  <div
                    key={world.id}
                    onClick={() => setSelectedWorld(world)}
                    className={`group relative h-40 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${selectedWorld?.id === world.id ? 'border-white ring-2 ring-white/20 scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}
                  >
                    <img src={world.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h4 className="text-white font-serif italic text-xl">{world.name}</h4>
                    </div>
                    {selectedWorld?.id === world.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <Check size={14} className="text-black" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-dipsea-accent">
                <History size={14} /> Recent Encounters
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {characters.slice(0, 6).map((char, i) => {
                  const isSelected = selectedCharacters.find(c => c.name === char.name);
                  return (
                    <div
                      key={i}
                      onClick={() => toggleCharacter(char)}
                      className={`relative aspect-[3/4] rounded-[24px] overflow-hidden cursor-pointer group transition-all duration-300 ${isSelected ? 'ring-2 ring-dipsea-accent scale-[1.02] shadow-2xl' : 'hover:scale-[1.02]'}`}
                    >
                      <img src={char.avatarUrl} className={`w-full h-full object-cover transition-all ${isSelected ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-serif text-lg leading-none">{char.name}</p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-dipsea-accent rounded-full flex items-center justify-center shadow-lg">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-16 flex justify-center">
              <button
                onClick={handleNext}
                disabled={!selectedWorld || selectedCharacters.length === 0}
                className={`
                    px-12 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-500
                    ${(!selectedWorld || selectedCharacters.length === 0)
                    ? 'bg-white/5 text-white/20 cursor-not-allowed'
                    : 'bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]'}
                `}
              >
                Choose Story Type <ChevronRight size={16} />
              </button>
            </div>
          </div>
        );

      case 1: // Story Type
        return (
          <div className="max-w-4xl mx-auto animate-fade-in text-center">
            <h2 className="text-4xl font-serif italic text-white mb-4">Choose a Story Type</h2>
            <p className="text-white/40 mb-12">What kind of story do you want?</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {STORY_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { setStoryType(type.id); handleNext(); }}
                  className="flex flex-col items-center justify-center p-8 rounded-3xl bg-[#161616] border border-white/5 hover:border-white/20 hover:bg-[#1f1b19] transition-all group"
                >
                  <span className="text-4xl mb-6 group-hover:scale-110 transition-transform">{type.emoji}</span>
                  <span className="text-white font-bold font-serif text-lg">{type.label}</span>
                </button>
              ))}
            </div>

            <button onClick={handleBackStep} className="mt-12 text-white/20 hover:text-white text-xs uppercase tracking-widest font-bold">Back</button>
          </div>
        );

      case 2: // Idea (Optional)
        return (
          <div className="max-w-2xl mx-auto animate-fade-in text-center">
            <h2 className="text-4xl font-serif italic text-white mb-4">Add an Idea</h2>
            <p className="text-white/40 mb-12">One sentence is enough — or skip this and we'll surprise you.</p>

            <div className="bg-[#161616] border border-white/10 rounded-3xl p-6 focus-within:border-white/30 transition-colors mb-8">
              <textarea
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                placeholder="E.g. We go on a quest together..."
                className="w-full bg-transparent border-none outline-none text-white text-lg placeholder:text-white/20 min-h-[150px] resize-none font-serif"
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button onClick={handleNext} className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-widest font-bold transition-all">
                Skip & Surprise Me
              </button>
              <button
                onClick={handleNext}
                disabled={!storyIdea.trim()}
                className={`px-8 py-4 rounded-full text-black text-xs uppercase tracking-widest font-bold transition-all ${!storyIdea.trim() ? 'bg-white/10 text-white/20' : 'bg-white hover:scale-105'}`}
              >
                Create Story
              </button>
            </div>
            <button onClick={handleBackStep} className="mt-12 text-white/20 hover:text-white text-xs uppercase tracking-widest font-bold">Back</button>
          </div>
        );

      case 3: // Ready
        return (
          <div className="max-w-2xl mx-auto animate-fade-in text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <BookOpen size={40} className="text-white" />
            </div>
            <h2 className="text-5xl font-serif italic text-white mb-6">Your story is ready.</h2>
            <p className="text-white/60 mb-12 text-lg">
              Read, interact naturally, or say <strong>"I want to be part of the story"</strong> to jump in effectively.
            </p>

            <button
              onClick={startStory}
              className="px-12 py-5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
            >
              Start Story
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8 md:p-12 animate-fade-in relative overflow-hidden">
      <button
        onClick={onBack}
        className="absolute right-8 top-8 p-2 text-white/20 hover:text-white transition-colors z-50"
      >
        <X size={32} />
      </button>

      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
        {step === 0 && (
          <div className="mb-16 space-y-4">
            <h1 className="text-7xl font-serif italic text-white tracking-tighter">Craft a Story.</h1>
            <p className="text-white/40 text-xl font-sans italic">Select characters to weave a new narrative.</p>
          </div>
        )}

        {renderStepContent()}
      </div>
    </div>
  );
};

export default function MasterDashboard({
  initialCharacters = [],
  user,
  initialView = 'discover',
  initialCharacterId
}: {
  initialCharacters?: CharacterProfile[],
  user?: any,
  initialView?: View,
  initialCharacterId?: string
}) {
  const [characters, setCharacters] = useState<CharacterProfile[]>(initialCharacters.length > 0 ? initialCharacters : []);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(initialCharacters.length === 0);
  // Router hooks
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get('view');

  // State initialization based on Props (priority) -> URL param -> Default
  const [currentView, setCurrentView] = useState<View>(initialView);

  // Find initial character if ID provided
  const initialChar = initialCharacterId
    ? (initialCharacters.find(c => c.id === initialCharacterId) || null)
    : null;

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(initialChar);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [onboardingChar, setOnboardingChar] = useState<CharacterProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Sync URL when state changes (one-way binding from URL -> State primarily)
  useEffect(() => {
    if (viewParam && viewParam !== currentView) {
      // Allow 'discover' and 'blog' as public views
      const isPublic = viewParam === 'discover' || viewParam === 'blog';

      // If NOT public and NOT logged in, we stay on current or go to discover
      const session = getSession();
      const hasAuth = !!(session && session.email);

      if (!isPublic && !hasAuth) {
        // If they tried to go to a protected view via URL but aren't logged in,
        // we default them to discover but DON'T force the modal unless they click something.
        setCurrentView('discover');
      } else {
        setCurrentView(viewParam as View);
      }
    }
  }, [viewParam]);

  // Helper to change view and update URL
  const changeView = (view: View) => {
    if (view === currentView) return;

    // Public views check
    if (view === 'discover' || view === 'blog') {
      setCurrentView(view);
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', view);
      router.push(`?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Protected - check auth
    const session = getSession();
    const hasAuth = !!(session && session.email) || !!currentUser;

    if (!hasAuth) {
      setIsAuthOpen(true);
      return;
    }

    setCurrentView(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Logout handler - clears all auth state
  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      if (supabase) {
        await supabase.auth.signOut();
      }
      // Clear localStorage session
      localStorage.removeItem('agentwood_user');
      // Clear the agentwood_token cookie
      document.cookie = 'agentwood_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      // Reset user state
      setCurrentUser(null);
      // Go back to discover view
      setCurrentView('discover');
      // Show success (optional)
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStoryStart = async (data: any) => {
    // 1. Select the primary character (first one)
    const primaryChar = data.characters[0];
    if (!primaryChar) return;

    setLoading(true);
    try {
      // 2. Call API to create conversation with context
      const res = await fetch('/api/story/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const { conversationId, firstMessage, systemPrompt } = await res.json();

        // 3. Set up the chat view
        setSelectedCharacter({
          ...primaryChar,
          // Override greeting with the generated story opener
          greeting: firstMessage
        });
        setActiveConversationId(conversationId);
        setInitialMessage(null); // Clear any specific user started message
        setCurrentView('chat');
      } else {
        console.error("Failed to start story");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check auth on mount using localStorage session AND Supabase

    const checkAuth = async () => {
      // CRITICAL: First check for OAuth callback auth_session param
      // This ensures localStorage is hydrated after Google/OAuth login
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const authSessionParam = urlParams.get('auth_session');

        if (authSessionParam) {
          try {
            const authData = JSON.parse(decodeURIComponent(authSessionParam));
            if (authData.id && authData.email) {
              // Hydrate localStorage from OAuth callback data
              setSession(authData);
              setCurrentUser(authData);

              // Clean URL by removing auth_session param
              urlParams.delete('auth_session');
              const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
              window.history.replaceState({}, '', newUrl);

              console.log("Session hydrated from OAuth callback");
              return; // We're done, session is set
            }
          } catch (e) {
            console.error("Failed to parse auth_session param:", e);
          }
        }
      }

      const session = getSession();

      // 1. Check local storage first - this is our source of truth for immediate UI
      if (session && session.email) {
        setCurrentUser(session);
      }

      // 2. Hydrate from Supabase (server cookie) if needed
      if (supabase) {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const user = {
            id: data.session.user.id,
            email: data.session.user.email,
            displayName: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
            planId: 'free' as const,
          };
          // Ensure local storage is in sync
          if (!session || !session.email) {
            setSession(user);
          }
          setCurrentUser(user);
        } else {
          // Fallback: Check if we have the cookie but no Supabase session
          const hasCookie = typeof document !== 'undefined' && document.cookie.includes('agentwood_token=');

          if (hasCookie && (!session || !session.email)) {
            // Try to refresh session if we have a cookie but no local session
            const { data: refreshData } = await supabase.auth.refreshSession();
            if (refreshData.session?.user) {
              const user = {
                id: refreshData.session.user.id,
                email: refreshData.session.user.email,
                displayName: refreshData.session.user.user_metadata?.full_name || '',
                planId: 'free' as const
              };
              setSession(user);
              setCurrentUser(user);
            }
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            const user = {
              id: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              planId: 'free' as const,
            };
            setSession(user);
            setCurrentUser(user);
          } else if (event === 'SIGNED_OUT') {
            // CRITICAL: Only clear session if we don't have a valid cookie/local session
            const hasCookie = typeof document !== 'undefined' && document.cookie.includes('agentwood_token=');
            if (!hasCookie) {
              setCurrentUser(null);
              setSession({ id: '', planId: 'free' as const });
              localStorage.removeItem('agentwood_user_session');
            }
          }
        });

        return () => subscription.unsubscribe();
      }
    };

    checkAuth();

    // Also listen for storage changes and auth events
    const handleStorageChange = () => checkAuth();
    const handleAuthChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('agentwood-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agentwood-auth-change', handleAuthChange);
    };
  }, []);

  const [favorites, setFavorites] = useState<CharacterProfile[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('agentwood_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('agentwood_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (char: CharacterProfile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setFavorites(prev => {
      const exists = prev.find(c => c.name === char.name);
      if (exists) return prev.filter(c => c.name !== char.name);
      return [...prev, char];
    });
  };

  const isFavorite = (char: CharacterProfile) => favorites.some(c => c.name === char.name);

  useEffect(() => {
    const fetchData = async () => {
      if (initialCharacters.length > 0) {
        setLoading(true);
        // Simulate a small delay for smoother transition
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = activeCategory === "All"
          ? initialCharacters
          : initialCharacters.filter(c => c.category === activeCategory);
        setCharacters(filtered);
        setLoading(false);
      } else {
        setLoading(true);
        const [data] = await Promise.all([
          getShowcaseCharacters(activeCategory),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        setCharacters(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [activeCategory, initialCharacters]);

  const handleSelectCharacter = async (character: CharacterProfile) => {
    // Set local state for SPA-style navigation within MasterDashboard
    // Do NOT use router.push here - it causes a full page reload which breaks state
    setSelectedCharacter(character);
    setInitialMessage(null); // Clear any previous starter
    setCurrentView('character');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL without reload (Deep Linking)
    if (character.id) {
      window.history.pushState({ characterId: character.id }, '', `/character/${character.id}`);
    }

    // Increment view count
    try {
      if (character.id) {
        fetch('/api/character/view', {
          method: 'POST',
          body: JSON.stringify({ characterId: character.id })
        }).catch(err => console.error('View count error', err));
      }
    } catch (e) {
      // ignore
    }
  };

  const navigateToProfile = (char: CharacterProfile) => {
    handleSelectCharacter(char);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('agentwood_onboarding_seen', 'true');
    if (onboardingChar) {
      setSelectedCharacter(onboardingChar);
      setCurrentView('character');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setOnboardingChar(null);
    }
  };

  const navigateToChat = (char: CharacterProfile, starterMessage?: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSelectedCharacter(char);
    setInitialMessage(starterMessage || null);
    setCurrentView('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Increment view count via beacon/background
    try {
      if (char.id) {
        fetch('/api/character/view', {
          method: 'POST',
          body: JSON.stringify({ characterId: char.id })
        }).catch(err => console.error('View count error', err));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="flex min-h-screen font-sans bg-dipsea-bg text-dipsea-cream">

      <aside className="fixed left-0 top-0 hidden h-full w-[260px] flex-col border-r border-white/5 lg:flex z-50 bg-[#0c0c0c] p-5">
        <div
          className="mb-8 flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentView('discover')}
        >
          <img src="/logo.png" alt="AgentWood" className="w-10 h-10 object-contain shadow-lg" />
          <span className="text-2xl font-serif italic text-white">AgentWood</span>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              return;
            }
            setSelectedCharacter(null);
            setCurrentView('create');
          }}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] font-bold text-black transition-all hover:bg-white/90 shadow-md font-sans"
        >
          <Plus size={18} />
          Create a Character
        </button>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto scrollbar-hide pr-1">
          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Explore</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink
                active={currentView === 'discover'}
                icon={<Compass size={18} />}
                label="Discover"
                onClick={() => changeView('discover')}
              />
              <SidebarLink
                active={currentView === 'search'}
                icon={<Search size={18} />}
                label="Search"
                onClick={() => changeView('search')}
              />
              <SidebarLink
                active={currentView === 'favorites'}
                icon={<Heart size={18} />}
                label="Favorites"
                onClick={() => changeView('favorites')}
              />
              <SidebarLink
                active={currentView === 'training'}
                icon={<Brain size={18} />}
                label="Training & Data"
                badge="PRO"
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                    return;
                  }
                  changeView('training');
                }}
              />
              <SidebarLink
                active={currentView === 'blog'}
                icon={<BookOpen size={18} />}
                label="Blog"
                onClick={() => changeView('blog')}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Creative Studio</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink
                active={currentView === 'craft'}
                icon={<PenTool size={18} />}
                label="Craft a Story"
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                    return;
                  }
                  setCurrentView('craft');
                }}
              />
              <SidebarLink
                active={currentView === 'rewards'}
                icon={<Award size={18} />}
                label="Rewards"
                badge="PRO"
                onClick={() => {
                  if (!currentUser) {
                    setIsAuthOpen(true);
                    return;
                  }
                  setCurrentView('rewards');
                }}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Recent</h4>
            <div className="flex flex-col gap-0.5">
              {/* Fresh start: No recent chats yet */}
              <div className="px-4 py-3 text-[12px] text-white/20 italic">No recent chats</div>
            </div>
          </section>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
          {/* Auth Status Indicator */}
          {currentUser?.email ? (
            <div className="flex items-center gap-3 px-4 py-2 text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-[11px] font-bold uppercase tracking-wider">Logged In</span>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <User size={18} />
              <span className="text-[12px] font-bold">Sign Up / Log In</span>
            </button>
          )}

          <SidebarLink icon={<Settings size={18} />} label="Settings" onClick={() => {
            if (!currentUser) {
              setIsAuthOpen(true);
              return;
            }
            changeView('settings');
          }} />
          <div
            onClick={() => setIsSubscriptionOpen(true)}
            className="p-4 rounded-2xl bg-[#1e1428] border border-white/5 group cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col"><span className="text-[13px] font-bold text-white">Unlock with</span><span className="text-[13px] font-bold text-white">Agentwood+</span></div>
              <div className="h-10 w-12 bg-[#a855f7] rounded-md flex items-center justify-center font-black text-white text-[10px]">-50%</div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-purple-500/10 blur-xl rounded-full"></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        {currentView === 'discover' && (
          <LandingPage
            characters={characters}
            loading={loading}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onSelectCharacter={navigateToProfile}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onSearch={() => changeView('search')}
            currentUser={currentUser}
            onSignIn={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'favorites' && (
          <div className="p-12 fade-in min-h-screen bg-[#0c0c0c]">
            <div className="flex items-center gap-4 mb-12">
              <button onClick={() => setCurrentView('discover')} className="text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-5xl font-serif italic text-white">Your Favorites.</h1>
            </div>

            {favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-6">
                <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                  <Heart size={48} />
                </div>
                <p className="text-white/40 font-sans italic">No favorites yet. Start exploring the wood.</p>
                <button onClick={() => setCurrentView('discover')} className="px-8 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">
                  Discover Characters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                {favorites.map((char, i) => (
                  <CharacterCard
                    key={i}
                    character={char}
                    onClick={() => navigateToProfile(char)}
                    isFavorite={true}
                    onToggleFavorite={(e) => toggleFavorite(char, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'blog' && <BlogPage />}

        {currentView === 'character' && selectedCharacter && (
          <CharacterProfileView
            character={selectedCharacter}
            onBack={() => setCurrentView('discover')}
            onChat={(starterMessage) => navigateToChat(selectedCharacter, starterMessage)}
            isFavorite={isFavorite(selectedCharacter)}
            onToggleFavorite={(e) => toggleFavorite(selectedCharacter, e)}
          />
        )}

        {currentView === 'chat' && selectedCharacter && (
          <div className="flex-1 flex flex-col min-h-0 animate-fade-in">
            <ChatWindow
              persona={{
                ...selectedCharacter,
                greeting: selectedCharacter.greeting || (
                  selectedCharacter.tagline
                    ? `Hello! I'm ${selectedCharacter.name}.`
                    : `Hey there. I'm ${selectedCharacter.name}. What's on your mind?`
                ),
                voiceName: selectedCharacter.voiceName || 'puck'
              }}
              conversationId={activeConversationId || `chat-${selectedCharacter.id}-${new Date().toDateString()}`}
              onBack={() => setCurrentView('character')}
              initialMessage={initialMessage || undefined}
            />
          </div>
        )}

        {currentView === 'create' && (
          <CreateView onBack={() => setCurrentView('discover')} />
        )}

        {currentView === 'rewards' && <RewardsView onBack={() => setCurrentView('discover')} />}

        {currentView === 'training' && <TrainingView onBack={() => setCurrentView('discover')} />}

        {currentView === 'settings' && <SettingsView onBack={() => setCurrentView('discover')} user={currentUser} onUpdateUser={setCurrentUser} onLogout={handleLogout} />}

        {currentView === 'craft' && <CraftStoryView onBack={() => setCurrentView('discover')} characters={characters} onStartStory={handleStoryStart} />}

        {currentView === 'search' && <SearchView onSelectCharacter={navigateToProfile} characters={characters.length > 0 ? characters : FALLBACK_CHARACTERS} />}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setSession(user);
        }}
      />
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        user={currentUser}
        onAuthRequired={() => setIsAuthOpen(true)}
      />
      <OnboardingModal
        character={onboardingChar}
        isOpen={!!onboardingChar}
        onClose={() => setOnboardingChar(null)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
