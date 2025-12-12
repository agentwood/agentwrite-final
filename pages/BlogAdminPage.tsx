import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Calendar, Clock, CheckCircle2, XCircle, Play, Pause, 
    Plus, Edit, Trash2, Eye, Sparkles, TrendingUp, FileText,
    Zap, AlertCircle
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BlogPostEditor from '../components/BlogPostEditor';
import { 
    blogService, 
    BlogPost 
} from '../services/blogService';
import {
    scheduleDailyPosts,
    getContentPlan,
    createBlogPostFromTemplate,
    getAllScheduledPosts,
    getNextScheduledPost,
    publishScheduledPost,
    BlogPostTemplate
} from '../services/blogPublishingService';
import { supabase } from '../services/supabaseClient';

const BlogAdminPage = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [scheduledPosts, setScheduledPosts] = useState<Array<{ template: BlogPostTemplate; publishDate: Date }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
    const [selectedTemplate, setSelectedTemplate] = useState<BlogPostTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [publishingIndex, setPublishingIndex] = useState<number | null>(null);

    useEffect(() => {
        loadPosts();
        loadScheduledPosts();
    }, []);

    const loadPosts = async () => {
        setIsLoading(true);
        try {
            const allPosts = await blogService.getAllPosts();
            setPosts(allPosts);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadScheduledPosts = () => {
        const scheduled = getAllScheduledPosts();
        setScheduledPosts(scheduled);
    };

    const handleScheduleDailyPosts = () => {
        const startDate = new Date();
        scheduleDailyPosts(startDate);
        loadScheduledPosts();
        alert('Daily publishing schedule created! Posts will be ready to publish starting today.');
    };

    const handleCreateFromTemplate = async (template: BlogPostTemplate) => {
        setIsCreating(true);
        setPublishingIndex(CONTENT_PLAN.indexOf(template));
        try {
            const postId = await createBlogPostFromTemplate(template);
            if (postId) {
                // Reload posts to get the new one
                await loadPosts();
                
                // Find the newly created post
                const allPosts = await blogService.getAllPosts();
                const newPost = allPosts.find(p => p.id === postId);
                
                if (newPost) {
                    setEditingPost(newPost);
                    setShowEditor(true);
                    alert(`Blog post created! Now add the actual content.`);
                } else {
                    alert(`Blog post created! Post ID: ${postId}\n\nRefresh the page to edit it.`);
                }
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating post. Please try again.');
        } finally {
            setIsCreating(false);
            setPublishingIndex(null);
        }
    };

    const handleSavePost = async (postData: Partial<BlogPost>) => {
        if (!supabase || !editingPost) return;

        try {
            const { error } = await supabase
                .from('blog_posts')
                .update({
                    ...postData,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingPost.id);

            if (error) throw error;

            await loadPosts();
            setShowEditor(false);
            setEditingPost(undefined);
        } catch (error) {
            console.error('Error saving post:', error);
            throw error;
        }
    };

    const handlePublishPost = async (postId: string) => {
        const success = await publishScheduledPost(postId);
        if (success) {
            await loadPosts();
            alert('Post published successfully!');
        } else {
            alert('Error publishing post.');
        }
    };

    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const CONTENT_PLAN = getContentPlan();
    const nextPost = getNextScheduledPost();

    return (
        <div className="min-h-screen bg-stone-50 text-slate-800 font-sans">
            <Navigation />
            
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="font-serif text-4xl text-slate-900 mb-2">Blog Admin</h1>
                        <p className="text-slate-600">Manage blog posts and daily publishing schedule</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        <button
                            onClick={handleScheduleDailyPosts}
                            className="bg-slate-900 text-white p-6 rounded-xl hover:bg-slate-800 transition flex items-center gap-3"
                        >
                            <Calendar size={24} />
                            <div className="text-left">
                                <div className="font-bold">Schedule Daily Posts</div>
                                <div className="text-sm text-slate-300">Set up 30-day publishing plan</div>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setEditingPost(undefined);
                                setShowEditor(true);
                            }}
                            className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition flex items-center gap-3"
                        >
                            <Plus size={24} />
                            <div className="text-left">
                                <div className="font-bold">Create New Post</div>
                                <div className="text-sm text-indigo-200">Manual blog post creation</div>
                            </div>
                        </button>
                        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={20} className="text-amber-600" />
                                <span className="font-bold text-amber-900">Next Post</span>
                            </div>
                            {nextPost ? (
                                <div className="text-sm text-amber-800">
                                    <div className="font-medium">{nextPost.title}</div>
                                    <div className="text-xs mt-1">KD: {nextPost.keywordDifficulty} | {nextPost.searchVolume}/mo</div>
                                </div>
                            ) : (
                                <div className="text-sm text-amber-700">No posts scheduled</div>
                            )}
                        </div>
                    </div>

                    {/* Content Plan Templates */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl text-slate-900">30-Day Content Plan</h2>
                            <div className="text-sm text-slate-600">
                                {CONTENT_PLAN.length} articles ready to publish
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {CONTENT_PLAN.map((template, index) => {
                                const isCreating = publishingIndex === index;
                                const isPublished = posts.some(p => 
                                    p.title.toLowerCase() === template.title.toLowerCase()
                                );

                                return (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-xl p-6 border-2 ${
                                            isPublished
                                                ? 'border-green-200 bg-green-50'
                                                : 'border-stone-200 hover:border-indigo-300'
                                        } transition`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs font-bold text-slate-500">
                                                        Day {index + 1}
                                                    </span>
                                                    {isPublished && (
                                                        <CheckCircle2 size={14} className="text-green-600" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">
                                                    {template.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="px-2 py-1 bg-stone-100 rounded text-slate-700">
                                                    {template.category}
                                                </span>
                                                <span className="text-slate-500">
                                                    KD: {template.keywordDifficulty}
                                                </span>
                                                <span className="text-slate-500">
                                                    {template.searchVolume}/mo
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                {template.wordCount.toLocaleString()} words
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCreateFromTemplate(template)}
                                            disabled={isCreating || isPublished}
                                            className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                                                isPublished
                                                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                    : isCreating
                                                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            {isCreating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="animate-spin">⏳</span>
                                                    Creating...
                                                </span>
                                            ) : isPublished ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={14} />
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Plus size={14} />
                                                    Create Post
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Published Posts */}
                    <div className="mb-12">
                        <h2 className="font-serif text-2xl text-slate-900 mb-6">Published Posts</h2>
                        {isLoading ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">Loading posts...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-600 mb-2">No posts published yet</p>
                                <p className="text-sm text-slate-500">Create your first post from the content plan above</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="bg-white rounded-xl p-6 border border-stone-200 hover:shadow-lg transition"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-slate-900">{post.title}</h3>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        post.status === 'published'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>{post.category}</span>
                                                    <span>{post.readTime} min read</span>
                                                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                                                    <span>{post.viewCount} views</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => navigate(`/blog/${post.slug}`)}
                                                    className="p-2 hover:bg-stone-100 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <Eye size={18} className="text-slate-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingPost(post);
                                                        setShowEditor(true);
                                                    }}
                                                    className="p-2 hover:bg-stone-100 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} className="text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Blog Post Editor Modal */}
            {showEditor && (
                <BlogPostEditor
                    post={editingPost}
                    onSave={handleSavePost}
                    onCancel={() => {
                        setShowEditor(false);
                        setEditingPost(undefined);
                    }}
                />
            )}

            <Footer />
        </div>
    );
};

export default BlogAdminPage;

