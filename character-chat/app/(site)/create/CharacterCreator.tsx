'use client';

import { useState } from 'react';
import { ChevronLeft, Wand2, Loader2, ImageIcon, Send, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CharacterFormData {
  name: string;
  tagline: string;
  description: string;
  greeting: string;
  category: string;
  voiceName: string;
  avatarUrl: string;
  personality: string;
}

const CATEGORIES = ['All', 'Play & Fun', 'Helper', 'Original', 'Anime & Game', 'Fiction & Media'];

export default function CharacterCreator() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    tagline: '',
    description: '',
    greeting: '',
    category: 'Helper',
    voiceName: 'default',
    avatarUrl: '',
    personality: ''
  });

  const [previewMessages, setPreviewMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);

  const handleGenerateWithAI = async () => {
    if (!formData.personality.trim()) {
      alert('Please provide some character traits or keywords to expand');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: formData.personality,
          name: formData.name || 'Character'
        })
      });

      if (!response.ok) throw new Error('Failed to generate character');

      const data = await response.json();

      setFormData({
        ...formData,
        description: data.description || formData.description,
        greeting: data.greeting || formData.greeting,
        tagline: data.tagline || formData.tagline,
        personality: data.personality || formData.personality
      });
    } catch (error) {
      console.error('Error generating character:', error);
      alert('Failed to generate character details. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const characterData = {
        name: formData.name,
        tagline: formData.tagline,
        description: formData.description,
        greeting: formData.greeting,
        category: formData.category,
        avatarUrl: formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        voiceName: formData.voiceName,
        systemPrompt: `You are ${formData.name}. ${formData.description}. ${formData.personality}`
      };

      const response = await fetch('/api/personas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      });

      if (!response.ok) throw new Error('Failed to create character');

      const result = await response.json();
      router.push(`/character/${result.id}`);
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Failed to create character. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-12 fade-in max-w-7xl mx-auto text-left bg-[#0f0f0f] min-h-screen">
      <button
        onClick={() => router.push('/home')}
        className="flex items-center gap-3 text-[11px] font-black text-white/30 hover:text-white mb-12 uppercase tracking-[0.2em] transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Discover
      </button>

      <div className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-5xl font-black tracking-tight">Create Character</h1>
          {formData.personality.trim() && (
            <button
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl text-xs font-black hover:bg-purple-700 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Generate with AI
                </>
              )}
            </button>
          )}
        </div>
        <p className="text-white/40 text-lg font-medium">Design an AI that thinks, speaks, and interacts exactly how you imagine.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side - Form */}
          <div className="space-y-12">
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Profile Vision</label>
              <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-6 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform">
                  <ImageIcon size={48} className="opacity-20" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-white/40 uppercase mb-2">Upload Portrait</p>
                  <p className="text-[10px] text-white/20 font-medium">JPG, PNG OR WEBP</p>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Luna the Explorer"
                  className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Primary Category</label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 appearance-none text-white transition-all cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>
                    ))}
                  </select>
                  <ChevronLeft size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-[-90deg] opacity-30 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">
                  Character Keywords
                  <span className="text-white/20 ml-2 normal-case text-[9px]">(for AI generation)</span>
                </label>
                <input
                  type="text"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="e.g. wise, elderly, mentor, fantasy"
                  className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 transition-all"
                />
                <p className="text-[10px] text-white/30 font-medium">Use keywords to auto-generate personality with AI</p>
              </div>
            </div>
          </div>

          {/* Right Side - Preview & Expanded Form */}
          <div className="space-y-12">
            <div className="flex flex-col gap-4 h-full">
              <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Core Personality & Prompting</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="How should this character behave? What are their secrets? How do they sound? The more detail, the better the experience."
                className="flex-1 min-h-[300px] bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-10 text-sm font-medium outline-none focus:border-purple-500/50 resize-none transition-all leading-relaxed"
                required
              />

              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Greeting Message</label>
                <input
                  type="text"
                  value={formData.greeting}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  placeholder="e.g. Hello! I'm here to help you on your journey."
                  className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    INITIALIZING AGENT
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    INITIALIZE AGENT
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
