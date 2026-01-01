
import React, { useEffect, useState } from 'react';
import { 
  Search, Bell, Plus, Compass, Rss, Library, PenTool, 
  Award, Settings, ChevronRight, Hash, Star,
  ArrowUpRight, Target, BarChart3, Users, User, Sparkle, ChevronLeft,
  MessageSquare, Play, Send, Image as ImageIcon, LayoutGrid,
  CreditCard, Volume2, Shield, EyeOff, DollarSign, LogOut,
  Smartphone, Github, HelpCircle, Trophy, CheckCircle2, Copy,
  ArrowRight, X, Info, Zap, Music, Mic, Wand2, RefreshCcw, Loader2
} from 'lucide-react';
import { CharacterCard } from './components/CharacterCard';
import { AuthModal } from './components/AuthModal';
import { getShowcaseCharacters, FALLBACK_CHARACTERS } from './services/geminiService';
import { CharacterProfile, Category, View } from './types';
import { GoogleGenAI } from "@google/genai";

const CATEGORIES: {name: Category, icon: React.ReactNode}[] = [
  { name: "All", icon: <Star size={12} className="fill-current" /> },
  { name: "Play & Fun", icon: <span className="text-xs">🎲</span> },
  { name: "Helper", icon: <span className="text-xs">💼</span> },
  { name: "Original", icon: <PenTool size={12} /> },
  { name: "Anime & Game", icon: <span className="text-xs">🎮</span> },
  { name: "Fiction & Media", icon: <span className="text-xs">🎬</span> },
];

type SettingsSection = 'profile' | 'account' | 'preferences' | 'muted' | 'parental' | 'payouts';

