import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Book, MessageCircle, FileText, Video, Settings, CreditCard, User, HelpCircle, ChevronRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import StructuredData from '../components/StructuredData';

const HelpPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const helpCategories = [
        {
            title: 'Getting Started',
            icon: Book,
            description: 'Learn the basics of AgentWrite',
            articles: [
                { title: 'How to create your first story', slug: 'getting-started-first-story' },
                { title: 'Understanding the AI Create interface', slug: 'getting-started-ai-create' },
                { title: 'Setting up your account', slug: 'getting-started-account-setup' },
            ]
        },
        {
            title: 'Writing Tools',
            icon: FileText,
            description: 'Master our writing features',
            articles: [
                { title: 'Using the Studio editor', slug: 'writing-tools-studio' },
                { title: 'Brainstorm Engine guide', slug: 'writing-tools-brainstorm' },
                { title: 'Character and plot generation', slug: 'writing-tools-generation' },
            ]
        },
        {
            title: 'AI Features',
            icon: MessageCircle,
            description: 'Get the most from AI assistance',
            articles: [
                { title: 'How AI Create works', slug: 'ai-features-create' },
                { title: 'Customizing AI prompts', slug: 'ai-features-prompts' },
                { title: 'Generating images and audio', slug: 'ai-features-media' },
            ]
        },
        {
            title: 'Account & Billing',
            icon: CreditCard,
            description: 'Manage your subscription',
            articles: [
                { title: 'Understanding credits', slug: 'account-credits' },
                { title: 'Upgrading your plan', slug: 'account-upgrade' },
                { title: 'Billing and payments', slug: 'account-billing' },
            ]
        },
        {
            title: 'Troubleshooting',
            icon: HelpCircle,
            description: 'Solve common issues',
            articles: [
                { title: 'Connection problems', slug: 'troubleshooting-connection' },
                { title: 'AI not responding', slug: 'troubleshooting-ai' },
                { title: 'Export and download issues', slug: 'troubleshooting-export' },
            ]
        },
    ];

    const popularArticles = [
        { title: 'How to create your first story', category: 'Getting Started', slug: 'getting-started-first-story' },
        { title: 'Understanding credits and usage', category: 'Account & Billing', slug: 'account-credits' },
        { title: 'Using AI Create for interactive stories', category: 'AI Features', slug: 'ai-features-create' },
        { title: 'Exporting your work', category: 'Writing Tools', slug: 'writing-tools-export' },
    ];

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Help Center - AgentWrite Support & Documentation</title>
                <meta name="description" content="Get help with AgentWrite. Find answers to common questions, tutorials, and guides for using our AI writing tools." />
                <link rel="canonical" href="https://help.agentwriteai.com" />
            </Helmet>
            <StructuredData type="WebSite" />

            <Navigation />

            <main className="pt-24 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="font-serif text-5xl text-slate-900 mb-4">How can we help?</h1>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
                            Find answers, tutorials, and guides to get the most out of AgentWrite
                        </p>

                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-stone-200 rounded-xl focus:border-indigo-500 focus:outline-none text-slate-900 bg-white"
                            />
                        </div>
                    </div>

                    {/* Popular Articles */}
                    <div className="mb-16">
                        <h2 className="font-serif text-2xl text-slate-900 mb-6">Popular Articles</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {popularArticles.map((article, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(`/help/${article.slug}`)}
                                    className="text-left p-6 bg-white rounded-xl border border-stone-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <span className="text-xs font-medium text-indigo-600 mb-2 block">{article.category}</span>
                                            <h3 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                                {article.title}
                                            </h3>
                                        </div>
                                        <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Help Categories */}
                    <div className="mb-12">
                        <h2 className="font-serif text-2xl text-slate-900 mb-6">Browse by Category</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {helpCategories.map((category, index) => {
                                const Icon = category.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-xl border border-stone-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                <Icon size={20} className="text-indigo-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-900">{category.title}</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">{category.description}</p>
                                        <ul className="space-y-2">
                                            {category.articles.map((article, articleIndex) => (
                                                <li key={articleIndex}>
                                                    <button
                                                        onClick={() => navigate(`/help/${article.slug}`)}
                                                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors text-left"
                                                    >
                                                        {article.title}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-8 text-center">
                        <h2 className="font-serif text-2xl text-slate-900 mb-3">Still need help?</h2>
                        <p className="text-slate-600 mb-6">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button
                                onClick={() => navigate('/contact')}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Contact Support
                            </button>
                            <button
                                onClick={() => window.open('https://discord.com/invite/agentwood', '_blank')}
                                className="bg-white text-indigo-600 border-2 border-indigo-200 px-6 py-3 rounded-lg hover:border-indigo-300 transition font-medium"
                            >
                                Join Discord
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default HelpPage;

