"use client";

import React, { useState, useRef } from 'react';
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

const LandingHero = () => (
  <section className="relative w-full min-h-[700px] md:min-h-[85vh] overflow-hidden bg-black flex items-center px-8 md:px-24">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
      <img
        src="/hero.png"
        className="w-full h-full object-cover opacity-60"
        alt="Luxury Hearth"
      />
    </div>
    <div className="relative z-10 max-w-4xl animate-fade-in-up space-y-12">
      <h1 className="text-[70px] md:text-[120px] font-serif italic text-white leading-[0.85] tracking-tight">
        Enter <br />The Wood
      </h1>

      <div className="flex gap-8 items-start max-w-xl">
        <div className="w-[1px] h-12 bg-white/40 mt-1 shrink-0"></div>
        <p className="text-lg md:text-xl text-white/60 font-sans leading-relaxed">
          Immersive audio stories and roleplay <br className="hidden md:block" />
          companions designed to spark your imagination.
        </p>
      </div>

      <button className="group px-10 py-5 bg-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-black hover:bg-white/90 transition-all flex items-center gap-4 shadow-2xl">
        Try Agentwood
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </section>
);

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

const TestimonialSection = () => (
  <section className="plum-gradient py-24 px-8 md:px-12 text-center space-y-10 border-y border-white/5">
    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 font-sans">YOU DON'T HAVE TO TAKE OUR WORD FOR IT</p>
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-center mb-6">
        <span className="text-6xl text-dipsea-accent font-serif">“</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-serif italic text-white leading-tight">
        Agentwood is unparalleled when it comes to the production value of their narratives. I love that they have deep, resonant voices for every part.
      </h2>
      <div className="flex justify-center gap-1.5 pt-6">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#c2956e" className="text-dipsea-accent" />)}
      </div>
    </div>
  </section>
);

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
          <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors font-sans">AFFILIATES</span>
          <Bell size={18} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
          <div className="h-9 w-9 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center font-bold text-white text-xs">U</div>
        </div>
      </div>

      <LandingHero />

      {/* Trending Header */}
      <div className="px-6 md:px-12 pt-16 pb-4 bg-[#0c0c0c]">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/30 font-sans">TRENDING NOW</span>
      </div>

      <section className="px-6 md:px-12 py-16 bg-[#0c0c0c]">
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

      <TestimonialSection />

      {/* Filter Section - Restored to match requested style */}
      <section className="sticky top-[89px] z-30 bg-[#0c0c0c]/95 backdrop-blur-xl border-b border-white/5 py-6 px-6 md:px-12">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 font-sans flex-shrink-0">MOOD</span>
          <div className="flex items-center gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => {
                  setActiveMood(mood);
                  // Map mood to existing categories for filtering
                  const moodMap: Record<string, Category> = {
                    'Helpful': 'Helpful',
                    'Relaxed': 'Helpful',
                    'Intense': 'Icon',
                    'Romantic': 'Romance',
                    'Playful': 'Play & Fun',
                    'Slow-Burn': 'Fiction & Media',
                    'Wholesome': 'Educational',
                    'Adventurous': 'Fun'
                  };
                  onCategoryChange(moodMap[mood] || 'All');
                }}
                className={`px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${activeMood === mood
                  ? 'bg-dipsea-accent text-white border-dipsea-accent shadow-lg'
                  : 'bg-[#1c1816] text-white/40 border-white/5 hover:border-white/20 hover:text-white'
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
                if (activeCategory === 'All') return true;
                return char.category === activeCategory;
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
