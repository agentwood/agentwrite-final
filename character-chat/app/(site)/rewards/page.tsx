'use client';

import { useState, useEffect } from 'react';
import { Trophy, PenTool, Users, Gift, Star, Zap, Check, Loader2, Sparkles } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Footer from '@/app/components/Footer';
import { getSession } from '@/lib/auth';

interface Reward {
    id: string;
    title: string;
    description: string;
    rewardAmount: number;
    rewardType: 'credits' | 'badge' | 'feature';
    progress: number;
    target: number;
    icon: 'trophy' | 'pen' | 'users' | 'gift' | 'star' | 'zap';
    claimed: boolean;
}

const ICON_MAP = {
    trophy: Trophy,
    pen: PenTool,
    users: Users,
    gift: Gift,
    star: Star,
    zap: Zap,
};

// Default rewards that every user can work towards
const DEFAULT_REWARDS: Reward[] = [
    {
        id: 'first-chat',
        title: 'First Conversation',
        description: 'Start your first chat with any character',
        rewardAmount: 50,
        rewardType: 'credits',
        progress: 0,
        target: 1,
        icon: 'star',
        claimed: false
    },
    {
        id: 'chat-10',
        title: 'Social Butterfly',
        description: 'Chat with 10 different characters',
        rewardAmount: 150,
        rewardType: 'credits',
        progress: 0,
        target: 10,
        icon: 'users',
        claimed: false
    },
    {
        id: 'messages-100',
        title: 'Chatterer',
        description: 'Send 100 messages across all chats',
        rewardAmount: 200,
        rewardType: 'credits',
        progress: 0,
        target: 100,
        icon: 'zap',
        claimed: false
    },
    {
        id: 'create-char',
        title: 'Creator',
        description: 'Create your first custom character',
        rewardAmount: 100,
        rewardType: 'credits',
        progress: 0,
        target: 1,
        icon: 'pen',
        claimed: false
    },
    {
        id: 'daily-login-7',
        title: 'Dedicated Fan',
        description: 'Log in 7 days in a row',
        rewardAmount: 300,
        rewardType: 'credits',
        progress: 0,
        target: 7,
        icon: 'trophy',
        claimed: false
    },
    {
        id: 'referral',
        title: 'Friend Finder',
        description: 'Refer a friend who signs up',
        rewardAmount: 500,
        rewardType: 'credits',
        progress: 0,
        target: 1,
        icon: 'gift',
        claimed: false
    },
];

