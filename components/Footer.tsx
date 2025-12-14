import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Feather } from 'lucide-react';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-white border-t border-stone-200 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center">
                                <Feather size={16} strokeWidth={2} />
                            </div>
                            <span className="font-serif font-bold text-xl text-slate-900 tracking-tight">AgentWrite</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            The AI-powered creative suite that turns vague ideas into best-selling manuscripts, viral scripts, and immersive audiobooks.
                        </p>
                        <p className="text-xs text-slate-400">
                            AgentWrite is a subsidiary of Agentwood
                        </p>
                    </div>

                    {/* Learn Column */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Learn</h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => navigate('/video-ideas-generator')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Video Ideas Generator
                                </button>
                            </li>
                            <li>
                                <a href="https://docs.agentwood.xyz" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                                    Docs
                                </a>
                            </li>
                            <li>
                                <button onClick={() => navigate('/changelog')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Changelog
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/faq')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    FAQ
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/resources')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Free Tools
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/pricing')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Pricing
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/articles')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Blog
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/help')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Help
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Connect</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://discord.com/invite/agentwood" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                                    Discord
                                </a>
                            </li>
                            <li>
                                <a href="https://x.com/agentwoodstudio" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                                    X (Twitter)
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@agentwood.xyz" className="text-sm text-slate-600 hover:text-slate-900 transition">
                                    Email Us
                                </a>
                            </li>
                            <li>
                                <button onClick={() => navigate('/pricing')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Become an Affiliate
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <button onClick={() => navigate('/terms')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Terms & Conditions
                                </button>
                            </li>
                            <li>
                                <button onClick={() => navigate('/privacy')} className="text-sm text-slate-600 hover:text-slate-900 transition text-left">
                                    Privacy Policy
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Free Tools Section */}
                <div className="border-t border-stone-200 pt-8 mb-8">
                    <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Free Tools</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="https://agentwood.xyz/tools/character-name-generator" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                            Character Name Generators
                        </a>
                        <a href="https://agentwood.xyz/tools/story-generator" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                            AI Story Plot Generator
                        </a>
                        <a href="https://agentwood.xyz/tools/title-generator" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                            Book Title Generator
                        </a>
                        <a href="https://agentwood.xyz/tools/plot-generator" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-600 hover:text-slate-900 transition">
                            Plot Generator
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-stone-200 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-400 text-center md:text-left">
                            © {new Date().getFullYear()} AgentWrite (a subsidiary of Agentwood). All rights reserved.
                        </p>
                        <p className="text-xs text-slate-400 italic text-center md:text-right">
                            "There is no greater agony than bearing an untold story inside you." — Maya Angelou
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

