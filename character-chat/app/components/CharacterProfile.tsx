'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, ThumbsUp, ThumbsDown, Upload, 
  Heart, Eye, Bookmark, MessageCircle, ChevronRight,
  Users, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import SafeImage from './SafeImage';
import Footer from './Footer';

interface CharacterProfileProps {
  persona: {
    id: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    avatarUrl: string;
    category: string;
    archetype?: string | null;
    greeting?: string | null;
    creator: string;
    interactionCount: number;
    followerCount: number;
    viewCount: number;
    saveCount: number;
    commentCount: number;
    likes: number;
    expertise: string;
    simplePleasures: string;
    chatStarters: string[];
  };
}

export default function CharacterProfile({ persona }: CharacterProfileProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [followerCount, setFollowerCount] = useState(persona.followerCount);
  const [likeCount, setLikeCount] = useState(persona.likes || 0);

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:36',message:'CharacterProfile render',data:{personaId:persona.id,personaName:persona.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }
  // #endregion

  // Load initial follow and save status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        // Load follow status
        const followResponse = await fetch(`/api/personas/${persona.id}/follow`);
        if (followResponse.ok) {
          const followData = await followResponse.json();
          setIsFollowing(followData.following || false);
        }
        
        // Load save status (check if saved)
        // Note: We'd need a GET endpoint for save status, or check on first save attempt
      } catch (error) {
        console.error('Error loading status:', error);
      }
    };
    loadStatus();
  }, [persona.id]);

  const handleChat = () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:45',message:'Chat button clicked',data:{personaId:persona.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    }
    // #endregion
    router.push(`/c/${persona.id}`);
  };

  const handleFollow = async () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:52',message:'Follow button clicked',data:{personaId:persona.id,currentState:isFollowing},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    }
    // #endregion
    try {
      const response = await fetch(`/api/personas/${persona.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:60',message:'Follow API response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowerCount(prev => data.following ? prev + 1 : prev - 1);
      } else {
        // #region agent log
        if (typeof window !== 'undefined') {
          fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:68',message:'Follow API error',data:{status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // #region agent log
      if (typeof window !== 'undefined') {
        fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:75',message:'Follow error caught',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
    }
  };

  const handleSave = async () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:82',message:'Save button clicked',data:{personaId:persona.id,currentState:isSaved},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    }
    // #endregion
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/personas/${persona.id}/save`, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleLike = async () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:100',message:'Like button clicked',data:{personaId:persona.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    try {
      const response = await fetch(`/api/personas/${persona.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'like' }),
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        setIsDisliked(false);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDislike = async () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:118',message:'Dislike button clicked',data:{personaId:persona.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    try {
      const response = await fetch(`/api/personas/${persona.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'dislike' }),
      });
      
      if (response.ok) {
        setIsDisliked(!isDisliked);
        setIsLiked(false);
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  const handleShare = async () => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:136',message:'Share button clicked',data:{personaId:persona.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    }
    // #endregion
    const shareUrl = `${window.location.origin}/character/${persona.id}`;
    const shareText = `Check out ${persona.name} on Agentwood!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: persona.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleChatStarter = (starter: string) => {
    // #region agent log
    if (typeof window !== 'undefined') {
      fetch('http://127.0.0.1:7243/ingest/849b47d0-4707-42cd-b5ab-88f1ec7db25a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/components/CharacterProfile.tsx:160',message:'Chat starter clicked',data:{personaId:persona.id,starter},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    }
    // #endregion
    router.push(`/c/${persona.id}?message=${encodeURIComponent(starter)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200 sticky top-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4">
                  <SafeImage
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                    fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                  />
                </div>
                
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">{persona.name}</h1>
                <p className="text-sm text-zinc-500 mb-4">By @{persona.creator}</p>
                
                {/* Chat Button */}
                <button
                  onClick={handleChat}
                  className="w-full py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-colors mb-4"
                >
                  Chat
                </button>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 mb-6">
                  <button 
                    onClick={handleLike}
                    className={`p-2 rounded-lg transition-colors ${
                      isLiked 
                        ? 'bg-indigo-100 text-indigo-600' 
                        : 'hover:bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={handleDislike}
                    className={`p-2 rounded-lg transition-colors ${
                      isDisliked 
                        ? 'bg-red-100 text-red-600' 
                        : 'hover:bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" fill={isDisliked ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Stats */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>{persona.interactionCount.toLocaleString()} Interactions</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{likeCount} Likes</span>
                    </div>
                  </div>
                </div>
                
                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-full">
                    {persona.category.charAt(0).toUpperCase() + persona.category.slice(1)}
                  </span>
                  {persona.archetype && (
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-700 text-xs font-semibold rounded-full">
                      {persona.archetype.charAt(0).toUpperCase() + persona.archetype.slice(1)}
                    </span>
                  )}
                </div>
                
                {/* Follow/Save Buttons */}
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-2 rounded-xl font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleSave}
                    className={`p-2 rounded-xl transition-colors ${
                      isSaved
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - About & Chat Starters */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
              <div className="flex items-center gap-6 border-b border-zinc-200 pb-4 mb-6">
                <button className="text-zinc-900 font-semibold border-b-2 border-zinc-900 pb-2">
                  About
                </button>
                <button className="text-zinc-600 font-semibold hover:text-zinc-900">
                  Chat Starters
                </button>
                <button className="text-zinc-600 font-semibold hover:text-zinc-900">
                  Similar Characters
                </button>
              </div>

              {/* About Section */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-zinc-900">About {persona.name}</h2>
                    <span className="px-2 py-1 bg-zinc-100 text-zinc-500 text-xs font-semibold rounded">
                      Content by AW
                    </span>
                  </div>
                  <p className="text-zinc-700 leading-relaxed">
                    {persona.description || persona.tagline || `Meet ${persona.name}, a ${persona.archetype || persona.category} character ready to chat.`}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">
                    {persona.name}'s Area of Expertise
                  </h3>
                  <p className="text-zinc-700 leading-relaxed">
                    {persona.expertise}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">My simple pleasures</h3>
                  <p className="text-zinc-700 leading-relaxed italic">
                    {persona.simplePleasures}
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Starters */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-zinc-200">
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Chat Starters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {persona.chatStarters.map((starter, index) => (
                  <button
                    key={index}
                    onClick={() => handleChatStarter(starter)}
                    className="flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors text-left group"
                  >
                    <span className="text-sm font-medium text-zinc-900 flex-1">
                      {starter}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

