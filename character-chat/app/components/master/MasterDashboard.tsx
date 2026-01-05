"use client";

import React, { useEffect, useState, useRef } from 'react';
import {
  Search, Bell, Plus, Compass, Library, PenTool,
  Award, Settings, ChevronRight, Star,
  Sparkle, ChevronLeft,
  MessageSquare, Play, Send, Image as ImageIcon,
  PlayCircle,
  Zap, Wand2, Loader2, Music,
  ChevronDown, BookOpen, Share2, Instagram, Twitter,
  User, CreditCard, Sliders, VolumeX, ShieldCheck, DollarSign,
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

const SearchView: React.FC<{ onSelectCharacter: (char: CharacterProfile) => void }> = ({ onSelectCharacter }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Trending');
  const tabs = ['Trending', 'Rising', 'New', 'Editors Choice'];

  const results = FALLBACK_CHARACTERS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.tagline.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6 md:p-12 animate-fade-in pb-32">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header & Search Input */}
        <div className="flex flex-col items-center space-y-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-serif italic text-white text-center">Explore the Wood</h1>

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
              key={index}
              onClick={() => onSelectCharacter(char)}
              className="group relative flex items-center gap-4 p-4 rounded-2xl bg-[#161616] border border-white/5 hover:bg-[#1f1b19] hover:border-white/10 transition-all cursor-pointer overflow-hidden"
            >
              {/* Rank Number */}
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
                <img src={char.avatarUrl} className="w-full h-full object-cover" />
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
                    <MessageSquare size={10} /> {char.chatCount}
                  </span>
                </div>
              </div>

              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ... BlogPage, CharacterProfileView, ImmersiveChatView, CreateView, RewardsView, SettingsView, CraftStoryView (ensure CraftStoryView is defined) ...

const BlogPage = () => {
  const categories = ["ALL", "WELLNESS", "STORYTELLING", "RELATIONSHIPS", "CULTURE"];
  const featuredPost = {
    title: "The Art of Auditory Intimacy: Why Voice Matters",
    category: "STORYTELLING",
    image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1200",
    author: "Elena Vasquez",
    date: "May 12, 2025"
  };

  const posts = [
    { title: "5 Ways to Rekindle the Spark with Shared Stories", category: "RELATIONSHIPS", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800" },
    { title: "Deep Dive: The Psychology of the 'Slow Burn'", category: "CULTURE", image: "https://images.unsplash.com/photo-1490122417551-6ee9691429d0?auto=format&fit=crop&q=80&w=800" },
    { title: "Nighttime Rituals for Better Sleep and Connection", category: "WELLNESS", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" },
    { title: "Designing Characters with Heart and Soul", category: "STORYTELLING", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] fade-in">
      <div className="px-16 py-24 text-center space-y-8">
        <h1 className="text-9xl font-serif italic text-white tracking-tighter">The Blog.</h1>
        <div className="flex justify-center gap-10 border-t border-b border-white/5 py-8">
          {categories.map(cat => <button key={cat} className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors">{cat}</button>)}
        </div>
      </div>

      <section className="px-16 mb-32">
        <div className="relative rounded-[60px] overflow-hidden aspect-[21/9] border border-white/10 group cursor-pointer">
          <img src={featuredPost.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute bottom-16 left-16 max-w-2xl space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-dipsea-accent">{featuredPost.category}</span>
            <h2 className="text-7xl font-serif italic text-white leading-none">{featuredPost.title}</h2>
            <p className="text-white/40 text-sm font-sans italic">By {featuredPost.author} — {featuredPost.date}</p>
          </div>
        </div>
      </section>

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
            <h2 className="text-6xl font-serif italic text-white">Join the wood.</h2>
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
  onChat: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}> = ({ character, onBack, onChat, isFavorite, onToggleFavorite }) => {
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
                <MessageSquare size={12} /> {character.chatCount}
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
              onClick={onChat}
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

            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-6">Conversation Starters</h3>
              <div className="grid gap-4">
                {character.chatStarters?.map((starter, i) => (
                  <button key={i} onClick={onChat} className="text-left p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <span className="text-lg font-serif italic text-white/80 group-hover:text-white transition-colors">"{starter}"</span>
                  </button>
                ))}
              </div>
            </section>
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
                  <span className="text-white text-sm font-medium">Velvet & Deep</span>
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

  const playVoice = async (text: string) => {
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
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
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
              <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                ? 'bg-[#fcf9f7] text-black rounded-tr-sm'
                : 'bg-[#1c1816] border border-white/10 text-white/90 rounded-tl-sm'
                }`}>
                {msg.text}
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
                <span className="flex items-center gap-1"><Eye size={12} /> 59.2K</span>
                <span className="flex items-center gap-1"><User size={12} /> 2.0K</span>
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
            <button className="flex-1 py-4 text-white border-b-2 border-white relative">
              <MessageSquare size={18} className="mx-auto" />
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/10 blur-lg rounded-full"></span>
            </button>
            <button className="flex-1 py-4 text-white/30 hover:text-white transition-colors"><Sparkle size={18} className="mx-auto" /></button>
            <button className="flex-1 py-4 text-white/30 hover:text-white transition-colors"><Settings size={18} className="mx-auto" /></button>
          </div>

          {/* Comments Preview */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">Comments <span className="text-white">567</span></div>
              <ChevronRight size={14} className="text-white/20" />
            </div>

            {/* Dummy Comments */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-bold border border-white/5 flex-shrink-0">D</div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-white/90">Dreamer_99</span>
                    <span className="text-[9px] text-white/30">2h</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">The depth of this character is insane. I feel like I'm actually there.</p>
                </div>
                <div className="ml-auto pt-1">
                  <Heart size={10} className="text-white/20" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold border border-white/5 flex-shrink-0">A</div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-bold text-white/90">AlexM</span>
                    <span className="text-[9px] text-white/30">5h</span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">Wait, did you get the hidden dialogue option about the cafe?</p>
                </div>
                <div className="ml-auto pt-1">
                  <Heart size={10} className="text-white/20" />
                </div>
              </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 bg-[#161616] rounded-full pl-2 pr-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white shadow-md">Y</div>
              <input type="text" placeholder="Type your comment..." className="bg-transparent border-none outline-none text-[12px] text-white flex-1 placeholder:text-white/20 font-sans" />
            </div>
          </div>
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

  const generateAvatar = async () => {
    if (!description && !name) return;
    setIsGeneratingImage(true);

    try {
      const prompt = `High-end semi-realistic digital illustration, cinematic visual novel art style. A detailed character portrait of a ${gender} named ${name}. 
          Character Details: ${description}. 
          Artistic Style: Painterly brush strokes, rich atmospheric background with environmental storytelling, dramatic cinematic lighting with rim lights and soft fill, expressive detailed facial features, textured clothing, vibrant yet sophisticated color palette. Masterwork quality, trending on ArtStation, 4k ultra-detailed. Close-up or waist-up composition.`;

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

          {['Skill', 'Image', 'Voice'].map((section) => (
            <div key={section} className="p-5 rounded-2xl bg-[#161616] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ChevronDown size={14} className="text-white/40" />
                  <h3 className="text-sm font-bold text-white group-hover:text-white transition-colors">{section}</h3>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 px-3 py-1 rounded-full hover:bg-white hover:text-black transition-all">
                  <Plus size={10} /> Add
                </button>
              </div>
              <p className="text-[11px] text-white/30 pl-6">
                {section === 'Skill' && "Supports additional capabilities like Image Generation and Song Creation."}
                {section === 'Image' && "Add image to make your Character more engaging."}
                {section === 'Voice' && "Choose a voice for your Character."}
              </p>

              {section === 'Image' && (
                <div className="mt-4 ml-6 p-4 bg-[#0c0c0c] border border-white/5 border-dashed rounded-xl flex flex-col items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                  {avatarUrl ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden group/img">
                      <img src={avatarUrl} className="w-full h-full object-cover" />
                      <button onClick={generateAvatar} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <RotateCcw size={20} className="mr-2" /> Regenerate
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 w-full">
                      <ImageIcon size={24} className="mb-2" />
                      <p className="text-xs text-white/40 mb-3">No image selected</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); generateAvatar(); }}
                        disabled={isGeneratingImage}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50"
                      >
                        {isGeneratingImage ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        Generate with AI
                      </button>
                    </div>
                  )}
                </div>
              )}

              {section !== 'Image' && (
                <div className="mt-4 ml-6 h-20 bg-[#0c0c0c] border border-white/5 border-dashed rounded-xl flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                  {section === 'Skill' && <Sparkle size={20} />}
                  {section === 'Voice' && <VolumeX size={20} />}
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      <div className="hidden lg:flex w-[45%] flex-col border-l border-white/5 bg-[#0e0e0e] relative z-20">
        <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-[#0e0e0e]">
          <span className="text-[13px] font-bold text-white">Preview and Testing</span>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-[#1c1816] text-white/60 rounded-lg font-bold text-[11px] hover:text-white hover:bg-[#25201d] transition-all">Save</button>
            <button className="px-6 py-2 bg-white text-black rounded-lg font-bold text-[11px] hover:bg-white/90 transition-all shadow-lg">Publish</button>
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
    </div>
  );
};

const RewardsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const milestones = [
    { level: 1, title: "First Whisper", desc: "Spend 1 hour talking to any character.", progress: 100, total: 100, completed: true, reward: "50 Credits", icon: <Clock size={20} /> },
    { level: 2, title: "Storyteller", desc: "Create your first custom character.", progress: 1, total: 1, completed: true, reward: "New Voice Pack", icon: <PenTool size={20} /> },
    { level: 3, title: "Deep Dive", desc: "Reach a 7-day streak.", progress: 4, total: 7, completed: false, reward: "Profile Badge", icon: <Trophy size={20} /> },
    { level: 4, title: "World Builder", desc: "Craft 5 unique stories.", progress: 2, total: 5, completed: false, reward: "200 Credits", icon: <Map size={20} /> },
    { level: 5, title: "Legend Status", desc: "Create a character that reaches 1,000 users within a month.", progress: 124, total: 1000, completed: false, reward: "Pro Subscription (1 Month)", icon: <Users size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-12 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-4xl font-serif italic text-white mb-1">Rewards & Milestones</h1>
            <p className="text-white/40 text-sm font-sans">Track your journey through the wood.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1c1816] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500"><Trophy size={24} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Level</p>
              <p className="text-3xl font-serif text-white">12</p>
            </div>
          </div>
          <div className="bg-[#1c1816] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Sparkle size={24} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Credits Earned</p>
              <p className="text-3xl font-serif text-white">450</p>
            </div>
          </div>
          <div className="bg-[#1c1816] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Target size={24} /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Next Goal</p>
              <p className="text-xl font-serif text-white">Deep Dive</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-white/5 -z-10"></div>

          {milestones.map((milestone, i) => (
            <div key={i} className={`relative flex gap-6 p-6 rounded-2xl border transition-all duration-300 ${milestone.completed ? 'bg-white/5 border-white/10' : 'bg-[#1c1816] border-white/5 opacity-80'}`}>
              <div className={`flex-shrink-0 w-14 h-14 rounded-full border-4 border-[#0c0c0c] flex items-center justify-center z-10 ${milestone.completed ? 'bg-green-500 text-black' : 'bg-[#161616] text-white/40'}`}>
                {milestone.completed ? <Check size={20} strokeWidth={3} /> : <span className="font-bold text-sm">{milestone.level}</span>}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-xl font-bold font-serif ${milestone.completed ? 'text-white' : 'text-white/60'}`}>{milestone.title}</h3>
                    <p className="text-sm text-white/40 mt-1">{milestone.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                    {milestone.completed ? <Unlock size={12} className="text-green-500" /> : <Lock size={12} className="text-white/20" />}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">{milestone.reward}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/30">
                    <span>Progress</span>
                    <span>{milestone.progress} / {milestone.total}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${milestone.completed ? 'bg-green-500' : 'bg-purple-600'}`}
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
  );
};

const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('Public profile');
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
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 overflow-y-auto bg-[#0c0c0c]">
        <div className="max-w-2xl p-12">
          <h2 className="text-4xl font-serif italic text-white mb-12">{activeTab}</h2>

          {activeTab === 'Public profile' && (
            <div className="space-y-10">
              {/* Avatar */}
              <div className="relative inline-block group cursor-pointer">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ffaa40] to-[#9c40ff] p-1">
                  <div className="w-full h-full rounded-full bg-[#1c1816] flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl font-bold text-white">A</div>
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
                      defaultValue="ArrogantLovebird5806"
                      className="w-full bg-transparent border-none outline-none text-white font-sans text-base placeholder:text-white/20"
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">20/20</div>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 focus-within:border-white/30 transition-colors group">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 group-focus-within:text-dipsea-accent transition-colors">Display Name</label>
                    <input
                      type="text"
                      defaultValue="ArrogantLovebird5806"
                      className="w-full bg-transparent border-none outline-none text-white font-sans text-base placeholder:text-white/20"
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">20/20</div>
                </div>

                <div className="space-y-1.5">
                  <div className="bg-[#161616] border border-white/10 rounded-2xl p-4 focus-within:border-white/30 transition-colors group h-40">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 group-focus-within:text-dipsea-accent transition-colors">Description</label>
                    <textarea
                      className="w-full h-[calc(100%-24px)] bg-transparent border-none outline-none text-white font-sans text-base resize-none placeholder:text-white/20"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="text-right text-[10px] font-bold text-white/20">0/500</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Account' && (
            <div className="space-y-6">
              <div className="bg-[#161616] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Email Address</h3>
                <p className="text-white/40 text-sm mb-4">Your email is visible only to you.</p>
                <input type="email" value="user@example.com" disabled className="bg-black/20 w-full p-3 rounded-lg text-white/60 border border-white/5" />
              </div>
              <button className="w-full py-4 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/5 rounded-xl transition-colors border border-red-500/20">
                Log Out
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
  { id: 'cyberpunk', name: 'Neon Synapse', description: 'A high-tech, low-life future where rain never stops and neon reflects off wet pavement.', image: 'https://images.unsplash.com/photo-1574169208507-84376194878d?auto=format&fit=crop&q=80&w=800' },
  { id: 'fantasy', name: 'Ethereal Glade', description: 'Ancient magic permeates the mist-shrouded forests. Beasts and beauty coexist.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800' },
  { id: 'noir', name: 'Velvet Shadows', description: '1920s aesthetic, jazz clubs, smoke, and secrets whispered in dark corners.', image: 'https://images.unsplash.com/photo-1565622359461-8974d0a33481?auto=format&fit=crop&q=80&w=800' },
  { id: 'modern', name: 'Urban Loft', description: 'Contemporary city life. Coffee shops, art galleries, and modern romance.', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800' },
];

const CraftStoryView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<CharacterProfile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);

  const toggleCharacter = (char: CharacterProfile) => {
    if (selectedCharacters.find(c => c.name === char.name)) {
      setSelectedCharacters(prev => prev.filter(c => c.name !== char.name));
    } else {
      if (selectedCharacters.length < 3) {
        setSelectedCharacters(prev => [...prev, char]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!selectedWorld || selectedCharacters.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: selectedWorld,
          characters: selectedCharacters
        })
      });

      const data = await response.json();
      setGeneratedStory(data.text || "The story fades before it begins...");
    } catch (e) {
      console.error(e);
      setGeneratedStory("The ink has run dry. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setGeneratedStory(null);
    setSelectedWorld(null);
    setSelectedCharacters([]);
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex flex-col items-center justify-center animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]"></div>
        <Loader2 size={48} className="text-white animate-spin mb-6 relative z-10" />
        <h2 className="text-4xl font-serif italic text-white mb-2 relative z-10">Weaving Fate Lines...</h2>
        <p className="text-white/40 font-sans text-sm tracking-widest uppercase relative z-10">Constructing the world of {selectedWorld?.name}</p>
      </div>
    )
  }

  if (generatedStory) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] p-8 md:p-16 animate-fade-in relative">
        <div className="max-w-3xl mx-auto space-y-12 relative z-10">
          <div className="flex items-center justify-between">
            <button onClick={reset} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={20} /> <span className="text-xs font-bold uppercase tracking-widest">Craft New Story</span>
            </button>
            <div className="flex gap-3">
              <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"><Share2 size={18} /></button>
              <button className="px-6 py-3 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform">Publish Story</button>
            </div>
          </div>

          <div className="bg-[#161616] border border-white/5 rounded-[40px] p-10 md:p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 justify-center mb-8">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dipsea-accent">{selectedWorld?.name}</span>
              </div>
              <p className="text-xl md:text-2xl font-serif text-white/90 leading-relaxed indent-8 first-letter:text-5xl first-letter:font-serif first-letter:mr-1 first-letter:float-left">
                {generatedStory}
              </p>
              <div className="pt-8 flex justify-center gap-4">
                {selectedCharacters.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
                    <div className="w-6 h-6 rounded-full overflow-hidden"><img src={c.avatarUrl} className="w-full h-full object-cover" /></div>
                    <span className="text-xs text-white/60 font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-8 md:p-12 animate-fade-in relative overflow-hidden">
      <button
        onClick={onBack}
        className="absolute right-8 top-8 p-2 text-white/20 hover:text-white transition-colors z-50"
      >
        <X size={32} />
      </button>

      <div className="max-w-6xl mx-auto h-full flex flex-col justify-center min-h-[80vh]">
        <div className="mb-16 space-y-4">
          <h1 className="text-7xl font-serif italic text-white tracking-tighter">Craft a Story.</h1>
          <p className="text-white/40 text-xl font-sans italic">Select characters to weave a new narrative.</p>
        </div>

        <div className="space-y-12">
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
              {FALLBACK_CHARACTERS.slice(0, 6).map((char, i) => {
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
        </div>

        <div className="mt-16 flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={!selectedWorld || selectedCharacters.length === 0}
            className={`
                            px-12 py-5 rounded-full font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-500
                            ${(!selectedWorld || selectedCharacters.length === 0)
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]'}
                        `}
          >
            <PenTool size={16} /> Create Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MasterDashboard({ initialCharacters = [] }: { initialCharacters?: CharacterProfile[] }) {
  const [characters, setCharacters] = useState<CharacterProfile[]>(initialCharacters.length > 0 ? initialCharacters : []);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(initialCharacters.length === 0);
  const [currentView, setCurrentView] = useState<View>('discover');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [onboardingChar, setOnboardingChar] = useState<CharacterProfile | null>(null);

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

  const navigateToProfile = (char: CharacterProfile) => {
    const hasSeenOnboarding = localStorage.getItem('agentwood_onboarding_seen');
    if (!hasSeenOnboarding) {
      setOnboardingChar(char);
    } else {
      setSelectedCharacter(char);
      setCurrentView('character');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const navigateToChat = (char: CharacterProfile) => {
    setSelectedCharacter(char);
    setCurrentView('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen font-sans bg-dipsea-bg text-dipsea-cream">

      <aside className="fixed left-0 top-0 hidden h-full w-[260px] flex-col border-r border-white/5 lg:flex z-50 bg-[#0c0c0c] p-5">
        <div
          className="mb-8 flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentView('discover')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/10 shadow-lg">
            <span className="text-2xl font-serif italic text-white leading-none">A</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">agentwood</span>
        </div>

        <button
          onClick={() => { setSelectedCharacter(null); setCurrentView('create'); }}
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
                onClick={() => setCurrentView('discover')}
              />
              <SidebarLink
                active={currentView === 'search'}
                icon={<Search size={18} />}
                label="Search"
                onClick={() => setCurrentView('search')}
              />
              <SidebarLink
                active={currentView === 'favorites'}
                icon={<Heart size={18} />}
                label="Favorites"
                onClick={() => setCurrentView('favorites')}
              />
              <SidebarLink icon={<Library size={18} />} label="Memory" />
              <SidebarLink
                active={currentView === 'blog'}
                icon={<BookOpen size={18} />}
                label="Blog"
                onClick={() => setCurrentView('blog')}
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
                onClick={() => setCurrentView('craft')}
              />
              <SidebarLink
                active={currentView === 'rewards'}
                icon={<Award size={18} />}
                label="Rewards"
                badge="PRO"
                onClick={() => setCurrentView('rewards')}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Recent</h4>
            <div className="flex flex-col gap-0.5">
              {FALLBACK_CHARACTERS.map((char, i) => (
                <button key={i} onClick={() => navigateToProfile(char)} className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10"><img src={char.avatarUrl} className="w-full h-full object-cover" /></div>
                  <span className="truncate font-sans">{char.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
          <SidebarLink icon={<Settings size={18} />} label="Settings" onClick={() => setCurrentView('settings')} />
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
            onSearch={() => setCurrentView('search')}
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
            onChat={() => navigateToChat(selectedCharacter)}
            isFavorite={isFavorite(selectedCharacter)}
            onToggleFavorite={(e) => toggleFavorite(selectedCharacter, e)}
          />
        )}

        {currentView === 'chat' && selectedCharacter && (
          <ImmersiveChatView
            character={selectedCharacter}
            onBack={() => setCurrentView('character')}
            onUpgrade={() => { setIsSubscriptionOpen(true); }}
          />
        )}

        {currentView === 'create' && (
          <CreateView onBack={() => setCurrentView('discover')} />
        )}

        {currentView === 'rewards' && <RewardsView onBack={() => setCurrentView('discover')} />}

        {currentView === 'settings' && <SettingsView onBack={() => setCurrentView('discover')} />}

        {currentView === 'craft' && <CraftStoryView onBack={() => setCurrentView('discover')} />}

        {currentView === 'search' && <SearchView onSelectCharacter={navigateToProfile} />}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SubscriptionModal isOpen={isSubscriptionOpen} onClose={() => setIsSubscriptionOpen(false)} />
      <OnboardingModal
        character={onboardingChar}
        isOpen={!!onboardingChar}
        onClose={() => setOnboardingChar(null)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
