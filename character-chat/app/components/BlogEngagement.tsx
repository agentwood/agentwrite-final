'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';

interface Comment {
    id: string;
    name: string;
    content: string;
    createdAt: string;
}

interface BlogEngagementProps {
    slug: string;
}

export default function BlogEngagement({ slug }: BlogEngagementProps) {
    const [likeCount, setLikeCount] = useState(0);
    const [liked, setLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
    const [submitting, setSubmitting] = useState(false);
    const [sessionId, setSessionId] = useState('');

    useEffect(() => {
        // Generate or retrieve session ID for anonymous likes
        let sid = localStorage.getItem('blog_session_id');
        if (!sid) {
            sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('blog_session_id', sid);
        }
        setSessionId(sid);

        // Fetch initial like count
        fetchLikeStatus(sid);
        fetchComments();
    }, [slug]);

    const fetchLikeStatus = async (sid: string) => {
        try {
            const res = await fetch(`/api/blog/like?slug=${slug}&sessionId=${sid}`);
            const data = await res.json();
            setLikeCount(data.count || 0);
            setLiked(data.liked || false);
        } catch (e) {
            console.error('Failed to fetch like status:', e);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/blog/comments?slug=${slug}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (e) {
            console.error('Failed to fetch comments:', e);
        }
    };

    const handleLike = async () => {
        try {
            const res = await fetch('/api/blog/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, sessionId }),
            });
            const data = await res.json();
            setLikeCount(data.count || 0);
            setLiked(data.liked);
        } catch (e) {
            console.error('Failed to toggle like:', e);
        }
    };

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentForm.name.trim() || !commentForm.content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/blog/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, ...commentForm }),
            });
            if (res.ok) {
                setCommentForm({ name: '', email: '', content: '' });
                fetchComments();
            }
        } catch (e) {
            console.error('Failed to submit comment:', e);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="mt-16 space-y-8 animate-fade-in">
            {/* Like and Comment Buttons */}
            <div className="flex items-center gap-6 border-t border-b border-white/10 py-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${liked
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                >
                    <Heart size={20} className={liked ? 'fill-red-400' : ''} />
                    <span className="font-bold">{likeCount}</span>
                    <span className="text-sm">{likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${showComments
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                >
                    <MessageCircle size={20} />
                    <span className="font-bold">{comments.length}</span>
                    <span className="text-sm">{comments.length === 1 ? 'Comment' : 'Comments'}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="space-y-8">
                    {/* Comment Form */}
                    <form onSubmit={handleSubmitComment} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Leave a Comment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Your name *"
                                value={commentForm.name}
                                onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-colors"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email (optional)"
                                value={commentForm.email}
                                onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-colors"
                            />
                        </div>
                        <textarea
                            placeholder="Write your comment... *"
                            value={commentForm.content}
                            onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                            rows={4}
                            maxLength={2000}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 transition-colors resize-none mb-4"
                            required
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/30">{commentForm.content.length}/2000</span>
                            <button
                                type="submit"
                                disabled={submitting || !commentForm.name.trim() || !commentForm.content.trim()}
                                className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-bold text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} />
                                {submitting ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-4">
                        {comments.length === 0 ? (
                            <p className="text-center text-white/40 py-8">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-white/[0.03] rounded-xl p-5 border border-white/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                                            {comment.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{comment.name}</p>
                                            <p className="text-xs text-white/40">{formatDate(comment.createdAt)}</p>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm leading-relaxed">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
