import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Feather } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { blogService, BlogPost } from '../services/blogService';
import { StructuredData } from '../components/StructuredData';

const ArticlesPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All Posts');
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        // #region agent log
        console.log('[ArticlesPage] Component mounted');
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticlesPage.tsx:17',message:'ArticlesPage mounted',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch((e)=>console.error('[Debug] Log fetch failed:',e));
        // #endregion
        loadPosts();
    }, []);

    const loadPosts = async () => {
        console.log('[ArticlesPage] loadPosts called');
        setIsLoading(true);
        try {
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticlesPage.tsx:21',message:'loadPosts called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch((e)=>console.error('[Debug] Log fetch failed:',e));
            // #endregion
            const allPosts = await blogService.getAllPosts();
            console.log('[ArticlesPage] Posts fetched:', allPosts.length, allPosts);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticlesPage.tsx:25',message:'Posts fetched',data:{postCount:allPosts.length,posts:allPosts.map(p=>({title:p.title,slug:p.slug,status:p.status}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch((e)=>console.error('[Debug] Log fetch failed:',e));
            // #endregion
            setPosts(allPosts);
            
            // Extract unique categories
            const uniqueCategories = Array.from(new Set(allPosts.map(post => post.category)));
            setCategories(['All Posts', ...uniqueCategories]);
            console.log('[ArticlesPage] Categories:', uniqueCategories);
        } catch (error) {
            console.error('[ArticlesPage] Error loading posts:', error);
            // #region agent log
            fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticlesPage.tsx:31',message:'Error loading posts',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch((e)=>console.error('[Debug] Log fetch failed:',e));
            // #endregion
        } finally {
            setIsLoading(false);
            console.log('[ArticlesPage] Loading complete, isLoading:', false);
        }
    };

    const filteredPosts = selectedCategory === 'All Posts' 
        ? posts 
        : posts.filter(post => post.category === selectedCategory);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return { month, day, year };
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Tutorial': 'text-blue-600',
            'Theory': 'text-purple-600',
            'Prompting': 'text-amber-600',
            'Case Study': 'text-emerald-600',
            'Content Writing': 'text-indigo-600',
            'Story Writing': 'text-pink-600',
            'Creative Writing': 'text-rose-600',
            'AI Tools': 'text-cyan-600',
            'Writing Tips': 'text-violet-600',
            'Tool Comparisons': 'text-orange-600',
        };
        return colors[category] || 'text-slate-600';
    };

    const getCategoryHoverColor = (category: string) => {
        const colors: Record<string, string> = {
            'Tutorial': 'group-hover:text-blue-600',
            'Theory': 'group-hover:text-purple-600',
            'Prompting': 'group-hover:text-amber-600',
            'Case Study': 'group-hover:text-emerald-600',
            'Content Writing': 'group-hover:text-indigo-600',
            'Story Writing': 'group-hover:text-pink-600',
            'Creative Writing': 'group-hover:text-rose-600',
            'AI Tools': 'group-hover:text-cyan-600',
            'Writing Tips': 'group-hover:text-violet-600',
            'Tool Comparisons': 'group-hover:text-orange-600',
        };
        return colors[category] || 'group-hover:text-slate-600';
    };

    return (
        <div className="bg-[#FDFCFC] text-slate-600 antialiased selection:bg-slate-900 selection:text-white flex flex-col min-h-screen">
            <Helmet>
                <title>The Journal - Thoughts on Narrative Structure, AI Tooling, and Digital Storytelling | AgentWrite</title>
                <meta name="description" content="Thoughts on narrative structure, AI tooling, and the craft of digital storytelling. Expert insights on creative writing, content creation, and AI-powered tools." />
                <meta name="keywords" content="AI writing blog, narrative structure, digital storytelling, creative writing tips, AI tooling, content creation" />
                <link rel="canonical" href="https://agentwriteai.com/articles" />
            </Helmet>
            <StructuredData type="Blog" />

            <Navigation />

            {/* Main Content */}
            <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-12">
                
                {/* Section Header with Filters */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="font-serif text-4xl text-[#0B1221] font-normal tracking-tight mb-2">The Journal</h1>
                        <p className="text-slate-500 font-light max-w-lg">Thoughts on narrative structure, AI tooling, and the craft of digital storytelling.</p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100 self-start md:self-end flex-wrap">
                        {categories.slice(0, 5).map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                    selectedCategory === category
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                            >
                                {category === 'All Posts' ? 'All Posts' : category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feed List */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500">Loading articles...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                        {/* #region agent log */}
                        {(() => { 
                            console.log('[ArticlesPage] No posts found', { totalPosts: posts.length, filteredPosts: filteredPosts.length, selectedCategory, isLoading });
                            fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ArticlesPage.tsx:125',message:'No posts found',data:{totalPosts:posts.length,filteredPosts:filteredPosts.length,selectedCategory,isLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch((e)=>console.error('[Debug] Log fetch failed:',e)); 
                            return null; 
                        })()}
                        {/* #endregion */}
                        <p className="text-slate-500 text-lg">No articles found. Try a different category.</p>
                        <p className="text-slate-400 text-sm mt-2">Total posts: {posts.length} | Filtered: {filteredPosts.length}</p>
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg text-left max-w-md mx-auto">
                            <p className="text-xs text-slate-500 mb-2">Debug Info:</p>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>Loading: {isLoading ? 'Yes' : 'No'}</li>
                                <li>Total Posts: {posts.length}</li>
                                <li>Filtered Posts: {filteredPosts.length}</li>
                                <li>Selected Category: {selectedCategory}</li>
                                <li>Available Categories: {categories.join(', ')}</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {filteredPosts.map((post, index) => {
                            const { month, day, year } = formatDate(post.publishedAt);
                            const categoryColor = getCategoryColor(post.category);
                            const hoverColor = getCategoryHoverColor(post.category);

                            return (
                                <React.Fragment key={post.id}>
                                    <article 
                                        onClick={() => navigate(`/blog/${post.slug}`)}
                                        className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-8 items-start relative"
                                    >
                                        {/* Date Column */}
                                        <div className="md:col-span-2 pt-1.5 flex flex-row md:flex-col items-center md:items-start gap-2">
                                            <span className="text-sm font-medium text-slate-400 tabular-nums">{month} {day}</span>
                                            <span className="h-px w-4 bg-slate-200 md:hidden"></span>
                                            <span className="text-xs text-slate-300 font-medium md:mt-1">{year}</span>
                                        </div>

                                        {/* Content Column */}
                                        <div className="md:col-span-10 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`${categoryColor} text-xs font-bold tracking-wider uppercase`}>
                                                    {post.category}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="text-slate-400 text-xs">{post.readTime} min read</span>
                                            </div>
                                            
                                            <h2 className={`text-2xl font-serif text-[#0B1221] ${hoverColor} transition-colors font-medium tracking-tight`}>
                                                {post.title}
                                            </h2>
                                            
                                            <p className="text-base text-slate-500 leading-relaxed max-w-2xl">
                                                {post.excerpt}
                                            </p>

                                            <div className="pt-2 flex items-center gap-2 text-slate-900 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                Read article <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </article>

                                    {/* Divider */}
                                    {index < filteredPosts.length - 1 && (
                                        <div className="w-full h-px bg-slate-100"></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
                
                {/* Pagination */}
                {filteredPosts.length > 0 && (
                    <div className="mt-20 flex justify-center">
                        <button className="group flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-lg hover:border-slate-300 hover:text-slate-900 transition-all text-sm font-medium shadow-sm hover:shadow">
                            Load older posts
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ArticlesPage;