// Define missing helper components before they are used in App
const SidebarLink = ({ active, icon, label, badge, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-2 text-[11px] font-black transition-all ${
      active ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && <span className="rounded bg-purple-500 px-1 py-0.5 text-[8px] font-black text-white">{badge}</span>}
  </button>
);

const RecentItem = ({ name, avatar, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-3 group text-left">
    <div className="h-6 w-6 overflow-hidden rounded-full border border-white/10 transition-transform group-hover:scale-110">
      <img src={avatar} alt={name} className="h-full w-full object-cover" />
    </div>
    <span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors truncate">{name}</span>
  </button>
);

const EmojiPill = ({ emoji, active }: { emoji: string; active?: boolean }) => (
  <button className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all ${
    active ? 'bg-white shadow-xl scale-110 border-white' : 'bg-white/5 border border-white/5 grayscale hover:grayscale-0 hover:bg-white/10'
  }`}>
    {emoji}
  </button>
);

export default function App() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<View>('discover');
  const [activeSettingsSection, setActiveSettingsSection] = useState<SettingsSection>('profile');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (currentView === 'discover') {
      const fetchData = async () => {
        setLoading(true);
        const data = await getShowcaseCharacters(activeCategory);
        setCharacters(data.map((c, i) => ({ ...c, isLive: i % 4 === 0 })));
        setLoading(false);
      };
      fetchData();
    }
  }, [activeCategory, currentView]);

  const navigateToCharacter = (char: CharacterProfile) => {
    setSelectedCharacter(char);
    setCurrentView('character');
  };

  return (
    <div className="flex min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-colors duration-500 bg-[#0f0f0f] text-white">
      
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-full w-60 flex-col border-r lg:flex z-50 border-white/5 bg-[#0f0f0f] p-5">
        <div 
          className="mb-8 flex items-center gap-2 px-1 cursor-pointer group"
          onClick={() => setCurrentView('discover')}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-serif italic text-lg transition-transform group-hover:scale-105">A</div>
          <span className="text-lg font-extrabold tracking-tight">agentwood</span>
        </div>

        <button 
          onClick={() => setCurrentView('create')}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-2.5 text-xs font-black text-black transition-all hover:bg-gray-200 active:scale-95 shadow-lg"
        >
          <Plus size={14} strokeWidth={3} />
          Create a Character
        </button>

        <nav className="flex flex-col gap-5 overflow-y-auto scrollbar-hide">
          <section>
            <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Explore</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink 
                active={currentView === 'discover'} 
                icon={<Compass size={16} />} 
                label="Discover" 
                onClick={() => setCurrentView('discover')}
              />
              <SidebarLink icon={<Search size={16} />} label="Search" />
              <SidebarLink icon={<Library size={16} />} label="Memory" />
            </div>
          </section>

          <section>
            <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Creative Studio</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink icon={<PenTool size={16} />} label="Write a story" />
              <SidebarLink 
                active={currentView === 'rewards'}
                icon={<Award size={16} />} 
                label="Rewards" 
                badge="PRO" 
                onClick={() => setCurrentView('rewards')}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-3 px-1 text-[9px] font-bold uppercase tracking-widest opacity-40">Recent</h4>
            <div className="flex flex-col gap-3 px-4">
              {FALLBACK_CHARACTERS.slice(0, 3).map(c => (
                <RecentItem key={c.name} name={c.name} avatar={c.avatarUrl} onClick={() => navigateToCharacter(c)} />
              ))}
            </div>
          </section>
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-5">
          <SidebarLink 
            active={currentView === 'settings'}
            icon={<Settings size={16} />} 
            label="Settings" 
            onClick={() => setCurrentView('settings')}
          />
          
          <button className="group flex w-full items-center justify-between rounded-xl bg-[#1a1325] px-4 py-3 text-[11px] font-black text-purple-400 border border-purple-500/20 hover:bg-purple-600/10 transition-all">
             <div className="flex items-center gap-2">
                <Zap size={14} fill="currentColor" />
                Unlock with Agentwood+
             </div>
             <span className="rounded bg-purple-500 px-1 py-0.5 text-[8px] text-white">- 50%</span>
          </button>

          <div className="flex items-center gap-2.5 rounded-2xl p-2.5 bg-white/5 border border-white/5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white font-bold text-[10px]">S</div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold truncate">SparklyCamel</p>
              <p className="text-[8px] opacity-40 font-medium uppercase tracking-tighter">FREE PLAN</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:pl-60 flex flex-col">
        
        {/* HEADER */}
        {currentView !== 'character' && currentView !== 'create' && (
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/5 bg-[#0f0f0f]/70 px-6 backdrop-blur-xl">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
              <input 
                type="text" 
                placeholder="Search characters..." 
                className="w-full rounded-xl py-2 pl-10 pr-4 text-[13px] outline-none transition-all bg-white/5 border border-white/10 text-white focus:bg-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => setCurrentView('affiliates')}
                className={`text-[12px] font-semibold transition-colors ${currentView === 'affiliates' ? 'text-purple-400' : 'text-white/40 hover:text-white'}`}
              >
                Affiliates
              </button>
              <div className="h-4 w-px opacity-10 bg-white"></div>
              <button className="relative opacity-30 hover:opacity-100 transition-colors">
                <Bell size={18} />
                <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-red-500"></span>
              </button>
              <div onClick={() => setIsAuthModalOpen(true)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white ring-2 ring-purple-500/20">U</div>
            </div>
          </header>
        )}

        {/* VIEW RENDERING */}
        <div className="flex-1">
          {currentView === 'discover' && (
            <div className="fade-in">
              <section className="relative overflow-hidden px-10 py-16">
                 <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                        ARE YOU... <Sparkle size={10} className="text-white/60" />
                      </p>
                      <h1 className="mb-8 text-6xl font-black tracking-tight leading-[1]">
                        Looking for <br />
                        connections?
                      </h1>
                      <div className="flex gap-4">
                        <EmojiPill emoji="😍" active />
                        <EmojiPill emoji="🤪" />
                        <EmojiPill emoji="👻" />
                        <EmojiPill emoji="😈" />
                      </div>
                    </div>

                    <div className="flex flex-1 items-center justify-center gap-6 perspective-1000 relative">
                       <button className="absolute left-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 z-30">
                          <ChevronLeft size={20} />
                       </button>
                       <div className="flex items-center gap-4 transition-transform duration-500">
                          {FALLBACK_CHARACTERS.slice(0, 5).map((c, i) => (
                             <div 
                              key={i} 
                              onClick={() => navigateToCharacter(c)}
                              className={`rounded-2xl overflow-hidden relative shadow-2xl transition-all duration-500 hover:scale-105 border border-white/10 cursor-pointer flex-shrink-0 ${
                                i === 2 ? 'w-52 aspect-[3/4.5] z-20 scale-110 shadow-purple-500/10' : 'w-36 aspect-[3/4.5] opacity-40 hover:opacity-100'
                              }`}
                             >
                                <img src={c.avatarUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                   <p className="text-[12px] font-black mb-1 truncate">{c.name}</p>
                                   <div className="flex items-center gap-1.5 opacity-60 text-[9px] font-black">
                                      <MessageSquare size={10} /> {c.chatCount}
                                   </div>
                                </div>
                             </div>
                          ))}
                       </div>
                       <button className="absolute right-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 z-30">
                          <ChevronRight size={20} />
                       </button>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
              </section>

              <div className="px-10 py-6">
                <div className="mb-10 flex flex-wrap items-center gap-2">
                  <h3 className="mr-6 text-[10px] font-black tracking-tight text-white/40 uppercase flex items-center gap-2">
                    FOR YOU <Sparkle size={12} className="opacity-40" />
                  </h3>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black transition-all border ${
                        activeCategory === cat.name 
                        ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {cat.icon}
                      {cat.name}
                    </button>
                  ))}
                  <button className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 transition-all">
                    Icon
                  </button>
                </div>

                <section className="mb-20">
                  <div className="mb-10 flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight flex items-center gap-3">
                      <span className="text-2xl">🎁</span> Recommended
                    </h2>
                    <button className="text-[10px] font-black opacity-30 hover:opacity-100 transition-opacity flex items-center gap-1 uppercase tracking-widest">
                      See all <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                    {characters.map((char, index) => (
                      <CharacterCard key={index} character={char} onClick={() => navigateToCharacter(char)} />
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {currentView === 'character' && selectedCharacter && (
            <CharacterDetail 
              character={selectedCharacter} 
              onBack={() => setCurrentView('discover')} 
            />
          )}

          {currentView === 'affiliates' && <AffiliateDashboard />}

          {currentView === 'rewards' && <RewardsView />}

          {currentView === 'settings' && (
            <SettingsView 
              activeSection={activeSettingsSection} 
              onSectionChange={setActiveSettingsSection} 
            />
          )}

          {currentView === 'create' && (
            <CreateView onBack={() => setCurrentView('discover')} />
          )}
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

// Internal components to fix undefined errors

function CharacterDetail({ character, onBack }: { character: CharacterProfile, onBack: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsTyping(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', text: userMsg }].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: `You are ${character.name}. ${character.description}. Tagline: ${character.tagline}. Stay in character and respond naturally.`
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "..." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0f0f0f] fade-in">
      <div className="flex items-center justify-between border-b border-white/5 p-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/5 transition-colors"><ChevronLeft size={20} /></button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-white/10 shadow-lg shadow-purple-500/10">
              <img src={character.avatarUrl} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">{character.name}</p>
              <p className="text-[10px] opacity-40 font-bold">{character.handle}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition-colors"><Volume2 size={18} className="opacity-40" /></button>
          <button className="rounded-full bg-white/5 p-2 hover:bg-white/10 transition-colors"><Settings size={18} className="opacity-40" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
             <div className="h-28 w-28 rounded-full border-2 border-purple-500/20 p-1.5 mb-8">
               <img src={character.avatarUrl} className="h-full w-full rounded-full object-cover shadow-2xl" />
             </div>
             <h2 className="text-3xl font-black mb-3 tracking-tight">{character.name}</h2>
             <p className="text-sm opacity-50 max-w-xs mb-10 font-medium leading-relaxed">{character.description}</p>
             <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setInput("Hey there! How's it going?")} className="rounded-2xl bg-white/5 border border-white/5 px-6 py-3 text-[11px] font-black hover:bg-white/10 transition-all">SAY HELLO</button>
                <button onClick={() => setInput("Tell me a bit about yourself.")} className="rounded-2xl bg-white/5 border border-white/5 px-6 py-3 text-[11px] font-black hover:bg-white/10 transition-all">ABOUT YOU</button>
             </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm font-medium leading-relaxed ${
              m.role === 'user' ? 'bg-purple-600 text-white shadow-xl shadow-purple-500/10' : 'bg-white/5 text-white/90 border border-white/5'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-2xl px-5 py-4 border border-white/5">
              <Loader2 className="animate-spin opacity-40" size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="relative max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Message ${character.name}...`}
              className="w-full rounded-2xl bg-white/5 border border-white/10 py-5 pl-8 pr-16 text-[13px] outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all font-medium"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3 opacity-30">
               <ImageIcon size={18} className="cursor-pointer hover:opacity-100 transition-opacity" />
               <Mic size={18} className="cursor-pointer hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <button 
            onClick={handleSend} 
            disabled={!input.trim()}
            className="rounded-2xl bg-white text-black px-8 font-black text-xs hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const AffiliateDashboard = () => (
  <div className="p-10 fade-in">
    <div className="mb-12 text-left">
      <h2 className="text-4xl font-black mb-3 tracking-tight">Affiliate Dashboard</h2>
      <p className="text-sm opacity-40 font-medium">Manage your referrals and track your earnings in real-time.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        { label: 'Total Earnings', value: '$1,240.50', icon: <DollarSign className="text-green-500" /> },
        { label: 'Active Referrals', value: '142', icon: <Users className="text-blue-500" /> },
        { label: 'Conversion Rate', value: '4.8%', icon: <BarChart3 className="text-purple-500" /> }
      ].map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-colors group">
          <div className="flex justify-between items-center mb-6">
            <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{stat.icon}</div>
            <ArrowUpRight size={20} className="text-white/20" />
          </div>
          <p className="text-4xl font-black mb-2 tracking-tighter">{stat.value}</p>
          <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
);

