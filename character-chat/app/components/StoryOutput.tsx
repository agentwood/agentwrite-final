'use client';

import { useState } from 'react';
import { Headphones, User, BookOpen, Sparkles, ChevronRight, Download, Copy, Check } from 'lucide-react';

interface StoryOutputProps {
    storyText: string;
    characterOptions: string[];
    plotOptions: string[];
    twistOptions: string[];
    onSelectOption: (type: 'character' | 'plot' | 'twist', option: string) => void;
    onOpenAudioStudio: () => void;
}

export default function StoryOutput({
    storyText,
    characterOptions,
    plotOptions,
    twistOptions,
    onSelectOption,
    onOpenAudioStudio,
}: StoryOutputProps) {
    const [selectedChoices, setSelectedChoices] = useState<{
        character?: string;
        plot?: string;
        twist?: string;
    }>({});

    const handleSelect = (type: 'character' | 'plot' | 'twist', option: string) => {
        setSelectedChoices(prev => ({ ...prev, [type]: option }));
        onSelectOption(type, option);
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12">
            {/* Story Text Display */}
            <div className="max-w-4xl mx-auto">
                <div className="prose prose-invert prose-lg max-w-none mb-12">
                    <p className="text-white/80 text-lg md:text-xl leading-relaxed font-serif whitespace-pre-wrap">
                        {storyText}
                    </p>
                </div>

                {/* Open Audio Studio Button */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={onOpenAudioStudio}
                        className="flex items-center gap-3 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-bold text-white shadow-xl shadow-purple-600/30 transition-all"
                    >
                        <Headphones className="w-5 h-5" />
                        Open Audio Studio
                    </button>
                </div>

                {/* Export Buttons */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => {
                            const blob = new Blob([storyText], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'my-story.txt';
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold text-white transition-all border border-white/10"
                    >
                        <Download className="w-4 h-4" />
                        Download Story
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(storyText);
                            alert('Story copied to clipboard!');
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold text-white transition-all border border-white/10"
                    >
                        <Copy className="w-4 h-4" />
                        Copy to Clipboard
                    </button>
                </div>

                {/* Choice Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Character Card */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Character</span>
                        </div>
                        <div className="space-y-3">
                            {characterOptions.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect('character', option)}
                                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${selectedChoices.character === option
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                        : 'bg-[#0f0f0f] text-white/70 hover:bg-[#2a2a2a] border border-transparent'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Plot Card */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Plot</span>
                        </div>
                        <div className="space-y-3">
                            {plotOptions.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect('plot', option)}
                                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${selectedChoices.plot === option
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                        : 'bg-[#0f0f0f] text-white/70 hover:bg-[#2a2a2a] border border-transparent'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Twist Card */}
                    <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Twist</span>
                        </div>
                        <div className="space-y-3">
                            {twistOptions.map((option, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelect('twist', option)}
                                    className={`w-full text-left p-3 rounded-xl text-sm transition-all ${selectedChoices.twist === option
                                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        : 'bg-[#0f0f0f] text-white/70 hover:bg-[#2a2a2a] border border-transparent'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                {(selectedChoices.character || selectedChoices.plot || selectedChoices.twist) && (
                    <div className="flex justify-center mt-8">
                        <button
                            className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-white/90 transition-all shadow-xl"
                        >
                            Continue Story
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
