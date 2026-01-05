'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  MoreVertical,
  MessageSquare,
  Volume2,
  VolumeX,
  History,
  Settings,
  Pin,
  ChevronRight,
  X,
  Heart,
  Eye,
  Users,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SafeImage from './SafeImage';

interface ChatSidebarProps {
  persona: {
    id: string;
    name: string;
    avatarUrl: string;
    tagline?: string | null;
    description?: string | null;
    category: string;
    voiceName?: string;
    followerCount?: number;
    viewCount?: number;
    interactionCount?: number;
    saveCount?: number;
    commentCount?: number;
  };
  conversationId: string;
  voiceEnabled?: boolean;
  setVoiceEnabled?: (enabled: boolean) => void;
}

export default function ChatSidebar({
  persona,
  conversationId,
  voiceEnabled = false,
  setVoiceEnabled
}: ChatSidebarProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(persona.followerCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [viewCount, setViewCount] = useState(persona.viewCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  // Modal states
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showPinned, setShowPinned] = useState(false);
  // Style selector removed - only available in character creation
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [createdStory, setCreatedStory] = useState<any>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  // Style selector removed
  const [customizeSettings, setCustomizeSettings] = useState({
    responseLength: 'medium',
    temperature: 0.7,
    creativity: 0.5,
  });

  // Load follow status and counters
  useEffect(() => {
    loadFollowStatus();
    loadPinnedMessages();
    loadCounters();
    loadSaveStatus();
    loadComments();
  }, [persona.id, conversationId]);

  // Load conversation history
  useEffect(() => {
    if (showHistory) {
      loadConversations();
    }
  }, [showHistory, persona.id]);

  const loadFollowStatus = async () => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/follow`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error('Error loading follow status:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowerCount(prev => data.following ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`/api/conversations?personaId=${persona.id}`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadPinnedMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/pinned`);
      if (response.ok) {
        const data = await response.json();
        setPinnedMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading pinned messages:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId: persona.id }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/c/${persona.id}?conversation=${data.conversation.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleLike = async () => {
    setIsLiked(!isLiked);
    if (isDisliked) setIsDisliked(false);
    // TODO: Send feedback to API
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) {
      setIsLiked(false);
    }
    // TODO: Send feedback to API
  };

  const loadCounters = async () => {
    try {
      // Fetch persona with real counters
      const response = await fetch(`/api/personas/${persona.id}`);
      if (response.ok) {
        const data = await response.json();
        setSaveCount(data.saveCount || 0);
        setCommentCount(data.commentCount || 0);
        setViewCount(data.viewCount || 0);
      }
    } catch (error) {
      console.error('Error loading counters:', error);
    }
  };

  const loadSaveStatus = async () => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/save`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved || false);
      }
    } catch (error) {
      console.error('Error loading save status:', error);
    }
  };

  const handleSave = async () => {
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/personas/${persona.id}/save`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
        setSaveCount(prev => data.saved ? prev + 1 : Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/personas/${persona.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setCommentCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Styles removed - only in character creation

  return (
    <>
      {/* Right Sidebar Panel */}
      <aside className="w-[320px] h-full bg-white border-l border-zinc-100 flex flex-col">
        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">

          {/* Top Panel Identity */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 shadow-lg">
              <SafeImage
                src={persona.avatarUrl}
                alt={persona.name}
                className="w-full h-full object-cover"
                fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
              />
            </div>
            <h2 className="text-base font-bold text-zinc-900">{persona.name}</h2>
            <p className="text-[11px] text-zinc-400 font-bold mb-4">By @{persona.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}</p>
            <div className="flex flex-col gap-2 text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-4">
              <div className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {viewCount} views
              </div>
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                {saveCount} saves
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {commentCount} comments
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button className="p-2.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-zinc-900 transition-all">
                <Upload className="w-4 h-4" />
              </button>
              <div className="flex bg-zinc-50 border border-zinc-100 rounded-full px-4 py-2 gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-xs font-bold ${isLiked ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-900'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-4 bg-zinc-200 self-center"></div>
                <button
                  onClick={handleDislike}
                  className={`text-zinc-400 hover:text-zinc-900 ${isDisliked ? 'text-zinc-900' : ''}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSave}
                className={`p-2.5 rounded-full transition-all ${isSaved
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-indigo-600'
                  }`}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleFollow}
                className={`p-2.5 rounded-full transition-all ${isFollowing
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-50 border border-zinc-100 text-zinc-500 hover:text-red-500'
                  }`}
              >
                <Heart className="w-4 h-4" fill={isFollowing ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Comments button removed - only showing viewCount */}
          </div>

          {/* Navigation Options */}
          <div className="space-y-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-transparent hover:border-zinc-200 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-200/50 flex items-center justify-center text-zinc-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-900">New chat</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (setVoiceEnabled) {
                  setVoiceEnabled(!voiceEnabled);
                }
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Voice</span>
              </div>
              <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 flex items-center gap-1">
                {persona.voiceName || "Default"}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => setShowHistory(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                  <History className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">History</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
            </button>

            <button
              onClick={() => setShowCustomize(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Customize</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
            </button>

            <button
              onClick={() => {
                setShowPinned(true);
                loadPinnedMessages();
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                  <Pin className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Pinned</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
            </button>

            <button
              onClick={() => setShowCreateStory(true)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-transparent hover:border-zinc-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-zinc-500 group-hover:text-zinc-900">Create Story</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-zinc-100 flex items-center gap-3">
          <Link
            href="/discover"
            className="flex-1 py-4 px-6 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-[0.98] text-center"
          >
            Back to Discover
          </Link>
        </div>
      </aside>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Conversation History</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {conversations.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No previous conversations</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        router.push(`/c/${persona.id}?conversation=${conv.id}`);
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-4 rounded-xl hover:bg-zinc-50 border border-zinc-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-zinc-900 truncate">
                            {conv.messages[0]?.text?.substring(0, 50) || 'New conversation'}...
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {conv._count.messages} messages • {new Date(conv.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Customize Character</h2>
              <button onClick={() => setShowCustomize(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Response Length</label>
                <select
                  value={customizeSettings.responseLength}
                  onChange={(e) => setCustomizeSettings({ ...customizeSettings, responseLength: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl"
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Temperature: {customizeSettings.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={customizeSettings.temperature}
                  onChange={(e) => setCustomizeSettings({ ...customizeSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Creativity: {customizeSettings.creativity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={customizeSettings.creativity}
                  onChange={(e) => setCustomizeSettings({ ...customizeSettings, creativity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <button
                onClick={() => {
                  // TODO: Save settings to API
                  setShowCustomize(false);
                }}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Messages Modal */}
      {showPinned && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Pinned Messages</h2>
              <button onClick={() => setShowPinned(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {pinnedMessages.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No pinned messages</p>
              ) : (
                <div className="space-y-3">
                  {pinnedMessages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                      <p className="text-zinc-900">{msg.text}</p>
                      <p className="text-xs text-zinc-500 mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Modal removed - only available in character creation */}

      {/* Create Story Modal */}
      {showCreateStory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Create Story</h2>
              <button onClick={() => {
                setShowCreateStory(false);
                setCreatedStory(null);
                setStoryTitle('');
              }} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!createdStory ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Story Title (optional)
                    </label>
                    <input
                      type="text"
                      value={storyTitle}
                      onChange={(e) => setStoryTitle(e.target.value)}
                      placeholder={`A Story with ${persona.name}`}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-sm text-zinc-600">
                    Create an engaging story based on your conversation with {persona.name}.
                    The AI will transform your chat into a readable narrative.
                  </p>
                  <button
                    onClick={async () => {
                      setIsCreatingStory(true);
                      try {
                        const response = await fetch('/api/stories/create', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            conversationId,
                            title: storyTitle || undefined,
                          }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to create story');
                        }

                        const data = await response.json();
                        setCreatedStory(data.story);
                      } catch (error) {
                        console.error('Error creating story:', error);
                        alert('Failed to create story. Please try again.');
                      } finally {
                        setIsCreatingStory(false);
                      }
                    }}
                    disabled={isCreatingStory}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingStory ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Creating Story...
                      </>
                    ) : (
                      <>
                        <BookOpen size={20} />
                        Create Story
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">{createdStory.title}</h3>
                    <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap leading-relaxed">
                      {createdStory.content}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-zinc-200">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdStory.content);
                        alert('Story copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors"
                    >
                      Copy Story
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateStory(false);
                        setCreatedStory(null);
                        setStoryTitle('');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900">Comments</h2>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-zinc-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
                      {(comment.user?.displayName || comment.user?.username || 'User')[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">
                        {comment.user?.displayName || comment.user?.username || 'Anonymous'}
                      </p>
                      <p className="text-sm text-zinc-700 mt-1">{comment.text}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-zinc-500 text-sm py-8">No comments yet. Be the first!</p>
              )}
            </div>
            <div className="p-6 border-t border-zinc-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  onClick={handleAddComment}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const NavMenuItem = ({
  icon,
  label,
  value,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <span className="text-zinc-600 group-hover:text-zinc-900">{icon}</span>
      <span className="text-sm font-semibold text-zinc-700 tracking-tight">{label}</span>
    </div>
    {value && (
      <span className="text-xs text-zinc-500 font-medium">{value}</span>
    )}
    <ChevronRight size={16} className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
);
