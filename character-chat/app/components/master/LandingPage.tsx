"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Bell, Play, Star, MessageSquare, ChevronDown, Heart, ChevronRight
} from 'lucide-react';
import { CharacterProfile, Category } from '@/lib/master/types';
import { CharacterCard } from './CharacterCard';
import { SkeletonRow, SkeletonCard } from './SkeletonLoaders';
import { Footer } from './Footer';
import { getSession } from '@/lib/auth';

interface LandingPageProps {
  characters: CharacterProfile[];
  loading: boolean;
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  onSelectCharacter: (char: CharacterProfile) => void;
  isFavorite: (char: CharacterProfile) => boolean;
  onToggleFavorite: (char: CharacterProfile, e: React.MouseEvent) => void;
  onSearch: () => void;
  currentUser?: { avatarUrl?: string; displayName?: string; email?: string } | null;
  onSignIn?: () => void;
}

const AgentwoodDifference = () => (
  <section className="bg-[#0c0c0c] px-4 sm:px-6 md:px-24 py-8 border-b border-white/5 overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C69C6D] mb-3">THE AGENTWOOD DIFFERENCE</h3>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-white max-w-full sm:max-w-3xl leading-tight break-words">
          Communication, reimagined for the modern era.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 border-t border-white/10 pt-8">
        {/* 01 */}
        <div className="space-y-3 sm:space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-2 sm:mb-4 group-hover:text-[#C69C6D] transition-colors">01</span>
          <h4 className="text-lg sm:text-xl font-serif text-white">Premium Immersion</h4>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Experience narratives with unparalleled production value. Every voice, pause, and whisper is crafted for maximum realism.
          </p>
        </div>

        {/* 02 */}
        <div className="space-y-3 sm:space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-2 sm:mb-4 group-hover:text-[#C69C6D] transition-colors">02</span>
          <h4 className="text-lg sm:text-xl font-serif text-white">Creator Economy</h4>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Build, buy, and sell unique character personas. Your imagination is now a tradeable asset.
          </p>
        </div>

        {/* 03 */}
        <div className="space-y-3 sm:space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-2 sm:mb-4 group-hover:text-[#C69C6D] transition-colors">03</span>
          <h4 className="text-lg sm:text-xl font-serif text-white">Active Memory</h4>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Our agents learn from every conversation, building a relationship that deepens with you.
          </p>
        </div>

        {/* 04 */}
        <div className="space-y-3 sm:space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-2 sm:mb-4 group-hover:text-[#C69C6D] transition-colors">04</span>
          <h4 className="text-lg sm:text-xl font-serif text-white">Story Generation</h4>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            Turn chats into audiobooks and novels instantly from your roleplay history.
          </p>
        </div>
      </div>
    </div>
  </section>
);

const LandingHero = () => {
  const scrollToCharacters = () => {
    const section = document.getElementById('characters');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[85vh] overflow-hidden bg-black flex items-center px-4 sm:px-8 md:px-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/videos/fireplace.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="relative z-10 max-w-4xl animate-fade-in-up space-y-6 sm:space-y-12">
        <h1 className="text-[40px] sm:text-[60px] md:text-[90px] lg:text-[120px] font-serif italic text-white leading-[0.9] tracking-tight">
          Enter <br />The Woods
        </h1>

        <div className="flex gap-4 sm:gap-8 items-start max-w-xl">
          <div className="w-[1px] h-8 sm:h-12 bg-white/40 mt-1 shrink-0"></div>
          <p className="text-sm sm:text-lg md:text-xl text-white/60 font-sans leading-relaxed">
            Meet premium characters you can talk to, learn from and have fun with, from therapists to fantasy characters
          </p>
        </div>

        <button onClick={scrollToCharacters} className="group px-6 sm:px-10 py-4 sm:py-5 bg-white rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-black hover:bg-white/90 transition-all flex items-center gap-3 sm:gap-4 shadow-2xl">
          Try Agentwood
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </section>
  );
};

