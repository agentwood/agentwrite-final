import React, { useState } from 'react';
import { Character } from '../types';
import { ArrowLeft, Send, Image as ImageIcon, Grid, MoreHorizontal, UserPlus } from 'lucide-react';
import { CharacterProfile } from './CharacterProfile';

interface ChatInterfaceProps {
  character: Character;
  onBack: () => void;
  allCharacters?: Character[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ character, onBack, allCharacters = [] }) => {
  const [showProfile, setShowProfile] = useState(false);

  // Filter similar characters based on category
  const similarCharacters = allCharacters
    .filter(c => c.category === character.category && c.id !== character.id);

  if (showProfile) {
    return (
        <CharacterProfile 
            character={character} 
            onBack={() => setShowProfile(false)} 
            onChat={() => setShowProfile(false)}
            similarCharacters={similarCharacters}
        />
    );
  }

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden font-sans animate-fade-in relative z-50">
       {/* Main Chat Area */}
       <div className="flex-1 flex flex-col relative z-10 min-w-0">
          {/* Header */}
          <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#121212]/95 backdrop-blur z-20">
             <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-400" />
             </button>
             
             <div 
                className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowProfile(true)}
             >
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{character.name}</h2>
                    {/* Mock Flag/Badge */}
                    <span className="text-xs">🏳️‍🌈</span> 
                </div>
                <div className="text-[10px] text-gray-500 flex items-center gap-2 uppercase tracking-wide font-medium">
                   <span>{character.totalChats || '0'} Chats</span>
                   <span>|</span>
                   <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> 11 Online
                   </span>
                   <span>|</span>
                   <span>By {character.handle}</span>
                </div>
             </div>

             <button 
                onClick={() => setShowProfile(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
             >
                <MoreHorizontal size={20} className="text-gray-400" />
             </button>
          </header>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
             <div className="flex flex-col items-center justify-center py-8 space-y-4">
                 <div 
                    className="w-24 h-24 rounded-full p-1 border border-white/10 relative cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setShowProfile(true)}
                 >
                    <img src={character.avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" />
                 </div>
                 <div className="flex flex-col items-center gap-3">
                     <h1 className="text-2xl font-bold">{character.name}</h1>
                     <button className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
                        <UserPlus size={16} /> Follow
                     </button>
                 </div>
             </div>

             {/* Intro Message Box */}
             <div className="bg-[#1e1e1e] p-5 rounded-2xl max-w-3xl mx-auto border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex items-start gap-3 mb-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded">Intro</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed font-light">
                    {character.description}
                </p>
             </div>

             {/* AI Initial Message */}
             <div className="flex gap-4 max-w-3xl mx-auto animate-slide-up">
                <img src={character.avatarUrl} className="w-10 h-10 rounded-full object-cover mt-1 border border-white/10 shrink-0" alt="char" />
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2">
                         <span className="text-sm font-bold text-gray-300">{character.name}</span>
                         <span className="text-[10px] text-gray-600">AI</span>
                    </div>
                    <div className="bg-[#1e1e1e] px-5 py-4 rounded-2xl rounded-tl-none border border-white/5 text-gray-200 text-sm leading-relaxed shadow-sm">
                        <p>{character.introMessage || "Hello there. I noticed you staring. Is there something on my face, or are you just lost?"}</p>
                    </div>
                    {/* Message Actions */}
                    <div className="flex gap-4 mt-1 px-2">
                         <button className="text-xs text-gray-500 hover:text-white transition-colors">Reply</button>
                         <button className="text-xs text-gray-500 hover:text-white transition-colors">Regenerate</button>
                    </div>
                </div>
             </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
             <div className="bg-[#1e1e1e] rounded-3xl p-2 pl-4 flex items-center gap-3 border border-white/10 shadow-2xl relative">
                <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><Grid size={20}/></button>
                <div className="h-6 w-px bg-white/5"></div>
                <input 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm py-3"
                  placeholder={`Message ${character.name}...`} 
                  autoFocus
                />
                <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><ImageIcon size={20}/></button>
                <button className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                    <Send size={18} className="translate-x-0.5 translate-y-0.5" />
                </button>
             </div>
             <p className="text-center text-[10px] text-gray-600 mt-3">
                AI characters can make mistakes. Please double-check facts.
             </p>
          </div>
       </div>

       {/* Right Panel - Character Art (Desktop only) */}
       <div className="hidden xl:block w-[450px] h-full relative shrink-0 border-l border-white/5 bg-black">
          <img src={character.avatarUrl} className="w-full h-full object-cover opacity-80" alt="Character Art" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#121212]/20 to-[#121212]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
          
          {/* Optional: Floating details on the art */}
          <div className="absolute bottom-8 right-8 text-right">
              <h3 className="text-3xl font-bold text-white/90 drop-shadow-xl">{character.name}</h3>
              <p className="text-white/60 text-sm mt-1 backdrop-blur-sm bg-black/30 inline-block px-2 rounded">@{character.handle}</p>
          </div>
       </div>
    </div>
  );
};
