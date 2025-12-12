import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Video, FileText, Sparkles, Lightbulb, ArrowRight, Zap, Play, BarChart3 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';

const tools = [
    {
        icon: Lightbulb,
        title: 'Video Ideas Generator',
        description: 'Generate unlimited creative video ideas for your brand. Never run out of content concepts.',
        link: '/video-ideas-generator',
        category: 'Video Marketing',
        free: true,
    },
    {
        icon: FileText,
        title: 'Video Script Generator',
        description: 'Create professional video scripts for YouTube, social media, and marketing campaigns.',
        link: '/video-script-generator',
        category: 'Video Marketing',
        free: true,
    },
    {
        icon: Sparkles,
        title: 'AI Content Creator',
        description: 'Generate blog posts, articles, and long-form content with AI assistance.',
        link: '/create',
        category: 'Content Creation',
        free: false,
    },
    {
        icon: Video,
        title: 'Video Content Generator',
        description: 'Create complete video content from scripts. AI-powered video production.',
        link: '/create',
        category: 'Video Marketing',
        free: false,
    },
    {
        icon: Play,
        title: 'Audiobook Generator',
        description: 'Turn your written content into professional audiobooks with AI voice synthesis.',
        link: '/create',
        category: 'Audio',
        free: false,
    },
    {
        icon: BarChart3,
        title: 'Content Analytics',
        description: 'Track content performance, engagement, and ROI with detailed analytics.',
        link: '/stats',
        category: 'Analytics',
        free: false,
    },
];

const categories = ['All', 'Video Marketing', 'Content Creation', 'Audio', 'Analytics'];

const ResourcesPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredTools = tools.filter(tool => 
        selectedCategory === 'All' || tool.category === selectedCategory
    );

    const freeTools = filteredTools.filter(tool => tool.free);
    const premiumTools = filteredTools.filter(tool => !tool.free);

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Free Tools & Resources - AI Content Creation Tools | AgentWrite</title>
                <meta name="description" content="Access free AI tools for video marketing and content creation. Video idea generator, script generator, and more. Start creating content today." />
                <meta name="keywords" content="free AI tools, video idea generator, video script generator, content creation tools, marketing tools, AI writing tools" />
                <link rel="canonical" href="https://agentwoodai.com/#/resources" />
                
                <meta property="og:title" content="Free Tools & Resources - AI Content Creation Tools" />
                <meta property="og:description" content="Access free AI tools for video marketing and content creation." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/resources" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'AgentWrite Free Tools',
                    applicationCategory: 'ContentCreationApplication',
                    description: 'Free AI tools for video marketing and content creation',
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Free Tools</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            Free Tools & Resources
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Access powerful AI tools for video marketing and content creation. Many tools are completely free to use.
                        </p>
                        
                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                                        selectedCategory === category
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-white text-slate-600 border border-stone-200 hover:border-slate-900'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Free Tools Section */}
                    {freeTools.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-3xl text-slate-900">Free Tools</h2>
                                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                    No Signup Required
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {freeTools.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(tool.link)}
                                        className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition">
                                            <tool.icon size={24} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-serif text-xl text-slate-900 group-hover:text-amber-600 transition">
                                                {tool.title}
                                            </h3>
                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                                FREE
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                            {tool.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                                            Try it now <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Premium Tools Section */}
                    {premiumTools.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-serif text-3xl text-slate-900">Premium Tools</h2>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                                    Requires Account
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {premiumTools.map((tool, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => navigate(tool.link)}
                                        className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                                    >
                                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition">
                                            <tool.icon size={24} />
                                        </div>
                                        <h3 className="font-serif text-xl text-slate-900 mb-2 group-hover:text-indigo-600 transition">
                                            {tool.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                                            {tool.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                                            Get started <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA Section */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-4xl mb-4">Ready to Create Amazing Content?</h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Start using AgentWrite to generate video ideas, create scripts, and automate your entire content marketing workflow.
                        </p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-slate-900 px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-100 transition shadow-xl flex items-center gap-2 mx-auto"
                        >
                            Start Free Trial <ArrowRight size={20} />
                        </button>
                        <p className="text-sm text-slate-400 mt-4">
                            No credit card required • 14-day free trial • Cancel anytime
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResourcesPage;

