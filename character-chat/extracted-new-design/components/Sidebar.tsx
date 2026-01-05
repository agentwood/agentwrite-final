
import React from 'react';
import { ViewState, SavedChat, Agent } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onCreateClick: () => void;
  onSettingsClick: () => void;
  savedChats: SavedChat[];
  recentAgents: Agent[];
  onLoadChat: (savedChat: SavedChat) => void;
  onSelectAgent: (agent: Agent) => void;
  userPlan: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setView,
  onCreateClick,
  onSettingsClick,
  savedChats,
  recentAgents,
  onLoadChat,
  onSelectAgent,
  userPlan
}) => {
  const NavItem = ({ view, icon, label, isPro }: { view: ViewState; icon: React.ReactNode; label: string; isPro?: boolean }) => (
    <button
      onClick={() => setView(view)}
      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all ${currentView === view
          ? 'bg-zinc-100 text-zinc-900 shadow-sm'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className={`${currentView === view ? 'text-zinc-900' : 'text-zinc-400'}`}>
          {icon}
        </div>
        {label}
      </div>
      {isPro && (
        <span className="text-[9px] font-black bg-zinc-900 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">Pro</span>
      )}
    </button>
  );

  return (
    <aside className="w-72 border-r border-zinc-100 hidden md:flex flex-col h-full bg-white flex-shrink-0 z-20">
      <div className="p-6 h-full flex flex-col">
        {/* New Image Logo */}
        <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer" onClick={() => setView('discover')}>
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-black/5 ring-1 ring-zinc-100">
            <img src="/agentwood-logo.png" alt="Agentwood Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black tracking-tight">agentwood</span>
        </div>

        {/* Primary Action */}
        <button
          onClick={onCreateClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-zinc-900 text-white text-sm font-bold transition-all hover:bg-black mb-8 shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
          New Character
        </button>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-9">
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Explore</p>
            <NavItem view="discover" label="Discover" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>} />
            <NavItem view="home" label="My Feed" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
            <NavItem view="library" label="Library" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>} />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Creative Studio</p>
            <NavItem
              view="story-studio"
              label="Write a story"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
            />
            <NavItem
              view="rewards"
              label="Rewards"
              isPro={true}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
            />
          </div>

          <div className="space-y-1">
            <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Recent</p>
            <div className="space-y-0.5 px-1">
              {recentAgents.length === 0 ? (
                <p className="px-4 text-xs text-zinc-400 font-medium italic">No characters yet.</p>
              ) : (
                recentAgents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent(agent)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm font-bold rounded-xl text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all text-left group"
                  >
                    <img src={agent.avatar} alt={agent.name} className="w-6 h-6 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span className="truncate flex-1">{agent.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="mt-auto pt-6 space-y-4 border-t border-zinc-100">
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all group"
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
          </button>

          <div className="flex items-center gap-3 px-4 py-4 rounded-[1.5rem] bg-zinc-50 border border-zinc-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-pink-300 flex items-center justify-center text-white font-black text-xs shadow-sm">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-zinc-900 truncate">SparklyCamel</p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">{userPlan} Plan</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
