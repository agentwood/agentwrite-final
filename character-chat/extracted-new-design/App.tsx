
import React, { useState, useEffect } from 'react';
import { Agent, ViewState, SavedChat, UserProfile } from './types';
import { INITIAL_AGENTS, TRENDING_VOICES, REFINED_VOICES, SCENES_DATA, POPULAR_DATA, ANIME_CHARACTERS, ASSISTANT_CHARACTERS } from './constants';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import CreateCharacterModal from './components/CreateCharacterModal';
import CharacterDetailModal from './components/CharacterDetailModal';
import SettingsModal from './components/SettingsModal';
import StoryStudio from './components/StoryStudio';
import Rewards from './components/Rewards';
import Footer from './components/Footer';

const CATEGORIES = ['All', 'Fantasy', 'Sports', 'Historical', 'Sci-Fi', 'Villain', 'Mentor'];
const SUB_CATEGORIES = ['Assistants', 'Anime', 'Creativity & Writing', 'Entertainment & Gaming', 'History', 'Humor', 'Learning', 'Lifestyle', 'Parody', 'RPG & Puzzles'];

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('discover');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [previewAgent, setPreviewAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState('Assistants');
  const [searchQuery, setSearchQuery] = useState('');

  // Rewards State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'SparklyCamel8370',
    plan: 'Free',
    points: 125,
    completedQuests: []
  });

  useEffect(() => {
    const storedHistory = localStorage.getItem('agentwood_history');
    if (storedHistory) { try { setSavedChats(JSON.parse(storedHistory)); } catch (e) { console.error(e); } }
    
    const storedRecent = localStorage.getItem('agentwood_recent_agents');
    if (storedRecent) { 
      try { 
        const ids = JSON.parse(storedRecent) as string[];
        const recent = ids.map(id => agents.find(a => a.id === id)).filter(Boolean) as Agent[];
        setRecentAgents(recent);
      } catch (e) { console.error(e); } 
    }

    const storedProfile = localStorage.getItem('agentwood_profile');
    if (storedProfile) { try { setUserProfile(JSON.parse(storedProfile)); } catch (e) { console.error(e); } }
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('agentwood_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addPoints = (amount: number) => {
    setUserProfile(prev => ({ ...prev, points: prev.points + amount }));
  };

  const handleAgentClick = (agent: Agent) => {
    setPreviewAgent(agent);
  };

  const handleInitiateChat = (agent: Agent, selectedVoice?: string) => {
    const sessionAgent = selectedVoice 
      ? { ...agent, traits: { ...agent.traits, voiceName: selectedVoice } }
      : agent;

    setSelectedAgent(sessionAgent);
    setPreviewAgent(null);
    setView('chat');

    // Earn points for initiating a conversation
    addPoints(5);

    const newRecent = [agent, ...recentAgents.filter(a => a.id !== agent.id)].slice(0, 5);
    setRecentAgents(newRecent);
    localStorage.setItem('agentwood_recent_agents', JSON.stringify(newRecent.map(a => a.id)));
  };

  const handleSaveChat = (chat: SavedChat) => {
    const updated = [chat, ...savedChats.filter(c => c.id !== chat.id)].slice(0, 50);
    setSavedChats(updated);
    localStorage.setItem('agentwood_history', JSON.stringify(updated));
  };

  const handleUpgrade = () => {
    setUserProfile(prev => ({ ...prev, plan: 'Pro Plus', points: prev.points + 250 }));
    alert('Welcome to Pro Plus! 250 AP bonus granted.');
  };

  const filteredAgents = agents.filter(agent => {
    const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      agent.name.toLowerCase().includes(query) || 
      agent.role.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const subCategoryData = activeSubCategory === 'Anime' ? ANIME_CHARACTERS : ASSISTANT_CHARACTERS;

  if (currentView === 'chat' && selectedAgent) {
    return <ChatWindow agent={selectedAgent} onBack={() => setView('discover')} onSave={handleSaveChat} />;
  }

  if (currentView === 'story-studio') {
    return <StoryStudio agents={agents} onBack={() => setView('discover')} />;
  }

  if (currentView === 'rewards') {
    return <Rewards user={userProfile} onBack={() => setView('discover')} onUpgrade={handleUpgrade} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-zinc-900 selection:bg-zinc-200">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        onCreateClick={() => setIsCreateModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        savedChats={savedChats}
        recentAgents={recentAgents}
        userPlan={userProfile.plan}
        onSelectAgent={handleAgentClick}
        onLoadChat={(chat) => {
          const agent = agents.find(a => a.id === chat.agentId);
          if (agent) { setSelectedAgent(agent); setView('chat'); }
        }}
      />

      <main className="flex-1 flex flex-col h-full overflow-y-auto no-scrollbar scroll-smooth">
        {/* Unified Hero Section */}
        <section className="py-24 px-6 md:px-12 flex flex-col items-center text-center fade-in bg-white">
          <h1 className="text-display mb-10">
            Talk. Create.<br />
            <span className="text-zinc-400">Discover.</span>
          </h1>

          <p className="text-h2 text-zinc-500 max-w-2xl mb-12 font-medium">
            Have conversations with different characters, create and discover unique content curated on Agentwood.
          </p>

          <div className="w-full max-w-2xl relative">
             <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-[2rem] p-1.5 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-black/5">
                <div className="pl-6 text-zinc-400">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find a personality..."
                  className="w-full px-6 py-4 bg-transparent border-none text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-0 text-lg font-bold"
                />
             </div>
          </div>
        </section>

        {/* Featured Section - 6 in a row */}
        <section className="px-6 md:px-12 py-16 bg-white border-y border-zinc-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-h1 mb-10">Featured</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
               {INITIAL_AGENTS.slice(0, 6).map(agent => (
                 <div 
                   key={`featured-${agent.id}`} 
                   onClick={() => handleAgentClick(agent)}
                   className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 border border-zinc-100"
                 >
                   <img src={agent.avatar} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={agent.name} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                   <div className="absolute bottom-6 left-6 right-6 text-white">
                     <p className="text-[9px] uppercase mb-1.5 opacity-60 font-black tracking-widest">@{agent.author.replace('@','')}</p>
                     <h3 className="text-base font-bold mb-1 leading-tight">{agent.name}</h3>
                     <p className="text-[11px] opacity-70 line-clamp-2 leading-snug">{agent.description}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* All Characters Grid */}
        <section className="px-6 md:px-12 py-24 bg-white">
           <div className="max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
                <div className="space-y-3">
                  <h2 className="text-h1">All Characters</h2>
                  <p className="text-zinc-500 font-medium">Browse the complete library of autonomous agents.</p>
                </div>
                
                <div className="flex items-center gap-4">
                   {/* Styled Dropdown Filter */}
                   <div className="relative group min-w-[200px]">
                      <select 
                        value={activeCategory}
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-black/5 hover:border-zinc-400 hover:bg-white transition-all cursor-pointer pr-12 shadow-sm"
                      >
                         {CATEGORIES.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                         ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-zinc-900 transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-10 gap-y-16">
                {filteredAgents.map(agent => (
                  <div key={agent.id} onClick={() => handleAgentClick(agent)} className="group cursor-pointer">
                    <div className="aspect-square w-full rounded-[2.5rem] bg-zinc-50 overflow-hidden mb-6 border border-zinc-100 transition-all group-hover:border-zinc-300 group-hover:shadow-xl group-hover:-translate-y-1 duration-300">
                      <img src={agent.avatar} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={agent.name} />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">{agent.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-3">@{agent.author.replace('@','')}</p>
                    <p className="text-small-ui text-zinc-500 line-clamp-2 leading-relaxed h-12">{agent.description}</p>
                  </div>
                ))}
             </div>
           </div>
        </section>

        {/* Scenes Section */}
        <section className="px-6 md:px-12 py-16 bg-white overflow-hidden border-t border-zinc-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-h1 mb-10">Scenes</h2>
            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8">
              {SCENES_DATA.map((scene) => (
                <div key={scene.id} className="min-w-[280px] flex flex-col group cursor-pointer">
                  <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 shadow-md group-hover:shadow-2xl transition-all duration-500">
                    <img src={scene.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={scene.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-lg font-bold text-white mb-4 leading-tight">{scene.title}</h3>
                      <button className="w-full py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center gap-2 text-white text-xs font-bold hover:bg-white/20 transition-all">
                        <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center border border-white/20">
                           <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        Select Character
                      </button>
                    </div>

                    <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/30 backdrop-blur-md border border-white/10">
                       <svg className="w-3.5 h-3.5 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-bold ml-1 uppercase tracking-widest">By {scene.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </main>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCharacterModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onCreated={(newAgent) => { 
            setAgents(prev => [newAgent, ...prev]); 
            addPoints(50); // Achievement points
            handleInitiateChat(newAgent); 
          }}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsModalOpen(false)} 
        />
      )}

      {previewAgent && (
        <CharacterDetailModal 
          agent={previewAgent} 
          onClose={() => setPreviewAgent(null)}
          onInitiate={(voice) => handleInitiateChat(previewAgent, voice)}
        />
      )}
    </div>
  );
};

export default App;
