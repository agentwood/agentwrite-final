'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Info, Image as ImageIcon, Volume2, Plus, Sparkles, Loader2 } from 'lucide-react';
import CreatingCharacterModal from '@/app/components/CreatingCharacterModal';
import VoiceSelector from '@/app/components/VoiceSelector';

// ... (keep creating character modal import)

// Available archetypes for voice selection (DEPRECATED - Kept for reference if needed, but UI uses VoiceSelector)
// const VOICE_ARCHETYPES = ... 

const CATEGORIES = ['Helper', 'Original', 'Anime & Game', 'Fiction & Media', 'Roleplay', 'History', 'Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn', 'Wholesome', 'Adventurous'];

export default function CharacterCreator() {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    gender: 'NB' as 'M' | 'F' | 'NB',
    description: '', // Settings / Description
    tagline: '', // Intro / Hook
    greeting: '', // Opening
    category: 'Original',
    voiceSeedId: '', // NEW: Selected Voice Seed ID
    voiceName: '',   // NEW: For UI display
    avatarUrl: '',
    keywords: '', // Hidden field for API compatibility if needed
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showCreatingModal, setShowCreatingModal] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [creatingCharacterId, setCreatingCharacterId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (!formData.voiceSeedId) {
      alert('Please select a voice for your character.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/personas/create-full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          gender: formData.gender,
          description: formData.description,
          tagline: formData.tagline,
          greeting: formData.greeting,
          category: formData.category,
          voiceSeedId: formData.voiceSeedId, // SENDING NEW FIELD
          // Use description/tagline as keywords fallback if empty
          keywords: formData.keywords || `${formData.description} ${formData.tagline}`.slice(0, 100),
          avatarUrl: formData.avatarUrl || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to create character');

      const result = await response.json();
      setCreatingCharacterId(result.id);
      setShowCreatingModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create character');
      setIsSaving(false);
    }
  };

  const handleCreationComplete = (characterId: string) => {
    setShowCreatingModal(false);
    router.push(`/character/${characterId}`);
  };

  return (
    <>
      <CreatingCharacterModal
        isOpen={showCreatingModal}
        characterId={creatingCharacterId}
        characterName={formData.name}
        onComplete={handleCreationComplete}
        onError={() => setShowCreatingModal(false)}
      />

      <div className="min-h-screen bg-[#0f0f0f] text-white p-6 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="text-white/60" />
            <span className="sr-only">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Create Your Character</h1>
          </div>

          <div className="flex gap-3">
            <button
              disabled={isSaving}
              onClick={handleSubmit}
              className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Save & Create'}
            </button>
          </div>
        </div>

        {/* 3-Column Layout */}
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-6 sm:px-12 lg:px-24 h-[calc(100vh-120px)]">

          {/* LEFT COLUMN - Core Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name your character"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500/50 outline-none transition-all"
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                Gender <Info size={12} />
              </label>
              <div className="flex gap-4">
                {['Male', 'Female', 'Non-Binary'].map((g) => {
                  const val = g === 'Non-Binary' ? 'NB' : g.charAt(0);
                  return (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${formData.gender === val ? 'border-purple-500' : 'border-white/30 group-hover:border-white/50'
                        }`}>
                        {formData.gender === val && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                      </div>
                      <span className="text-sm text-white/70 group-hover:text-white transition-colors">{g}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Settings / Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                Settings (Impact the character's reply) <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-orange-400">Update: Can't be seen by the user, only affects the dialogue effect</p>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Settings of the character, including all the background information, characteristics, relationship between the character and the user, etc."
                className="w-full h-40 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Intro / Tagline */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                Intro (No impact on reply) <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-orange-400">Update: Introduction of your character doesn't affect the dialogue effect</p>
              <textarea
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Anything you want to show or say to the users, especially to make users have a better understanding of your character"
                className="w-full h-24 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500/50 outline-none transition-all resize-none"
              />
            </div>

            {/* Opening / Greeting */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                Opening <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] text-white/30">The opening starts the conversation and sets the tone</p>
              <textarea
                value={formData.greeting}
                onChange={e => setFormData({ ...formData, greeting: e.target.value })}
                placeholder="Hello there! How can I help you today?"
                className="w-full h-24 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-purple-500/50 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* MIDDLE COLUMN - Media & Config (3 cols) */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {/* Category / Skill */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Category</label>
              </div>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-purple-500/50"
              >
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1a1a]">{c}</option>)}
              </select>
            </div>

            {/* Image */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4 block">Image</label>
              <div className="aspect-square w-full bg-black/20 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 text-white/30 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
                <ImageIcon size={32} />
                <span className="text-xs">Add Image (Auto-generated if empty)</span>
              </div>
            </div>

            {/* Voice */}
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-4 block">Voice</label>

              <button
                type="button"
                onClick={() => setVoiceModalOpen(true)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Volume2 size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                      {formData.voiceName || 'Select a Voice'}
                    </div>
                    <div className="text-xs text-white/40">
                      {formData.voiceName ? 'Voice selected' : 'No voice selected'}
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                  Browse
                </div>
              </button>
            </div>

            <VoiceSelector
              isModal
              selectedId={formData.voiceSeedId}
              onSelect={(id, name) => setFormData({ ...formData, voiceSeedId: id, voiceName: name })}
              onClose={() => setVoiceModalOpen(false)}
              className={voiceModalOpen ? 'block' : 'hidden'}
            />
          </div>

          {/* RIGHT COLUMN - Preview (5 cols) */}
          <div className="lg:col-span-5 bg-[#1a1a1a] rounded-2xl border border-white/5 flex flex-col overflow-hidden relative">
            <div className="absolute top-4 left-4 text-xs font-bold text-white/30 uppercase tracking-widest z-10">
              Preview & Testing
            </div>

            {/* Mock Chat Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-50 pointer-events-none select-none">
              <div className="w-24 h-24 bg-white/5 rounded-3xl mb-6 flex items-center justify-center">
                <span className="text-4xl font-serif italic text-white/20">
                  {formData.name ? formData.name.charAt(0) : '?'}
                </span>
              </div>
              <h3 className="text-2xl font-serif italic text-white/40 mb-2">
                {formData.name || 'Your Character'}
              </h3>
              <p className="text-sm text-white/20 text-center max-w-xs">
                {formData.tagline || 'Character preview will appear here once created.'}
              </p>
            </div>

            {/* Mock Input */}
            <div className="p-4 border-t border-white/5">
              <div className="bg-black/20 text-white/30 text-sm px-4 py-3 rounded-xl flex justify-between items-center cursor-not-allowed">
                <span>Type a message...</span>
                <Sparkles size={16} />
              </div>
              <p className="text-[10px] text-white/20 mt-2 text-center">
                Preview mode specificies may vary from final character behavior.
              </p>
            </div>
          </div>

        </form>
      </div>
    </>
  );
}
