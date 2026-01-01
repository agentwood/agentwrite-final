import React from 'react';
import { Character } from '../types';
import { MessageCircle, Play } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  variant?: 'portrait' | 'landscape' | 'compact';
  className?: string;
  onClick?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, variant = 'portrait', className = '', onClick }) => {
  if (variant === 'landscape') {
    return (
      <div 
        onClick={onClick}
        className={`group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer ${className}`}
      >
        <div className="relative h-32 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent z-10" />
            <img 
              src={character.avatarUrl} 
              alt={character.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-3 left-3 z-20">
                 <h3 className="font-bold text-white text-lg leading-tight shadow-black drop-shadow-md">
                  {character.name}
                </h3>
            </div>
        </div>
        <div className="p-3">
             <p className="text-xs text-gray-500 line-clamp-2">{character.description}</p>
             <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <MessageCircle size={12} />
                <span>{character.totalChats || '2.1k'}</span>
             </div>
        </div>
      </div>
    );
  }

  // Portrait Variant with Special Hover Effect
  return (
    <div 
        onClick={onClick}
        className={`group relative flex flex-col cursor-pointer transition-all duration-300 ${className}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-3 shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100">
        <img 
          src={character.avatarUrl} 
          alt={character.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Default View: Subtle Gradient Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-0 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="font-bold text-white text-lg leading-tight mb-0.5 shadow-sm">
              {character.name}
            </h3>
            <p className="text-xs text-gray-300 font-medium line-clamp-1 mb-2">
              {character.handle}
            </p>
             <div className="flex items-center gap-3 text-white/80 text-xs">
                <span className="flex items-center gap-1">
                    <Play size={10} className="fill-current" /> {character.totalChats || '50k'}
                </span>
             </div>
        </div>

        {/* Hover View: Dark Overlay, Circle Avatar, Button */}
        <div className="absolute inset-0 bg-black/80 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-between p-6 text-center backdrop-blur-[2px]">
            <div className="mt-4">
                <div className="w-20 h-20 rounded-full border-2 border-white/20 mx-auto mb-3 overflow-hidden shadow-2xl p-0.5 bg-black/50">
                    <img src={character.avatarUrl} className="w-full h-full rounded-full object-cover" alt={character.name} />
                </div>
                <h3 className="text-white font-bold text-lg leading-tight">{character.name}</h3>
            </div>
            
            <p className="text-gray-300 text-xs line-clamp-4 leading-relaxed px-2 font-medium">
                {character.description}
            </p>
            
            <button className="w-full bg-white text-black py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg mt-2 transform translate-y-2 group-hover:translate-y-0 duration-300">
                <MessageCircle size={16} className="fill-current" /> Chat Now
            </button>
        </div>
      </div>
    </div>
  );
};