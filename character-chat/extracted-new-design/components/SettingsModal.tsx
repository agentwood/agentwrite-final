
import React, { useState } from 'react';

type SettingsTab = 'Public profile' | 'Account' | 'Preferences' | 'Muted words' | 'Parental Insights' | 'Advanced';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Public profile');

  const TabButton = ({ tab, icon }: { tab: SettingsTab, icon?: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab
          ? 'bg-zinc-200 text-zinc-900'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        }`}
    >
      {tab}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Public profile':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-zinc-900">Public profile</h2>

            <div className="relative inline-block group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 to-pink-200 flex items-center justify-center text-4xl font-bold text-zinc-800 shadow-inner">
                S
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="bg-zinc-100/80 rounded-xl p-4">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Username</label>
                  <input
                    type="text"
                    defaultValue="SparklyCamel8370"
                    className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                  />
                </div>
                <p className="text-right text-[10px] text-zinc-400 mt-1">16/20</p>
              </div>

              <div>
                <div className="bg-zinc-100/80 rounded-xl p-4">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Display Name</label>
                  <input
                    type="text"
                    defaultValue="SparklyCamel8370"
                    className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none"
                  />
                </div>
                <p className="text-right text-[10px] text-zinc-400 mt-1">16/20</p>
              </div>

              <div>
                <div className="bg-zinc-100/80 rounded-xl p-4 min-h-[100px]">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    placeholder="Add a bio..."
                    className="w-full bg-transparent text-sm font-semibold text-zinc-900 outline-none resize-none h-20"
                  />
                </div>
                <p className="text-right text-[10px] text-zinc-400 mt-1">0/500</p>
              </div>
            </div>
          </div>
        );
      case 'Account':
        return (
          <div className="space-y-8 flex flex-col h-full">
            <h2 className="text-3xl font-bold text-zinc-900">Account</h2>

            <div className="bg-zinc-100/50 border border-zinc-200 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium mb-1">Your current plan</p>
                <p className="text-xl font-bold text-zinc-900">Free</p>
              </div>
              <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-colors">
                Upgrade
              </button>
            </div>

            <div className="mt-auto">
              <button className="bg-zinc-200 text-zinc-900 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-zinc-300 transition-colors">
                Manage Account & Data
              </button>
            </div>
          </div>
        );
      case 'Preferences':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-zinc-900">Preferences</h2>

            <div className="space-y-8">
              <div>
                <div className="bg-zinc-100/80 rounded-xl p-4 flex items-center justify-between cursor-pointer border border-transparent hover:border-zinc-200 transition-all">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Language</p>
                    <p className="text-sm font-semibold text-zinc-900">English</p>
                  </div>
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-zinc-500">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {['System', 'Light', 'Dark'].map((t) => (
                    <button key={t} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${t === 'System' ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-100 border-transparent text-zinc-600 hover:bg-zinc-200'}`}>
                      {t === 'System' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"></path></svg>}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-zinc-500">Chat Style</p>
                <div className="grid grid-cols-3 gap-3">
                  {['Default', 'Classic', 'Dense'].map((s) => (
                    <button key={s} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${s === 'Default' ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-100 border-transparent text-zinc-600 hover:bg-zinc-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold text-zinc-500">Sound Effects</p>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  {['On', 'Off'].map((s) => (
                    <button key={s} className={`flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm transition-all ${s === 'On' ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-100 border-transparent text-zinc-600 hover:bg-zinc-200'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'Muted words':
        return (
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-zinc-900">Muted words</h2>
            <p className="text-sm text-zinc-500 font-medium">Add a single word at a time you'd prefer not to encounter in your conversations</p>
            <div className="pt-8 border-b border-zinc-100"></div>
          </div>
        );
      case 'Advanced':
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-zinc-900">Advanced</h2>
            <button className="w-full bg-zinc-900 text-white py-4 rounded-3xl font-bold text-sm hover:bg-black transition-all">
              Verify age
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 transition-colors z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Sidebar */}
        <div className="w-72 bg-zinc-50 border-r border-zinc-100 p-8 flex flex-col">
          <div className="flex-1 space-y-1">
            <TabButton tab="Public profile" />
            <TabButton tab="Account" />
            <TabButton tab="Preferences" />
            <TabButton tab="Muted words" />
            <TabButton tab="Parental Insights" />
            <TabButton tab="Advanced" />
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-200/80 rounded-2xl text-xs font-bold text-zinc-900 hover:bg-zinc-200 transition-all">
              <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z" /></svg>
              </div>
              Join community
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-200/80 rounded-2xl text-xs font-bold text-zinc-900 hover:bg-zinc-200 transition-all">
              <div className="w-6 h-6 rounded overflow-hidden">
                <img src="/agentwood-logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              Get the app
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-16 overflow-y-auto no-scrollbar">
          <div className="max-w-xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
