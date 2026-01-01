
import React from 'react';
import { CharacterProfile } from '../types';
import { MessageSquare, Play } from 'lucide-react';

interface CharacterCardProps {
  character: CharacterProfile;
  className?: string;
  onClick?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#1a1a1a] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-pointer ${className}`}
    >
      {/* Background Image */}
      <img 
        src={character.avatarUrl} 
        alt={character.name} 
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Live Badge */}
      {character.isLive && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-[9px] font-black text-white backdrop-blur-md border border-white/10">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
      )}

      {/* Gradient Overlay - Darker at bottom for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <h3 className="text-sm font-black leading-tight mb-1 truncate">{character.name}</h3>
        <div className="flex items-center gap-1.5 opacity-60 mb-2">
          <MessageSquare size={10} className="stroke-[3]" />
          <span className="text-[10px] font-black">{character.chatCount}</span>
        </div>
        <p className="text-[10px] opacity-70 line-clamp-2 font-medium leading-relaxed group-hover:opacity-100 transition-opacity">
          {character.tagline}
        </p>
      </div>

      {/* Glossy sheen on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
    </div>
  );
};
