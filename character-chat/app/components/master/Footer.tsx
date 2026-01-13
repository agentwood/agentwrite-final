"use client";

import React from 'react';
import Link from 'next/link';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-[#0c0c0c] border-t border-white/5 py-20 px-8 md:px-16 mt-auto">
    <div className="max-w-[1400px] mx-auto">
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
        {/* Logo & Social */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Agentwood" className="w-10 h-10 object-contain" />
            <span className="text-xl font-serif italic text-white">AgentWood</span>
          </Link>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Meet premium AI characters you can talk to, learn from, and have fun with.
          </p>
          <div className="flex gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Platform Links */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">Platform</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link href="/" className="hover:text-white transition-colors">Discover</Link></li>
            <li><Link href="/create" className="hover:text-white transition-colors">Create Character</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
          </ul>
        </div>

        {/* Resources Links */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">Resources</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link href="/affiliates" className="hover:text-white transition-colors">Affiliates</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><a href="mailto:support@agentwood.com" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Legal Links */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-6">Legal</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-xs text-white/20">© 2026 Agentwood Inc. All rights reserved.</span>
        <div className="flex gap-6 text-xs text-white/20">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
