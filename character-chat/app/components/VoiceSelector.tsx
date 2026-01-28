'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceSeed {
    id: string;
    name: string;
    filePath: string;
    gender: string;
    age: string;
    tone: string;
    energy: string;
    accent: string;
    category: string;
    tags: string[];
    suitableFor: string[];
    description: string;
    previewUrl: string;
}

interface VoiceSelectorProps {
    onSelect: (voiceSeedId: string, voiceName: string) => void;
    selectedId?: string;
    className?: string;
    isModal?: boolean; // New prop to toggle modal styling
    onClose?: () => void; // For closing the modal
}

const CATEGORY_ICONS: Record<string, string> = {
    'Authority': '👑',
    'Mentor': '🧙',
    'Energetic': '⚡',
    'Texture': '🎭',
    'Global': '🌍',
    'Gemini': '✨',
    'Cartoon': '🎨',
};

const CATEGORY_COLORS: Record<string, string> = {
    'Authority': 'from-purple-500 to-pink-500',
    'Mentor': 'from-green-500 to-teal-500',
    'Energetic': 'from-orange-500 to-red-500',
    'Texture': 'from-blue-500 to-indigo-500',
    'Global': 'from-cyan-500 to-blue-500',
    'Gemini': 'from-yellow-400 to-orange-500',
    'Cartoon': 'from-pink-400 to-purple-400',
};

export default function VoiceSelector({ onSelect, selectedId, className = '', isModal, onClose }: VoiceSelectorProps) {
    const [voices, setVoices] = useState<VoiceSeed[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch voices on mount
    useEffect(() => {
        const fetchVoices = async () => {
            try {
                const res = await fetch('/api/voices/pool');
                if (!res.ok) throw new Error('Failed to fetch voices');
                const data = await res.json();
                setVoices(data.voices || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchVoices();
    }, []);

    // Filter voices
    const filteredVoices = voices.filter(v => {
        if (activeCategory && v.category !== activeCategory) return false;
        if (genderFilter && v.gender !== genderFilter) return false;
        return true;
    });

    // Group by category
    const groupedVoices = filteredVoices.reduce((acc: Record<string, VoiceSeed[]>, v) => {
        if (!acc[v.category]) acc[v.category] = [];
        acc[v.category].push(v);
        return acc;
    }, {});

    // Play preview
    const playPreview = (voice: VoiceSeed) => {
        if (playingId === voice.id) {
            // Stop current
            audioRef.current?.pause();
            setPlayingId(null);
            return;
        }

        // Play new
        if (audioRef.current) {
            audioRef.current.pause();
        }
        const audio = new Audio(voice.previewUrl);
        audioRef.current = audio;
        audio.play();
        setPlayingId(voice.id);

        audio.onended = () => {
            setPlayingId(null);
        };
    };

    // Categories for tabs
    const categories = [...new Set(voices.map(v => v.category))];

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">Loading voices...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    const content = (
        <div className={`voice-selector ${className} ${isModal ? 'h-full flex flex-col' : ''}`}>
            {/* Header */}
            <div className="mb-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Select a Voice</h3>
                        <p className="text-sm text-gray-400">Choose from {voices.length} premium voice personalities</p>
                    </div>
                    {isModal && onClose && (
                        <button onClick={onClose} className="p-2 text-white/50 hover:text-white transition-colors">
                            <span className="sr-only">Close</span>
                            ✖
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                {/* Category Pills */}
                <button
                    onClick={() => setActiveCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === null
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${activeCategory === cat
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        <span>{CATEGORY_ICONS[cat] || '🎤'}</span>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Voice Grid - Scrollable Area */}
            <div className={`space-y-6 ${isModal ? 'flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar' : ''}`}>

                {/* Custom Voice Upload - Only show if NO filter is active for cleanliness */}
                {!activeCategory && !genderFilter && (
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🎙️</span>
                                    <h4 className="text-xl font-bold text-white">Clone Your Voice</h4>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                                    Upload a short voice memo to create a custom voice.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <button className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200">
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {Object.entries(groupedVoices).map(([category, catVoices]) => (
                    <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2 sticky top-0 bg-[#0f0f0f]/90 py-2 z-10 backdrop-blur-sm">
                            <span>{CATEGORY_ICONS[category] || '🎤'}</span>
                            {category}
                            <span className="text-gray-500 font-normal">({catVoices.length})</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {catVoices.map(voice => (
                                <div
                                    key={voice.id}
                                    onClick={() => {
                                        onSelect(voice.id, voice.name);
                                        if (isModal && onClose) onClose();
                                    }}
                                    className={`
                    relative p-4 rounded-xl cursor-pointer transition-all
                    border hover:scale-[1.01]
                    ${selectedId === voice.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                        }
                  `}
                                >
                                    {/* Selected Badge */}
                                    {selectedId === voice.id && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-[10px]">✓</span>
                                        </div>
                                    )}

                                    {/* Voice Info */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h5 className="font-semibold text-white text-sm">{voice.name}</h5>
                                            <p className="text-[10px] text-gray-400">{voice.tone} • {voice.energy}</p>
                                        </div>

                                        {/* Play Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPreview(voice);
                                            }}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${playingId === voice.id
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                        >
                                            {playingId === voice.id ? '◼' : '▶'}
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">
                                        {voice.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filteredVoices.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                    No voices match your filters
                </div>
            )}
        </div>
    );

    if (!isModal) return content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-4xl h-[85vh] bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {content}
            </div>
        </div>
    );
}