const RewardsView = () => (
  <div className="p-10 fade-in">
    <div className="max-w-4xl text-left">
      <div className="mb-12">
        <h2 className="text-4xl font-black mb-3 tracking-tight">Rewards & Milestones</h2>
        <p className="text-white/40 text-sm font-medium leading-relaxed">Earn Agentwood tokens and exclusive badges by reaching community goals.</p>
      </div>
      
      <div className="space-y-6">
        {[
          { title: 'Character Milestone', desc: 'Reach 10k chats on a single character', reward: '500 AGW', progress: 75, icon: <Trophy size={18} /> },
          { title: 'Daily Writer', desc: 'Create 3 new scenarios in 24 hours', reward: '100 AGW', progress: 33, icon: <PenTool size={18} /> },
          { title: 'Community Hero', desc: 'Get 50 positive ratings from users', reward: '250 AGW', progress: 90, icon: <Users size={18} /> }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-purple-400">{item.icon}</div>
                <h4 className="font-black text-base">{item.title}</h4>
              </div>
              <p className="text-xs text-white/40 font-medium mb-6">{item.desc}</p>
              <div className="h-2 w-full max-w-md bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" style={{ width: `${item.progress}%` }}></div>
              </div>
            </div>
            <div className="text-right ml-8">
              <p className="text-2xl font-black text-white mb-2 tracking-tight">{item.reward}</p>
              <button className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${item.progress === 100 ? 'bg-purple-500 text-white' : 'text-white/20'}`}>
                {item.progress === 100 ? 'Claim Now' : 'In Progress'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SettingsView = ({ activeSection, onSectionChange }: { activeSection: string, onSectionChange: (s: any) => void }) => {
  const sections = [
    { id: 'profile', icon: <User size={16} />, label: 'Profile' },
    { id: 'account', icon: <Shield size={16} />, label: 'Account' },
    { id: 'preferences', icon: <Sparkle size={16} />, label: 'Preferences' },
    { id: 'muted', icon: <EyeOff size={16} />, label: 'Muted Characters' },
    { id: 'parental', icon: <Shield size={16} />, label: 'Parental Controls' },
    { id: 'payouts', icon: <DollarSign size={16} />, label: 'Payouts' },
  ];

  return (
    <div className="flex h-full fade-in">
      <div className="w-64 border-r border-white/5 p-8 flex flex-col gap-2">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black transition-all ${
              activeSection === s.id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
        <button className="mt-auto flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black text-red-500 hover:bg-red-500/10 transition-all">
           <LogOut size={16} />
           Sign Out
        </button>
      </div>
      <div className="flex-1 p-12 overflow-y-auto text-left">
        <h2 className="text-4xl font-black mb-12 capitalize tracking-tight">{activeSection} Settings</h2>
        <div className="max-w-3xl">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
             <div className="flex items-center gap-8 mb-12">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-3xl font-black shadow-2xl border-4 border-white/10">S</div>
                <div className="space-y-3">
                   <button className="bg-white text-black px-6 py-2.5 rounded-2xl text-[11px] font-black hover:bg-gray-200 transition-all">Change Avatar</button>
                   <p className="text-[11px] text-white/30 font-medium">Recommended: 400x400px JPG or PNG</p>
                </div>
             </div>
             <div className="space-y-8">
                <div className="flex flex-col gap-3">
                   <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Display Name</label>
                   <input type="text" defaultValue="SparklyCamel" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-purple-500/50 transition-all" />
                </div>
                <div className="flex flex-col gap-3">
                   <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Biography</label>
                   <textarea rows={4} defaultValue="Just a human exploring the wood, looking for meaningful AI connections." className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-purple-500/50 transition-all resize-none" />
                </div>
                <div className="pt-4">
                   <button className="bg-purple-600 text-white px-10 py-4 rounded-2xl text-xs font-black shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Changes</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateView = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="p-12 fade-in max-w-6xl mx-auto text-left">
      <button onClick={onBack} className="flex items-center gap-3 text-[11px] font-black text-white/30 hover:text-white mb-12 uppercase tracking-[0.2em] transition-colors group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Discover
      </button>
      
      <div className="mb-16">
        <h1 className="text-5xl font-black mb-4 tracking-tight">Create Character</h1>
        <p className="text-white/40 text-lg font-medium">Design an AI that thinks, speaks, and interacts exactly how you imagine.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="flex flex-col gap-4">
             <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Profile Vision</label>
             <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-6 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <div className="p-6 bg-white/5 rounded-3xl group-hover:scale-110 transition-transform"><ImageIcon size={48} className="opacity-20" /></div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-white/40 uppercase mb-2">Upload Portrait</p>
                  <p className="text-[10px] text-white/20 font-medium">JPG, PNG OR WEBP</p>
                </div>
             </div>
          </div>
          
          <div className="space-y-10">
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Display Name</label>
              <input type="text" placeholder="e.g. Luna the Explorer" className="bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 transition-all" />
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Primary Category</label>
              <div className="relative">
                <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm font-medium outline-none focus:border-purple-500/50 appearance-none text-white transition-all cursor-pointer">
                  {CATEGORIES.filter(c => c.name !== 'All').map(c => <option key={c.name} value={c.name} className="bg-[#1a1a1a]">{c.name}</option>)}
                </select>
                <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 opacity-30 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex flex-col gap-4 h-full">
            <label className="text-[11px] font-black uppercase text-white/40 tracking-[0.2em]">Core Personality & Prompting</label>
            <textarea 
              placeholder="How should this character behave? What are their secrets? How do they sound? The more detail, the better the experience." 
              className="flex-1 min-h-[400px] bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-10 text-sm font-medium outline-none focus:border-purple-500/50 resize-none transition-all leading-relaxed"
            />
          </div>
          <button className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
             <Wand2 size={18} />
             INITIALIZE AGENT
          </button>
        </div>
      </div>
    </div>
  );
};