const CharacterPlayRow: React.FC<{ char: CharacterProfile, onClick: () => void }> = ({ char, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10">
        <img src={char.avatarUrl} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="text-sm font-serif italic text-white group-hover:text-dipsea-accent transition-colors">{char.name}</h4>
        <p className="text-[10px] text-white/40 line-clamp-1 font-sans">{char.tagline}</p>
      </div>
    </div>
    <button className="p-2 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-black transition-all">
      <Play size={14} fill="currentColor" />
    </button>
  </div>
);

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing_page_footer' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setMessage('Welcome to the inner circle.');
      setEmail('');
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <section className="px-6 md:px-12 py-24 bg-[#0c0c0c] border-t border-white/5">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-5xl font-serif italic text-white">Join the Waitlist</h2>
        <p className="text-white/60">Be the first to know when new characters arrive.</p>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white focus:border-white/30 outline-none w-full"
            required
          />
          <button disabled={status === 'loading'} className="bg-white text-black font-bold uppercase tracking-widest text-xs px-8 py-3 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap">
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
        {message && <p className={`text-sm ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
      </div>
    </section>
  );
};

import { audioManager } from '@/lib/audio/audioManager';

export const LandingPage: React.FC<LandingPageProps> = ({
  characters,
  loading,
  activeCategory,
  onCategoryChange,
  onSelectCharacter,
  isFavorite,
  onToggleFavorite,
  onSearch,
  currentUser,
  onSignIn
}) => {
  const [activeMood, setActiveMood] = useState('All');
  const moods = ['All', 'Helpful', 'Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn', 'Wholesome', 'Adventurous'];

  // Use currentUser avatar if available
  const userAvatar = currentUser?.avatarUrl || null;
  const isLoggedIn = !!(currentUser?.email);

  // Optimistic Audio Unlock: Resume context immediately on user interaction
  const handleCharacterClick = async (char: CharacterProfile) => {
    try {
      await audioManager.resume();
    } catch (e) {
      console.warn('Failed to resume audio context on click', e);
    }
    onSelectCharacter(char);
  };

  return (
    <div className="fade-in overflow-x-hidden">
      {/* Sticky Header - Mobile Optimized */}
      <div className="sticky top-0 z-40 w-full px-3 sm:px-6 md:px-12 py-3 sm:py-6 bg-[#0c0c0c]/95 backdrop-blur-lg border-b border-white/5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4 md:mr-8 flex-shrink-0">
          <Link href="/" className="font-serif italic text-xl md:text-2xl text-white font-bold tracking-tight hover:text-white/80 transition-colors">
            AW
          </Link>
        </div>

        {/* Search - Shrinks on mobile */}
        <div className="flex-1 min-w-0 max-w-[200px] sm:max-w-xl relative group" onClick={onSearch}>
          <Search size={14} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-dipsea-accent transition-colors" />
          <input readOnly type="text" placeholder="Search..." className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl py-2 sm:py-2.5 pl-8 sm:pl-10 pr-2 sm:pr-4 text-xs outline-none focus:border-dipsea-accent transition-all font-sans text-white placeholder:text-white/20 cursor-pointer" />
        </div>
        {/* Right side actions - Compact on mobile */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
          <Link href="/affiliates" className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors font-sans">AFFILIATES</Link>
          {isLoggedIn && (
            <Link href="/notifications">
              <Bell size={18} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
            </Link>
          )}
          {isLoggedIn ? (
            <Link href="/settings" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center font-bold text-white text-xs hover:border-white transition-colors overflow-hidden flex-shrink-0">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser?.displayName?.[0] || currentUser?.email?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </Link>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 sm:px-5 py-2 rounded-full bg-white text-black text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-white/90 transition-colors whitespace-nowrap flex-shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <LandingHero />

      <AgentwoodDifference />

      {/* Trending Header */}
      <div className="px-4 sm:px-6 md:px-12 pt-8 sm:pt-16 pb-4 bg-[#0c0c0c]">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 font-sans">TRENDING NOW</span>
      </div>

      <section id="characters" className="px-4 sm:px-6 md:px-12 py-8 sm:py-16 bg-[#0c0c0c]">
        <div className="flex items-center justify-between mb-6 sm:mb-12 gap-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif italic text-white tracking-tight">Meet our Characters</h2>
          <button className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-dipsea-accent border-b border-dipsea-accent hover:text-white hover:border-white transition-all font-sans pb-1 whitespace-nowrap flex-shrink-0">SEE ALL</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : (
            characters.slice(0, 9).map((char, i) => (
              <CharacterPlayRow key={i} char={char} onClick={() => handleCharacterClick(char)} />
            ))
          )}
        </div>
      </section>

      <NewsletterSection />

      {/* Filter Section - Matching Users Screenshot */}
      <section className="sticky top-[52px] sm:top-[72px] md:top-[86px] z-30 bg-[#0c0c0c]/95 backdrop-blur-xl border-b border-white/5 py-3 sm:py-6 px-4 sm:px-6 md:px-12">
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-hide hide-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d5650] font-sans flex-shrink-0">MOOD</span>
          <div className="flex items-center gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => {
                  setActiveMood(mood);
                  // Determine broad category mapping for the URL/State, but we'll do refined filtering below
                  const moodMap: Record<string, Category> = {
                    'All': 'All',
                    'Helpful': 'Helpful',
                    'Relaxed': 'All',
                    'Intense': 'Anime & Game',
                    'Romantic': 'Romance',
                    'Playful': 'Play & Fun',
                    'Slow-Burn': 'Romance',
                    'Wholesome': 'Helpful',
                    'Adventurous': 'Fun'
                  };
                  // We update the parent category for broad syncing, but local state drives the display
                  onCategoryChange(moodMap[mood] || 'All');
                }}
                className={`px-6 py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeMood === mood
                  ? 'bg-[#C69C6D] text-white shadow-lg shadow-[#C69C6D]/20 transform scale-105'
                  : 'bg-[#1c1816] text-[#6b645f] hover:bg-[#2A2420] hover:text-[#8b847f]'
                  }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-12 bg-[#0c0c0c] min-h-screen">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {loading ? (
            Array.from({ length: 14 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            characters
              .filter(char => {
                // Map database categories to mood groups - expanded to cover all categories
                // Keys are lowercased for case-insensitive matching
                const categoryToMood: Record<string, string[]> = {
                  // Helpful mood
                  'helpful': ['Helpful'],
                  'helper': ['Helpful'],
                  'wellness': ['Helpful', 'Relaxed'],
                  'education': ['Helpful'],
                  'educational': ['Helpful'],
                  'wisdom': ['Helpful'],
                  'mindfulness': ['Helpful', 'Relaxed'],
                  'fitness': ['Helpful'],
                  'business': ['Helpful'],
                  'science': ['Helpful'],
                  'technology': ['Helpful'],
                  'learning': ['Helpful'],
                  'career': ['Helpful'],
                  'cooking': ['Helpful', 'Wholesome'],
                  'health': ['Helpful'],
                  'finance': ['Helpful'],
                  'support': ['Helpful', 'Wholesome'],

                  // Relaxed mood
                  'comfort': ['Relaxed', 'Wholesome'],
                  'nature': ['Relaxed', 'Wholesome'],
                  'art': ['Relaxed', 'Playful'],
                  'design': ['Relaxed'],
                  'lifestyle': ['Relaxed', 'Wholesome'],
                  'meditation': ['Relaxed'],
                  'music': ['Relaxed', 'Playful'],
                  'philosophy': ['Relaxed', 'Helpful'],

                  // Intense mood
                  'villain': ['Intense'],
                  'mystery': ['Intense'],
                  'military': ['Intense'],
                  'dark': ['Intense'],
                  'horror': ['Intense'],
                  'thriller': ['Intense'],
                  'action': ['Intense', 'Adventurous'],
                  'drama': ['Intense', 'Romantic'],
                  'supernatural': ['Intense', 'Adventurous'],
                  'vampire': ['Intense', 'Romantic'],
                  'demon': ['Intense'],
                  'angel': ['Wholesome', 'Helpful'],
                  'alternative': ['Intense'],

                  // Playful mood
                  'fun': ['Playful'],
                  'play & fun': ['Playful'],
                  'comedy': ['Playful'],
                  'entertainment': ['Playful'],
                  'gaming': ['Playful', 'Adventurous'],
                  'anime': ['Playful', 'Adventurous'],
                  'cartoon': ['Playful'],
                  'pet': ['Playful', 'Wholesome'],
                  'sports': ['Playful', 'Intense'],
                  'trickster': ['Playful', 'Intense'],

                  // Romantic mood
                  'romance': ['Romantic'],
                  'dating': ['Romantic'],
                  'love': ['Romantic'],
                  'relationship': ['Romantic', 'Wholesome'],
                  'fantasy romance': ['Romantic', 'Adventurous'],

                  // Adventurous mood
                  'adventure': ['Adventurous'],
                  'storyteller': ['Adventurous', 'Playful'],
                  'fantasy': ['Adventurous'],
                  'sci-fi': ['Adventurous'],
                  'historical': ['Adventurous'],
                  'epic': ['Adventurous', 'Intense'],
                  'medieval': ['Adventurous'],
                  'pirate': ['Adventurous', 'Playful'],
                  'space': ['Adventurous'],
                  'superhero': ['Adventurous', 'Playful'],
                  'warrior': ['Adventurous', 'Intense'],
                  'guardian': ['Adventurous', 'Intense'],
                  'scientist': ['Helpful', 'Adventurous'],

                  // Wholesome mood
                  'motivation': ['Wholesome', 'Helpful'],
                  'family': ['Wholesome'],
                  'friendship': ['Wholesome', 'Playful'],
                  'cozy': ['Wholesome', 'Relaxed'],
                  'sweet': ['Wholesome', 'Romantic'],

                  // Slow-Burn mood (reserved, stoic characters)
                  'reserved': ['Slow-Burn'],
                  'stoic': ['Slow-Burn', 'Intense'],
                  'cold': ['Slow-Burn', 'Intense'],
                  'professional': ['Slow-Burn', 'Helpful'],

                  // Default/catch-all - these get assigned to multiple moods
                  'original': ['Adventurous', 'Playful'],
                  'recommend': ['Wholesome', 'Playful'],
                  'general': ['Playful', 'Wholesome'],
                  'character': ['Playful', 'Adventurous'],
                };

                // If 'All' is selected, show everything
                if (activeMood === 'All') return true;

                // Check if character's category maps to the active mood (case-insensitive)
                const charCategory = (char.category || 'General').toLowerCase();
                const mappedMoods = categoryToMood[charCategory] || [];
                if (mappedMoods.includes(activeMood)) return true;

                // Fallback to keyword matching for flexible matching
                const text = (char.description + ' ' + char.tagline + ' ' + char.name + ' ' + (char.category || '')).toLowerCase();

                switch (activeMood) {
                  case 'Helpful':
                    return text.includes('help') || text.includes('assist') || text.includes('guide') || text.includes('support') ||
                      text.includes('mentor') || text.includes('teach') || text.includes('advice') || text.includes('coach') ||
                      text.includes('doctor') || text.includes('chef') || text.includes('professor') || text.includes('tutor');
                  case 'Relaxed':
                    return text.includes('calm') || text.includes('chill') || text.includes('relax') || text.includes('easy') ||
                      text.includes('quiet') || text.includes('gentle') || text.includes('friendly') || text.includes('soft');
                  case 'Intense':
                    return text.includes('dark') || text.includes('power') || text.includes('villain') || text.includes('dangerous') ||
                      text.includes('mysterious') || text.includes('dominant') || text.includes('yandere') || text.includes('rival') ||
                      text.includes('shadow') || text.includes('blood') || text.includes('death') || text.includes('storm');
                  case 'Romantic':
                    return text.includes('love') || text.includes('romance') || text.includes('date') || text.includes('flirt') ||
                      text.includes('girlfriend') || text.includes('boyfriend') || text.includes('wife') || text.includes('husband') ||
                      text.includes('heart') || text.includes('sweet') || text.includes('affection');
                  case 'Playful':
                    return text.includes('fun') || text.includes('play') || text.includes('game') || text.includes('joke') ||
                      text.includes('comedy') || text.includes('laugh') || text.includes('energetic') || text.includes('bubbly') ||
                      text.includes('silly') || text.includes('cheerful') || text.includes('happy');
                  case 'Slow-Burn':
                    return (text.includes('slow') && text.includes('burn')) || text.includes('shy') || text.includes('stoic') ||
                      text.includes('cold') || text.includes('distant') || text.includes('stranger') || text.includes('reserved') ||
                      text.includes('quiet') || text.includes('mysterious');
                  case 'Wholesome':
                    return text.includes('sweet') || text.includes('pure') || text.includes('kind') || text.includes('caring') ||
                      text.includes('innocent') || text.includes('family') || text.includes('childhood') || text.includes('warm') ||
                      text.includes('gentle') || text.includes('comfort');
                  case 'Adventurous':
                    return text.includes('adventure') || text.includes('travel') || text.includes('explore') || text.includes('quest') ||
                      text.includes('action') || text.includes('hero') || text.includes('journey') || text.includes('battle') ||
                      text.includes('fight') || text.includes('magic') || text.includes('fantasy') || text.includes('warrior');
                  default:
                    return true;
                }
              })
              .map((char, i) => (
                <CharacterCard
                  key={i}
                  character={char}
                  onClick={() => handleCharacterClick(char)}
                  isFavorite={isFavorite(char)}
                  onToggleFavorite={(e) => onToggleFavorite(char, e)}
                />
              ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
