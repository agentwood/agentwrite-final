
import React from 'react';
import { UserProfile } from '../types';

interface RewardsProps {
  user: UserProfile;
  onBack: () => void;
  onUpgrade: () => void;
}

const QUESTS = [
  { id: 'daily-chat', title: 'Daily Conversationalist', desc: 'Send 10 messages today.', progress: 7, total: 10, reward: 50 },
  { id: 'create-agent', title: 'Character Architect', desc: 'Create your first autonomous agent.', progress: 0, total: 1, reward: 200 },
  { id: 'write-story', title: 'The Storyteller', desc: 'Write a story in the Studio.', progress: 1, total: 1, reward: 150 },
  { id: 'polyglot', title: 'The Polyglot', desc: 'Chat with 3 different character categories.', progress: 2, total: 3, reward: 100 },
];

const STORE_ITEMS = [
  { id: 'badge-gold', title: 'Elite Badge', price: 500, icon: '🏆' },
  { id: 'voice-pack', title: 'Vintage Voice Pack', price: 1000, icon: '🎙️' },
  { id: 'priority', title: 'Priority Access', price: 2000, icon: '⚡' },
];

const Rewards: React.FC<RewardsProps> = ({ user, onBack, onUpgrade }) => {
  const isPro = user.plan === 'Pro Plus';

  return (
    <div className="flex flex-col h-full bg-white fade-in overflow-hidden">
      <header className="h-24 px-12 flex items-center justify-between border-b border-zinc-100 bg-white/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all">
             <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-zinc-900">Agent Rewards</h1>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Quests & Redemptions</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 text-white rounded-2xl shadow-lg">
             <span className="text-sm font-black uppercase tracking-widest">Balance</span>
             <div className="w-[1px] h-4 bg-white/20"></div>
             <span className="text-lg font-black">{user.points} AP</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-12 lg:p-20 bg-grain">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Progress Section */}
          <div className="lg:col-span-2 space-y-12">
            {!isPro && (
              <div className="p-10 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black mb-4">Locked Feature</h2>
                  <p className="text-zinc-400 font-medium mb-8 max-w-md">
                    Redemption and Quest rewards are exclusive to <span className="text-white font-bold">Pro Plus</span> users. Upgrade now to claim your 250 AP welcome bonus.
                  </p>
                  <button onClick={onUpgrade} className="px-8 py-4 bg-white text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl active:scale-95">
                    Upgrade to Pro Plus
                  </button>
                </div>
                <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 scale-150 opacity-10 pointer-events-none group-hover:scale-160 transition-transform duration-700">
                   <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </div>
              </div>
            )}

            <div className="space-y-8">
              <h3 className="text-h1 text-zinc-900">Active Quests</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {QUESTS.map((quest) => (
                   <div key={quest.id} className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-zinc-900">{quest.title}</h4>
                          <p className="text-[11px] text-zinc-400 font-bold">{quest.desc}</p>
                        </div>
                        <span className="text-[10px] font-black bg-zinc-100 px-2 py-1 rounded-lg text-zinc-500">+{quest.reward} AP</span>
                     </div>
                     <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                           <span>Progress</span>
                           <span>{quest.progress} / {quest.total}</span>
                        </div>
                        <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-zinc-900 transition-all duration-1000" 
                             style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                           ></div>
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Redemption Sidebar */}
          <div className="space-y-12">
             <div className="space-y-8">
               <h3 className="text-h1 text-zinc-900">Agent Store</h3>
               <div className="space-y-4">
                  {STORE_ITEMS.map((item) => (
                    <div key={item.id} className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-lg transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-xl shadow-sm">
                             {item.icon}
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-900">{item.title}</p>
                            <p className="text-[10px] text-zinc-400 font-bold">{item.price} AP</p>
                          </div>
                       </div>
                       <button 
                        disabled={!isPro || user.points < item.price}
                        className="p-2.5 rounded-xl bg-zinc-900 text-white opacity-0 group-hover:opacity-100 disabled:opacity-20 transition-all"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                       </button>
                    </div>
                  ))}
               </div>
               <p className="text-[10px] text-zinc-400 font-medium italic">
                 New rewards are added every Friday. Spent points cannot be refunded.
               </p>
             </div>

             <div className="p-8 bg-zinc-100/50 rounded-[2.5rem] border border-zinc-200">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-4">Your Tier</h4>
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                   </div>
                   <div>
                      <p className="text-sm font-black text-zinc-900">{isPro ? 'Pro Elite' : 'Standard'}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Member since 2024</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Rewards;
