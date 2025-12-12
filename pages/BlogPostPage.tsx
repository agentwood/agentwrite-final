import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, Tag, Share2, Twitter, Facebook, Linkedin, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';
import { blogService, BlogPost } from '../services/blogService';
import CompetitorComparison from '../components/CompetitorComparison';
import RelatedTools from '../components/RelatedTools';

const BlogPostPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const loadPost = async () => {
            if (!slug) return;
            setIsLoading(true);
            try {
                const postData = await blogService.getPostBySlug(slug);
                setPost(postData);
                if (postData) {
                    const related = await blogService.getRelatedPosts(postData.category, slug, 3);
                    setRelatedPosts(related);
                }
            } catch (error) {
                console.error('Error loading post:', error);
                setPost(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500">Loading article...</p>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Post Not Found</h1>
                    <button onClick={() => navigate('/blog')} className="text-slate-600 hover:text-slate-900">
                        Back to Blog
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const shareUrl = `https://agentwoodai.com/#/blog/${post.slug}`;

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Helmet>
                <title>{post.seoTitle || post.title} | AgentWrite Blog</title>
                <meta name="description" content={post.seoDescription || post.excerpt} />
                <meta name="keywords" content={post.seoKeywords || post.tags.join(', ')} />
                <link rel="canonical" href={`https://agentwoodai.com/#/blog/${post.slug}`} />
                
                <meta property="og:title" content={post.seoTitle || post.title} />
                <meta property="og:description" content={post.seoDescription || post.excerpt} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={shareUrl} />
                <meta property="article:published_time" content={post.publishedAt} />
                <meta property="article:author" content={post.author} />
                <meta property="article:section" content={post.category} />
                {post.tags.map(tag => (
                    <meta key={tag} property="article:tag" content={tag} />
                ))}
            </Helmet>
            
            <StructuredData
                type="BlogPosting"
                data={{
                    headline: post.title,
                    description: post.excerpt,
                    image: post.imageUrl ? [post.imageUrl] : undefined,
                    author: {
                        '@type': 'Organization',
                        name: post.author,
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: 'AgentWrite',
                        logo: {
                            '@type': 'ImageObject',
                            url: 'https://agentwoodai.com/logo.png'
                        }
                    },
                    datePublished: post.publishedAt,
                    dateModified: post.updatedAt || post.publishedAt,
                    articleSection: post.category,
                    keywords: post.tags.join(', '),
                    mainEntityOfPage: {
                        '@type': 'WebPage',
                        '@id': `https://agentwoodai.com/#/blog/${post.slug}`
                    },
                    wordCount: post.content.split(/\s+/).length,
                    timeRequired: `PT${post.readTime}M`
                }}
            />
            
            {/* Breadcrumb Structured Data */}
            <StructuredData
                type="BreadcrumbList"
                data={{
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Home',
                            item: 'https://agentwoodai.com/'
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Blog',
                            item: 'https://agentwoodai.com/#/blog'
                        },
                        {
                            '@type': 'ListItem',
                            position: 3,
                            name: post.title,
                            item: `https://agentwoodai.com/#/blog/${post.slug}`
                        }
                    ]
                }}
            />
            
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/blog')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Blog
                    </button>

                    <article>
                        {/* Header */}
                        <header className="mb-12">
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
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
                            
                            <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-6 leading-tight">
                                {post.title}
                            </h1>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center">
                                        {post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{post.author}</p>
                                        <p className="text-sm text-slate-500">Content Team</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button className="p-2 hover:bg-stone-100 rounded-lg transition">
                                        <Share2 size={18} className="text-slate-600" />
                                    </button>
                                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 rounded-lg transition">
                                        <Twitter size={18} className="text-slate-600" />
                                    </a>
                                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 rounded-lg transition">
                                        <Facebook size={18} className="text-slate-600" />
                                    </a>
                                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 rounded-lg transition">
                                        <Linkedin size={18} className="text-slate-600" />
                                    </a>
                                </div>
                            </div>
                        </header>

                        {/* Content */}
                        <div className="prose prose-slate max-w-none mb-12">
                            <div className="whitespace-pre-line text-slate-700 leading-relaxed">
                                {post.content.split('\n').map((line, idx) => {
                                    if (line.startsWith('# ')) {
                                        return <h1 key={idx} className="font-serif text-3xl text-slate-900 mt-8 mb-4">{line.substring(2)}</h1>;
                                    } else if (line.startsWith('## ')) {
                                        return <h2 key={idx} className="font-serif text-2xl text-slate-900 mt-6 mb-3">{line.substring(3)}</h2>;
                                    } else if (line.startsWith('### ')) {
                                        return <h3 key={idx} className="font-serif text-xl text-slate-900 mt-4 mb-2">{line.substring(4)}</h3>;
                                    } else if (line.startsWith('- ')) {
                                        return <li key={idx} className="ml-6 mb-2">{line.substring(2)}</li>;
                                    } else if (line.trim() === '') {
                                        return <br key={idx} />;
                                    } else {
                                        return <p key={idx} className="mb-4">{line}</p>;
                                    }
                                })}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-stone-200">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-stone-100 text-slate-700 rounded-full text-sm flex items-center gap-1">
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Competitor Comparison Widget */}
                        {(post.tags.some(tag => 
                            tag.toLowerCase().includes('alternative') || 
                            tag.toLowerCase().includes('comparison') ||
                            tag.toLowerCase().includes('sudowrite') ||
                            tag.toLowerCase().includes('talefy') ||
                            tag.toLowerCase().includes('dipsea')
                        ) || post.category === 'Tool Comparisons') && (
                            <CompetitorComparison />
                        )}

                        {/* Related Tools */}
                        <RelatedTools currentCategory={post.category} maxTools={3} />

                        {/* Related Posts */}
                        {relatedPosts.length > 0 && (
                            <div className="mb-12">
                                <h3 className="font-serif text-2xl text-slate-900 mb-6">Related Articles</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {relatedPosts.map(relatedPost => (
                                        <article
                                            key={relatedPost.id}
                                            onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                                            className="bg-white rounded-xl p-4 border border-stone-200 hover:shadow-lg transition-all cursor-pointer group"
                                        >
                                            <h4 className="font-serif text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition">
                                                {relatedPost.title}
                                            </h4>
                                            <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                                                {relatedPost.excerpt}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock size={12} />
                                                {relatedPost.readTime} min read
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Enhanced CTA */}
                        <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-10 text-center text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)]"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                                    <Sparkles size={18} className="text-amber-400" />
                                    <span className="text-sm font-bold">Try AgentWrite Free</span>
                                </div>
                                <h2 className="font-serif text-3xl md:text-4xl mb-4">
                                    Ready to Transform Your Writing?
                                </h2>
                                <p className="text-slate-300 mb-2 text-lg max-w-2xl mx-auto">
                                    Join thousands of writers using AgentWrite to create blog posts, stories, and marketing content faster than ever.
                                </p>
                                <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="text-green-400">✓</span> Free trial
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-green-400">✓</span> No credit card
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-green-400">✓</span> Cancel anytime
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/signup')}
                                        className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-amber-50 transition text-lg flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <Sparkles size={20} />
                                        Start Free Trial
                                    </button>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-medium hover:bg-white/20 transition border border-white/20"
                                    >
                                        View Pricing
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-4">
                                    No credit card required • 7-day free trial • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;

