import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, Loader2, Save, Eye, X } from 'lucide-react';
import { blogService, BlogPost } from '../services/blogService';

interface BlogPostEditorProps {
    post?: BlogPost;
    onSave: (post: Partial<BlogPost>) => Promise<void>;
    onCancel: () => void;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ post, onSave, onCancel }) => {
    const [title, setTitle] = useState(post?.title || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content || '');
    const [category, setCategory] = useState(post?.category || 'Creative Writing');
    const [seoKeywords, setSeoKeywords] = useState(post?.seoKeywords || '');
    const [tags, setTags] = useState<string[]>(post?.tags || []);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    const categories = [
        'Creative Writing',
        'Content Writing',
        'Story Writing',
        'AI Tools',
        'Tutorials',
        'Writing Tips',
        'Tool Comparisons',
    ];

    // Auto-generate tags when content changes
    useEffect(() => {
        const generateTags = async () => {
            if (title.length > 10 && content.length > 100) {
                setIsGeneratingTags(true);
                try {
                    const autoTags = await blogService.autoTagPost(
                        title,
                        content,
                        excerpt || title.substring(0, 150),
                        category,
                        seoKeywords
                    );
                    setSuggestedTags(autoTags);
                } catch (error) {
                    console.error('Error generating tags:', error);
                } finally {
                    setIsGeneratingTags(false);
                }
            }
        };

        const timeoutId = setTimeout(generateTags, 1000); // Debounce
        return () => clearTimeout(timeoutId);
    }, [title, content, excerpt, category, seoKeywords]);

    const handleAddTag = (tag: string) => {
        if (!tags.includes(tag) && tag.trim()) {
            setTags([...tags, tag.trim()]);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleApplySuggestedTags = () => {
        suggestedTags.forEach(tag => {
            if (!tags.includes(tag)) {
                setTags(prev => [...prev, tag]);
            }
        });
        setSuggestedTags([]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                title,
                excerpt,
                content,
                category,
                tags,
                seoKeywords,
            });
        } catch (error) {
            console.error('Error saving post:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between z-10">
                    <h2 className="font-serif text-2xl text-slate-900">
                        {post ? 'Edit Blog Post' : 'Create Blog Post'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-stone-100 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="Enter blog post title..."
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Excerpt *
                        </label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            rows={3}
                            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="Brief description of the post..."
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Content *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent font-mono text-sm"
                            placeholder="Write your blog post content here..."
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* SEO Keywords */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            SEO Keywords (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={seoKeywords}
                            onChange={(e) => setSeoKeywords(e.target.value)}
                            className="w-full p-3 border border-stone-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                            placeholder="ai writing, content creation, storytelling"
                        />
                    </div>

                    {/* Tags Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-bold text-slate-700">
                                Tags
                            </label>
                            {isGeneratingTags && (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Loader2 size={14} className="animate-spin" />
                                    Generating tags...
                                </div>
                            )}
                        </div>

                        {/* Suggested Tags */}
                        {suggestedTags.length > 0 && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-amber-600" />
                                        <span className="text-sm font-medium text-amber-900">
                                            Suggested Tags
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleApplySuggestedTags}
                                        className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                                    >
                                        Apply All
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleAddTag(tag)}
                                            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium hover:bg-amber-200 transition"
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm flex items-center gap-2"
                                >
                                    <Tag size={12} />
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:text-red-600 transition"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Add Tag Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Add a tag..."
                                className="flex-1 p-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const input = e.target as HTMLInputElement;
                                        handleAddTag(input.value);
                                        input.value = '';
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                                    if (input?.value) {
                                        handleAddTag(input.value);
                                        input.value = '';
                                    }
                                }}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-stone-200 p-6 flex items-center justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 border border-stone-200 text-slate-700 rounded-lg font-medium hover:bg-stone-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title || !excerpt || !content || isSaving}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Save Post
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BlogPostEditor;





