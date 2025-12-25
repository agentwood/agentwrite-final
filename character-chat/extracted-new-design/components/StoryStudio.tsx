
import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types';
import { geminiService } from '../services/geminiService';

interface StoryStudioProps {
  agents: Agent[];
  onBack: () => void;
}

const StoryStudio: React.FC<StoryStudioProps> = ({ agents, onBack }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Story');
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGetInspiration = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setSuggestion(null);

    const context = content.slice(-500); // Get last 500 chars for context
    const prompt = `As ${selectedAgent.name} (${selectedAgent.role}), provide a 2-sentence creative continuation or a plot twist for this story. Be atmospheric and match your personality.
    Story Context: ${context}`;

    try {
      const response = await geminiService.streamChat(selectedAgent.systemPrompt, [], prompt);
      let fullResponse = '';
      for await (const chunk of response) {
        fullResponse += chunk;
      }
      setSuggestion(fullResponse);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = () => {
    if (suggestion) {
      setContent(prev => prev + (prev.length > 0 ? '\n\n' : '') + suggestion);
      setSuggestion(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white fade-in overflow-hidden">
      {/* Studio Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
             <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold text-zinc-900 bg-transparent border-none focus:ring-0 w-64"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {agents.slice(0, 3).map(a => (
              <img 
                key={a.id} 
                src={a.avatar} 
                onClick={() => setSelectedAgent(a)}
                className={`w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-all ${selectedAgent.id === a.id ? 'ring-2 ring-black scale-110 z-10' : 'opacity-40'}`} 
                alt={a.name} 
              />
            ))}
          </div>
          <button 
            onClick={handleGetInspiration}
            disabled={isGenerating}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? 'Consulting Muse...' : 'Get Inspiration'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Writing Area */}
        <div className="flex-1 flex flex-col items-center overflow-y-auto no-scrollbar p-12 lg:p-24 bg-grain">
          <div className="w-full max-w-2xl bg-white shadow-2xl shadow-black/5 rounded-[3rem] p-12 lg:p-20 min-h-[800px] flex flex-col">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start your story here..."
              className="w-full flex-1 text-xl lg:text-2xl leading-relaxed text-zinc-800 placeholder-zinc-200 bg-transparent border-none focus:ring-0 resize-none font-serif-display font-medium"
            />
          </div>
        </div>

        {/* AI Co-writer Sidebar */}
        <aside className="w-80 border-l border-zinc-100 p-8 space-y-8 overflow-y-auto bg-zinc-50/50">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Co-Writer</p>
            <div className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-zinc-100 shadow-sm">
               <img src={selectedAgent.avatar} className="w-12 h-12 rounded-xl object-cover" alt={selectedAgent.name} />
               <div>
                  <p className="text-sm font-bold text-zinc-900">{selectedAgent.name}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase">{selectedAgent.role}</p>
               </div>
            </div>
          </div>

          {suggestion && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
               <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Inspiration</p>
               <div className="p-6 bg-zinc-900 text-white rounded-[2rem] shadow-xl relative group">
                  <p className="text-sm font-medium italic leading-relaxed">
                    "{suggestion}"
                  </p>
                  <button 
                    onClick={applySuggestion}
                    className="absolute -bottom-3 -right-3 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  </button>
               </div>
            </div>
          )}

          <div className="pt-10 space-y-4">
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Writing Tips</p>
             <div className="space-y-3">
                {[
                  "Focus on the senses.",
                  "Show, don't tell.",
                  "Start in the middle of action."
                ].map((tip, i) => (
                  <div key={i} className="p-4 bg-white/50 border border-zinc-100 rounded-2xl text-[11px] font-medium text-zinc-500">
                    {tip}
                  </div>
                ))}
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default StoryStudio;
