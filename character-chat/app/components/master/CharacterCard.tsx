"use client";

import React from 'react';
import { CharacterProfile } from '@/lib/master/types';
import { MessageSquare, Heart } from 'lucide-react';

interface CharacterCardProps {
  character: CharacterProfile;
  className?: string;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, className = '', onClick, isFavorite, onToggleFavorite }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative aspect-[3/4] overflow-hidden rounded-[32px] bg-dipsea-surface cursor-pointer shadow-lg hover:shadow-2xl animate-fade-in-up ${className}`}
    >
      {/* Background Image with Scale Animation */}
      <div className="absolute inset-0 overflow-hidden rounded-[32px]">
        <img 
            src={character.avatarUrl} 
            alt={character.name} 
            className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
        />
      </div>
      
      {/* Favorite Button */}
      {onToggleFavorite && (
        <button 
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 z-30 p-3 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white transition-all duration-300 group-hover:opacity-100 opacity-0 md:opacity-100 transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Heart 
            size={18} 
            className={`transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-500"}`}
          />
        </button>
      )}
      
      {/* Elegant Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700"></div>
      
      {/* Default Content (Bottom Overlay) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 transition-all duration-700 group-hover:translate-y-2 group-hover:opacity-0">
        <h3 className="text-2xl font-bold font-sans leading-tight mb-1">
          {character.name}
        </h3>
        <div className="flex items-center gap-2 text-white/80 mb-1">
          <MessageSquare size={14} className="opacity-60" />
          <span className="text-[13px] font-sans font-medium">{character.chatCount}</span>
        </div>
        <p className="text-[12px] text-white/40 font-sans tracking-wide">
          {character.handle}
        </p>
      </div>

      {/* Hover State: Glassy Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
            <div className="w-16 h-16 rounded-full border-2 border-white/20 mb-6 overflow-hidden shadow-2xl mx-auto">
                <img src={character.avatarUrl} className="w-full h-full object-cover" />
            </div>
            
            <p className="text-sm font-sans text-white/90 leading-relaxed mb-8 italic line-clamp-3">
            "{character.description}"
            </p>

            <button className="px-6 py-3 bg-white text-black rounded-full flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
            Start Chatting
            </button>
        </div>
      </div>

      {/* Aesthetic Border Glow */}
      <div className="absolute inset-0 border border-white/5 group-hover:border-white/20 transition-colors duration-700 pointer-events-none rounded-[32px]"></div>
    </div>
  );
};
