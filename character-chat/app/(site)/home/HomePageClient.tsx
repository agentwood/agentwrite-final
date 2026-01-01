'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, ChevronLeft, ChevronRight, MessageSquare, Star, Sparkle } from 'lucide-react';
import SafeImage from '../../components/SafeImage';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

interface Character {
    id: string;
    seedId: string;
    name: string;
    handle: string;
    description: string;
    category: string;
    avatarUrl: string;
    totalChats: string;
    prompts: string[];
    tags: string[];
}

interface Props {
    characters: Character[];
    categories: string[];
    heroStates: any[];
    starters?: any[];
    assistants?: any[];
}

const CATEGORIES = ['All', 'Play & Fun', 'Helper', 'Original', 'Anime & Game', 'Fiction & Media'];

// Emoji categories for the slideshow - each emoji filters different character types
const EMOJI_CATEGORIES = [
    { emoji: '😍', label: 'Romance', filter: 'Romance', bgColor: 'bg-rose-100', borderColor: 'border-rose-400' },
    { emoji: '🤪', label: 'Fun', filter: 'Play & Fun', bgColor: 'bg-amber-100', borderColor: 'border-amber-400' },
    { emoji: '👻', label: 'Spooky', filter: 'Fiction & Media', bgColor: 'bg-slate-200', borderColor: 'border-slate-400' },
    { emoji: '😈', label: 'Villain', filter: 'Anime & Game', bgColor: 'bg-purple-200', borderColor: 'border-purple-400' },
];

