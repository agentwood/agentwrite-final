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
}

const CATEGORY_ICONS: Record<string, string> = {
    'Authority': '👑',
    'Mentor': '🧙',
    'Energetic': '⚡',
    'Texture': '🎭',
    'Global': '🌍',
};

const CATEGORY_COLORS: Record<string, string> = {
    'Authority': 'from-purple-500 to-pink-500',
    'Mentor': 'from-green-500 to-teal-500',
    'Energetic': 'from-orange-500 to-red-500',
    'Texture': 'from-blue-500 to-indigo-500',
    'Global': 'from-cyan-500 to-blue-500',
};

export default function VoiceSelector({ onSelect, selectedId, className = '' }: VoiceSelectorProps) {
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

    return (
        <div className={`voice-selector ${className}`}>
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Select a Voice</h3>
                <p className="text-sm text-gray-400">Choose from 29 premium voice personalities</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
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

            {/* Custom Voice Upload Section - COMING SOON
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 relative overflow-hidden group opacity-50 cursor-not-allowed">
                 <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                    <span className="bg-black/80 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white border border-white/10">Coming Soon</span>
                 </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 blur-[2px]">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🎙️</span>
                            <h4 className="text-xl font-bold text-white">Clone Your Voice</h4>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Upload a 30-60 second voice memo to train a custom AI voice model.
                        </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                            <div className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                                <span>Upload Audio</span>
                            </div>
                    </div>
                </div>
            </div>
             */}

            {/* Gender Filter */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setGenderFilter(null)}
                    className={`px-3 py-1 rounded text-xs font-medium ${genderFilter === null ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                >
                    All Genders
                </button>
                <button
                    onClick={() => setGenderFilter('male')}
                    className={`px-3 py-1 rounded text-xs font-medium ${genderFilter === 'male' ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                >
                    Male
                </button>
                <button
                    onClick={() => setGenderFilter('female')}
                    className={`px-3 py-1 rounded text-xs font-medium ${genderFilter === 'female' ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                >
                    Female
                </button>
            </div>

            {/* Voice Grid */}
            <div className="space-y-6">
                {Object.entries(groupedVoices).map(([category, catVoices]) => (
                    <div key={category}>
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <span>{CATEGORY_ICONS[category] || '🎤'}</span>
                            {category}
                            <span className="text-gray-500 font-normal">({catVoices.length})</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {catVoices.map(voice => (
                                <div
                                    key={voice.id}
                                    onClick={() => onSelect(voice.id, voice.name)}
                                    className={`
                    relative p-4 rounded-xl cursor-pointer transition-all
                    border-2 hover:scale-[1.02]
                    ${selectedId === voice.id
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30'
                                        }
                  `}
                                >
                                    {/* Selected Badge */}
                                    {selectedId === voice.id && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">✓</span>
                                        </div>
                                    )}

                                    {/* Voice Info */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h5 className="font-semibold text-white">{voice.name}</h5>
                                            <p className="text-xs text-gray-400">{voice.tone} • {voice.energy}</p>
                                        </div>

                                        {/* Play Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPreview(voice);
                                            }}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${playingId === voice.id
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                }`}
                                        >
                                            {playingId === voice.id ? '◼' : '▶'}
                                        </button>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                        {voice.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1">
                                        {voice.tags.slice(0, 3).map(tag => (
                                            <span
                                                key={tag}
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r ${CATEGORY_COLORS[category] || 'from-gray-500 to-gray-600'} text-white`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Accent Badge */}
                                    <div className="absolute bottom-2 right-2">
                                        <span className="text-[10px] text-gray-500 uppercase">{voice.accent}</span>
                                    </div>
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
}
