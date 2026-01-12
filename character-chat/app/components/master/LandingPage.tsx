"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Bell, Play, Star, MessageSquare, ChevronDown, Heart, ChevronRight
} from 'lucide-react';
import { CharacterProfile, Category } from '@/lib/master/types';
import { CharacterCard } from './CharacterCard';
import { SkeletonRow, SkeletonCard } from './SkeletonLoaders';
import { Footer } from './Footer';

interface LandingPageProps {
  characters: CharacterProfile[];
  loading: boolean;
  activeCategory: Category;
  onCategoryChange: (cat: Category) => void;
  onSelectCharacter: (char: CharacterProfile) => void;
  isFavorite: (char: CharacterProfile) => boolean;
  onToggleFavorite: (char: CharacterProfile, e: React.MouseEvent) => void;
  onSearch: () => void;
}

const AgentwoodDifference = () => (
  <section className="bg-[#0c0c0c] px-8 md:px-24 py-12 border-b border-white/5">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C69C6D] mb-4">THE AGENTWOOD DIFFERENCE</h3>
        <h2 className="text-3xl md:text-5xl font-serif text-white max-w-3xl leading-tight">
          Communication, reimagined for the modern era.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-t border-white/10 pt-12">
        {/* 01 */}
        <div className="space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-4 group-hover:text-[#C69C6D] transition-colors">01</span>
          <h4 className="text-xl font-serif text-white">Premium Immersion</h4>
          <p className="text-sm text-white/50 leading-relaxed">
            Experience narratives with unparalleled production value. Every voice, pause, and whisper is crafted for maximum realism and emotional depth.
          </p>
        </div>

        {/* 02 */}
        <div className="space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-4 group-hover:text-[#C69C6D] transition-colors">02</span>
          <h4 className="text-xl font-serif text-white">Creator Economy</h4>
          <p className="text-sm text-white/50 leading-relaxed">
            The first platform where you can build, buy, and sell unique character personas. Your imagination is now a tangible, tradeable asset.
          </p>
        </div>

        {/* 03 */}
        <div className="space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-4 group-hover:text-[#C69C6D] transition-colors">03</span>
          <h4 className="text-xl font-serif text-white">Active Memory</h4>
          <p className="text-sm text-white/50 leading-relaxed">
            Forget resetting. Our agents learn from every conversation, referencing past details to build a relationship that deepens and grows with you.
          </p>
        </div>

        {/* 04 */}
        <div className="space-y-4 group">
          <span className="text-[10px] font-bold text-white/30 block mb-4 group-hover:text-[#C69C6D] transition-colors">04</span>
          <h4 className="text-xl font-serif text-white">Story Generation</h4>
          <p className="text-sm text-white/50 leading-relaxed">
            Turn your chats into lasting artifacts. Create immersive audiobooks and written novels instantly from your roleplay history.
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
    <section className="relative w-full min-h-[700px] md:min-h-[85vh] overflow-hidden bg-black flex items-center px-8 md:px-24">
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
      <div className="relative z-10 max-w-4xl animate-fade-in-up space-y-12">
        <h1 className="text-[70px] md:text-[120px] font-serif italic text-white leading-[0.85] tracking-tight">
          Enter <br />The Woods
        </h1>

        <div className="flex gap-8 items-start max-w-xl">
          <div className="w-[1px] h-12 bg-white/40 mt-1 shrink-0"></div>
          <p className="text-lg md:text-xl text-white/60 font-sans leading-relaxed">
            Meet premium characters you can talk to, learn from and have fun with, from therapists to fantasy characters
          </p>
        </div>

        <button onClick={scrollToCharacters} className="group px-10 py-5 bg-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white/90 transition-all flex items-center gap-4 shadow-2xl">
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

export const LandingPage: React.FC<LandingPageProps> = ({
  characters,
  loading,
  activeCategory,
  onCategoryChange,
  onSelectCharacter,
  isFavorite,
  onToggleFavorite,
  onSearch
}) => {
  const [activeMood, setActiveMood] = useState('Relaxed');
  const moods = ['Helpful', 'Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn', 'Wholesome', 'Adventurous'];

  return (
    <div className="fade-in">
      <div className="sticky top-0 z-40 w-full px-6 md:px-12 py-6 glass border-b border-white/5 flex items-center justify-between">
        <div className="flex-1 max-w-xl relative group" onClick={onSearch}>
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-dipsea-accent transition-colors" />
          <input readOnly type="text" placeholder="Search characters..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-dipsea-accent transition-all font-sans text-white placeholder:text-white/20 cursor-pointer" />
        </div>
        <div className="flex items-center gap-8 ml-4">
          <Link href="/affiliates" className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors font-sans">AFFILIATES</Link>
          <Link href="/notifications">
            <Bell size={18} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
          </Link>
          <Link href="/settings" className="h-9 w-9 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center font-bold text-white text-xs hover:border-white transition-colors">
            U
          </Link>
        </div>
      </div>

      <LandingHero />

      <AgentwoodDifference />

      {/* Trending Header */}
      <div className="px-6 md:px-12 pt-16 pb-4 bg-[#0c0c0c]">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 font-sans">TRENDING NOW</span>
      </div>

      <section id="characters" className="px-6 md:px-12 py-16 bg-[#0c0c0c]">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight">Meet our Characters</h2>
          <button className="text-[10px] font-bold uppercase tracking-widest text-dipsea-accent border-b border-dipsea-accent hover:text-white hover:border-white transition-all font-sans pb-1">SEE ALL</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
          ) : (
            characters.slice(0, 9).map((char, i) => (
              <CharacterPlayRow key={i} char={char} onClick={() => onSelectCharacter(char)} />
            ))
          )}
        </div>
      </section>

      <NewsletterSection />

      {/* Filter Section - Matching Users Screenshot */}
      <section className="sticky top-[86px] z-30 bg-[#0c0c0c]/95 backdrop-blur-xl border-b border-white/5 py-6 px-6 md:px-12">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5d5650] font-sans flex-shrink-0">MOOD</span>
          <div className="flex items-center gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => {
                  setActiveMood(mood);
                  // Determine broad category mapping for the URL/State, but we'll do refined filtering below
                  const moodMap: Record<string, Category> = {
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
                // 1. First Pass: Category Filter (if set strictly by parent, but we want mood to take precedence in this view)
                // Actually, let's make MOOD the primary filter for this view.

                if (activeMood === 'Relaxed') return true; // Show all for relaxed (discovery mode) or filter by 'calm' tags if we had them.
                // For now, 'Relaxed' serves as 'All/Discover' 

                if (activeMood === 'Helpful') return char.category === 'Helpful' || char.category === 'Helper' || char.category === 'Educational';
                if (activeMood === 'Romantic') return char.category === 'Romance';
                if (activeMood === 'Playful') return char.category === 'Play & Fun' || char.category === 'Fun';
                if (activeMood === 'Intense') return char.category === 'Anime & Game' || char.description.toLowerCase().includes('villain') || char.description.toLowerCase().includes('power');
                if (activeMood === 'Slow-Burn') return char.category === 'Romance' && (char.description.toLowerCase().includes('slow') || char.description.toLowerCase().includes('quiet'));
                if (activeMood === 'Wholesome') return char.category === 'Helpful' || char.category === 'Icon';
                if (activeMood === 'Adventurous') return char.category === 'Fun' || char.category === 'Fiction & Media';

                return true;
              })
              .map((char, i) => (
                <CharacterCard
                  key={i}
                  character={char}
                  onClick={() => onSelectCharacter(char)}
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
