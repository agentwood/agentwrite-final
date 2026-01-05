"use client";

import React from 'react';
import { Instagram, Twitter, Share2 } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-dipsea-bg border-t border-white/5 py-32 px-16 mt-auto">
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-16 mb-32">
      <div className="col-span-1 md:col-span-2 space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
            <span className="text-3xl font-serif italic text-white leading-none">A</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter text-white font-sans">agentwood</span>
        </div>
        <p className="text-white/30 text-xl font-sans italic max-w-sm leading-relaxed">Crafting the future of digital intimacy and sophisticated storytelling through the wood.</p>
        <div className="flex gap-8">
          <button className="text-white/20 hover:text-white transition-colors"><Instagram size={24} /></button>
          <button className="text-white/20 hover:text-white transition-colors"><Twitter size={24} /></button>
          <button className="text-white/20 hover:text-white transition-colors"><Share2 size={24} /></button>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 mb-8 font-sans">PLATFORM</h4>
        <ul className="space-y-6 text-sm font-sans text-white/30">
          <li className="hover:text-white cursor-pointer transition-colors">Discover</li>
          <li className="hover:text-white cursor-pointer transition-colors">Create</li>
          <li className="hover:text-white cursor-pointer transition-colors">Stories</li>
          <li className="hover:text-white cursor-pointer transition-colors">Rewards</li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 mb-8 font-sans">DISCOVER</h4>
        <ul className="space-y-6 text-sm font-sans text-white/30">
          <li className="hover:text-white cursor-pointer transition-colors">Top Audiobooks</li>
          <li className="hover:text-white cursor-pointer transition-colors">Browse</li>
          <li className="hover:text-white cursor-pointer transition-colors">Characters</li>
          <li className="hover:text-white cursor-pointer transition-colors">Books</li>
        </ul>
      </div>
      <div className="flex flex-col items-end gap-12">
        <button className="px-10 py-4 bg-[#ff5a42] text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
          START LISTENING
        </button>
      </div>
    </div>
    <div className="max-w-[1400px] mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <span className="text-[10px] font-bold text-white/10 font-sans uppercase tracking-[0.4em]">© 2025 AGENTWOOD INC. ALL RIGHTS RESERVED.</span>
      <div className="flex gap-12 text-[10px] font-bold text-white/10 font-sans uppercase tracking-[0.4em]">
        <a href="#" className="hover:text-white">PRIVACY POLICY</a>
        <a href="#" className="hover:text-white">TERMS & CONDITIONS</a>
      </div>
    </div>
  </footer>
);
