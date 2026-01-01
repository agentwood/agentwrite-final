import React from 'react';
import { Home, Library, PenTool, Settings, Sparkles, LogOut, DollarSign, Menu, Zap } from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  
  const navItems = [
    { id: PageView.HOME, label: 'Discover', icon: Home },
    { id: PageView.LIBRARY, label: 'My Library', icon: Library },
    { id: PageView.CREATE, label: 'Create', icon: PenTool },
  ];

  const bottomItems = [
    { id: PageView.SETTINGS, label: 'Settings & Payouts', icon: Settings },
  ];

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:block
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick(PageView.HOME)}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">agentwood</span>
          </div>

          {/* Create Button */}
          <div className="px-6 mb-6">
            <button 
              onClick={() => handleNavClick(PageView.CREATE)}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl transition-all shadow-md font-medium"
            >
              <Sparkles size={18} />
              <span>New Character</span>
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-4">
              Explore
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}

            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2 mt-8">
              Account
            </div>
            {bottomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
             <button
                onClick={() => handleNavClick(PageView.SETTINGS)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900`}
              >
                <DollarSign size={18} />
                Affiliates Program
              </button>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-100">
             {/* Upgrade Button */}
            <button className="w-full mb-4 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2">
                <Zap size={14} className="fill-yellow-400 text-yellow-400" />
                Upgrade to Plus
            </button>

            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                SC
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">SparklyCamel</p>
                <p className="text-xs text-gray-500 truncate">Free Plan</p>
              </div>
              <LogOut size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};