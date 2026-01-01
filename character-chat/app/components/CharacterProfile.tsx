'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, ThumbsUp, ThumbsDown, Upload,
  Heart, Eye, Bookmark, MessageCircle, ChevronRight,
  Users, Sparkles, Star, Award, Zap, Coffee, Book, Music
} from 'lucide-react';
import Link from 'next/link';
import SafeImage from './SafeImage';
import Footer from './Footer';

interface SimilarCharacter {
  id: string;
  name: string;
  tagline: string;
  avatarUrl: string;
  interactionCount: number;
}

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
    // Enhanced fields
    personality?: string;
    background?: string;
    interests?: string[];
    conversationStyle?: string;
  };
  similarCharacters?: SimilarCharacter[];
}

export default function CharacterProfile({ persona, similarCharacters = [] }: CharacterProfileProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'about' | 'starters' | 'similar'>('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [followerCount, setFollowerCount] = useState(persona.followerCount);
  const [likeCount, setLikeCount] = useState(persona.likes || 0);
  const [fetchedSimilar, setFetchedSimilar] = useState<SimilarCharacter[]>([]);

  // Fetch similar characters
  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const response = await fetch(`/api/characters?category=${persona.category}&limit=6`);
        if (response.ok) {
          const data = await response.json();
          const similar = (data.personas || [])
            .filter((p: any) => p.id !== persona.id)
            .slice(0, 5)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              tagline: p.tagline || p.description?.substring(0, 80) + '...',
              avatarUrl: p.avatarUrl,
              interactionCount: p.interactionCount || Math.floor(Math.random() * 50000),
            }));
          setFetchedSimilar(similar);
        }
      } catch (error) {
        console.error('Error fetching similar characters:', error);
      }
    };
    fetchSimilar();
  }, [persona.id, persona.category]);

  // Load initial follow and save status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const followResponse = await fetch(`/api/personas/${persona.id}/follow`);
        if (followResponse.ok) {
          const followData = await followResponse.json();
          setIsFollowing(followData.following || false);
        }
      } catch (error) {
        console.error('Error loading status:', error);
      }
    };
    loadStatus();
  }, [persona.id]);

  const handleChat = () => {
    router.push(`/c/${persona.id}`);
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
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleLike = async () => {
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
        console.log('Share cancelled or failed');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleChatStarter = (starter: string) => {
    router.push(`/c/${persona.id}?message=${encodeURIComponent(starter)}`);
  };

  // Generate enhanced personality traits based on archetype/category
  const getPersonalityTraits = () => {
    const traits: string[] = [];
    const category = persona.category?.toLowerCase() || '';
    const archetype = persona.archetype?.toLowerCase() || '';

    if (category.includes('helper') || archetype.includes('mentor')) {
      traits.push('Empathetic', 'Patient', 'Wise', 'Supportive');
    } else if (category.includes('fun') || category.includes('play')) {
      traits.push('Playful', 'Creative', 'Spontaneous', 'Humorous');
    } else if (category.includes('professional')) {
      traits.push('Knowledgeable', 'Articulate', 'Methodical', 'Reliable');
    } else if (category.includes('anime') || category.includes('game')) {
      traits.push('Adventurous', 'Determined', 'Loyal', 'Spirited');
    } else if (category.includes('fiction')) {
      traits.push('Imaginative', 'Expressive', 'Deep', 'Intriguing');
    } else {
      traits.push('Thoughtful', 'Engaging', 'Authentic', 'Curious');
    }
    return traits;
  };

  // Generate enhanced expertise based on description
  const getEnhancedExpertise = () => {
    const description = persona.description?.toLowerCase() || '';
    const expertise: string[] = [];

    if (description.includes('therapist') || description.includes('counselor') || description.includes('mental')) {
      expertise.push('Mental Health Support', 'Emotional Guidance', 'Active Listening', 'Stress Management');
    } else if (description.includes('teacher') || description.includes('professor') || description.includes('educator')) {
      expertise.push('Educational Guidance', 'Knowledge Sharing', 'Curriculum Development', 'Student Mentorship');
    } else if (description.includes('chef') || description.includes('cook') || description.includes('culinary')) {
      expertise.push('Culinary Arts', 'Recipe Creation', 'Food Pairing', 'Kitchen Techniques');
    } else if (description.includes('dj') || description.includes('music') || description.includes('producer')) {
      expertise.push('Music Production', 'Sound Design', 'Live Performance', 'Crowd Engagement');
    } else if (description.includes('doctor') || description.includes('medical') || description.includes('nurse')) {
      expertise.push('Medical Knowledge', 'Patient Care', 'Health Advice', 'Wellness Coaching');
    } else if (description.includes('lawyer') || description.includes('legal') || description.includes('attorney')) {
      expertise.push('Legal Consultation', 'Case Analysis', 'Rights Advocacy', 'Conflict Resolution');
    } else if (description.includes('grandpa') || description.includes('grandma') || description.includes('retired')) {
      expertise.push('Life Wisdom', 'Storytelling', 'Historical Perspective', 'Family Values');
    } else {
      expertise.push('Engaging Conversation', 'Emotional Intelligence', 'Creative Thinking', 'Problem Solving');
    }
    return expertise;
  };

  const allSimilar = similarCharacters.length > 0 ? similarCharacters : fetchedSimilar;
  const personalityTraits = getPersonalityTraits();
  const expertiseAreas = getEnhancedExpertise();

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/10 sticky top-8">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-2xl shadow-purple-500/20 mb-4">
                  <SafeImage
                    src={persona.avatarUrl}
                    alt={persona.name}
                    className="w-full h-full object-cover"
                    fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&radius=20`}
                  />
                </div>

                <h1 className="text-3xl font-black text-white mb-1">{persona.name}</h1>
                <p className="text-sm text-white/40 mb-4">By @{persona.creator}</p>

                {/* Chat Button */}
                <button
                  onClick={handleChat}
                  className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/30 mb-4"
                >
                  Chat
                </button>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <button
                    onClick={handleLike}
                    className={`p-3 rounded-xl transition-all ${isLiked
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'bg-white/5 hover:bg-white/10 text-white/60'
                      }`}
                  >
                    <ThumbsUp className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleDislike}
                    className={`p-3 rounded-xl transition-all ${isDisliked
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-white/5 hover:bg-white/10 text-white/60'
                      }`}
                  >
                    <ThumbsDown className="w-5 h-5" fill={isDisliked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/60"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-white/70">{persona.interactionCount.toLocaleString()} Interactions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ThumbsUp className="w-4 h-4 text-green-400" />
                    <span className="text-white/70">{likeCount.toLocaleString()} Likes</span>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="w-full mb-6">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Personality</p>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait, i) => (
                      <span key={i} className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/20">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 bg-white/5 text-white/70 text-xs font-bold rounded-full border border-white/10">
                    {persona.category.charAt(0).toUpperCase() + persona.category.slice(1)}
                  </span>
                  {persona.archetype && (
                    <span className="px-4 py-2 bg-white/5 text-white/70 text-xs font-bold rounded-full border border-white/10">
                      {persona.archetype.charAt(0).toUpperCase() + persona.archetype.slice(1)}
                    </span>
                  )}
                </div>

                {/* Follow/Save Buttons */}
                <div className="flex gap-3 w-full">
                  <button
                    onClick={handleFollow}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${isFollowing
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                      }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button
                    onClick={handleSave}
                    className={`p-3 rounded-xl transition-all ${isSaved
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                      }`}
                  >
                    <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-8 border-b border-white/10 pb-4 mb-8">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`text-sm font-bold pb-3 transition-all ${activeTab === 'about'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('starters')}
                  className={`text-sm font-bold pb-3 transition-all ${activeTab === 'starters'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  Chat Starters
                </button>
                <button
                  onClick={() => setActiveTab('similar')}
                  className={`text-sm font-bold pb-3 transition-all ${activeTab === 'similar'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  Similar Characters
                </button>
              </div>

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  {/* About Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-xl font-black text-white">About {persona.name}</h2>
                      <span className="px-2 py-1 bg-white/10 text-white/40 text-xs font-bold rounded">
                        Content by AW
                      </span>
                    </div>
                    <p className="text-white/70 leading-relaxed text-base">
                      {persona.description || persona.tagline || `Meet ${persona.name}, a ${persona.archetype || persona.category} character ready to chat.`}
                    </p>
                  </div>

                  {/* Areas of Expertise */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      {persona.name}'s Areas of Expertise
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {expertiseAreas.map((area, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-white/80 text-sm font-medium">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conversation Style */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-400" />
                      Conversation Style
                    </h3>
                    <p className="text-white/70 leading-relaxed">
                      {persona.conversationStyle || `${persona.name} communicates with warmth and authenticity. Expect thoughtful responses that reflect their unique perspective and expertise. They're attentive listeners who remember details from your conversations.`}
                    </p>
                  </div>

                  {/* Simple Pleasures */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Coffee className="w-5 h-5 text-amber-400" />
                      What Brings Me Joy
                    </h3>
                    <p className="text-white/70 leading-relaxed italic">
                      "{persona.simplePleasures}"
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Starters Tab */}
              {activeTab === 'starters' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h2 className="text-xl font-black text-white mb-6">Start a Conversation</h2>
                  <div className="space-y-3">
                    {persona.chatStarters.map((starter, index) => (
                      <button
                        key={index}
                        onClick={() => handleChatStarter(starter)}
                        className="flex items-center justify-between w-full p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-left group border border-white/5 hover:border-purple-500/30"
                      >
                        <span className="text-white/90 font-medium">
                          {starter}
                        </span>
                        <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Characters Tab */}
              {activeTab === 'similar' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <h2 className="text-xl font-black text-white mb-6">You Might Also Like</h2>
                  {allSimilar.length > 0 ? (
                    <div className="space-y-4">
                      {allSimilar.map((char) => (
                        <Link
                          key={char.id}
                          href={`/character/${char.id}`}
                          className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 hover:border-purple-500/30 group"
                        >
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0">
                            <SafeImage
                              src={char.avatarUrl}
                              alt={char.name}
                              className="w-full h-full object-cover"
                              fallback={`https://api.dicebear.com/7.x/avataaars/svg?seed=${char.name}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold truncate">{char.name}</h3>
                            <p className="text-white/50 text-sm truncate">{char.tagline}</p>
                            <div className="flex items-center gap-2 mt-1 text-white/40 text-xs">
                              <MessageSquare className="w-3 h-3" />
                              <span>{char.interactionCount?.toLocaleString() || '0'}</span>
                            </div>
                          </div>
                          <button className="px-5 py-2 bg-white/10 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            Chat
                          </button>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/40">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No similar characters found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
