
import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, Bell, Plus, Compass, Library, PenTool, 
  Award, Settings, ChevronRight, Star,
  Sparkle, ChevronLeft,
  MessageSquare, Play, Send, Image as ImageIcon,
  PlayCircle,
  Zap, Wand2, Loader2, Music,
  ChevronDown, BookOpen, Share2, Instagram, Twitter,
  User, CreditCard, Sliders, VolumeX, ShieldCheck, DollarSign,
  Globe, Moon, Sun, Monitor, Laptop, Check, X, ShieldAlert,
  Link, BarChart, Users, ThumbsUp, ThumbsDown, Bookmark,
  MoreHorizontal, Headphones, Smile, Heart, ZapOff, Info,
  Feather, History, ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon, ArrowRight
} from 'lucide-react';
import { CharacterCard } from './components/CharacterCard';
import { AuthModal } from './components/AuthModal';
import { getShowcaseCharacters, FALLBACK_CHARACTERS } from './services/geminiService';
import { CharacterProfile, Category, View } from './types';
import { GoogleGenAI } from "@google/genai";

const SidebarLink: React.FC<{ active?: boolean; icon: React.ReactNode; label: string; badge?: string; onClick?: () => void }> = ({ active, icon, label, badge, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-[13px] font-medium transition-all ${
      active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className="flex items-center gap-3">
      <span className={active ? 'text-white' : 'text-white/40'}>{icon}</span>
      <span className="font-sans">{label}</span>
    </div>
    {badge && (
      <span className="rounded-[4px] bg-[#a855f7] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-tighter font-sans">
        {badge}
      </span>
    )}
  </button>
);

const LandingHero = () => (
  <section className="relative w-full min-h-[700px] overflow-hidden bg-dipsea-bg flex items-center px-16">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-dipsea-bg via-dipsea-bg/40 to-transparent z-10"></div>
      <img src="https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
    </div>
    <div className="relative z-10 max-w-2xl animate-fade-in-up">
      <h1 className="text-8xl font-serif italic text-white mb-8 leading-none tracking-tight">Find your <br />favorite fantasy.</h1>
      <button className="px-10 py-5 bg-white/5 border border-white/20 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all mb-12">
        Try Agentwood
      </button>
      <div className="pt-12 border-t border-white/5 space-y-4">
        <p className="text-[11px] text-white/40 font-bold uppercase tracking-widest">Or download the app for the best listening experience.</p>
        <div className="flex gap-4">
          <div className="h-10 px-4 rounded-lg bg-black border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold text-white font-sans">App Store</span>
          </div>
          <div className="h-10 px-4 rounded-lg bg-black border border-white/10 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold text-white font-sans">Google Play</span>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute right-32 top-1/2 -translate-y-1/2 w-[400px] aspect-[9/16] bg-dipsea-surface rounded-[48px] border-[12px] border-white/10 shadow-2xl overflow-hidden hidden xl:block">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" className="h-full w-full object-cover" />
    </div>
  </section>
);

const CharacterPlayRow: React.FC<{ char: CharacterProfile, onClick: () => void }> = ({ char, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-all group">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10">
        <img src={char.avatarUrl} className="w-full h-full object-cover" />
      </div>
      <div>
        <h4 className="text-sm font-serif italic text-white group-hover:text-dipsea-accent transition-colors">{char.name}</h4>
        <p className="text-[10px] text-white/40 line-clamp-1 font-sans">{char.tagline}</p>
      </div>
    </div>
    <button className="p-2 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-black transition-all">
      <Play size={14} fill="currentColor" />
    </button>
  </div>
);

const TestimonialSection = () => (
  <section className="plum-gradient py-32 px-12 text-center space-y-12">
    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 font-sans">YOU DON'T HAVE TO TAKE OUR WORD FOR IT</p>
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-center mb-8">
        <span className="text-6xl text-dipsea-accent font-serif">“</span>
      </div>
      <h2 className="text-5xl font-serif italic text-white leading-tight">
        Agentwood is unparalleled when it comes to the production value of their narratives and their focus on storytelling. I love that they have deep, resonant voices for every part.
      </h2>
      <div className="flex justify-center gap-1.5 pt-8">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#c2956e" className="text-dipsea-accent" />)}
      </div>
    </div>
  </section>
);

const ConnectionsSection: React.FC<{ characters: CharacterProfile[], onSelect: (c: CharacterProfile) => void, onCategoryChange: (c: Category) => void, activeCategory: Category }> = ({ characters, onSelect, onCategoryChange, activeCategory }) => {
  const [activeEmoji, setActiveEmoji] = useState('😍');
  const [activeMood, setActiveMood] = useState('Relaxed');
  const [activeTrait, setActiveTrait] = useState('Intimacy');
  const emojis = ['😍', '🤪', '👻', '😈'];
  const moods = ['Relaxed', 'Intense', 'Romantic', 'Playful', 'Slow-Burn'];
  const traits = ['Intimacy', 'Deep Voice', 'Accents', 'Roleplay', 'Banter'];
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const categories: Category[] = ["All", "Play & Fun", "Helper", "Original", "Anime & Game", "Fiction & Media"];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-black py-24 px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 mb-24">
        <div className="flex-1 space-y-12">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 font-sans">ARE YOU...</span>
            <h2 className="text-7xl font-serif italic text-white tracking-tight leading-none">Looking for <br />connections?</h2>
          </div>
          
          <div className="flex gap-4">
            {emojis.map(emoji => (
              <button 
                key={emoji}
                onClick={() => setActiveEmoji(emoji)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${activeEmoji === emoji ? 'bg-dipsea-cream scale-110 shadow-2xl' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 relative group max-w-xl w-full">
           <div 
             ref={scrollRef}
             className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
           >
             {characters.map((char, i) => (
               <div 
                 key={i} 
                 onClick={() => onSelect(char)}
                 className="min-w-[280px] aspect-[3/4] rounded-[40px] overflow-hidden relative group/card cursor-pointer snap-center shadow-2xl bg-dipsea-surface"
               >
                 <img src={char.avatarUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-8">
                   <h4 className="text-xl font-serif italic text-white mb-1">{char.name}</h4>
                   <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-bold tracking-widest font-sans">
                     <MessageSquare size={10} /> {char.chatCount}
                   </div>
                   <p className="text-[10px] text-white/20 font-sans mt-1">{char.handle}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="space-y-10 pt-12 border-t border-white/5">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 font-sans min-w-[100px]">CATEGORY</span>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => onCategoryChange(cat)} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all font-sans ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}>{cat}</button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 font-sans min-w-[100px]">MOOD</span>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <button key={mood} onClick={() => setActiveMood(mood)} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all font-sans ${activeMood === mood ? 'bg-dipsea-accent text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>{mood}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 font-sans min-w-[100px]">TRAITS</span>
            <div className="flex flex-wrap gap-2">
              {traits.map(trait => (
                <button key={trait} onClick={() => setActiveTrait(trait)} className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all font-sans ${activeTrait === trait ? 'bg-purple-600 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}>{trait}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BlogPage = () => {
  const categories = ["ALL", "WELLNESS", "STORYTELLING", "RELATIONSHIPS", "CULTURE"];
  const featuredPost = {
    title: "The Art of Auditory Intimacy: Why Voice Matters",
    category: "STORYTELLING",
    image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1200",
    author: "Elena Vasquez",
    date: "May 12, 2025"
  };

  const posts = [
    { title: "5 Ways to Rekindle the Spark with Shared Stories", category: "RELATIONSHIPS", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=800" },
    { title: "Deep Dive: The Psychology of the 'Slow Burn'", category: "CULTURE", image: "https://images.unsplash.com/photo-1490122417551-6ee9691429d0?auto=format&fit=crop&q=80&w=800" },
    { title: "Nighttime Rituals for Better Sleep and Connection", category: "WELLNESS", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800" },
    { title: "Designing Characters with Heart and Soul", category: "STORYTELLING", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800" }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0c] fade-in">
      {/* Header */}
      <div className="px-16 py-24 text-center space-y-8">
        <h1 className="text-9xl font-serif italic text-white tracking-tighter">The Blog.</h1>
        <div className="flex justify-center gap-10 border-t border-b border-white/5 py-8">
          {categories.map(cat => <button key={cat} className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors">{cat}</button>)}
        </div>
      </div>

      {/* Featured Post */}
      <section className="px-16 mb-32">
        <div className="relative rounded-[60px] overflow-hidden aspect-[21/9] border border-white/10 group cursor-pointer">
          <img src={featuredPost.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute bottom-16 left-16 max-w-2xl space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-dipsea-accent">{featuredPost.category}</span>
            <h2 className="text-7xl font-serif italic text-white leading-none">{featuredPost.title}</h2>
            <p className="text-white/40 text-sm font-sans italic">By {featuredPost.author} — {featuredPost.date}</p>
          </div>
        </div>
      </section>

      {/* Grid Posts */}
      <section className="px-16 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24 mb-32">
        {posts.map((post, i) => (
          <div key={i} className="group cursor-pointer space-y-8">
            <div className="aspect-[16/9] rounded-[48px] overflow-hidden border border-white/5 relative">
              <img src={post.image} className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105" />
            </div>
            <div className="space-y-4 px-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-dipsea-accent">{post.category}</span>
              <h3 className="text-4xl font-serif italic text-white group-hover:text-dipsea-accent transition-colors">{post.title}</h3>
              <p className="text-white/20 text-sm font-sans italic">Read Story — 6 min read</p>
            </div>
          </div>
        ))}
      </section>

      {/* Editorial Newsletter */}
      <section className="px-16 mb-32">
        <div className="bg-[#1a1a1a] rounded-[80px] p-32 text-center space-y-10 border border-white/5 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-6xl font-serif italic text-white">Join the wood.</h2>
            <p className="text-white/30 text-xl font-sans italic max-w-xl mx-auto">Get exclusive editorial insights, stories, and connection tips delivered to your inbox.</p>
            <div className="max-w-md mx-auto relative mt-12">
              <input type="email" placeholder="email@address.com" className="w-full bg-transparent border-b border-white/10 py-5 px-4 text-2xl italic outline-none focus:border-dipsea-accent transition-colors font-sans text-white" />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-dipsea-accent"><ArrowRight size={32} /></button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-dipsea-accent/5 blur-[100px] rounded-full"></div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Footer = () => (
  <footer className="bg-dipsea-bg border-t border-white/5 py-32 px-16 mt-auto">
    <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-16 mb-32">
      <div className="col-span-1 md:col-span-2 space-y-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
            <span className="text-3xl font-serif italic text-white leading-none">A</span>
          </div>
          <span className="text-3xl font-bold tracking-tighter text-white font-sans">agentwood</span>
        </div>
        <p className="text-white/30 text-xl font-sans italic max-w-sm leading-relaxed">Crafting the future of digital intimacy and sophisticated storytelling through the wood.</p>
        <div className="flex gap-8">
          <button className="text-white/20 hover:text-white transition-colors"><Instagram size={24} /></button>
          <button className="text-white/20 hover:text-white transition-colors"><Twitter size={24} /></button>
          <button className="text-white/20 hover:text-white transition-colors"><Share2 size={24} /></button>
        </div>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 mb-8 font-sans">PLATFORM</h4>
        <ul className="space-y-6 text-sm font-sans text-white/30">
          <li className="hover:text-white cursor-pointer transition-colors">Discover</li>
          <li className="hover:text-white cursor-pointer transition-colors">Create</li>
          <li className="hover:text-white cursor-pointer transition-colors">Stories</li>
          <li className="hover:text-white cursor-pointer transition-colors">Rewards</li>
        </ul>
      </div>
      <div>
        <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/10 mb-8 font-sans">DISCOVER</h4>
        <ul className="space-y-6 text-sm font-sans text-white/30">
          <li className="hover:text-white cursor-pointer transition-colors">Top Audiobooks</li>
          <li className="hover:text-white cursor-pointer transition-colors">Browse</li>
          <li className="hover:text-white cursor-pointer transition-colors">Characters</li>
          <li className="hover:text-white cursor-pointer transition-colors">Books</li>
        </ul>
      </div>
      <div className="flex flex-col items-end gap-12">
        <button className="px-10 py-4 bg-[#ff5a42] text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
          START LISTENING
        </button>
      </div>
    </div>
    <div className="max-w-[1400px] mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
      <span className="text-[10px] font-bold text-white/10 font-sans uppercase tracking-[0.4em]">© 2025 AGENTWOOD INC. ALL RIGHTS RESERVED.</span>
      <div className="flex gap-12 text-[10px] font-bold text-white/10 font-sans uppercase tracking-[0.4em]">
        <a href="#" className="hover:text-white">PRIVACY POLICY</a>
        <a href="#" className="hover:text-white">TERMS & CONDITIONS</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('discover');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getShowcaseCharacters(activeCategory);
      setCharacters(data);
      setLoading(false);
    };
    fetchData();
  }, [activeCategory]);

  const navigateToProfile = (char: CharacterProfile) => {
    setSelectedCharacter(char);
    setCurrentView('character');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToChat = (char: CharacterProfile) => {
    setSelectedCharacter(char);
    setCurrentView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen font-sans bg-dipsea-bg text-dipsea-cream">
      
      <aside className="fixed left-0 top-0 hidden h-full w-[260px] flex-col border-r border-white/5 lg:flex z-50 bg-[#0c0c0c] p-5">
        <div 
          className="mb-8 flex items-center gap-3 cursor-pointer"
          onClick={() => setCurrentView('discover')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-white/10 shadow-lg">
            <span className="text-2xl font-serif italic text-white leading-none">A</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white font-sans">agentwood</span>
        </div>

        <button 
          onClick={() => setCurrentView('create')}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-[15px] font-bold text-black transition-all hover:bg-white/90 shadow-md font-sans"
        >
          <Plus size={18} />
          Create a Character
        </button>

        <div className="flex flex-1 flex-col gap-8 overflow-y-auto scrollbar-hide pr-1">
          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Explore</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink 
                active={currentView === 'discover'} 
                icon={<Compass size={18} />} 
                label="Discover" 
                onClick={() => setCurrentView('discover')}
              />
              <SidebarLink icon={<Search size={18} />} label="Search" />
              <SidebarLink icon={<Library size={18} />} label="Memory" />
              <SidebarLink 
                active={currentView === 'blog'}
                icon={<BookOpen size={18} />} 
                label="Blog" 
                onClick={() => setCurrentView('blog')}
              />
            </div>
          </section>

          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Creative Studio</h4>
            <div className="flex flex-col gap-0.5">
              <SidebarLink 
                active={currentView === 'rewards'}
                icon={<PenTool size={18} />} 
                label="Write a story" 
                onClick={() => setCurrentView('rewards')}
              />
              <SidebarLink icon={<Award size={18} />} label="Rewards" badge="PRO" />
            </div>
          </section>

          <section>
            <h4 className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-white/30 font-sans">Recent</h4>
            <div className="flex flex-col gap-0.5">
              {FALLBACK_CHARACTERS.map((char, i) => (
                <button key={i} onClick={() => navigateToProfile(char)} className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all">
                  <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10"><img src={char.avatarUrl} className="w-full h-full object-cover" /></div>
                  <span className="truncate font-sans">{char.name}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 space-y-4">
           <SidebarLink icon={<Settings size={18} />} label="Settings" onClick={() => setCurrentView('settings')} />
           <div 
             onClick={() => setIsAuthOpen(true)}
             className="p-4 rounded-2xl bg-[#1e1428] border border-white/5 group cursor-pointer relative overflow-hidden transition-transform hover:scale-[1.02]"
           >
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col"><span className="text-[13px] font-bold text-white">Unlock with</span><span className="text-[13px] font-bold text-white">Agentwood+</span></div>
                <div className="h-10 w-12 bg-[#a855f7] rounded-md flex items-center justify-center font-black text-white text-[10px]">-50%</div>
             </div>
             <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-purple-500/10 blur-xl rounded-full"></div>
           </div>
        </div>
      </aside>

      <main className="flex-1 lg:pl-[260px] flex flex-col min-h-screen">
        {currentView === 'discover' && (
          <div className="fade-in">
            <div className="sticky top-0 z-40 w-full px-12 py-6 glass border-b border-white/5 flex items-center justify-between">
              <div className="flex-1 max-w-xl relative group">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-dipsea-accent transition-colors" />
                <input type="text" placeholder="Search characters..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-dipsea-accent transition-all font-sans" />
              </div>
              <div className="flex items-center gap-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer hover:text-white transition-colors font-sans">AFFILIATES</span>
                <Bell size={18} className="text-white/40 cursor-pointer" />
                <div className="h-10 w-10 rounded-full bg-purple-600 border border-white/20 flex items-center justify-center font-bold text-white">U</div>
              </div>
            </div>

            <LandingHero />

            <section className="px-12 py-16 bg-[#0c0c0c]">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-5xl font-serif italic text-white tracking-tight">Meet our Characters</h2>
                <button className="text-[10px] font-bold uppercase tracking-widest text-dipsea-accent border-b border-dipsea-accent hover:text-white hover:border-white transition-all font-sans">SEE ALL</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-4">
                {(loading ? FALLBACK_CHARACTERS : characters).slice(0, 12).map((char, i) => (
                  <CharacterPlayRow key={i} char={char} onClick={() => navigateToProfile(char)} />
                ))}
              </div>
            </section>

            <TestimonialSection />

            <ConnectionsSection 
              characters={loading ? FALLBACK_CHARACTERS : characters} 
              onSelect={navigateToProfile} 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
            />

            <section className="px-12 py-32 bg-black">
              <h3 className="text-2xl font-bold mb-16 tracking-tight font-sans">Roleplay</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
                {(loading ? FALLBACK_CHARACTERS : characters).map((char, i) => (
                  <CharacterCard 
                    key={i} 
                    character={char} 
                    onClick={() => navigateToProfile(char)} 
                  />
                ))}
              </div>
            </section>
            
            <Footer />
          </div>
        )}

        {currentView === 'blog' && <BlogPage />}

        {currentView === 'character' && selectedCharacter && (
          <CharacterProfileView character={selectedCharacter} onBack={() => setCurrentView('discover')} onChat={() => setCurrentView('create')} />
        )}

        {currentView === 'create' && selectedCharacter && (
          <ImmersiveChatView 
            character={selectedCharacter} 
            onBack={() => setCurrentView('character')} 
            onUpgrade={() => setIsAuthOpen(true)}
          />
        )}

        {currentView === 'settings' && <SettingsView onBack={() => setCurrentView('discover')} />}

        {currentView === 'rewards' && <WriteStoryView onBack={() => setCurrentView('discover')} />}
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

function CharacterProfileView({ character, onBack, onChat }: { character: CharacterProfile, onBack: () => void, onChat: () => void }) {
  const [activeTab, setActiveTab] = useState<'about' | 'starters' | 'similar'>('about');

  return (
    <div className="min-h-screen bg-[#0c0c0c] fade-in">
       <div className="px-12 py-8 flex items-center gap-4 border-b border-white/5">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </button>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/20 font-sans">Characters / {character.name}</span>
       </div>

       <div className="max-w-[1400px] mx-auto px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-[#1a1a1a] rounded-[32px] overflow-hidden border border-white/5 p-8 flex flex-col items-center text-center shadow-2xl">
                <div className="relative mb-8">
                  <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-dipsea-accent shadow-2xl">
                    <img src={character.avatarUrl} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 right-4 bg-green-500 h-6 w-6 rounded-full border-4 border-[#1a1a1a] shadow-lg"></div>
                </div>

                <h1 className="text-4xl font-bold font-sans tracking-tight mb-2">{character.name}</h1>
                <p className="text-dipsea-accent text-sm font-sans mb-10">{character.handle}</p>

                <button 
                  onClick={onChat}
                  className="w-full py-5 rounded-2xl bg-[#a855f7] text-white font-bold text-xl hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(168,85,247,0.3)] mb-4"
                >
                  Chat
                </button>

                <div className="flex gap-4 w-full mb-10">
                  <button className="flex-1 py-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><ThumbsUp size={20} /></button>
                  <button className="flex-1 py-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><ThumbsDown size={20} /></button>
                  <button className="flex-1 py-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><Share2 size={20} /></button>
                </div>

                <div className="w-full pt-10 flex gap-4">
                  <button className="flex-1 py-4 rounded-xl bg-white/10 text-white font-bold font-sans hover:bg-white/20 transition-all">Follow</button>
                  <button className="p-4 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all"><Bookmark size={20} /></button>
                </div>
             </div>
          </div>

          <div className="lg:col-span-8">
             <div className="bg-[#1a1a1a] rounded-[32px] border border-white/5 h-full overflow-hidden shadow-2xl">
                <div className="px-10 pt-10 border-b border-white/5 bg-black/20">
                   <div className="flex gap-10">
                      {[
                        {id: 'about', label: 'About'},
                        {id: 'starters', label: 'Chat Starters'},
                        {id: 'similar', label: 'Similar Characters'}
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`pb-6 text-sm font-bold font-sans transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-white/20 hover:text-white'}`}
                        >
                          {tab.label}
                          {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-dipsea-accent rounded-full"></div>}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="p-12 space-y-16">
                   <section className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold font-sans">About {character.name}</h2>
                        <span className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 font-sans">Content by AW</span>
                      </div>
                      <p className="text-white/60 text-lg font-sans leading-relaxed font-light">
                        {character.description}
                      </p>
                   </section>

                   <section className="space-y-8">
                      <div className="flex items-center gap-3 text-dipsea-accent">
                        <Bookmark size={20} />
                        <h3 className="text-xl font-bold font-sans">{character.name}'s Areas of Expertise</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                           {icon: <Sparkle size={18} />, title: "Engaging Conversation"},
                           {icon: <Heart size={18} />, title: "Emotional Intelligence"},
                           {icon: <Zap size={18} />, title: "Creative Thinking"},
                           {icon: <Sliders size={18} />, title: "Problem Solving"}
                         ].map((item, i) => (
                           <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all cursor-pointer">
                              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                                {item.icon}
                              </div>
                              <span className="font-bold text-white/60 font-sans">{item.title}</span>
                           </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
          </div>
       </div>
       <Footer />
    </div>
  );
}

function ImmersiveChatView({ character, onBack, onUpgrade }: { character: CharacterProfile, onBack: () => void, onUpgrade: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
          systemInstruction: `You are ${character.name}. ${character.description}. Speak in an intimate, editorial, and sophisticated tone. Keep responses brief and evocative. Start some responses with an italicized emotive action in lowercase brackets, e.g. [laughs softly].`
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "..." }]);
    } catch (error) { console.error(error); } finally { setIsTyping(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative font-sans">
       <div className="w-full bg-[#a855f7] py-2.5 px-6 flex items-center justify-between z-50 shadow-2xl">
          <div className="flex items-center gap-3 text-white">
             <Sparkle size={18} fill="white" />
             <div className="text-xs font-bold font-sans">
                Upgrade to Premium
                <span className="font-normal ml-2 opacity-80">Unlock unlimited chats, ad-free experience, and more!</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={onUpgrade}
               className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold font-sans hover:bg-white/90 transition-all"
             >
               Upgrade Now
             </button>
             <button className="text-white/40 hover:text-white transition-colors" onClick={onBack}><X size={18} /></button>
          </div>
       </div>

       <div className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center text-center z-10 w-full px-8 pointer-events-none">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 mb-4 shadow-2xl">
            <img src={character.avatarUrl} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold text-white font-sans tracking-tight">{character.name}</h2>
          <p className="text-white/40 text-sm italic mb-1 font-sans">{character.tagline}</p>
          <p className="text-[10px] uppercase font-bold text-white/20 tracking-[0.3em] font-sans">BY @{character.handle.replace('@','')}</p>
       </div>

       <div 
         ref={scrollRef}
         className="flex-1 overflow-y-auto pt-72 pb-32 px-12 lg:px-64 space-y-12 scrollbar-hide relative z-0"
       >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 animate-fade-in-up">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 max-w-md w-full relative shadow-2xl backdrop-blur-xl">
                 <p className="text-white font-sans leading-relaxed text-lg italic italic italic">
                    <span className="text-dipsea-accent font-bold italic">[softly]</span> Hello there. It's so good to finally connect. What's on your mind today?
                 </p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
               <div className={`max-w-[85%] lg:max-w-[70%] group flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-8 py-5 rounded-[32px] text-lg font-sans transition-all shadow-xl leading-relaxed ${m.role === 'user' ? 'bg-[#a855f7] text-white' : 'bg-[#1a1a1a] text-white/80 border border-white/5'}`}>
                    {m.text}
                  </div>
               </div>
            </div>
          ))}
          {isTyping && <div className="flex justify-start items-center gap-3"><Loader2 className="animate-spin text-dipsea-accent" size={20} /><span className="text-xs text-white/20 font-bold uppercase tracking-widest font-sans">The Wood Whispers...</span></div>}
       </div>

       <div className="absolute right-0 top-0 bottom-0 w-[450px] pointer-events-none z-0 hidden lg:block opacity-20">
          <div className="w-full h-full bg-gradient-to-l from-transparent via-black/40 to-black absolute inset-0 z-10"></div>
          <img src={character.avatarUrl} className="w-full h-full object-cover grayscale blur-[2px]" />
          <div className="absolute bottom-16 left-16 z-20 pointer-events-auto">
             <div className="flex items-center gap-6 mb-8">
                <span className="flex items-center gap-2 text-[10px] font-bold text-green-500 font-sans uppercase tracking-widest"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div> Online</span>
                <span className="text-[10px] font-bold text-white/20 font-sans uppercase tracking-widest">|</span>
                <span className="text-[10px] font-bold text-white/40 font-sans uppercase tracking-widest">Active Partner</span>
             </div>
             <div className="flex gap-4">
                <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all hover:bg-white/10"><Info size={24} /></button>
                <button className="p-4 rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all hover:bg-white/10"><Library size={24} /></button>
             </div>
          </div>
       </div>

       <div className="absolute bottom-0 left-0 right-0 p-12 lg:px-64 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
          <div className="max-w-4xl mx-auto relative group">
             <input 
               value={input} 
               onChange={(e) => setInput(e.target.value)} 
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder={`Message ${character.name}...`} 
               className="w-full bg-[#1a1a1a] border border-white/10 py-6 px-10 pr-20 rounded-full text-lg font-sans outline-none focus:border-dipsea-accent transition-all placeholder:text-white/10 shadow-2xl relative z-10"
             />
             <button onClick={handleSend} className="absolute right-8 top-1/2 -translate-y-1/2 text-dipsea-accent hover:scale-110 transition-all z-20"><Send size={24} /></button>
          </div>
       </div>
    </div>
  );
}

function WriteStoryView({ onBack }: { onBack: () => void }) {
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [story, setStory] = useState<string | null>(null);

  const toggleChar = (name: string) => {
    setSelectedChars(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const generateStory = async () => {
    if (selectedChars.length === 0) return;
    setIsGenerating(true);
    setStory(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Write a short, intimate, and evocative lifestyle story featuring these characters: ${selectedChars.join(', ')}. 
      Tone: Dipsea Stories, slow-burn, editorial, high-end lifestyle. 
      Focus on a shared moment, a dinner, or a journey. Max 300 words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setStory(response.text || "The wood remained silent.");
    } catch (error) {
      console.error(error);
      setStory("The ink ran dry. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] fade-in">
       <div className="px-12 py-24 max-w-[1200px] mx-auto space-y-16">
          <div className="flex items-center justify-between">
             <div className="space-y-4">
               <h1 className="text-8xl font-serif italic tracking-tighter">Write a story.</h1>
               <p className="text-white/40 text-2xl font-sans italic">Select characters to weave a new narrative.</p>
             </div>
             <button onClick={onBack} className="text-white/20 hover:text-white transition-colors"><X size={48} /></button>
          </div>

          <section className="space-y-12">
             <div className="flex items-center gap-4 text-dipsea-accent">
                <History size={24} />
                <h3 className="text-xl font-bold font-sans uppercase tracking-[0.4em]">RECENT ENCOUNTERS</h3>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {FALLBACK_CHARACTERS.map((char, i) => (
                   <div 
                     key={i} 
                     onClick={() => toggleChar(char.name)}
                     className={`relative aspect-[3/4] rounded-[32px] overflow-hidden cursor-pointer border-4 transition-all duration-500 ${selectedChars.includes(char.name) ? 'border-dipsea-accent scale-105 shadow-[0_0_50px_rgba(194,149,110,0.3)]' : 'border-white/5 grayscale opacity-40 hover:grayscale-0 hover:opacity-80'}`}
                   >
                      <img src={char.avatarUrl} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                         <span className="text-sm font-bold font-sans text-white">{char.name}</span>
                         {selectedChars.includes(char.name) && <div className="h-6 w-6 rounded-full bg-dipsea-accent flex items-center justify-center text-black"><Check size={12} strokeWidth={4} /></div>}
                      </div>
                   </div>
                ))}
             </div>
          </section>

          <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-12">
             <button 
               onClick={generateStory}
               disabled={selectedChars.length === 0 || isGenerating}
               className="px-20 py-8 rounded-full bg-white text-black font-bold text-xl uppercase tracking-[0.5em] shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105 transition-all disabled:opacity-20 disabled:scale-100 flex items-center gap-6"
             >
                {isGenerating ? <><Loader2 className="animate-spin" /> Weaving...</> : <><Feather size={28} /> Create Story</>}
             </button>

             {story && (
                <div className="w-full p-20 rounded-[80px] bg-[#1a1a1a] border border-white/5 animate-fade-in-up shadow-2xl">
                   <div className="max-w-2xl mx-auto space-y-16">
                      <div className="flex justify-center"><PenTool className="text-dipsea-accent" size={48} /></div>
                      <div className="prose prose-invert prose-2xl mx-auto">
                         <p className="text-white/80 font-sans leading-[2.2] text-2xl font-light italic whitespace-pre-wrap">
                            {story}
                         </p>
                      </div>
                      <div className="flex justify-center gap-12 pt-16 border-t border-white/5">
                         <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white/40 font-bold font-sans hover:text-white transition-all"><Share2 size={20} /> Share</button>
                         <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white/40 font-bold font-sans hover:text-white transition-all"><Bookmark size={20} /> Save</button>
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
       <Footer />
    </div>
  );
}

const SettingsView = ({ onBack }: { onBack: () => void }) => (
  <div className="p-24 fade-in min-h-screen">
     <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white mb-16 font-sans transition-colors">
        <ChevronLeft size={14} /> Back
      </button>
     <h1 className="text-8xl font-serif italic tracking-tighter mb-16">Settings.</h1>
     <p className="text-white/40 text-xl font-sans italic">Profile and account management coming soon.</p>
  </div>
);

const CreateView = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen flex flex-col">
    <div className="flex-1 p-24 fade-in max-w-4xl mx-auto w-full">
      <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 hover:text-white mb-16 font-sans transition-colors">
        <ChevronLeft size={14} /> Back
      </button>
      <h1 className="text-8xl font-serif italic tracking-tighter mb-16">Create.</h1>
      <div className="space-y-16">
        <div className="flex flex-col gap-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 font-sans">Name</label>
          <input type="text" placeholder="Character Name" className="bg-transparent border-b border-white/10 py-6 text-4xl font-serif italic outline-none focus:border-dipsea-accent transition-colors font-sans" />
        </div>
        <div className="flex flex-col gap-6">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 font-sans">Voice Prompt</label>
          <textarea rows={4} placeholder="Describe their persona..." className="bg-transparent border-b border-white/10 py-6 text-2xl italic outline-none focus:border-dipsea-accent resize-none transition-colors font-sans" />
        </div>
        <button className="w-full py-8 bg-dipsea-accent text-white font-bold uppercase tracking-[0.5em] text-[13px] hover:bg-white hover:text-black transition-all font-sans shadow-2xl">Initialize</button>
      </div>
    </div>
    <Footer />
  </div>
);
