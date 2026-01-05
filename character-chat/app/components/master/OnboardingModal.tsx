"use client";

import React from 'react';
import { CharacterProfile } from '@/lib/master/types';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  character: CharacterProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ character, isOpen, onClose, onComplete }) => {
  if (!isOpen || !character) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
       <div className="relative w-full max-w-sm bg-[#1c1816] border border-white/10 rounded-[40px] p-8 shadow-2xl animate-fade-in-up overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-dipsea-accent/5 blur-[40px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
             <div className="relative">
                <div className="w-24 h-24 rounded-full p-1 border border-white/10 shadow-xl relative z-10 bg-[#1c1816]">
                    <img src={character.avatarUrl} className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
             </div>
             
             <div className="space-y-2">
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-dipsea-accent">Welcome</span>
               <h3 className="text-3xl font-serif italic text-white leading-tight">Connect with {character.name.split(' ')[0]}</h3>
               <p className="text-white/40 text-sm font-sans px-2">
                 You are entering a private, immersive roleplay experience tailored to your desires.
               </p>
             </div>

             <div className="w-full space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-left transition-colors hover:bg-white/10">
                   <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                      <MessageSquare size={16} />
                   </div>
                   <div>
                      <h4 className="text-white text-[11px] font-bold uppercase tracking-wider mb-0.5">Be Yourself</h4>
                      <p className="text-white/40 text-[10px] leading-relaxed">Speak naturally. The story adapts to you.</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-left transition-colors hover:bg-white/10">
                   <div className="p-2 bg-green-500/10 rounded-xl text-green-400">
                      <ShieldCheck size={16} />
                   </div>
                   <div>
                      <h4 className="text-white text-[11px] font-bold uppercase tracking-wider mb-0.5">Private & Safe</h4>
                      <p className="text-white/40 text-[10px] leading-relaxed">Your chats are private and encrypted.</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={onComplete}
               className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3"
             >
               Start Journey <ArrowRight size={14} />
             </button>
          </div>
       </div>
    </div>
  );
};
