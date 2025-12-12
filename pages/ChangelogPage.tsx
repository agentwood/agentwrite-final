import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Tag, Sparkles, ArrowRight, Filter, Search } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';
import { changelogService, ChangelogEntry } from '../services/changelogService';

interface ChangelogEntry {
    id: string;
    title: string;
    description: string;
    date: string;
    category: 'feature' | 'improvement' | 'fix' | 'announcement';
    tags: string[];
    version?: string;
}

const MOCK_CHANGELOG: ChangelogEntry[] = [
    {
        id: '1',
        title: 'Video Script Generator - New AI Tool',
        description: 'Introducing our new AI-powered video script generator. Create professional scripts for YouTube, social media, and marketing videos in minutes. Supports multiple formats including product demos, tutorials, testimonials, and brand stories.',
        date: '2024-12-27',
        category: 'feature',
        tags: ['video', 'script', 'AI', 'new feature'],
        version: '2.1.0',
    },
    {
        id: '2',
        title: 'Blog System Launch',
        description: 'We\'ve launched our new blog system with full database integration. Publish SEO-optimized articles daily to improve keyword rankings and drive organic traffic. Includes category filtering, search functionality, and related posts.',
        date: '2024-12-27',
        category: 'feature',
        tags: ['blog', 'SEO', 'content'],
        version: '2.0.0',
    },
    {
        id: '3',
        title: 'Enhanced Video Ideas Generator',
        description: 'Improved the video ideas generator with better AI prompts and more creative output. Now generates more specific, actionable video concepts tailored to your industry and video type.',
        date: '2024-12-26',
        category: 'improvement',
        tags: ['video ideas', 'AI', 'improvement'],
    },
    {
        id: '4',
        title: 'SEO Landing Pages Added',
        description: 'Created three new SEO-optimized landing pages: Content Marketing AI, Video Script Generator, and Video Marketing Tools. Each page targets specific high-value keywords and includes comparison tables, use cases, and CTAs.',
        date: '2024-12-26',
        category: 'feature',
        tags: ['SEO', 'landing pages', 'marketing'],
    },
    {
        id: '5',
        title: 'Image Generation Fix',
        description: 'Fixed image generation issues in AICreatePage and PersonaPage. Updated API calls to use correct Gemini model and improved error handling for better reliability.',
        date: '2024-12-25',
        category: 'fix',
        tags: ['bug fix', 'images', 'API'],
    },
    {
        id: '6',
        title: 'Navigation Improvements',
        description: 'Enhanced navigation with blog link, improved mobile menu, and better dropdown functionality. Added quick access to all major features from the main navigation.',
        date: '2024-12-24',
        category: 'improvement',
        tags: ['UI', 'navigation', 'UX'],
    },
    {
        id: '7',
        title: 'Footer Redesign',
        description: 'Completely redesigned footer with better organization, social links, and free tools section. Matches modern design standards similar to Sudowrite and other leading SaaS platforms.',
        date: '2024-12-23',
        category: 'improvement',
        tags: ['UI', 'footer', 'design'],
    },
    {
        id: '8',
        title: 'Business Page Launch',
        description: 'Launched dedicated Business page for enterprise customers. Includes team collaboration features, enterprise security, custom AI models, advanced analytics, and priority support information.',
        date: '2024-12-22',
        category: 'feature',
        tags: ['business', 'enterprise', 'B2B'],
    },
    {
        id: '9',
        title: 'Structured Data Implementation',
        description: 'Added comprehensive Schema.org structured data across all pages. Improves SEO and enables rich snippets in search results. Includes Organization, SoftwareApplication, Article, and Blog schemas.',
        date: '2024-12-21',
        category: 'improvement',
        tags: ['SEO', 'structured data', 'schema'],
    },
    {
        id: '10',
        title: 'Sitemap and Robots.txt',
        description: 'Created comprehensive sitemap.xml and robots.txt files for better search engine crawling and indexing. All important pages are now properly indexed.',
        date: '2024-12-20',
        category: 'improvement',
        tags: ['SEO', 'sitemap', 'robots'],
    },
];

