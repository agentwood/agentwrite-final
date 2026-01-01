import React, { useState } from 'react';
import { User, Image as ImageIcon, Sparkles, ArrowRight, ArrowLeft, Check, Wand2, Loader2, LayoutGrid } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CreateWizardProps {
  onComplete: () => void;
}

const CATEGORIES = [
  { id: 'Anime & Game', label: 'Anime & Game', icon: '🎮', description: 'Stylized characters from games or anime.' },
  { id: 'Fiction & Media', label: 'Fiction & Media', icon: '🎬', description: 'Characters from movies, books, or shows.' },
  { id: 'Original', label: 'Original', icon: '✨', description: 'Unique characters and concepts.' },
  { id: 'Helper', label: 'Helper', icon: '🤝', description: 'Realistic assistants for advice & support.' },
  { id: 'Play & Fun', label: 'Play & Fun', icon: '🎲', description: 'Games, humor, and entertainment.' },
];

export const CreateWizard: React.FC<CreateWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    description: '',
    avatarUrl: '',
    introMessage: '',
    tags: '',
    category: 'Original', // Default to Original
  });

  // AI Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // In a real app, this would save to a backend
    console.log('Character Created:', formData);
    onComplete();
  };

  const handleGenerateAvatar = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGenerating(true);
    setGenError('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: imagePrompt }],
        },
        config: {
          imageConfig: { aspectRatio: "1:1" }
        }
      });

      if (response.candidates && response.candidates[0]?.content?.parts) {
        let foundImage = false;
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const imageUrl = `data:${mimeType};base64,${base64Data}`;
            setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
            foundImage = true;
            break;
          }
        }
        if (!foundImage) setGenError('No image generated. Please try a different prompt.');
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setGenError('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
            ${step === s 
              ? 'bg-black text-white shadow-lg scale-110' 
              : step > s 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {step > s ? <Check size={16} /> : s}
          </div>
          {s < 3 && (
            <div className={`w-16 h-1 rounded transition-all duration-300 mx-2 ${step > s ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Character</h1>
        <p className="text-gray-500 mt-2">Bring your imagination to life in just a few steps.</p>
      </div>

      {renderStepIndicator()}

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
        
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <User size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Identity</h2>
                    <p className="text-sm text-gray-500">Who is your character?</p>
                </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFormData({ ...formData, category: cat.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="font-semibold text-gray-900">{cat.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Character Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="e.g. Eldric the Wise"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handle (@username)</label>
              <input 
                type="text" 
                value={formData.handle}
                onChange={(e) => setFormData({...formData, handle: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="@eldric_wizard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-24 resize-none"
                placeholder="A brief summary of who they are..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Appearance */}
        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
                    <p className="text-sm text-gray-500">How do they look?</p>
                </div>
            </div>

            {/* AI Generation Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
               <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900">Generate with AI</h3>
               </div>
               <div className="flex gap-2">
                  <input 
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the avatar (e.g. 'Cyberpunk samurai with neon katana')"
                    className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <button 
                    onClick={handleGenerateAvatar}
                    disabled={isGenerating || !imagePrompt.trim()}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[50px]"
                  >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                  </button>
               </div>
               {genError && <p className="text-xs text-red-500 mt-2">{genError}</p>}
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or paste a URL</span>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input 
                type="text" 
                value={formData.avatarUrl}
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                placeholder="https://example.com/image.png"
              />
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
                {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white" />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <User size={48} />
                    </div>
                )}
                <span className="text-sm text-gray-500 mt-4 font-medium">Avatar Preview</span>
            </div>
          </div>
        )}

        {/* Step 3: Personality */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Personality</h2>
                    <p className="text-sm text-gray-500">Set the scene.</p>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intro Message</label>
              <textarea 
                value={formData.introMessage}
                onChange={(e) => setFormData({...formData, introMessage: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-32 resize-none"
                placeholder="The first thing they say when a chat starts..."
              />
            </div>

            {['Anime & Game', 'Fiction & Media', 'Original'].includes(formData.category) && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  placeholder="anime, warrior, helper, funny"
                />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
          <button 
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
            disabled={step === 1}
          >
            <ArrowLeft size={18} /> Back
          </button>

          {step < totalSteps ? (
             <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                Next <ArrowRight size={18} />
              </button>
          ) : (
            <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                Create Character <Sparkles size={18} />
              </button>
          )}
        </div>
      </div>
    </div>
  );
};