
import React, { useState, useEffect, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { Agent } from '../types';

interface CreateCharacterModalProps {
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}

const VOICES = ['Fenrir', 'Kore', 'Puck', 'Zephyr', 'Charon'];

interface FieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

const FieldLabel: React.FC<FieldLabelProps> = ({ children, required }) => (
  <label className="block text-sm font-bold text-zinc-900 mb-2">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const CharCount = ({ count, max }: { count: number, max: number }) => (
  <div className="text-right text-[10px] text-zinc-400 mt-1 font-mono">
    {count}/{max}
  </div>
);

const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    greeting: '',
    voice: 'Zephyr',
    visibility: 'Public',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>(['Anime', 'Assistant', 'RPG', 'Productivity', 'Storyteller']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingTags, setIsFetchingTags] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Debounced tag suggestion
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.name || formData.description) {
        setIsFetchingTags(true);
        const tags = await geminiService.suggestTags(formData.name, formData.tagline, formData.description);
        if (tags && tags.length > 0) {
          setSuggestedTags(prev => Array.from(new Set([...tags, ...prev])).slice(0, 10));
        }
        setIsFetchingTags(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.name, formData.tagline, formData.description]);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setIsGenerating(true);

    try {
      let finalAvatar = avatarPreview;
      if (!finalAvatar) {
        finalAvatar = await geminiService.generateAvatar(`${formData.name} ${formData.tagline}`);
      }

      const newAgent: Agent = {
        id: `${formData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
        name: formData.name,
        role: formData.tagline || 'Collaborator',
        category: 'Fantasy', 
        description: formData.description,
        avatar: finalAvatar,
        chats: '0',
        author: '@you',
        systemPrompt: `You are ${formData.name}. ${formData.description}. Your greeting is: "${formData.greeting}". Tags: ${selectedTags.join(', ')}`,
        accentColor: 'orange',
        traits: {
          aggression: 50,
          culture: 'Modern',
          style: 'Minimalist',
          voiceName: formData.voice
        }
      };

      onCreated(newAgent);
      onClose();
    } catch (error) {
      console.error("Failed to create character", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4">
      <div className="bg-zinc-50 w-full max-w-2xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-10 py-6 border-b border-zinc-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-zinc-900">Create Character</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
          
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 group">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-orange-200 to-orange-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                )}
              </div>
              <button className="absolute bottom-1 right-1 p-2 bg-white rounded-full shadow-md border border-zinc-100 text-zinc-600 hover:text-zinc-900 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            </div>
          </div>

          <div>
            <FieldLabel required>Character name</FieldLabel>
            <input 
              type="text"
              maxLength={20}
              placeholder="e.g. Albert Einstein"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-300 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
            />
            <CharCount count={formData.name.length} max={20} />
          </div>

          <div>
            <FieldLabel>Tagline</FieldLabel>
            <input 
              type="text"
              maxLength={50}
              placeholder="Add a short tagline of your Character"
              value={formData.tagline}
              onChange={e => setFormData({...formData, tagline: e.target.value})}
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-300 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all"
            />
            <CharCount count={formData.tagline.length} max={50} />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea 
              maxLength={500}
              placeholder="How would your Character describe themselves?"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-300 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all min-h-[120px] resize-none"
            />
            <CharCount count={formData.description.length} max={500} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FieldLabel>Tags</FieldLabel>
              {isFetchingTags && <span className="text-[10px] font-mono text-orange-500 animate-pulse">AI ANALYZING...</span>}
            </div>
            
            {/* Selected Tags Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1.5 bg-zinc-900 text-white rounded-full text-xs font-bold flex items-center gap-1.5 group transition-all"
                >
                  {tag}
                  <svg className="w-3 h-3 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              ))}
            </div>

            {/* Suggested Tags */}
            <div className="flex flex-wrap gap-2">
              {suggestedTags.filter(t => !selectedTags.includes(t)).map(tag => (
                <button 
                  key={tag} 
                  onClick={() => toggleTag(tag)}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 rounded-full text-xs font-semibold hover:border-zinc-900 hover:text-zinc-900 transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Greeting</FieldLabel>
            <textarea 
              maxLength={4096}
              placeholder="Your neighbor just knocked. He says his power's out... but why won't he leave?"
              value={formData.greeting}
              onChange={e => setFormData({...formData, greeting: e.target.value})}
              className="w-full px-5 py-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-900 placeholder-zinc-300 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 outline-none transition-all min-h-[120px] resize-none"
            />
            <CharCount count={formData.greeting.length} max={4096} />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-200/50 hover:bg-zinc-200 rounded-full text-xs font-bold text-zinc-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add additional greeting
          </button>

          <p className="text-[10px] text-zinc-400 italic">
            You can add up to 5 custom greetings. They'll appear in the order you set and people swipe to pick one before chatting. Once your list ends, we'll suggest ai-generated greetings based on your character.
          </p>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-4 h-4 border-2 border-zinc-300 rounded peer-checked:bg-zinc-900 peer-checked:border-zinc-900 transition-all"></div>
              <svg className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span className="text-sm font-bold text-zinc-900 group-hover:text-black">AI Greeting for New Chats</span>
          </label>

          <div className="bg-zinc-100/50 p-6 rounded-2xl border border-zinc-200">
            <FieldLabel>Voice</FieldLabel>
            <div className="relative">
              <select 
                value={formData.voice}
                onChange={e => setFormData({...formData, voice: e.target.value})}
                className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-3 text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-zinc-900/5"
              >
                {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <FieldLabel>Visibility</FieldLabel>
            <div className="flex gap-4">
              <div className="relative">
                <select 
                  value={formData.visibility}
                  onChange={e => setFormData({...formData, visibility: e.target.value})}
                  className="bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2 appearance-none pr-8 cursor-pointer outline-none"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                  <option value="Unlisted">Unlisted</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="px-10 py-6 border-t border-zinc-200 bg-white flex justify-end">
          <button 
            onClick={handleCreate}
            disabled={!formData.name.trim() || isGenerating}
            className={`px-10 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg ${!formData.name.trim() || isGenerating ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-400 text-white hover:bg-zinc-500'}`}
          >
            {isGenerating ? 'Creating...' : 'Create Character'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCharacterModal;