const categories = ['All', 'Feature', 'Improvement', 'Fix', 'Announcement'];

const ChangelogPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [entries, setEntries] = useState<ChangelogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadEntries = async () => {
            setIsLoading(true);
            try {
                const results = await changelogService.getAllEntries(
                    selectedCategory === 'All' ? undefined : selectedCategory,
                    searchQuery || undefined
                );
                setEntries(results);
            } catch (error) {
                console.error('Error loading changelog entries:', error);
                // Fallback to mock data if database not available
                setEntries(MOCK_CHANGELOG.filter(entry => {
                    const matchesCategory = selectedCategory === 'All' || 
                        entry.category === selectedCategory.toLowerCase();
                    const matchesSearch = searchQuery === '' ||
                        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                    return matchesCategory && matchesSearch;
                }));
            } finally {
                setIsLoading(false);
            }
        };

        loadEntries();
    }, [selectedCategory, searchQuery]);

    const filteredEntries = entries;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'feature':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'improvement':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'fix':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'announcement':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-stone-50 text-stone-700 border-stone-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'feature':
                return '✨';
            case 'improvement':
                return '⚡';
            case 'fix':
                return '🔧';
            case 'announcement':
                return '📢';
            default:
                return '📝';
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Changelog - Latest Updates & New Features | AgentWrite</title>
                <meta name="description" content="Stay updated with the latest AgentWrite features, improvements, and fixes. See what's new in AI video marketing tools and content creation software." />
                <meta name="keywords" content="AgentWrite changelog, new features, product updates, AI tool updates, video marketing updates" />
                <link rel="canonical" href="https://agentwoodai.com/#/changelog" />
                
                <meta property="og:title" content="Changelog - Latest Updates & New Features | AgentWrite" />
                <meta property="og:description" content="Stay updated with the latest AgentWrite features, improvements, and fixes." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/changelog" />
            </Helmet>
            
            <StructuredData
                type="SoftwareApplication"
                data={{
                    name: 'AgentWrite Changelog',
                    applicationCategory: 'ContentCreationApplication',
                    description: 'Latest updates, features, and improvements to AgentWrite',
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 shadow-sm">
                            <Sparkles size={16} className="text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product Updates</span>
                        </div>
                        
                        <h1 className="font-serif text-5xl md:text-6xl font-medium text-slate-900 mb-6 leading-tight">
                            Changelog
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Stay up to date with the latest features, improvements, and fixes to AgentWrite. We ship updates regularly to make your content creation workflow better.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search updates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border border-stone-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
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

                    {/* Changelog Entries */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">Loading updates...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                        {filteredEntries.map((entry, idx) => (
                            <article
                                key={entry.id}
                                className="bg-white rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getCategoryIcon(entry.category)}</span>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="font-serif text-2xl text-slate-900">
                                                    {entry.title}
                                                </h2>
                                                {entry.version && (
                                                    <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-mono">
                                                        v{entry.version}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDate(entry.date)}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                                                    {entry.category.charAt(0).toUpperCase() + entry.category.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {entry.description}
                                </p>
                                
                                {entry.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {entry.tags.map(tag => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-stone-50 text-slate-600 rounded-full text-xs flex items-center gap-1"
                                            >
                                                <Tag size={12} />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </article>
                        ))}
                        </div>
                    )}

                    {!isLoading && filteredEntries.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-500 text-lg">No updates found. Try a different search or category.</p>
                        </div>
                    )}

                    {/* Newsletter CTA */}
                    <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
                        <h2 className="font-serif text-3xl mb-4">Never Miss an Update</h2>
                        <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                            Subscribe to our newsletter and get notified about new features, improvements, and product updates directly in your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg text-slate-900"
                            />
                            <button className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-slate-100 transition">
                                Subscribe
                            </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-4">
                            We respect your privacy. Unsubscribe at any time.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ChangelogPage;

