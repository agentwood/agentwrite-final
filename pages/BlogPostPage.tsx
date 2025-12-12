import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, ArrowLeft, Tag, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StructuredData } from '../components/StructuredData';
import { blogService, BlogPost } from '../services/blogService';

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
                type="Article"
                data={{
                    headline: post.title,
                    description: post.excerpt,
                    author: {
                        '@type': 'Organization',
                        name: post.author,
                    },
                    datePublished: post.publishedAt,
                    dateModified: post.publishedAt,
                    articleSection: post.category,
                    keywords: post.tags.join(', '),
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

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center text-white">
                            <h2 className="font-serif text-2xl mb-3">Ready to Create Amazing Videos?</h2>
                            <p className="text-slate-300 mb-6">
                                Start using AgentWrite to generate video ideas, create scripts, and automate your video marketing workflow.
                            </p>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-white text-slate-900 px-8 py-3 rounded-lg font-medium hover:bg-slate-100 transition"
                            >
                                Start Free Trial
                            </button>
                        </div>
                    </article>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;

