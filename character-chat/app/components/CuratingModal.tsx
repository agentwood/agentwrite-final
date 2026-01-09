'use client';

import React, { useState, useEffect } from 'react';

/**
 * Curating Experience Modal
 * 
 * Displays during TTS cold start to mask loading time.
 * Shows animated "Curating..." text with rotating "Did you know?" facts.
 */

interface CuratingModalProps {
    isOpen: boolean;
    characterName?: string;
}

// Fun facts about AI, voices, and characters
const DID_YOU_KNOW_FACTS = [
    "Our AI voices can express over 50 different emotions",
    "Each character has a unique personality crafted by writers",
    "Voice synthesis happens in real-time on powerful GPUs",
    "You can create your own characters with custom voices",
    "The average response takes just 2-5 seconds to generate",
    "Our characters remember context from your entire conversation",
    "Voice cloning can capture accents from around the world",
    "AI voices are getting better at expressing subtle emotions",
    "Each character has their own backstory and motivations",
    "You're chatting with bleeding-edge AI technology",
];

export function CuratingModal({ isOpen, characterName }: CuratingModalProps) {
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [isFactVisible, setIsFactVisible] = useState(true);

    // Rotate facts every 4 seconds
    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setIsFactVisible(false);

            setTimeout(() => {
                setCurrentFactIndex((prev) => (prev + 1) % DID_YOU_KNOW_FACTS.length);
                setIsFactVisible(true);
            }, 300);
        }, 4000);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Reset to random fact when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentFactIndex(Math.floor(Math.random() * DID_YOU_KNOW_FACTS.length));
            setIsFactVisible(true);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/90 backdrop-blur-md">
            <div className="relative w-full max-w-lg mx-4 p-12 rounded-[32px] bg-[#121212] border border-white/5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Premium Shine Effect */}
                <div className="absolute -top-[40%] -left-[20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] animate-pulse" />

                <div className="relative space-y-12">
                    {/* Main message with Agentwrite serif styling */}
                    <div className="text-center">
                        <h2 className="text-[42px] font-serif italic text-white mb-4 tracking-tight leading-[1.1]">
                            Curating this experience
                            <span className="inline-flex ml-2">
                                <span className="animate-bounce delay-0 text-white/20">.</span>
                                <span className="animate-bounce delay-150 text-white/40" style={{ animationDelay: '0.15s' }}>.</span>
                                <span className="animate-bounce delay-300 text-white/60" style={{ animationDelay: '0.3s' }}>.</span>
                            </span>
                        </h2>

                        {characterName && (
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-6">
                                PREPARING {characterName.toUpperCase()}'S VOICE
                            </p>
                        )}
                    </div>

                    {/* Minimalist loading bar */}
                    <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-loading-bar" />
                    </div>

                    {/* Did you know section */}
                    <div className="pt-8 border-t border-white/5">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] mb-6">
                            Did you know?
                        </p>
                        <div className="min-h-[4rem] flex items-center">
                            <p
                                className={`text-[15px] text-white/60 font-light leading-relaxed transition-all duration-700 ${isFactVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
                                    }`}
                            >
                                {DID_YOU_KNOW_FACTS[currentFactIndex]}
                            </p>
                        </div>
                    </div>

                    {/* Subtle corner accent */}
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <div className="w-12 h-12 border-t border-r border-white/20 rounded-tr-xl" />
                    </div>
                </div>
            </div>

            {/* Custom animation styles */}
            <style jsx>{`
                @keyframes loading-bar {
                    0% {
                        width: 0%;
                        margin-left: 0%;
                    }
                    50% {
                        width: 60%;
                        margin-left: 20%;
                    }
                    100% {
                        width: 0%;
                        margin-left: 100%;
                    }
                }
                .animate-loading-bar {
                    animation: loading-bar 2s ease-in-out infinite;
                }
                .delay-150 {
                    animation-delay: 0.15s;
                }
                .delay-300 {
                    animation-delay: 0.3s;
                }
            `}</style>
        </div>
    );
}

export default CuratingModal;
