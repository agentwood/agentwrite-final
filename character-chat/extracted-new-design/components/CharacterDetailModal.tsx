
import React, { useState } from 'react';
import { Agent } from '../types';

interface CharacterDetailModalProps {
  agent: Agent;
  onClose: () => void;
  onInitiate: (selectedVoice: string) => void;
}

const VOICES = ['Fenrir', 'Kore', 'Puck', 'Zephyr', 'Charon'];

const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({ agent, onClose, onInitiate }) => {
  const [selectedVoice, setSelectedVoice] = useState(agent.traits.voiceName);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative h-64">
          <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div className="absolute bottom-0 left-0 p-10">
            <span className={`inline-block px-3 py-1 rounded bg-${agent.accentColor}-500/20 text-${agent.accentColor}-400 text-[10px] font-bold uppercase tracking-widest border border-${agent.accentColor}-500/30 mb-4`}>
              {agent.category} Protocol
            </span>
            <h2 className="text-5xl font-hero uppercase tracking-tighter text-white">{agent.name}</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm mt-1">{agent.role}</p>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aggression</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${agent.traits.aggression}%` }}></div>
                </div>
                <span className="text-xs font-mono text-zinc-300">{agent.traits.aggression}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Culture</p>
              <p className="text-sm font-semibold text-zinc-100 truncate">{agent.traits.culture}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Style</p>
              <p className="text-sm font-semibold text-zinc-100 truncate">{agent.traits.style}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Voice Model</p>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-zinc-800 text-zinc-100 text-sm font-semibold rounded-lg border border-white/10 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
              >
                {VOICES.map(voice => (
                  <option key={voice} value={voice} className="bg-zinc-900">{voice}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Persona Manifesto</p>
            <p className="text-lg text-zinc-300 font-serif-display italic leading-relaxed">
              "{agent.description}"
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => onInitiate(selectedVoice)}
              className={`flex-1 py-5 rounded-2xl bg-${agent.accentColor}-600 hover:bg-${agent.accentColor}-700 text-white font-bold uppercase tracking-widest text-sm shadow-xl shadow-${agent.accentColor}-900/20 transition-all flex items-center justify-center gap-3`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              Initiate Audio Link
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-5 rounded-2xl bg-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-sm hover:bg-zinc-700 hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="px-10 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Stability Score: 99.4%</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{agent.author}</span>
        </div>
      </div>
    </div>
  );
};

export default CharacterDetailModal;