const EmojiPill = ({ emoji, bgColor, borderColor, active, onClick }: {
    emoji: string;
    bgColor: string;
    borderColor: string;
    active?: boolean;
    onClick?: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${active
            ? `${bgColor} shadow-lg scale-110 ring-4 ${borderColor} ring-offset-2 ring-offset-[#0f0f0f]`
            : 'bg-white/10 hover:bg-white/20 hover:scale-105'
            }`}
    >
        {emoji}
    </button>
);

const CharacterCard = ({ character, onClick }: { character: Character; onClick?: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Get description from character.description or character.handle or tagline
    const description = character.description || character.handle || `Meet ${character.name}, ready to chat with you.`;

    return (
        <Link
            href={`/character/${character.id}`}
            onClick={onClick}
            className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#1a1a1a] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Image - fades on hover */}
            <SafeImage
                src={character.avatarUrl}
                alt={character.name}
                className={`h-full w-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 opacity-30 blur-[2px]' : 'scale-100 opacity-100'}`}
                fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
            />

            {/* Default gradient overlay (always visible) */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}></div>

            {/* Default bottom info (name/stats) - hides on hover */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 text-white z-10 transition-all duration-300 ${isHovered ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                <h3 className="text-sm font-black leading-tight mb-1 truncate">{character.name}</h3>
                <div className="flex items-center gap-1.5 opacity-60 mb-2">
                    <MessageSquare size={10} className="stroke-[3]" />
                    <span className="text-[10px] font-black">{character.totalChats}</span>
                </div>
                <p className="text-[10px] opacity-70 line-clamp-2 font-medium leading-relaxed">
                    {character.handle}
                </p>
            </div>

            {/* Hover overlay with description */}
            <div className={`absolute inset-0 bg-[#1a1a1a]/95 flex flex-col p-5 transition-all duration-400 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Avatar thumbnail */}
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 mb-4 shadow-lg flex-shrink-0">
                    <SafeImage
                        src={character.avatarUrl}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`}
                    />
                </div>

                {/* Description text */}
                <p className="text-white/90 text-sm leading-relaxed flex-1 overflow-hidden line-clamp-6">
                    {description}
                </p>

                {/* Chat Now button */}
                <button className="w-full mt-4 py-3 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors flex-shrink-0">
                    <MessageSquare size={16} />
                    Chat Now
                </button>
            </div>

            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
        </Link>
    );
};

export default function HomePageClient({ characters, categories, heroStates, starters = [], assistants = [] }: Props) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [carouselIndex, setCarouselIndex] = useState(2);
    const [activeEmoji, setActiveEmoji] = useState(0);
    const [poolIndex, setPoolIndex] = useState(2);
    const [showComingSoon, setShowComingSoon] = useState(false);

    const filteredCharacters = characters.filter(char =>
        activeCategory === 'All' || char.category === activeCategory
    );

    // Filter featured characters based on emoji selection
    const emojiFilter = EMOJI_CATEGORIES[activeEmoji]?.filter || 'All';
    const featuredCharacters = emojiFilter === 'All'
        ? characters.slice(0, 5)
        : characters.filter(c => c.category === emojiFilter || c.category?.includes(emojiFilter.split(' ')[0])).slice(0, 5).length > 0
            ? characters.filter(c => c.category === emojiFilter || c.category?.includes(emojiFilter.split(' ')[0])).slice(0, 5)
            : characters.slice(0, 5);

    const handlePoolClick = () => {
        setShowComingSoon(true);
        setTimeout(() => setShowComingSoon(false), 2000);
    };

    return (
        <div className="flex min-h-screen font-sans selection:bg-purple-500 selection:text-white transition-colors duration-500 bg-[#0f0f0f] text-white">
            <Sidebar
                recentCharacters={characters.slice(0, 3).map(p => ({
                    id: p.id,
                    name: p.name,
                    avatarUrl: p.avatarUrl,
                    category: p.category,
                }))}
            />

            <main className="flex-1 lg:pl-60 flex flex-col">
                {/* Header */}
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
                        <button className="text-[12px] font-semibold transition-colors text-white/40 hover:text-white">
                            Affiliates
                        </button>
                        <div className="h-4 w-px opacity-10 bg-white"></div>
                        <button className="relative opacity-30 hover:opacity-100 transition-colors">
                            <Bell size={18} />
                            <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        </button>
                        <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white ring-2 ring-purple-500/20">U</div>
                    </div>
                </header>

                <div className="flex-1">
                    <div className="fade-in">
                        {/* Hero Section */}
                        <section className="relative overflow-hidden px-10 py-16">
                            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                                <div className="flex-1">
                                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
                                        ARE YOU... <Sparkle size={10} className="text-white/60" />
                                    </p>
                                    <h1 className="mb-8 text-6xl font-black tracking-tight leading-[1] font-serif">
                                        Looking for <br />
                                        connections?
                                    </h1>
                                    <div className="flex gap-3">
                                        {EMOJI_CATEGORIES.map((cat, i) => (
                                            <EmojiPill
                                                key={i}
                                                emoji={cat.emoji}
                                                bgColor={cat.bgColor}
                                                borderColor={cat.borderColor}
                                                active={activeEmoji === i}
                                                onClick={() => {
                                                    setActiveEmoji(i);
                                                    setCarouselIndex(0);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Carousel */}
                                <div className="flex flex-1 items-center justify-center gap-6 perspective-1000 relative">
                                    <button
                                        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                        className="absolute left-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 z-30"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="flex items-center gap-4 transition-transform duration-500">
                                        {featuredCharacters.map((c, i) => (
                                            <div
                                                key={i}
                                                className={`rounded-2xl overflow-hidden relative shadow-2xl transition-all duration-500 hover:scale-105 border border-white/10 cursor-pointer flex-shrink-0 ${i === carouselIndex ? 'w-52 aspect-[3/4.5] z-20 scale-110 shadow-purple-500/10' : 'w-36 aspect-[3/4.5] opacity-40 hover:opacity-100'
                                                    }`}
                                            >
                                                {c.avatarUrl ? <img src={c.avatarUrl} className="w-full h-full object-cover" alt={c.name} /> : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">{c.name.charAt(0)}</div>}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <p className="text-[12px] font-black mb-1 truncate">{c.name}</p>
                                                    <div className="flex items-center gap-1.5 opacity-60 text-[9px] font-black">
                                                        <MessageSquare size={10} /> {c.totalChats}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCarouselIndex(Math.min(featuredCharacters.length - 1, carouselIndex + 1))}
                                        className="absolute right-0 h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 z-30"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
                        </section>

                        {/* Category Filters */}
                        <div className="px-10 py-6">
                            <div className="mb-10 flex flex-wrap items-center gap-2">
                                <h3 className="mr-6 text-[10px] font-black tracking-tight text-white/40 uppercase flex items-center gap-2">
                                    FOR YOU <Sparkle size={12} className="opacity-40" />
                                </h3>
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black transition-all border ${activeCategory === cat
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/5'
                                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                                            }`}
                                    >
                                        {cat === 'All' && <Star size={12} className="fill-current" />}
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Character Grid */}
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
                                    {filteredCharacters.slice(0, 21).map((char) => (
                                        <CharacterCard key={char.id} character={char} />
                                    ))}
                                </div>
                            </section>

                            {/* Live Sections - Added from screenshot */}
                            <section className="py-10 border-t border-white/5">
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded">LIVE</span>
                                        <h2 className="text-xl font-black">Oren (Challenge) live video</h2>
                                    </div>
                                    <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                                        {featuredCharacters.slice(0, 8).map((char, i) => (
                                            <div key={i} className="relative flex-shrink-0 w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 cursor-pointer hover:scale-105 transition-transform">
                                                {char.avatarUrl ? <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} /> : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">{char.name.charAt(0)}</div>}
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                                    LIVE
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                                                <div className="absolute bottom-2 left-2 right-2">
                                                    <p className="text-white text-[10px] font-black truncate">{char.name}</p>
                                                    <p className="text-white/60 text-[8px] truncate">{char.totalChats} watching</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Coming Soon Toast */}
                                {showComingSoon && (
                                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-6 py-3 rounded-xl shadow-2xl animate-bounce">
                                        🚀 Live Pools coming soon!
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                                        Agentwood Pool <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">LIVE</span>
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 w-full">
                                        <button
                                            onClick={() => setPoolIndex(Math.max(0, poolIndex - 1))}
                                            className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div className="flex items-center justify-center gap-3 flex-1 overflow-hidden px-4">
                                            {characters.slice(0, 10).map((char, i) => (
                                                <div
                                                    key={i}
                                                    onClick={handlePoolClick}
                                                    className={`transition-all duration-300 cursor-pointer group flex-shrink-0 ${i === poolIndex
                                                        ? 'scale-125 z-10'
                                                        : Math.abs(i - poolIndex) === 1
                                                            ? 'scale-100 opacity-80'
                                                            : Math.abs(i - poolIndex) === 2
                                                                ? 'scale-90 opacity-50'
                                                                : 'scale-75 opacity-30'
                                                        }`}
                                                >
                                                    <div className={`rounded-full overflow-hidden border-2 transition-all duration-300 ${i === poolIndex
                                                        ? 'w-20 h-20 border-purple-500 shadow-lg shadow-purple-500/30'
                                                        : 'w-14 h-14 border-white/10 group-hover:w-16 group-hover:h-16 group-hover:border-purple-400'
                                                        }`}>
                                                        {char.avatarUrl ? (
                                                            <img src={char.avatarUrl} className="w-full h-full object-cover" alt={char.name} />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                                {char.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setPoolIndex(Math.min(9, poolIndex + 1))}
                                            className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <div className="text-center mt-6">
                                        <p className="text-base font-black">{characters[poolIndex]?.name || 'Character'}</p>
                                        <p className="text-sm text-white/40 mt-1">💬 "{characters[poolIndex]?.handle || 'Click to join the conversation!'}"</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-black mb-4">Roleplay</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                                        {filteredCharacters.slice(0, 14).map((char) => (
                                            <CharacterCard key={char.id} character={char} />
                                        ))}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
}
