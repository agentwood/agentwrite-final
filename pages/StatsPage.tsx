
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Trophy, Zap, Lock, CheckCircle2, ShoppingBag, Shield, Palette, Feather, Award, BarChart2, Calendar, Target } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LevelUpModal from '../components/LevelUpModal';

const StatsPage = () => {
  const navigate = useNavigate();
  const [showLevelModal, setShowLevelModal] = useState(false);

  // Mock Data
  const currentLevel = 5;
  const currentXP = 1250;
  const nextLevelXP = 2000;
  const progressPercent = (currentXP / nextLevelXP) * 100;
  
  const badges = [
    { id: 1, name: 'First Draft', icon: <Feather />, unlocked: true, date: 'Oct 12' },
    { id: 2, name: 'Consistent Writer', icon: <Flame />, unlocked: true, date: 'Nov 01' },
    { id: 3, name: 'Night Owl', icon: <Trophy />, unlocked: false, date: '-' },
    { id: 4, name: 'Word Master', icon: <Shield />, unlocked: false, date: '-' },
  ];

  const dailyQuests = [
    { id: 1, task: 'Write 500 words', progress: 500, total: 500, completed: true, xp: 50 },
    { id: 2, task: 'Use Brainstorm tool', progress: 0, total: 1, completed: false, xp: 25 },
    { id: 3, task: 'Edit a chapter', progress: 1, total: 3, completed: false, xp: 100 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20">
      <Navigation />
      <LevelUpModal isOpen={showLevelModal} onClose={() => setShowLevelModal(false)} level={currentLevel + 1} />

      <header className="bg-white border-b border-stone-200 sticky top-0 z-20 px-6 py-4">
         <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
                <ArrowLeft size={18} /> Dashboard
            </button>
            <h1 className="font-serif font-bold text-lg text-slate-900">Writer Analytics</h1>
            <div className="w-8"></div> {/* Spacer */}
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Hero Stats - Elegant Card */}
        <div className="bg-white border border-stone-200 rounded-xl p-8 mb-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-white font-serif text-2xl shadow-md">
                   F
                </div>
                
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <h2 className="font-serif text-3xl text-slate-900 mb-1">Felix The Writer</h2>
                            <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Level {currentLevel} • Apprentice Scribe</p>
                        </div>
                        <div className="text-right hidden md:block">
                             <span className="font-serif text-2xl text-slate-900">{currentXP}</span> <span className="text-slate-400 text-sm">/ {nextLevelXP} XP</span>
                        </div>
                    </div>
                    
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mt-4">
                         <div 
                            className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                            style={{ width: `${progressPercent}%` }}
                         ></div>
                    </div>
                    <div className="mt-2 flex justify-end">
                         <button 
                            onClick={() => setShowLevelModal(true)}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-700 uppercase tracking-widest border border-stone-200 px-2 py-1 rounded"
                        >
                            Trigger Milestone (Demo)
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Main Column */}
            <div className="md:col-span-2 space-y-8">
                
                {/* Productivity / Streak */}
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl text-slate-900 flex items-center gap-2">
                            <Calendar size={20} className="text-slate-400" /> Weekly Consistency
                        </h3>
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">7 Day Streak</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 flex-1">
                                <div className={`w-full aspect-square rounded-md flex items-center justify-center text-xs transition-all ${i < 5 ? 'bg-slate-900 text-white' : 'bg-stone-100 text-slate-300'}`}>
                                    {i < 5 && <CheckCircle2 size={16} />}
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Daily Goals */}
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-serif text-xl text-slate-900 flex items-center gap-2">
                            <Target size={20} className="text-slate-400" /> Daily Objectives
                        </h3>
                        <span className="text-xs text-slate-400">Resets in 4h</span>
                    </div>
                    <div className="space-y-4">
                        {dailyQuests.map((quest) => (
                            <div key={quest.id} className={`border rounded-lg p-4 flex items-center gap-4 transition-all ${quest.completed ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-200'}`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${quest.completed ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300'}`}>
                                    {quest.completed && <CheckCircle2 size={12} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className={`text-sm font-medium ${quest.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{quest.task}</span>
                                        <span className="text-xs font-semibold text-amber-600">+{quest.xp} XP</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
                
                {/* Achievements */}
                <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-serif text-xl text-slate-900 mb-6">Achievements</h3>
                    <div className="space-y-4">
                        {badges.map((badge) => (
                            <div key={badge.id} className={`flex items-center gap-4 p-3 rounded-lg ${badge.unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                <div className={`w-10 h-10 rounded flex items-center justify-center border ${badge.unlocked ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-stone-50 border-stone-200'}`}>
                                    {badge.unlocked ? React.cloneElement(badge.icon as any, { size: 18 }) : <Lock size={16} />}
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900 text-sm">{badge.name}</div>
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wide">{badge.unlocked ? `Unlocked ${badge.date}` : 'Locked'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Marketplace */}
                <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="font-serif text-lg text-white">Writer's Market</h3>
                        <div className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                            450 Credits
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                         <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition group">
                            <div className="flex items-center gap-3">
                                <div className="text-slate-300"><Palette size={16} /></div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-slate-200">Noir Theme</div>
                                </div>
                            </div>
                            <span className="text-amber-400 text-xs font-mono">500</span>
                        </button>

                         <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition group">
                            <div className="flex items-center gap-3">
                                <div className="text-slate-300"><Zap size={16} /></div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-slate-200">Sci-Fi Module</div>
                                </div>
                            </div>
                            <span className="text-slate-500 text-[10px] bg-black/30 px-2 py-1 rounded border border-white/5">Lvl 10</span>
                        </button>
                    </div>
                </div>

            </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StatsPage;
