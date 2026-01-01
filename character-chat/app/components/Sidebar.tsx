'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Compass,
  Search,
  Library,
  PenTool,
  Award,
  Settings,
  Zap,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  recentCharacters?: Array<{
    id: string;
    name: string;
    avatarUrl: string;
    category: string;
  }>;
}

export default function Sidebar({ recentCharacters = [] }: SidebarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Mock logged in state - replace with actual auth check
  const isLoggedIn = true;
  const userName = 'SparklyCamel';
  const userPlan = 'FREE PLAN';

  const SidebarLink = ({
    active,
    icon,
    label,
    badge,
    onClick,
    href
  }: {
    active?: boolean;
    icon: React.ReactNode;
    label: string;
    badge?: string;
    onClick?: () => void;
    href?: string;
  }) => {
    const content = (
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-[11px] font-black transition-all ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
          }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {badge && <span className="rounded bg-purple-500 px-1 py-0.5 text-[8px] font-black text-white">{badge}</span>}
      </button>
    );

    if (href) {
      return <Link href={href}>{content}</Link>;
    }

    return content;
  };

  const RecentItem = ({ char }: { char: any }) => (
    <Link href={`/character/${char.id}`} className="flex items-center gap-3 group text-left">
      <div className="h-6 w-6 overflow-hidden rounded-full border border-white/10 transition-transform group-hover:scale-110">
        {char.avatarUrl ? (
          <img src={char.avatarUrl} alt={char.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-[8px]">{char.name.charAt(0)}</div>
        )}
      </div>
      <span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors truncate">{char.name}</span>
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r lg:flex z-50 border-white/5 bg-[#0f0f0f] p-5">
      <div
        className="mb-8 flex items-center gap-2 px-1 cursor-pointer group"
        onClick={() => router.push('/home')}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-serif italic text-lg transition-transform group-hover:scale-105 border border-white/10">A</div>
        <span className="text-lg font-extrabold tracking-tight">agentwood</span>
      </div>

      <Link
        href="/create"
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-xs font-black text-black transition-all hover:bg-gray-200 active:scale-95 shadow-lg"
      >
        <Plus size={14} strokeWidth={3} />
        Create a Character
      </Link>

      <nav className="flex flex-col gap-5 overflow-y-auto scrollbar-hide flex-1">
        <section>
          <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Explore</h4>
          <div className="flex flex-col gap-0.5">
            <SidebarLink
              active={true}
              icon={<Compass size={16} />}
              label="Discover"
              href="/home"
            />
            <SidebarLink icon={<Search size={16} />} label="Search" href="/home" />
            <SidebarLink icon={<Library size={16} />} label="Memory" href="/library" />
          </div>
        </section>

        <section>
          <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Creative Studio</h4>
          <div className="flex flex-col gap-0.5">
            <SidebarLink icon={<PenTool size={16} />} label="Write a story" href="https://agentwriteai.com/#/create" />
            <SidebarLink
              icon={<Award size={16} />}
              label="Rewards"
              badge="PRO"
              href="/rewards"
            />
          </div>
        </section>

        {recentCharacters.length > 0 && (
          <section>
            <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Recent</h4>
            <div className="flex flex-col gap-3 px-4">
              {recentCharacters.slice(0, 3).map(char => (
                <RecentItem key={char.id} char={char} />
              ))}
            </div>
          </section>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-5">
        <SidebarLink
          icon={<Settings size={16} />}
          label="Settings"
          href="/settings"
        />

        <Link
          href="/pricing"
          className="group flex w-full items-center justify-between rounded-xl bg-[#1a1325] px-4 py-3 text-[11px] font-black text-purple-400 border border-purple-500/20 hover:bg-purple-600/10 transition-all"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} fill="currentColor" />
            Unlock with Agentwood+
          </div>
          <span className="rounded bg-purple-500 px-1 py-0.5 text-[8px] text-white">- 50%</span>
        </Link>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-between w-full gap-2.5 rounded-2xl p-2.5 bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white font-bold text-[10px]">
                {isLoggedIn ? userName.charAt(0).toUpperCase() : 'N'}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-[11px] font-bold truncate">{isLoggedIn ? userName : 'Guest'}</p>
                <p className="text-[8px] opacity-40 font-medium uppercase tracking-tighter">{isLoggedIn ? userPlan : 'Not logged in'}</p>
              </div>
            </div>
            <ChevronDown size={14} className={`opacity-50 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-lg z-50">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                  >
                    <User size={16} />
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // TODO: Add actual logout logic
                      router.push('/');
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-white/10 transition-colors border-t border-white/5"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <User size={16} />
                  Log in
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