export default function RewardsPage() {
    const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [totalCredits, setTotalCredits] = useState(0);
    const [showClaimToast, setShowClaimToast] = useState(false);
    const [claimedAmount, setClaimedAmount] = useState(0);

    useEffect(() => {
        async function fetchRewardProgress() {
            try {
                const session = getSession();
                if (!session?.id) {
                    // Not logged in - show empty progress
                    setRewards(DEFAULT_REWARDS);
                    setLoading(false);
                    return;
                }

                // Fetch real progress from API
                const response = await fetch('/api/rewards', {
                    headers: {
                        'x-user-id': session.id,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRewards(data.rewards);
                    setTotalCredits(data.creditsBalance || 0);
                } else {
                    // Fallback to defaults if API fails
                    console.error('Failed to fetch rewards');
                    setRewards(DEFAULT_REWARDS);
                }
            } catch (error) {
                console.error('Error fetching rewards:', error);
                setRewards(DEFAULT_REWARDS);
            } finally {
                setLoading(false);
            }
        }

        fetchRewardProgress();
    }, []);

    const handleClaim = async (reward: Reward) => {
        if (reward.progress < reward.target || reward.claimed) return;

        const session = getSession();
        if (!session?.id) {
            alert('Please log in to claim rewards');
            return;
        }

        setClaiming(reward.id);

        try {
            const response = await fetch('/api/rewards/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': session.id,
                },
                body: JSON.stringify({ rewardId: reward.id }),
            });

            if (response.ok) {
                const data = await response.json();

                // Update local state
                setRewards(prev => prev.map(r =>
                    r.id === reward.id ? { ...r, claimed: true } : r
                ));

                setTotalCredits(data.newBalance);
                setClaimedAmount(reward.rewardAmount);
                setShowClaimToast(true);
                setTimeout(() => setShowClaimToast(false), 3000);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to claim reward');
            }
        } catch (error) {
            console.error('Error claiming reward:', error);
            alert('Failed to claim reward');
        } finally {
            setClaiming(null);
        }
    };

    const totalEarned = rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.rewardAmount, 0);
    const totalAvailable = rewards.filter(r => r.progress >= r.target && !r.claimed).reduce((sum, r) => sum + r.rewardAmount, 0);

    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">
            <Sidebar recentCharacters={[]} />
            <main className="flex-1 lg:pl-60 flex flex-col">
                {/* Claim Toast */}
                {showClaimToast && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold">+{claimedAmount} AGW Credits claimed!</span>
                    </div>
                )}

                <div className="p-10 fade-in flex-1">
                    <div className="max-w-4xl">
                        {/* Header */}
                        <div className="mb-12">
                            <h2 className="text-4xl font-black mb-3 tracking-tight">Rewards & Milestones</h2>
                            <p className="text-white/40 text-sm font-medium leading-relaxed">
                                Complete challenges to earn Agentwood credits and exclusive rewards.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
                                <p className="text-sm text-purple-300 font-medium mb-1">Total Earned</p>
                                <p className="text-3xl font-black text-white">{totalEarned} AGW</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-2xl p-6">
                                <p className="text-sm text-green-300 font-medium mb-1">Ready to Claim</p>
                                <p className="text-3xl font-black text-white">{totalAvailable} AGW</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
                                <p className="text-sm text-amber-300 font-medium mb-1">Challenges</p>
                                <p className="text-3xl font-black text-white">{rewards.filter(r => r.claimed).length}/{rewards.length}</p>
                            </div>
                        </div>

                        {/* Rewards List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rewards.map((reward) => {
                                    const Icon = ICON_MAP[reward.icon];
                                    const progressPercent = Math.min(100, (reward.progress / reward.target) * 100);
                                    const canClaim = reward.progress >= reward.target && !reward.claimed;

                                    return (
                                        <div
                                            key={reward.id}
                                            className={`bg-white/5 border rounded-2xl p-6 flex items-center justify-between transition-all ${canClaim
                                                ? 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20'
                                                : reward.claimed
                                                    ? 'border-green-500/30 bg-green-500/5'
                                                    : 'border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5 flex-1">
                                                <div className={`p-3 rounded-xl ${reward.claimed
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : canClaim
                                                        ? 'bg-purple-500/20 text-purple-400 animate-pulse'
                                                        : 'bg-white/10 text-white/40'
                                                    }`}>
                                                    {reward.claimed ? <Check size={20} /> : <Icon size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-white">{reward.title}</h4>
                                                        {reward.claimed && (
                                                            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                                                                COMPLETED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-white/40 mb-3">{reward.description}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 flex-1 max-w-xs bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${reward.claimed
                                                                    ? 'bg-green-500'
                                                                    : canClaim
                                                                        ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                                                                        : 'bg-white/30'
                                                                    }`}
                                                                style={{ width: `${progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-white/40 font-medium">
                                                            {reward.progress}/{reward.target}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-6">
                                                <p className={`text-xl font-black mb-2 ${reward.claimed ? 'text-green-400' : 'text-white'
                                                    }`}>
                                                    {reward.rewardAmount} AGW
                                                </p>
                                                <button
                                                    onClick={() => handleClaim(reward)}
                                                    disabled={!canClaim || claiming === reward.id}
                                                    className={`text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-xl transition-all ${reward.claimed
                                                        ? 'bg-green-500/20 text-green-400 cursor-default'
                                                        : canClaim
                                                            ? 'bg-purple-500 text-white hover:bg-purple-600 cursor-pointer'
                                                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {claiming === reward.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : reward.claimed ? (
                                                        'Claimed'
                                                    ) : canClaim ? (
                                                        'Claim Now'
                                                    ) : (
                                                        'In Progress'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Bonus Section */}
                        <div className="mt-12 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-2xl p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl">
                                    <Gift className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white">Daily Bonus</h3>
                                    <p className="text-sm text-white/40">Come back tomorrow for your daily reward!</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <div
                                        key={day}
                                        className={`flex-1 h-12 rounded-xl flex items-center justify-center text-sm font-bold ${day <= 1
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-white/10 text-white/40'
                                            }`}
                                    >
                                        {day === 7 ? '🎁' : `D${day}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </div>
    );
}
