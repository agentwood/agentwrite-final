import React, { useState } from 'react';
import { Camera, ArrowLeft, Sparkles, ChevronRight, Lock, Globe, Info, Wand2 } from 'lucide-react';
import { Character } from '../types';

interface CreateCharacterProps {
  onBack: () => void;
  onCreate: (char: Character) => void;
}

const CreateCharacter: React.FC<CreateCharacterProps> = ({ onBack, onCreate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    greeting: '',
    systemInstruction: '',
    avatarUrl: '',
    visibility: 'public'
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAvatar = () => {
    // Generate a consistent avatar based on name, fallback to a timestamp if empty to ensure change
    const seed = formData.name.trim() || `user-${Date.now()}`;
    const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e0e7ff,c7d2fe`;
    handleChange('avatarUrl', url);
  };

  const handleSubmit = () => {
    const newChar: Character = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      creator: '@You', // In a real app, this would be the logged in user
      description: formData.tagline || formData.description.slice(0, 50),
      avatarUrl: formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
      interactions: '0',
      systemInstruction: formData.systemInstruction,
      greeting: formData.greeting
    };
    onCreate(newChar);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create a Character</h1>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
           <div 
             className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]" 
             style={{ width: `${(step / 2) * 100}%` }}
           />
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center mb-10 mt-4">
               <div className="relative group cursor-pointer">
                  <div className="w-36 h-36 rounded-2xl bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center ring-1 ring-slate-100">
                     {formData.avatarUrl ? (
                       <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                       <Camera size={32} className="text-slate-300" />
                     )}
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:scale-110 transition-transform hover:rotate-6">
                     <Sparkles size={18} />
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Character Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. Albert Einstein"
                    className="w-full bg-slate-50 text-gray-900 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 transition-all"
                  />
               </div>
               
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                  <input 
                    type="text" 
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="In a few words, how would you describe them?"
                    className="w-full bg-slate-50 text-gray-900 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-2 ml-1">Appears on the character card.</p>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Avatar URL</label>
                  <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={formData.avatarUrl}
                        onChange={(e) => handleChange('avatarUrl', e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-slate-50 text-gray-900 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 transition-all"
                    />
                    <button 
                        onClick={generateAvatar}
                        title="Generate random avatar based on name"
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl hover:bg-indigo-100 hover:border-indigo-200 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Wand2 size={18} />
                        <span className="hidden sm:inline">Generate</span>
                    </button>
                  </div>
               </div>
            </div>

            <div className="mt-10 flex justify-end">
               <button 
                 onClick={() => setStep(2)} 
                 disabled={!formData.name}
                 className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
               >
                 Next Step <ChevronRight size={18} />
               </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="space-y-6">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-bold text-gray-700">Greeting</label>
                  </div>
                  <textarea 
                    value={formData.greeting}
                    onChange={(e) => handleChange('greeting', e.target.value)}
                    placeholder="What would they say to start a conversation?"
                    className="w-full bg-slate-50 text-gray-900 rounded-xl px-4 py-3 h-28 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 transition-all"
                  />
                  <div className="mt-2 bg-indigo-50/50 text-indigo-900 text-xs p-3 rounded-xl flex items-start gap-2 border border-indigo-100/50">
                    <Info size={14} className="mt-0.5 shrink-0 text-indigo-500" />
                    <p>
                      This is the first message the user will see. It sets the scene.<br/>
                      <span className="opacity-70 italic">Example: "*I look up from my book.* Oh, didn't see you there."</span>
                    </p>
                  </div>
               </div>

               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-bold text-gray-700">System Instructions</label>
                  </div>
                  <textarea 
                    value={formData.systemInstruction}
                    onChange={(e) => handleChange('systemInstruction', e.target.value)}
                    placeholder="Define the character's personality, memories, and behavior..."
                    className="w-full bg-slate-50 text-gray-900 rounded-xl px-4 py-3 h-48 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200 transition-all font-mono text-sm"
                  />
                  
                  {/* Enhanced Helper Text */}
                  <div className="mt-3 bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 text-xs p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex items-start gap-2">
                        <Info size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                        <p className="font-medium leading-relaxed">
                            Core Definition Guide
                        </p>
                    </div>
                    
                    <div className="pl-6 space-y-3 opacity-90">
                        <div>
                            <span className="font-bold text-indigo-700 block mb-1">1. Personality</span>
                            <p>"You are [Name], a [Role]. You are [Trait 1] and [Trait 2]."</p>
                        </div>
                        
                        <div>
                            <span className="font-bold text-indigo-700 block mb-1">2. Scenario</span>
                            <p>"The user is your [Relationship]. You are at [Location]."</p>
                        </div>
                    </div>
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Visibility</label>
                  <div className="flex gap-4">
                     <button 
                       onClick={() => handleChange('visibility', 'public')}
                       className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.visibility === 'public' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                     >
                        <Globe size={20} />
                        <span className="text-sm font-bold">Public</span>
                     </button>
                     <button 
                       onClick={() => handleChange('visibility', 'private')}
                       className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.visibility === 'private' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                     >
                        <Lock size={20} />
                        <span className="text-sm font-bold">Private</span>
                     </button>
                  </div>
               </div>
            </div>

            <div className="mt-10 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setStep(1)} 
                   className="text-gray-500 hover:text-gray-900 font-medium px-5 py-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                 >
                   Back
                 </button>
                 <button 
                   onClick={onBack} 
                   className="text-red-500 hover:text-red-700 font-medium px-5 py-2.5 hover:bg-red-50 rounded-xl transition-colors"
                 >
                   Cancel
                 </button>
               </div>
               <button 
                 onClick={handleSubmit}
                 className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg shadow-indigo-200"
               >
                 Create Character
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCharacter;