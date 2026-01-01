import React from 'react';
import { CharacterProfile } from '../types';
import { MessageSquare, Info } from 'lucide-react';

interface CharacterCardProps {
  character: CharacterProfile;
  className?: string;
  onClick?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative aspect-[3/4] overflow-hidden rounded-[32px] bg-dipsea-surface transition-all duration-700 hover:scale-[1.02] cursor-pointer shadow-2xl ${className}`}
    >
      {/* Background Image */}
      <img 
        src={character.avatarUrl} 
        alt={character.name} 
        className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
      />
      
      {/* Elegant Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-0 transition-opacity duration-500"></div>
      
      {/* Default Content (Bottom Overlay) */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-10 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-4">
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

      {/* Hover State: Detailed Card Overlay */}
      <div className="absolute inset-0 bg-[#1c1816]/98 flex flex-col items-center justify-center p-8 text-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
        <div className="w-20 h-20 rounded-full border-2 border-white/10 mb-6 overflow-hidden shadow-2xl">
           <img src={character.avatarUrl} className="w-full h-full object-cover" />
        </div>
        
        <p className="text-sm font-sans text-white/70 leading-relaxed mb-10 italic">
          "{character.description.length > 180 ? character.description.substring(0, 180) + '...' : character.description}"
        </p>

        <button className="w-full py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-bold text-sm tracking-wide shadow-xl active:scale-[0.98] transition-all">
          <MessageSquare size={18} /> Chat Now
        </button>
      </div>

      {/* Aesthetic Border Glow */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors duration-700 pointer-events-none rounded-[32px]"></div>
    </div>
  );
};
