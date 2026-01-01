import React, { useState, useMemo } from 'react';
import { Character } from '../types';
import { ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, ChevronRight, Sparkles, User, Send, Heart, Flag, EyeOff } from 'lucide-react';

interface CharacterProfileProps {
  character: Character;
  onBack: () => void;
  onChat: () => void;
  similarCharacters: Character[];
}

const MOCK_COMMENTS = [
  { id: 1, user: 'StarGazer99', text: 'Actually gives really good advice for my specific situation. Impressive!', date: '2h ago', timestamp: 1700000000000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&q=80', likes: 12 },
  { id: 2, user: 'PixelWarrior', text: 'Love the personality quirks. Feels very real.', date: '5h ago', timestamp: 1699990000000, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&q=80', likes: 8 },
  { id: 3, user: 'AnimeFan_X', text: 'Can we get a voice update? It\'s a bit fast.', date: '1d ago', timestamp: 1699900000000, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=50&q=80', likes: 3 },
  { id: 4, user: 'CozyReader', text: 'This character is exactly what I needed today. So wholesome.', date: '2d ago', timestamp: 1699000000000, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=50&q=80', likes: 24 },
];

export const CharacterProfile: React.FC<CharacterProfileProps> = ({ character, onBack, onChat, similarCharacters }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'starters' | 'comments' | 'similar'>('about');
  const [commentInput, setCommentInput] = useState('');
  
  // Sorting and Moderation State
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
  const [hiddenComments, setHiddenComments] = useState<number[]>([]);
  const [activeMenuCommentId, setActiveMenuCommentId] = useState<number | null>(null);

  const expertise = character.tags?.slice(0, 3).join(', ') || 'General Assistance';

  const handleReport = (id: number) => {
    // In a real app, this would send a report to the backend
    alert('Comment reported. Thank you for helping keep our community safe.');
    setActiveMenuCommentId(null);
  };

  const handleHide = (id: number) => {
    setHiddenComments(prev => [...prev, id]);
    setActiveMenuCommentId(null);
  };

  const visibleComments = useMemo(() => {
    // 1. Filter out hidden comments
    const filtered = MOCK_COMMENTS.filter(c => !hiddenComments.includes(c.id));
    
    // 2. Sort based on selection
    return filtered.sort((a, b) => {
        if (sortOption === 'newest') return b.timestamp - a.timestamp;
        if (sortOption === 'oldest') return a.timestamp - b.timestamp;
        if (sortOption === 'most_liked') return b.likes - a.likes;
        return 0;
    });
  }, [hiddenComments, sortOption]);
  
  return (
    <div className="bg-white min-h-screen z-50 absolute inset-0 overflow-y-auto animate-fade-in text-gray-900 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="font-semibold text-sm text-gray-500 uppercase tracking-wider">
            Profile
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <MoreHorizontal size={20} />
        </button>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 pb-32">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8 animate-slide-up">
            <div className="relative mb-4 group cursor-pointer">
                <div className="w-32 h-32 rounded-full p-1 border-2 border-gray-100 shadow-sm overflow-hidden">
                    <img 
                        src={character.avatarUrl} 
                        alt={character.name} 
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                </div>
                <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Online"></div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{character.name}</h1>
            <p className="text-sm text-gray-500 font-medium mb-6">By {character.handle}</p>
            
            <div className="flex items-center gap-3 mb-8 w-full justify-center max-w-md">
                <button 
                    onClick={onChat}
                    className="flex-1 bg-black text-white py-3 px-8 rounded-full font-semibold shadow-lg hover:bg-gray-800 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    <MessageCircle size={18} className="fill-current" />
                    Chat
                </button>
                
                <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                    <ThumbsUp size={20} />
                </button>
                <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                    <Share2 size={20} />
                </button>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                    <MessageCircle size={16} />
                    <span>{character.totalChats || '24.6k'}</span>
                </div>
                 <div className="flex items-center gap-1.5">
                    <Heart size={16} />
                    <span>{Math.floor(Math.random() * 500) + 20}</span>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[65px] bg-white z-30 pt-2">
            <div className="flex items-center justify-center gap-8 border-b border-gray-100 mb-8 overflow-x-auto scrollbar-hide">
                {[
                { id: 'about', label: 'About' },
                { id: 'starters', label: 'Chat Starters' },
                { id: 'comments', label: `Comments (${visibleComments.length})` },
                { id: 'similar', label: 'Similar' }
                ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 text-sm font-semibold transition-all relative whitespace-nowrap px-2 ${
                        activeTab === tab.id 
                        ? 'text-gray-900' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {tab.label}
                    {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
                    )}
                </button>
                ))}
            </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px] animate-fade-in">
            {/* About Tab */}
            {activeTab === 'about' && (
                <section className="space-y-6 animate-slide-up">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-base">
                            {character.description}
                            <br /><br />
                            Leading a narrative that focuses on {character.tags?.join(', ')}. 
                            Always ready to engage in deep conversation or light-hearted banter depending on the mood.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide opacity-70">Expertise</h4>
                            <p className="text-gray-700 font-medium">
                                {expertise}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide opacity-70">Simple Pleasures</h4>
                            <p className="text-gray-700 font-medium italic">
                                "A quiet morning coffee, a good book, or a hearty laugh."
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {character.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Chat Starters Tab */}
            {activeTab === 'starters' && (
                <section className="space-y-3 animate-slide-up">
                    {character.prompts ? character.prompts.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={onChat} 
                            className="w-full text-left bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl flex items-center justify-between group transition-all hover:shadow-sm border border-transparent hover:border-gray-200"
                        >
                            <span className="text-gray-700 font-medium text-lg">"{prompt}"</span>
                            <div className="bg-white p-2 rounded-full text-gray-300 group-hover:text-black transition-colors shadow-sm">
                                <Send size={16} className="ml-0.5" />
                            </div>
                        </button>
                    )) : (
                        <div className="text-center py-10 text-gray-400">
                            No custom starters available.
                        </div>
                    )}
                </section>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
                <section className="space-y-6 animate-slide-up">
                    {/* Comment Input */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 border border-gray-100 focus-within:ring-2 focus-within:ring-black/5 transition-shadow">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                            <User size={20} />
                        </div>
                        <input 
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder={`Type your comment about ${character.name}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400"
                        />
                        <button 
                            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-gray-800" 
                            disabled={!commentInput.trim()}
                        >
                            Post
                        </button>
                    </div>

                    {/* Sorting Controls */}
                    <div className="flex items-center justify-between pt-2 border-b border-gray-100 pb-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {visibleComments.length} Comments
                        </span>
                        <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as any)}
                            className="text-sm border-none bg-transparent font-medium text-gray-500 hover:text-gray-900 cursor-pointer focus:ring-0"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="most_liked">Most Liked</option>
                        </select>
                    </div>
                    
                    {/* Comment List */}
                    <div className="space-y-6">
                        {visibleComments.map(comment => (
                            <div key={comment.id} className="flex gap-4 group relative">
                                <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-100" />
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between pr-8">
                                        <h4 className="font-bold text-sm text-gray-900">{comment.user}</h4>
                                        <span className="text-xs text-gray-400">{comment.date}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{comment.text}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 transition-colors">
                                            <ThumbsUp size={14} /> {comment.likes}
                                        </button>
                                        <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium">
                                            Reply
                                        </button>
                                    </div>
                                </div>

                                {/* Comment Moderation Menu */}
                                <div className="absolute top-0 right-0">
                                    <button 
                                        onClick={() => setActiveMenuCommentId(activeMenuCommentId === comment.id ? null : comment.id)}
                                        className={`p-1 rounded-full transition-all ${
                                            activeMenuCommentId === comment.id 
                                            ? 'bg-gray-100 text-gray-900 opacity-100' 
                                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50 opacity-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        <MoreHorizontal size={16} />
                                    </button>
                                    
                                    {activeMenuCommentId === comment.id && (
                                        <div className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 animate-scale-up origin-top-right">
                                            <button 
                                                onClick={() => handleReport(comment.id)}
                                                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                                            >
                                                <Flag size={14} /> Report
                                            </button>
                                            <button 
                                                onClick={() => handleHide(comment.id)}
                                                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                            >
                                                <EyeOff size={14} /> Hide
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Similar Characters Tab */}
            {activeTab === 'similar' && (
                <section className="animate-slide-up">
                    {similarCharacters.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {similarCharacters.slice(0, 4).map(char => (
                                <div key={char.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer group hover:border-gray-200">
                                    <img src={char.avatarUrl} alt={char.name} className="w-14 h-14 rounded-xl object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{char.name}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{char.description}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-50 group-hover:bg-black group-hover:text-white text-xs font-bold rounded-full transition-colors">
                                        Chat
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400">
                            No similar characters found.
                        </div>
                    )}
                </section>
            )}
        </div>
      </main>
    </div>
  );
};