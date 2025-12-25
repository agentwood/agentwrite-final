import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onClick: (character: Character) => void;
  variant?: 'default' | 'scene' | 'horizontal';
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onClick, variant = 'default' }) => {
  
  if (variant === 'horizontal') {
    return (
      <div 
        onClick={() => onClick(character)}
        className="group relative flex-shrink-0 w-[320px] h-[140px] bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-lg rounded-2xl p-4 cursor-pointer transition-all duration-300 flex gap-4 overflow-hidden"
      >
         <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <img 
              src={character.avatarUrl} 
              alt={character.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
         </div>
         <div className="flex flex-col min-w-0 flex-1 justify-center">
            <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{character.name}</h3>
            <p className="text-xs text-indigo-500 font-medium mb-1 truncate">@{character.creator}</p>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{character.description}</p>
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs font-medium">
               <MessageSquare size={12} fill="currentColor" />
               <span>{character.interactions}</span>
            </div>
         </div>
      </div>
    );
  }

  if (variant === 'scene') {
    return (
       <div 
        onClick={() => onClick(character)}
        className="group relative flex-shrink-0 w-[220px] h-[300px] bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
       >
          {/* Background Image */}
          <div className="absolute inset-0">
             <img 
               src={character.backgroundImageUrl || character.avatarUrl} 
               alt={character.name}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-5 flex flex-col">
             <h3 className="text-white font-bold text-lg leading-tight mb-2 drop-shadow-md">{character.name}</h3>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border border-white/50 overflow-hidden">
                   <img src={character.avatarUrl} className="w-full h-full object-cover" />
                </div>
                <span className="text-gray-300 text-xs font-medium">Interactive Scene</span>
             </div>
          </div>
       </div>
    );
  }

  // Default Vertical Card
  return (
    <div 
      onClick={() => onClick(character)}
      className="group flex-shrink-0 w-[180px] cursor-pointer"
    >
      <div className="w-full h-[220px] rounded-2xl overflow-hidden mb-3 relative shadow-sm border border-gray-100">
        <img 
          src={character.avatarUrl} 
          alt={character.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
             <span className="text-white text-xs font-medium">Chat now</span>
        </div>
      </div>
      <h3 className="font-bold text-gray-900 truncate pr-2 group-hover:text-indigo-600 transition-colors">{character.name}</h3>
      <p className="text-xs text-indigo-500 truncate mb-1">@{character.creator}</p>
      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed h-10">{character.description}</p>
      <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs">
          <MessageSquare size={12} fill="currentColor" />
          <span>{character.interactions}</span>
      </div>
    </div>
  );
};

export default CharacterCard;