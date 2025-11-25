
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, X, Feather, BookOpen, 
  MoreVertical, Clock, Target, Share2, Headphones, Video, 
  User, Bell, Link, Linkedin, Twitter, Facebook, LogOut, Pencil,
  Sparkles, Loader2, Play, Wand2, Clapperboard, Layout, Settings
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { CreditTransaction } from '../types';
import { optimizePromptForVideo, generateVideo } from '../services/geminiService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // TABS: 'studio' (Standard) vs 'aicreate' (Interactive)
  const [activeTab, setActiveTab] = useState<'studio' | 'aicreate'>('studio');
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [communityEnabled, setCommunityEnabled] = useState(true);

  // Goal State
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [dailyWordCount, setDailyWordCount] = useState(350);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // User Prefs & Credits State
  const [userName, setUserName] = useState('Writer');
  const [userCredits, setUserCredits] = useState(225000);
  const [maxCredits, setMaxCredits] = useState(225000);

  // Modal State
  const [activeModal, setActiveModal] = useState<'none' | 'share' | 'media'>('none');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [mediaType, setMediaType] = useState<'Audio' | 'Video'>('Audio');

  // Video Gen State
  const [videoPrompt, setVideoPrompt] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  // Initialize & Auth Check
  useEffect(() => {
    const savedPrefs = localStorage.getItem('agentwrite_user_prefs');
    if (!savedPrefs) {
       navigate('/signup');
       return;
    }

    try {
       const parsed = JSON.parse(savedPrefs);
       setUserName(parsed.name || 'Writer');
       if (parsed.community !== undefined) setCommunityEnabled(parsed.community);
       
       // Load Credits
       if (parsed.credits !== undefined) setUserCredits(parsed.credits);
       if (parsed.maxCredits !== undefined) setMaxCredits(parsed.maxCredits);
    } catch (e) {
       navigate('/signup');
    }
  }, [navigate]);

  // Effect to handle redirection from Editor
  useEffect(() => {
    if (location.state && location.state.action === 'open_media') {
      const { project, mediaType } = location.state;
      setTimeout(() => {
        setSelectedProject(project);
        setMediaType(mediaType);
        if (mediaType === 'Video' && project.excerpt) {
            setVideoPrompt(project.excerpt); 
        } else {
            setVideoPrompt(`Cinematic trailer for a story titled "${project.title}".`);
        }
        setActiveModal('media');
      }, 100);
    }
  }, [location]);

  // ... mock data ...
  const projects = [
    { id: 'new', title: 'Untitled Draft', words: 0, time: '1 hour ago', type: 'Fiction', excerpt: "It was the start of something new." },
    { id: 'tutorial', title: 'The Midnight Library', words: 12540, time: '2 days ago', type: 'Novel', excerpt: "Between life and death there is a library..." },
    { id: 'p3', title: 'Character Study: Elara', words: 2400, time: '1 week ago', type: 'Notes', excerpt: "Elara stood by the window..." }
  ];

  const progressPercentage = Math.min((dailyWordCount / dailyGoal) * 100, 100);

  // --- ACTIONS ---

  const handleShareClick = (e: React.MouseEvent, project: any) => {
    e.stopPropagation();
    setSelectedProject(project);
    setActiveModal('share');
  };

  const handleMediaClick = (e: React.MouseEvent, project: any, type: 'Audio' | 'Video') => {
    e.stopPropagation();
    setSelectedProject(project);
    setMediaType(type);
    setGeneratedVideoUrl(null);
    setVideoPrompt(project.excerpt || `A scene from ${project.title}`);
    setActiveModal('media');
  };

  const closeModals = () => {
    setActiveModal('none');
    setSelectedProject(null);
    setGeneratedVideoUrl(null);
    setApiKeyError(null);
    window.history.replaceState({}, document.title);
  };
  
  const handleSocialShare = (platform: string) => {
    // Mock share logic
    closeModals();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(`I'm writing "${selectedProject?.title}" on AgentWriteAI.`);
    alert("Link copied to clipboard!");
    closeModals();
  };
  
  const handleLogout = async () => {
      if (supabase) await supabase.auth.signOut();
      localStorage.removeItem('agentwrite_user_prefs');
      navigate('/');
  };

  // --- VIDEO GENERATION LOGIC ---

  const handleOptimizePrompt = async () => {
      if (!videoPrompt) return;
      setIsOptimizing(true);
      try {
          const optimized = await optimizePromptForVideo(videoPrompt);
          setVideoPrompt(optimized);
      } catch (e) {
          console.error(e);
      } finally {
          setIsOptimizing(false);
      }
  };

  const handleGenerateVideo = async () => {
      setIsGeneratingVideo(true);
      setApiKeyError(null);
      setGeneratedVideoUrl(null);
      try {
          if ((window as any).aistudio) {
             const hasKey = await (window as any).aistudio.hasSelectedApiKey();
             if (!hasKey) {
                await (window as any).aistudio.openSelectKey();
                const hasKeyNow = await (window as any).aistudio.hasSelectedApiKey();
                if (!hasKeyNow) throw new Error("API Key selection is required for Veo models.");
             }
          }
          const url = await generateVideo(videoPrompt, '16:9');
          setGeneratedVideoUrl(url);
          setUserCredits(prev => Math.max(0, prev - 10000));
      } catch (e: any) {
          if (e.message?.includes("Requested entity was not found") && (window as any).aistudio) {
              await (window as any).aistudio.openSelectKey();
              setApiKeyError("API Key invalid. Please try again.");
          } else {
              setApiKeyError(e.message || "Generation failed.");
          }
      } finally {
          setIsGeneratingVideo(false);
      }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans relative pb-12">
      {/* ... Modals ... */}
      {activeModal !== 'none' && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={closeModals} />}
      
      {/* Share Modal */}
      {activeModal === 'share' && selectedProject && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-stone-200 animate-fade-in-up m-4">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="font-serif text-xl text-slate-900">Share Progress</h3>
                <button onClick={closeModals} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>
            <div className="p-6">
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-6 text-slate-600 italic text-sm">
                    "I'm currently writing <strong>{selectedProject.title}</strong> on AgentWriteAI. {selectedProject.words.toLocaleString()} words written so far! ✍️ #WritingCommunity"
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => handleSocialShare('twitter')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-black text-white hover:bg-slate-800 transition text-sm font-medium"><Twitter size={16} /> X</button>
                    <button onClick={() => handleSocialShare('linkedin')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#0077b5] text-white hover:bg-[#006396] transition text-sm font-medium"><Linkedin size={16} /> LinkedIn</button>
                    <button onClick={() => handleSocialShare('facebook')} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#1877F2] text-white hover:bg-[#166fe5] transition text-sm font-medium"><Facebook size={16} /> Facebook</button>
                    <button onClick={handleCopyToClipboard} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-stone-100 text-slate-700 hover:bg-stone-200 transition text-sm font-medium"><Link size={16} /> Copy Link</button>
                </div>
            </div>
        </div>
      )}

      {/* Media Lab Modal */}
      {activeModal === 'media' && selectedProject && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-stone-200 animate-fade-in-up m-4">
           {/* Header */}
           <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-md ${mediaType === 'Audio' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'}`}>
                  {mediaType === 'Audio' ? <Headphones size={20} /> : <Video size={20} />}
               </div>
               <div>
                   <h3 className="font-serif text-xl text-slate-900">{mediaType === 'Audio' ? 'Audiobook Studio' : 'Veo 3 Cinematic Studio'}</h3>
                   <div className="flex items-center gap-2 text-xs">
                       <span className="text-slate-500 uppercase tracking-wider">Adaptation for: {selectedProject.title}</span>
                   </div>
               </div>
            </div>
            <button onClick={closeModals} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
          </div>

          {/* CONTENT */}
          <div className="p-8 max-h-[70vh] overflow-y-auto">
              {mediaType === 'Video' ? (
                <div className="space-y-6">
                   {!generatedVideoUrl ? (
                    <>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Scene Description</label>
                                <button onClick={handleOptimizePrompt} disabled={isOptimizing || isGeneratingVideo} className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 disabled:opacity-50">
                                    {isOptimizing ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />} Optimize Prompt
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-32 p-4 rounded-lg border border-stone-200 bg-stone-50 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none resize-none text-sm text-slate-700 leading-relaxed"
                                placeholder="Describe the scene you want to generate..."
                                value={videoPrompt}
                                onChange={(e) => setVideoPrompt(e.target.value)}
                            />
                            <div className="flex justify-between mt-2 text-xs text-slate-400"><span>Veo 3.1 Model</span><span>Cost: 10,000 Credits</span></div>
                        </div>

                        {apiKeyError && <div className="bg-rose-50 text-rose-600 p-3 rounded text-xs border border-rose-100">{apiKeyError}</div>}

                        <button onClick={handleGenerateVideo} disabled={!videoPrompt.trim() || isGeneratingVideo} className="w-full py-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2">
                            {isGeneratingVideo ? <><Loader2 className="animate-spin" size={18} /> Producing Scene...</> : <><Video size={18} /> Generate Video</>}
                        </button>
                    </>
                   ) : (
                    <div className="space-y-6 animate-fade-in">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden relative group shadow-xl">
                            <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setGeneratedVideoUrl(null)} className="flex-1 py-3 border border-stone-200 text-slate-700 rounded-lg font-medium hover:bg-stone-50 transition">Create Another</button>
                            <a href={generatedVideoUrl} download={`agentwrite_veo_${Date.now()}.mp4`} className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-2"><Share2 size={16} /> Download</a>
                        </div>
                    </div>
                   )}
                </div>
              ) : (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-stone-50 border border-stone-100 relative`}>
                        <Headphones size={40} className="text-purple-600 relative z-10" />
                        <div className="absolute -bottom-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow-sm flex items-center gap-1"><Sparkles size={10} /> COMING SOON</div>
                    </div>
                    <h3 className="font-serif text-2xl text-slate-900 mb-3">Neural Audio Engine</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[260px]">We are currently training our multi-voice narration model.</p>
                    <button onClick={closeModals} className="w-full py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition text-sm shadow-lg shadow-slate-200">Notify Me Upon Release</button>
                  </div>
              )}
          </div>
        </div>
      )}

      {/* Header & Main Content */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center text-white"><Feather size={16} strokeWidth={2} /></div>
                <span className="font-serif font-bold text-xl tracking-tight text-slate-900">AgentWrite</span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credits</span>
                    <span className="text-xs font-medium text-slate-900">{userCredits.toLocaleString()} / {maxCredits.toLocaleString()}</span>
                </div>
                <div className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-8 h-8 bg-slate-100 rounded-full border border-stone-200 text-slate-600 flex items-center justify-center font-serif font-bold text-xs hover:bg-slate-200 transition relative">
                        {userName.charAt(0)}
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-100 py-1 z-30 animate-fade-in-up">
                            <div className="px-4 py-3 border-b border-stone-50">
                                <p className="text-sm font-medium text-slate-900">{userName}</p>
                                <p className="text-xs text-slate-500 font-mono">{userCredits.toLocaleString()} CR</p>
                            </div>
                             <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-stone-50 flex items-center gap-2"><User size={14} /> My Profile</button>
                             <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-stone-50 flex items-center gap-2"><Settings size={14} /> Settings</button>
                             <button onClick={() => navigate('/pricing')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-stone-50 flex items-center gap-2"><Target size={14} /> Upgrade Plan</button>
                             <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-stone-50 mt-1"><LogOut size={14} /> Log Out</button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="max-w-7xl mx-auto px-6 flex gap-8 border-t border-stone-50 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('studio')}
                className={`py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === 'studio' ? 'text-slate-900 border-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
                Standard Studio
            </button>
            <button 
                onClick={() => setActiveTab('aicreate')}
                className={`py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'aicreate' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-indigo-500'}`}
            >
                <Sparkles size={14} /> AI Create
            </button>
        </div>
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
         
         {/* VIEW: STANDARD STUDIO */}
         {activeTab === 'studio' && (
            <div className="flex flex-col lg:flex-row gap-10 items-start animate-fade-in">
                <div className="flex-1 w-full">
                    {/* Daily Progress */}
                    <div className="bg-white border border-stone-200 rounded-xl p-6 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
                       <div className="flex-1 w-full">
                           <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2"><h3 className="font-serif text-lg text-slate-900">Daily Target</h3><button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-slate-400"><Pencil size={14} /></button></div>
                               <div className="text-right"><span className="font-serif text-2xl text-slate-900">{dailyWordCount}</span> <span className="text-slate-400 text-sm">/ {dailyGoal} words</span></div>
                           </div>
                           <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden"><div className="bg-slate-900 h-full rounded-full transition-all duration-1000 ease-out" style={{width: `${progressPercentage}%`}}></div></div>
                       </div>
                       <div className="flex-shrink-0 w-full md:w-auto"><button onClick={() => navigate('/project/new')} className="w-full md:w-auto bg-amber-50 text-amber-800 border border-amber-100 px-5 py-3 rounded-lg font-medium text-sm hover:bg-amber-100 transition flex items-center justify-center gap-2"><Plus size={16} /> Write Now</button></div>
                    </div>
                    
                    {/* Promo Card for AI Create */}
                    <div onClick={() => setActiveTab('aicreate')} className="bg-white border border-stone-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition group relative overflow-hidden gap-4">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 z-0 transition-transform group-hover:scale-110"></div>
                         <div className="relative z-10 flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Looking for inspiration?</h3>
                                <p className="text-slate-500 text-sm">Try the AI Create Engine to build stories interactively.</p>
                            </div>
                         </div>
                         <div className="relative z-10 bg-white border border-stone-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors w-full md:w-auto text-center">
                             Switch Mode
                         </div>
                    </div>

                    {/* Projects List */}
                    <h3 className="font-serif text-xl text-slate-900 mb-4">Recent Drafts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {projects.map((project) => (
                            <div key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col text-left hover:shadow-md transition-all cursor-pointer">
                                <div className="p-6 pb-4 flex-1">
                                    <div className="flex justify-between items-start w-full mb-4">
                                        <div className="w-10 h-10 bg-stone-50 text-slate-400 rounded-lg flex items-center justify-center"><BookOpen size={20} strokeWidth={1.5} /></div>
                                        <div className="flex gap-2"><button className="p-1.5 hover:bg-stone-100 rounded-md text-slate-400"><MoreVertical size={16} /></button></div>
                                    </div>
                                    <h3 className="font-serif text-xl text-slate-900 mb-2">{project.title}</h3>
                                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium mt-4">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {project.time}</span><span>{project.words.toLocaleString()} words</span>
                                    </div>
                                </div>
                                <div className="bg-stone-50 border-t border-stone-100 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => handleMediaClick(e, project, 'Audio')} className="p-2 rounded-md text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition" title="Audio"><Headphones size={14} /></button>
                                        <button onClick={(e) => handleMediaClick(e, project, 'Video')} className="p-2 rounded-md text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition" title="Video"><Video size={14} /></button>
                                    </div>
                                    <button onClick={(e) => handleShareClick(e, project)} className="p-2 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"><Share2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
         )}

         {/* VIEW: AI CREATE DASHBOARD */}
         {activeTab === 'aicreate' && (
             <div className="animate-fade-in">
                 {/* Hero Banner */}
                 <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 md:p-10 text-white mb-10 relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                     <div className="relative z-10 max-w-2xl">
                         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                             <Sparkles size={12} /> Interactive Storytelling V1.0
                         </div>
                         <h2 className="font-serif text-3xl md:text-5xl mb-4 leading-tight">Build worlds. <br/><span className="text-indigo-400 italic">Scene by scene.</span></h2>
                         <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
                             The AI Create Engine acts as your co-author, Dungeon Master, and director. 
                             Choose your path, generate audio narration, and visualize scenes with Veo 3.
                         </p>
                         <button 
                            onClick={() => navigate('/create')}
                            className="w-full md:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition shadow-lg flex items-center justify-center gap-2 group"
                         >
                             Start New Story <Clapperboard size={20} className="group-hover:scale-110 transition-transform" />
                         </button>
                     </div>
                 </div>

                 {/* Recent Interactive Stories (Mock) */}
                 <h3 className="font-serif text-xl text-slate-900 mb-4">Your Interactive Library</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400 hover:border-slate-300 hover:bg-stone-50 transition cursor-pointer" onClick={() => navigate('/create')}>
                         <Plus size={32} className="mb-2 opacity-50" />
                         <span className="font-bold text-sm">Create New</span>
                     </div>
                     {/* Placeholder for future saved stories */}
                     <div className="bg-white border border-stone-200 rounded-xl p-6 opacity-50 grayscale">
                         <div className="h-4 w-1/2 bg-stone-200 rounded mb-3"></div>
                         <div className="h-3 w-3/4 bg-stone-100 rounded mb-2"></div>
                         <div className="h-3 w-full bg-stone-100 rounded"></div>
                         <div className="mt-4 pt-4 border-t border-stone-100 text-xs text-slate-400">No saved interactive stories yet.</div>
                     </div>
                 </div>
             </div>
         )}

      </main>
    </div>
  );
};

export default DashboardPage;
