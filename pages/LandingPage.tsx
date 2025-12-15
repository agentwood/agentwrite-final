import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ChevronRight, Zap, PlayCircle, Layers, Trophy, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { OrganizationSchema, SoftwareApplicationSchema } from '../components/StructuredData';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
            <Helmet>
                <title>AgentWrite - AI Video Marketing Tools & Content Creation Software | Video Ideas Generator</title>
                <meta name="description" content="AI-powered video marketing tools and content creation software. Generate video ideas for brands, create video scripts, and automate content marketing. Start free trial." />
                <meta name="keywords" content="AI video marketing tools, video ideas for brands, video script generator AI, AI content marketing tools, automated content creation software, video idea generator, social media video ideas generator, YouTube video ideas AI, brand video generator, video content creation AI" />
                <link rel="canonical" href="https://agentwoodai.com/" />
                
                {/* Open Graph */}
                <meta property="og:title" content="AgentWrite - AI Video Marketing Tools & Content Creation Software" />
                <meta property="og:description" content="Generate video ideas for brands, create video scripts, and automate content marketing with AI. The ultimate video marketing platform." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://agentwoodai.com/" />
                
                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="AgentWrite - AI Video Marketing Tools & Content Creation Software" />
                <meta name="twitter:description" content="Generate video ideas for brands, create video scripts, and automate content marketing with AI." />
            </Helmet>
            <OrganizationSchema />
            <SoftwareApplicationSchema />
            <Navigation />

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">

                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-white mb-8 animate-fade-in-up shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">V2.0 Now Live: Media Lab</span>
                    </div>

                    <h1 className="font-serif text-6xl md:text-8xl font-medium text-slate-900 mb-8 leading-[1.1] tracking-tight">
                        Write <span className="italic font-light text-slate-500">faster.</span><br />
                        Create <span className="italic font-light text-slate-500">better.</span>
                    </h1>

                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
                        The AI-powered creative suite that turns vague ideas into best-selling manuscripts, viral scripts, and immersive audiobooks.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-medium text-lg hover:bg-slate-800 transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
                        >
                            Start Creating for Free <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Bento Grid Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[200px] md:auto-rows-[240px]">

                    {/* Card 1: Main Feature (Large) */}
                    <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                                    <Zap size={24} />
                                </div>
                                <h3 className="font-serif text-3xl text-slate-900 mb-3">Brainstorm Engine</h3>
                                <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                                    Stuck on a plot point? Generate 10 unique twists, character flaws, or world-building rules in seconds.
                                </p>
                            </div>
                            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 mt-8">
                                <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider mb-2">AI Suggestion</div>
                                <p className="text-slate-700 font-medium italic">"The detective isn't chasing a killer, they are chasing a version of themselves from a timeline that went wrong."</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Stats/Gamification */}
                    <div className="md:col-span-1 row-span-2 bg-slate-900 rounded-3xl p-8 shadow-xl text-white flex flex-col relative overflow-hidden group cursor-pointer" onClick={() => navigate('/stats')}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-purple-500"></div>
                        <div className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-700 flex items-center justify-center text-3xl font-serif mb-4 relative">
                                7
                                <div className="absolute -bottom-2 bg-amber-500 text-[10px] px-2 py-0.5 rounded-full font-bold text-slate-900">DAY</div>
                            </div>
                            <h3 className="text-2xl font-serif mb-2">Keep the Streak</h3>
                            <p className="text-slate-400 text-sm">Write every day to unlock themes, badges, and premium models.</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-xs text-slate-400 uppercase tracking-wider">Level 5 Scribe</span>
                            <Trophy size={16} className="text-amber-400" />
                        </div>
                    </div>

                    {/* Card 3: Media Lab */}
                    <div className="md:col-span-1 lg:col-span-1 bg-rose-50 rounded-3xl p-6 border border-rose-100 flex flex-col justify-between hover:bg-rose-100 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white rounded-lg text-rose-500 shadow-sm"><PlayCircle size={20} /></div>
                            <ArrowRight size={16} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl text-rose-900 mb-1">Media Lab</h3>
                            <p className="text-rose-700 text-xs">Turn text into video trailers.</p>
                        </div>
                    </div>

                    {/* Card 4: Organization */}
                    <div className="md:col-span-1 lg:col-span-1 bg-white rounded-3xl p-6 border border-stone-200 flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div className="p-2 bg-stone-100 rounded-lg text-slate-600 w-fit"><Layers size={20} /></div>
                        <div>
                            <h3 className="font-serif text-xl text-slate-900 mb-1">Story Bible</h3>
                            <p className="text-slate-500 text-xs">Track every character & location.</p>
                        </div>
                    </div>

                    {/* Card 5: Testimonial (Wide) */}
                    <div className="md:col-span-3 lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                        <div className="flex-1">
                            <div className="text-4xl text-amber-400 font-serif mb-4">" "</div>
                            <h3 className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight mb-4">
                                AgentWrite didn't just help me finish my novel. It helped me rewrite the ending three times until it was <span className="italic text-amber-600">perfect</span>.
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100" alt="User" loading="lazy" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">Elena Ferris</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider">Published Author</div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-64 h-32 bg-stone-100 rounded-xl flex items-center justify-center border border-stone-200 border-dashed text-slate-400">
                            <span className="text-xs font-mono">Author's Draft Preview</span>
                        </div>
                    </div>

                </div>

            </main>

            {/* Blog Preview Section */}
            <section className="bg-white border-t border-stone-200 py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="font-serif text-4xl text-slate-900 mb-3">Latest from Our Blog</h2>
                            <p className="text-slate-600">Expert insights on creative writing, storytelling, and AI-powered content creation</p>
                        </div>
                        <button
                            onClick={() => navigate('/blog')}
                            className="hidden md:flex items-center gap-2 text-slate-600 hover:text-slate-900 transition font-medium"
                        >
                            View All Articles <ArrowRight size={18} />
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'How to Write Better Dialogue: 7 Techniques That Bring Characters to Life',
                                excerpt: 'Master the art of writing dialogue that feels natural and reveals character. Learn techniques for subtext, voice, and pacing.',
                                category: 'Writing Tips',
                                readTime: 8,
                                slug: 'how-to-write-better-dialogue',
                            },
                            {
                                title: 'The Three-Act Structure: A Writer\'s Guide to Story Architecture',
                                excerpt: 'Understand the fundamental structure that underpins most successful stories. Learn how to apply the three-act structure.',
                                category: 'Creative Writing',
                                readTime: 10,
                                slug: 'three-act-structure-writers-guide',
                            },
                            {
                                title: 'Character Development: Creating Memorable Protagonists and Antagonists',
                                excerpt: 'Learn how to create complex, believable characters that readers will remember. Explore techniques for character development.',
                                category: 'Story Writing',
                                readTime: 9,
                                slug: 'character-development-memorable-characters',
                            },
                        ].map((post, idx) => (
                            <article
                                key={idx}
                                onClick={() => navigate(`/blog/${post.slug}`)}
                                className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                            >
                                <span className="inline-block px-3 py-1 bg-stone-100 text-slate-600 rounded-full text-xs font-medium mb-3">
                                    {post.category}
                                </span>
                                <h3 className="font-serif text-xl text-slate-900 mb-3 group-hover:text-slate-700 transition">
                                    {post.title}
                                </h3>
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>{post.readTime} min read</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                                </div>
                            </article>
                        ))}
                    </div>
                    
                    <div className="text-center mt-8 md:hidden">
                        <button
                            onClick={() => navigate('/blog')}
                            className="text-slate-600 hover:text-slate-900 transition font-medium flex items-center gap-2 mx-auto"
                        >
                            View All Articles <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
