import React from 'react';
import { Search, Volume2, Play, Sparkles } from 'lucide-react';
import CharacterCard from './CharacterCard';
import { Character } from '../types';
import { MOCK_CHARACTERS, SCENES, CATEGORIES } from '../constants';

interface DiscoverProps {
  onCharacterClick: (char: Character) => void;
}

const Discover: React.FC<DiscoverProps> = ({ onCharacterClick }) => {
  return (
    <div className="max-w-[1600px] mx-auto pb-20 pt-4">
      
      {/* Top Search Bar (Mobile/Tablet usually) */}
      <div className="md:hidden p-4">
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search for characters" className="w-full bg-white border border-gray-200 py-3 pl-10 pr-4 rounded-full shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
         </div>
      </div>

      {/* Welcome Section */}
      <div className="px-6 py-8 md:px-12 bg-gradient-to-r from-indigo-600 to-purple-700 mx-6 md:mx-10 rounded-3xl text-white mb-10 shadow-lg shadow-indigo-200 relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Hello, SparklyCamel8370 👋</h2>
            <p className="text-indigo-100 opacity-90 max-w-lg">Discover new AI personas, roleplay in immersive scenes, or create your own unique characters today.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* For You Section */}
      <div className="mb-12">
         <div className="px-6 md:px-10 mb-5 flex items-center gap-2">
            <Sparkles size={20} className="text-indigo-600" />
            <h3 className="font-bold text-xl text-gray-900">Recommended for You</h3>
         </div>
         <div className="flex overflow-x-auto gap-5 px-6 md:px-10 pb-6 no-scrollbar snap-x">
            {MOCK_CHARACTERS.slice(0, 4).map(char => (
               <div className="snap-start" key={char.id}>
                 <CharacterCard 
                    character={char} 
                    variant="horizontal" 
                    onClick={onCharacterClick} 
               />
               </div>
            ))}
         </div>
      </div>

      {/* Scenes Section */}
      <div className="mb-12 bg-slate-50 py-10">
         <div className="px-6 md:px-10 mb-5">
            <h3 className="font-bold text-xl text-gray-900">Immersive Scenes</h3>
            <p className="text-gray-500 text-sm">Jump into a roleplay scenario</p>
         </div>
         <div className="flex overflow-x-auto gap-5 px-6 md:px-10 pb-4 no-scrollbar">
            {SCENES.map(scene => (
               <CharacterCard 
                  key={scene.id} 
                  character={scene} 
                  variant="scene" 
                  onClick={onCharacterClick} 
               />
            ))}
         </div>
      </div>

      {/* Featured Section */}
      <div className="mb-12">
         <div className="px-6 md:px-10 mb-5">
            <h3 className="font-bold text-xl text-gray-900">Featured Creators</h3>
         </div>
         <div className="flex overflow-x-auto gap-5 px-6 md:px-10 pb-6 no-scrollbar">
            {MOCK_CHARACTERS.slice(4, 9).map(char => (
               <CharacterCard 
                  key={char.id} 
                  character={char} 
                  variant="horizontal" 
                  onClick={onCharacterClick} 
               />
            ))}
         </div>
      </div>
      
       {/* Try These Section */}
       <div className="mb-12 px-6 md:px-10">
         <div className="mb-6">
            <h3 className="font-bold text-xl text-gray-900">Quick Chats</h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {MOCK_CHARACTERS.slice(4, 8).map((char, idx) => (
                <div key={char.id} onClick={() => onCharacterClick(char)} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md cursor-pointer transition-all group">
                   <img src={char.avatarUrl} className="w-12 h-12 rounded-xl object-cover" />
                   <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">{char.name}</p>
                      <p className="text-xs text-gray-500 truncate">@{char.creator}</p>
                   </div>
                </div>
             ))}
         </div>
      </div>
      
       {/* Voices Section */}
       <div className="mb-12">
         <div className="px-6 md:px-10 mb-5">
            <h3 className="font-bold text-xl text-gray-900">Trending Voices</h3>
         </div>
         <div className="flex overflow-x-auto gap-4 px-6 md:px-10 pb-4 no-scrollbar">
             {[
               { name: "Narrator", desc: "Deep & Calm", color: "bg-indigo-600" },
               { name: "Anime Hero", desc: "Energetic", color: "bg-pink-500" },
               { name: "Mystery", desc: "Low & Husky", color: "bg-purple-600" },
               { name: "Assistant", desc: "Clear & Crisp", color: "bg-cyan-600" }
             ].map((voice, idx) => (
                <div key={idx} className="flex-shrink-0 w-[200px] bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-4 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all group">
                   <div className={`w-12 h-12 rounded-xl ${voice.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Play size={20} fill="currentColor" />
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-bold text-base text-gray-900 truncate">{voice.name}</p>
                      <p className="text-xs text-gray-500 truncate">{voice.desc}</p>
                   </div>
                </div>
             ))}
         </div>
      </div>

       {/* Category Pills */}
       <div className="mb-10 px-6 md:px-10">
          <div className="flex flex-wrap gap-3">
             <button className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-200">All</button>
             {CATEGORIES.map(cat => (
                <button key={cat} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition-all">
                   {cat}
                </button>
             ))}
          </div>
       </div>

      {/* Popular Section - Grid */}
      <div className="px-6 md:px-10">
         <div className="mb-5">
            <h3 className="font-bold text-xl text-gray-900">All Characters</h3>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-10">
            {/* Repeating mock characters for grid effect */}
            {[...MOCK_CHARACTERS, ...MOCK_CHARACTERS].map((char, idx) => (
               <CharacterCard 
                  key={`${char.id}-${idx}`} 
                  character={char} 
                  onClick={onCharacterClick} 
               />
            ))}
         </div>
      </div>
    </div>
  );
};

export default Discover;