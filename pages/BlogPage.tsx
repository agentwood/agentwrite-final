import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowRight, Tag, Search, BookOpen, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';
import { blogService, BlogPost } from '../services/blogService';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    publishedAt: string;
    category: string;
    tags: string[];
    readTime: number;
    imageUrl?: string;
    slug: string;
}

const categories = ['All', 'Video Marketing', 'Video Ideas', 'Content Marketing', 'AI Tools', 'Tutorials'];

const BlogPage = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            setIsLoading(true);
            try {
                if (searchQuery) {
                    const results = await blogService.searchPosts(searchQuery);
                    setPosts(results);
                } else {
                    const results = await blogService.getAllPosts(
                        selectedCategory === 'All' ? undefined : selectedCategory
                    );
                    setPosts(results);
                }
            } catch (error) {
                console.error('Error loading posts:', error);
                setPosts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPosts();
    }, [selectedCategory, searchQuery]);

    const filteredPosts = posts;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>Blog - AI Video Marketing & Content Creation Tips | AgentWrite</title>
                <meta name="description" content="Expert insights on AI video marketing, content creation, video ideas for brands, and marketing automation. Learn strategies, tools, and best practices." />
                <meta name="keywords" content="AI video marketing blog, content marketing tips, video ideas blog, marketing automation guide, AI content creation blog" />
                <link rel="canonical" href="https://agentwoodai.com/#/blog" />
                
                <meta property="og:title" content="Blog - AI Video Marketing & Content Creation Tips | AgentWrite" />
                <meta property="og:description" content="Expert insights on AI video marketing, content creation, and marketing automation." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/#/blog" />
            </Helmet>
            
            {posts.length > 0 && (
                <StructuredData
                    type="Blog"
                    data={{
                        name: 'AgentWrite Blog',
                        description: 'Expert insights on AI video marketing, content creation, and marketing automation',
                        url: 'https://agentwoodai.com/#/blog',
                        publisher: {
                            '@type': 'Organization',
                            name: 'AgentWrite',
                            logo: {
                                '@type': 'ImageObject',
                                url: 'https://agentwoodai.com/logo.png'
                            }
                        },
                        blogPost: posts.slice(0, 10).map(post => ({
                            '@type': 'BlogPosting',
                            headline: post.title,
                            description: post.excerpt,
                            url: `https://agentwoodai.com/#/blog/${post.slug}`,
                            datePublished: post.publishedAt,
                            author: {
                                '@type': 'Organization',
                                name: post.author
                            }
                        }))
                    }}
                />
            )}
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <h1 className="font-serif text-5xl md:text-7xl font-medium text-slate-900 mb-6 leading-tight">
                            Blog
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Expert insights on AI video marketing, content creation, video ideas for brands, and marketing automation.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
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

                    {/* Blog Posts Grid */}
                    {isLoading ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">Loading articles...</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {filteredPosts.map(post => (
                            <article
                                key={post.id}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                                className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-xl transition-all cursor-pointer group"
                            >
                                {post.imageUrl && (
                                    <div className="aspect-video bg-stone-100 overflow-hidden">
                                        <img 
                                            src={post.imageUrl} 
                                            alt={`${post.title} - ${post.category} article`} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                        <span className="px-3 py-1 bg-stone-100 rounded-full font-medium">{post.category}</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(post.publishedAt)}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {post.readTime} min read
                                        </div>
                                    </div>
                                    
                                    <h2 className="font-serif text-2xl text-slate-900 mb-3 group-hover:text-slate-700 transition">
                                        {post.title}
                                    </h2>
                                    
                                    <p className="text-slate-600 mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            {post.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Tag size={12} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <ArrowRight size={18} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition" />
                                    </div>
                                </div>
                            </article>
                        ))}
                        </div>
                    )}

                    {filteredPosts.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-500 text-lg">No articles found. Try a different search or category.</p>
                        </div>
                    )}

                    {/* Enhanced Newsletter CTA */}
                    <div className="max-w-4xl mx-auto mt-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent)]"></div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                                <Sparkles size={18} className="text-amber-400" />
                                <span className="text-sm font-bold">Free Resources</span>
                            </div>
                            <h2 className="font-serif text-4xl mb-4">Stay Updated</h2>
                            <p className="text-slate-300 mb-2 text-lg max-w-2xl mx-auto">
                                Get the latest articles on AI writing, content creation, storytelling tips, and writing tools delivered to your inbox.
                            </p>
                            <p className="text-slate-400 mb-8 text-sm">
                                Join 10,000+ writers and content creators
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-4 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                                />
                                <button className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-amber-50 transition shadow-lg flex items-center justify-center gap-2">
                                    <Sparkles size={18} />
                                    Subscribe Free
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-4">
                                No spam • Unsubscribe anytime • Free writing resources
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPage;

