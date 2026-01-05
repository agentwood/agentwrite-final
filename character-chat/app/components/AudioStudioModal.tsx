'use client';

import { useState } from 'react';
import { X, Play, Headphones, Mic, Volume2 } from 'lucide-react';

interface Character {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface AudioStudioModalProps {
    isOpen: boolean;
    onClose: () => void;
    storyText: string;
    characters: Character[];
    onGenerate: (settings: AudioSettings) => void;
}

interface AudioSettings {
    style: 'cinematic' | 'audiobook' | 'radio';
    pacing: number;
    stability: number;
    selectedCast: string[];
}

export default function AudioStudioModal({
    isOpen,
    onClose,
    storyText,
    characters,
    onGenerate,
}: AudioStudioModalProps) {
    const [style, setStyle] = useState<'cinematic' | 'audiobook' | 'radio'>('cinematic');
    const [pacing, setPacing] = useState(50);
    const [stability, setStability] = useState(80);
    const [selectedCast, setSelectedCast] = useState<string[]>(characters.map(c => c.id));
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerate({ style, pacing, stability, selectedCast });
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleCastMember = (id: string) => {
        setSelectedCast(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-lg mx-4 overflow-hidden border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Audio Studio</h2>
                            <p className="text-xs text-white/40">Configure your story's audio</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Proposed Cast */}
                    <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-amber-400 text-sm">✦</span>
                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Proposed Cast</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {characters.map((char) => (
                                <button
                                    key={char.id}
                                    onClick={() => toggleCastMember(char.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCast.includes(char.id)
                                            ? 'bg-[#2a2a2a] text-white border border-blue-500/50'
                                            : 'bg-[#2a2a2a] text-white/50 border border-transparent'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${selectedCast.includes(char.id) ? 'bg-blue-500' : 'bg-gray-600'
                                        }`} />
                                    {char.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style Tabs */}
                    <div className="flex bg-[#0f0f0f] rounded-xl p-1 border border-white/5">
                        {(['cinematic', 'audiobook', 'radio'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStyle(s)}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${style === s
                                        ? 'bg-amber-500 text-black shadow-lg'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* Sliders */}
                    <div className="space-y-5">
                        {/* Pacing Slider */}
                        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Pacing</span>
                                <span className="text-sm font-bold text-white/70">{pacing}%</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={pacing}
                                    onChange={(e) => setPacing(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer slider-thumb-amber"
                                    style={{
                                        background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pacing}%, #2a2a2a ${pacing}%, #2a2a2a 100%)`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Stability Slider */}
                        <div className="bg-[#0f0f0f] rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Stability & Smoothness</span>
                                <span className="text-sm font-bold text-white/70">{stability}%</span>
                            </div>
                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={stability}
                                    onChange={(e) => setStability(parseInt(e.target.value))}
                                    className="w-full h-2 bg-[#2a2a2a] rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${stability}%, #2a2a2a ${stability}%, #2a2a2a 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || selectedCast.length === 0}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                        <Play className="w-5 h-5 fill-current" />
                        {isGenerating ? 'Generating Audio...' : 'Generate Audio'}
                    </button>
                </div>
            </div>

            <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .slider-thumb-amber::-webkit-slider-thumb {
          background: #f59e0b;
        }
      `}</style>
        </div>
    );
}
