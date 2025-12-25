'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  LayoutDashboard, 
  Compass, 
  Library, 
  Mic2,
  Settings,
  BookOpen,
  Gift
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  recentCharacters?: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    category: string;
    creator?: string;
  }>;
}

export default function Sidebar({ recentCharacters = [] }: SidebarProps) {
  const router = useRouter();

  const NavItem = ({ 
    href, 
    icon, 
    label, 
    isPro 
  }: { 
    href: string; 
    icon: React.ReactNode; 
    label: string; 
    isPro?: boolean;
  }) => {
    return (
      <Link
        href={href}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all hover:bg-zinc-50 hover:text-zinc-900 text-zinc-500"
      >
        <div className="flex items-center gap-3">
          <div className="text-zinc-400">
            {icon}
          </div>
          {label}
        </div>
        {isPro && (
          <span className="text-[9px] font-black bg-zinc-900 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Pro</span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-72 border-r border-zinc-100 hidden md:flex flex-col h-full bg-white flex-shrink-0 z-20">
      <div className="p-6 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-zinc-100">
            <img 
              src="https://pbs.twimg.com/profile_images/1792695503023849472/I8W6jY_e_400x400.jpg" 
              alt="Agentwood Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-xl font-black tracking-tight">agentwood</span>
        </div>

        {/* Primary Action */}
        <Link 
          href="/create"
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-zinc-900 text-white text-sm font-bold transition-all hover:bg-black mb-8 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Character
        </Link>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-9">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Explore</p>
            <NavItem 
              href="/discover" 
              label="Discover" 
              icon={<LayoutDashboard className="w-5 h-5" />} 
            />
            <NavItem 
              href="/" 
              label="My Feed" 
              icon={<Compass className="w-5 h-5" />} 
            />
            <NavItem 
              href="/library" 
              label="Library" 
              icon={<Library className="w-5 h-5" />} 
            />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Creative Studio</p>
            <NavItem 
              href="/story-studio" 
              label="Write a story" 
              icon={<BookOpen className="w-5 h-5" />} 
            />
            <NavItem 
              href="/rewards" 
              label="Rewards" 
              isPro={true}
              icon={<Gift className="w-5 h-5" />} 
            />
          </div>

          {recentCharacters.length > 0 && (
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Recent</p>
              <div className="space-y-0.5 px-1">
                {recentCharacters.slice(0, 5).map((char) => (
                  <Link
                    key={char.id}
                    href={`/c/${char.id}`}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left group"
                  >
                    <img 
                      src={char.avatarUrl} 
                      alt={char.name} 
                      className="w-6 h-6 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                    <span className="truncate flex-1">{char.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-6 space-y-4 border-t border-zinc-100">
          <Link 
            href="/settings"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
          >
            <Settings className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            Settings
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-4 rounded-[1.5rem] bg-zinc-50 border border-zinc-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-pink-300 flex items-center justify-center text-white font-black text-xs shadow-sm">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-zinc-900 truncate">SparklyCamel</p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">Free Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
