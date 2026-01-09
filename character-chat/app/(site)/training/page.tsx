'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Info, Lock } from 'lucide-react';
import { getSubscriptionStatus } from '@/lib/subscription';

interface Character {
    id: string;
    name: string;
    avatarUrl: string;
    trainingStatus: string | null;
}

export default function TrainingPage() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPro, setIsPro] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Check PRO subscription
    useEffect(() => {
        getSubscriptionStatus(null).then(status => {
            setIsPro(status.planId === 'pro' || status.planId === 'enterprise');
            setCheckingAccess(false);
        });
    }, []);

    useEffect(() => {
        if (!isPro && !checkingAccess) return;

        // Fetch user's characters
        fetch('/api/personas?limit=20')
            .then(res => res.json())
            .then(data => {
                setCharacters(data.personas || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [isPro, checkingAccess]);

    if (checkingAccess) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // PRO-only gate
    if (!isPro) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Lock size={40} className="text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-serif italic text-white">Training & Data</h1>
                    <p className="text-white/50">
                        Character training is a PRO-exclusive feature. Upgrade to customize your characters' personalities, behaviors, and constraints.
                    </p>
                    <Link
                        href="/pricing"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Upgrade to PRO
                    </Link>
                    <Link href="/home" className="block text-white/40 text-sm hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-lg">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/home" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <ChevronLeft size={20} className="text-white/60" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-serif italic text-[#c4a574]">Training & Data</h1>
                            <div className="flex items-center gap-2 text-xs text-[#b8956c]">
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                                SECURE ENVIRONMENT
                            </div>
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex gap-2">
                        <div className="w-8 h-1 bg-white rounded-full" />
                        <div className="w-8 h-1 bg-white/20 rounded-full" />
                        <div className="w-8 h-1 bg-white/20 rounded-full" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif italic text-[#e8dcc8] mb-4">
                        Select a Neural Core
                    </h2>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Choose a character to begin the training process. This will create a new development branch.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {characters.map(char => (
                            <Link
                                key={char.id}
                                href={`/training/${char.id}`}
                                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 hover:border-[#c4a574]/50 transition-all duration-300 hover:scale-[1.02]"
                            >
                                {/* Character Image */}
                                <div className="absolute inset-0">
                                    {char.avatarUrl ? (
                                        <img
                                            src={char.avatarUrl}
                                            alt={char.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-white/30">{char.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                </div>

                                {/* Character Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-lg font-serif italic text-[#e8dcc8]">{char.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Info size={12} className="text-white/40" />
                                        <span className="text-xs text-white/40 uppercase tracking-wide">
                                            {char.trainingStatus === 'trained' ? 'TRAINED' : 'UNTRAINED'}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#c4a574]/20 to-transparent pointer-events-none" />
                            </Link>
                        ))}

                        {/* Create New Card */}
                        <Link
                            href="/create"
                            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col items-center justify-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                                <Plus size={24} className="text-white/30 group-hover:text-white/60 transition-colors" />
                            </div>
                            <span className="text-xs text-white/30 uppercase tracking-wider group-hover:text-white/50 transition-colors">
                                Create New
                            </span>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
