import React, { useState } from 'react';
import { 
  Plus, 
  Compass, 
  LayoutList, 
  Film, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  User as UserIcon,
  ChevronsLeft,
  Mic,
  Sparkles
} from 'lucide-react';
import { Character } from '../types';

interface SidebarProps {
  onNavigate: () => void;
  onCreateClick: () => void;
  onVoiceClick: () => void;
  recentCharacters: Character[];
  onCharacterClick: (char: Character) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNavigate, 
  onCreateClick, 
  onVoiceClick,
  recentCharacters, 
  onCharacterClick 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-[280px]'} h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-in-out z-20 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between h-20">
        {!isCollapsed && (
          <div onClick={onNavigate} className="flex items-center gap-2 cursor-pointer group">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={18} fill="currentColor" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">ChatGenius</h1>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-gray-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Main Actions */}
      <div className="px-4 mb-6">
        <button 
          onClick={onCreateClick}
          className={`flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 ${isCollapsed ? 'px-0' : ''}`}
        >
          <Plus size={24} strokeWidth={2.5} />
          {!isCollapsed && <span>Create Character</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        <NavItem icon={<Compass size={20} />} label="Discover" active={true} collapsed={isCollapsed} onClick={onNavigate} />
        <NavItem icon={<LayoutList size={20} />} label="My Feed" collapsed={isCollapsed} />
        <NavItem icon={<Film size={20} />} label="AvatarFX" collapsed={isCollapsed} />
        <NavItem icon={<Mic size={20} />} label="Voice Studio" collapsed={isCollapsed} onClick={onVoiceClick} />
        
        <div className={`mt-8 mb-4 px-2 ${isCollapsed ? 'hidden' : 'block'}`}>
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search characters..." 
                className="w-full bg-slate-50 hover:bg-slate-100 text-sm py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all border border-transparent focus:border-indigo-200"
              />
           </div>
        </div>

        {!isCollapsed && (
          <div className="pt-6 px-2">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Chats</h3>
             <div className="space-y-1">
                {recentCharacters.slice(0, 3).map(char => (
                    <div key={char.id} onClick={() => onCharacterClick(char)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group">
                    <img src={char.avatarUrl} alt={char.name} className="w-9 h-9 rounded-lg object-cover ring-2 ring-transparent group-hover:ring-indigo-100 transition-all" />
                    <div className="overflow-hidden">
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate block">{char.name}</span>
                        <span className="text-[10px] text-gray-400 truncate block">@{char.creator}</span>
                    </div>
                    </div>
                ))}
             </div>
          </div>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="relative">
             <button 
               onClick={() => setShowProfileMenu(!showProfileMenu)}
               className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100`}
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      S
                   </div>
                   {!isCollapsed && (
                     <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">SparklyCamel</p>
                        <p className="text-xs text-indigo-500 font-medium">Pro Plan</p>
                     </div>
                   )}
                </div>
                {!isCollapsed && <ChevronLeft className="rotate-[-90deg] text-gray-400" size={16} />}
             </button>

             {/* Popup Menu */}
             {showProfileMenu && (
                <div className="absolute bottom-full left-0 w-full mb-3 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-1 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                   <MenuItem icon={<UserIcon size={18} />} label="Public profile" />
                   <MenuItem icon={<Settings size={18} />} label="Settings" />
                   <div className="h-px bg-slate-100 my-1" />
                   <MenuItem icon={<LogOut size={18} />} label="Logout" />
                </div>
             )}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false, highlight = false, collapsed = false, onClick }: any) => {
  return (
    <button 
      onClick={onClick}
      className={`
      flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group
      ${active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-gray-500 hover:bg-slate-50 hover:text-gray-900'}
      ${collapsed ? 'justify-center' : ''}
    `}>
      <span className={`transition-transform duration-200 ${active ? '' : 'group-hover:scale-110'}`}>{icon}</span>
      {!collapsed && <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>}
    </button>
  );
};

const MenuItem = ({ icon, label }: any) => (
  <button className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 text-gray-700 text-sm font-medium transition-colors">
    {icon}
    <span>{label}</span>
  </button>
);

export default Sidebar;