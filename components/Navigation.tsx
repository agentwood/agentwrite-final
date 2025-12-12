
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Feather, ChevronDown, ArrowRight, Sparkles, Menu, X, Layout, Users, CreditCard, LogOut, User, Settings, FileText, BookOpen, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleMouseEnter = (menu: string) => setActiveDropdown(menu);
    const handleMouseLeave = () => setActiveDropdown(null);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const MobileLink = ({ onClick, icon: Icon, label, desc }: any) => (
        <button onClick={onClick} className="w-full flex items-start gap-4 p-3 rounded-xl hover:bg-stone-50 active:bg-stone-100 text-left transition-colors">
            <div className="p-2 bg-white border border-stone-200 rounded-lg text-slate-600">
                <Icon size={18} />
            </div>
            <div>
                <div className="font-bold text-slate-900 text-sm">{label}</div>
                <div className="text-xs text-slate-500">{desc}</div>
            </div>
        </button>
    );

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-stone-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between relative">

                {/* Logo */}
                <div className="flex items-center gap-2 cursor-pointer z-20" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center">
                        <Feather size={16} strokeWidth={2} />
                    </div>
                    <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">AgentWrite</span>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-900 p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Center Menu (Desktop) */}
                <div className="hidden md:flex items-center gap-1">

                    {/* Product Dropdown */}
                    <div
                        className="relative px-4 py-6 cursor-pointer group"
                        onMouseEnter={() => handleMouseEnter('product')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">
                            Product <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                        </span>

                        {/* Dropdown Content */}
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[500px] transition-all duration-200 ${activeDropdown === 'product' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                            <div className="bg-white rounded-xl shadow-xl border border-stone-100 p-6 grid grid-cols-2 gap-4 overflow-hidden">
                                <div className="space-y-4">
                                    <div className="group/item cursor-pointer" onClick={() => navigate('/dashboard')}>
                                        <h4 className="text-slate-900 font-serif font-bold">The Studio</h4>
                                        <p className="text-xs text-slate-500 mt-1">Distraction-free writing environment with AI powers.</p>
                                    </div>
                                    <div className="group/item cursor-pointer" onClick={() => navigate('/brainstorm')}>
                                        <h4 className="text-slate-900 font-serif font-bold">Brainstorm Engine</h4>
                                        <p className="text-xs text-slate-500 mt-1">Generate plot points, characters, and worlds instantly.</p>
                                    </div>
                                    <div className="group/item cursor-pointer" onClick={() => navigate('/create')}>
                                        <h4 className="text-indigo-600 font-serif font-bold flex items-center gap-2"><Sparkles size={12} /> AI Create</h4>
                                        <p className="text-xs text-slate-500 mt-1">Interactive storytelling wizard. Build scenes instantly.</p>
                                    </div>
                                </div>
                                <div className="bg-stone-50 p-4 rounded-lg">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">New Feature</h4>
                                    <div className="font-medium text-slate-900 text-sm mb-1">Media Lab</div>
                                    <p className="text-xs text-slate-500 mb-3">Turn your stories into audiobooks and video trailers.</p>
                                    <div className="text-amber-600 text-xs font-bold flex items-center gap-1">Try it now <ArrowRight size={10} /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Individuals Dropdown */}
                    <div
                        className="relative px-4 py-6 cursor-pointer group"
                        onMouseEnter={() => handleMouseEnter('individuals')}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition">
                            Individuals <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === 'individuals' ? 'rotate-180' : ''}`} />
                        </span>

                        <div className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 transition-all duration-200 ${activeDropdown === 'individuals' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                            <div className="bg-white rounded-xl shadow-xl border border-stone-100 p-2 overflow-hidden">
                                <div onClick={() => navigate('/students')} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition">
                                    <div className="text-slate-900 font-medium text-sm">For Students</div>
                                    <p className="text-xs text-slate-400">Ace your creative writing assignments.</p>
                                </div>
                                <div onClick={() => navigate('/creators')} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition">
                                    <div className="text-slate-900 font-medium text-sm">For Content Creators</div>
                                    <p className="text-xs text-slate-400">Script videos and blogs 10x faster.</p>
                                </div>
                                <div onClick={() => navigate('/dashboard')} className="p-3 hover:bg-stone-50 rounded-lg cursor-pointer transition">
                                    <div className="text-slate-900 font-medium text-sm">For Novelists</div>
                                    <p className="text-xs text-slate-400">Finish your manuscript this month.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-6 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition" onClick={() => navigate('/articles')}>Articles</div>
                    <div className="px-4 py-6 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition" onClick={() => navigate('/help')}>Help</div>
                    {user && (
                        <div className="px-4 py-6 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition" onClick={() => navigate('/blog-admin')}>Blog Admin</div>
                    )}
                    <div className="px-4 py-6 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition" onClick={() => navigate('/pricing')}>Pricing</div>
                    <div className="px-4 py-6 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-900 transition" onClick={() => navigate('/')}>About</div>
                </div>

                {/* Right Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div
                            className="relative group"
                            onMouseEnter={() => handleMouseEnter('profile')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-full transition-colors">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center">
                                    <User size={16} />
                                </div>
                                <ChevronDown size={14} className="text-slate-600" />
                            </button>

                            {/* Profile Dropdown */}
                            <div className={`absolute top-full right-0 pt-2 w-48 transition-all duration-200 ${activeDropdown === 'profile' ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}>
                                <div className="bg-white rounded-xl shadow-xl border border-stone-100 p-2 overflow-hidden">
                                    <div className="px-3 py-2 border-b border-stone-100 mb-1">
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                        <User size={14} /> Profile
                                    </button>
                                    <button onClick={() => navigate('/blog-admin')} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                        <FileText size={14} /> Blog Admin
                                    </button>
                                    <button onClick={() => navigate('/settings')} className="w-full text-left px-3 py-2 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-2">
                                        <Settings size={14} /> Settings
                                    </button>
                                    <button onClick={handleSignOut} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2 mt-1">
                                        <LogOut size={14} /> Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/signup', { state: { mode: 'login' } })}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-medium hover:border-slate-900 transition bg-white"
                            >
                                Log in
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-lg shadow-slate-200 hover:shadow-xl text-sm"
                            >
                                Start Writing Free
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-stone-200 shadow-2xl p-6 flex flex-col gap-2 z-40 animate-fade-in-down max-h-[85vh] overflow-y-auto">
                    <div className="mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Product</h3>
                        <MobileLink onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false) }} icon={Layout} label="The Studio" desc="Main Writing Dashboard" />
                        <MobileLink onClick={() => { navigate('/create'); setIsMobileMenuOpen(false) }} icon={Sparkles} label="AI Create" desc="Interactive Story Engine" />
                        <MobileLink onClick={() => { navigate('/brainstorm'); setIsMobileMenuOpen(false) }} icon={Feather} label="Brainstorm" desc="Idea Generator" />
                        <MobileLink onClick={() => { navigate('/articles'); setIsMobileMenuOpen(false) }} icon={BookOpen} label="Articles" desc="The Journal" />
                        <MobileLink onClick={() => { navigate('/help'); setIsMobileMenuOpen(false) }} icon={HelpCircle} label="Help" desc="Support & Docs" />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account</h3>
                        <MobileLink onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false) }} icon={CreditCard} label="Pricing" desc="Plans & Credits" />
                        {!user && (
                            <MobileLink onClick={() => { navigate('/signup', { state: { mode: 'login' } }); setIsMobileMenuOpen(false) }} icon={Users} label="Sign In / Up" desc="Manage Account" />
                        )}
                    </div>

                    {user ? (
                        <>
                            <div className="border-t border-stone-100 pt-4 mt-2">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                        <p className="text-xs text-slate-500">Logged In</p>
                                    </div>
                                </div>
                                <button onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false) }} className="w-full text-left px-3 py-3 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-3">
                                    <User size={16} /> Profile
                                </button>
                                <button onClick={() => { navigate('/blog-admin'); setIsMobileMenuOpen(false) }} className="w-full text-left px-3 py-3 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-3">
                                    <FileText size={16} /> Blog Admin
                                </button>
                                <button onClick={() => { navigate('/settings'); setIsMobileMenuOpen(false) }} className="w-full text-left px-3 py-3 hover:bg-stone-50 rounded-lg text-sm text-slate-700 flex items-center gap-3">
                                    <Settings size={16} /> Settings
                                </button>
                                <button onClick={handleSignOut} className="w-full text-left px-3 py-3 hover:bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-3">
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false) }}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-2"
                        >
                            Start Writing Free
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navigation;
