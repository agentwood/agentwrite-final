'use client';

import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/agentwood-logo.png"
              alt="Agentwood"
              className="h-8 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <span className="text-xl font-bold tracking-tight text-white hidden">AW</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/discover" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Discover
            </Link>
            <Link href="/create" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Create
            </Link>
            <Link href="/video" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              AvatarFX
            </Link>
            <Link href="/library" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Library
            </Link>
            <Link href="/voice-studio" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Voice Studio
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/pricing"
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Upgrade
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-4">
              <Link href="/discover" className="text-sm font-medium text-white/60 hover:text-white">
                Discover
              </Link>
              <Link href="/create" className="text-sm font-medium text-white/60 hover:text-white">
                Create
              </Link>
              <Link href="/video" className="text-sm font-medium text-white/60 hover:text-white">
                AvatarFX
              </Link>
              <Link href="/library" className="text-sm font-medium text-white/60 hover:text-white">
                Library
              </Link>
              <Link href="/voice-studio" className="text-sm font-medium text-white/60 hover:text-white">
                Voice Studio
              </Link>
              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-white/90 text-center"
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
