'use client';

import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/agentwood-logo.png"
              alt="Agentwood"
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <span className="text-xl font-bold tracking-tight text-zinc-900 hidden">Agentwood</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Discover
            </Link>
            <Link href="/create" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Create
            </Link>
            <Link href="/video" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              AvatarFX
            </Link>
            <Link href="/library" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Library
            </Link>
            <Link href="/voice-studio" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Voice Studio
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200">
            <nav className="flex flex-col gap-4">
              <Link href="/discover" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Discover
              </Link>
              <Link href="/create" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Create
              </Link>
              <Link href="/video" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                AvatarFX
              </Link>
              <Link href="/library" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Library
              </Link>
              <Link href="/voice-studio" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                Voice Studio
              </Link>
              <div className="pt-4 border-t border-zinc-200 flex flex-col gap-2">
                <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 text-center"
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

