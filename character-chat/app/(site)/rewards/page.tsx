'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Sparkles,
    Target,
    CheckCircle2,
    Lock,
    Loader2,
    Share2,
    Gift,
    Zap,
    Globe,
    MessageCircle,
    Gem
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Reward {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    claimed: boolean;
    readyToClaim?: boolean;
    rewardAmount: number;
    type: string;
    icon?: string;
}

interface RewardsData {
    rewards: Reward[];
    creditsBalance: number;
    level: number;
    nextGoal: string;
}

export default function RewardsPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<RewardsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRewards();
    }, [session]);

    const fetchRewards = async () => {
        try {
            const res = await fetch('/api/rewards', {
                headers: {
                    'x-user-id': localStorage.getItem('agentwood_user_id') || ''
                }
            });
            if (res.ok) {
                const jsonData = await res.json();
                setData(jsonData);
            }
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (reward: Reward) => {
        if (claimingId) return;
        setClaimingId(reward.id);

        try {
            const res = await fetch('/api/rewards/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': localStorage.getItem('agentwood_user_id') || ''
                },
                body: JSON.stringify({ rewardId: reward.id }),
            });

            if (res.ok) {
                toast.success(`Claimed ${reward.title}!`, {
                    description: reward.type === 'credits' ? `Added ${reward.rewardAmount} credits` : 'Reward Unlocked'
                });
                fetchRewards(); // Refresh data
            } else {
                toast.error('Failed to claim reward');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setClaimingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'message-circle': return <MessageCircle className="w-5 h-5" />;
            case 'check-circle': return <CheckCircle2 className="w-5 h-5" />;
            case 'zap': return <Zap className="w-5 h-5" />;
            case 'globe': return <Globe className="w-5 h-5" />;
            default: return <Target className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-8 pt-24 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center space-x-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Total Level</div>
                            <div className="text-3xl font-light italic font-serif">{data?.level || 1}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center space-x-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Credits Earned</div>
                            <div className="text-3xl font-light italic font-serif">{data?.creditsBalance || 0}</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#111] border border-white/5 rounded-2xl p-6 flex items-center space-x-4"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Next Goal</div>
                            <div className="text-xl font-light italic font-serif truncate">{data?.nextGoal || 'None'}</div>
                        </div>
                    </motion.div>
                </div>

                {/* Rewards List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-light italic font-serif text-white/60 mb-6">Achievements</h2>

                    {data?.rewards.map((reward, index) => {
                        const percentage = Math.min(100, (reward.progress / reward.target) * 100);
                        const isCompleted = reward.progress >= reward.target;

                        return (
                            <motion.div
                                key={reward.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group overflow-hidden rounded-2xl border ${isCompleted
                                        ? 'bg-[#111] border-green-500/20'
                                        : 'bg-[#0a0a0a] border-white/5'
                                    } p-6 transition-all duration-300 hover:border-white/10`}
                            >
                                {/* Background Progress Bar (Subtle) */}
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000"
                                    style={{ width: `${percentage}%` }}
                                />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-start space-x-4">
                                        <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center shrink-0
                      ${isCompleted ? 'bg-green-500 text-black' : 'bg-white/5 text-white/40'}
                    `}>
                                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : getIcon(reward.icon)}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                                {reward.title}
                                                {reward.type === 'voice-pack' && (
                                                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Voice Pack</span>
                                                )}
                                                {reward.type === 'badge' && (
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Badge</span>
                                                )}
                                            </h3>
                                            <p className="text-white/40 text-sm mb-3">{reward.description}</p>

                                            <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-wider">
                                                <div className="text-white/20">Progress</div>
                                                <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <div className={isCompleted ? 'text-green-500' : 'text-purple-400'}>
                                                    {reward.progress} / {reward.target}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {reward.claimed ? (
                                            <span className="flex items-center space-x-2 text-white/20 text-sm font-bold uppercase tracking-wider px-4 py-2 border border-white/5 rounded-full">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Claimed</span>
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => reward.readyToClaim && handleClaim(reward)}
                                                disabled={!reward.readyToClaim || claimingId === reward.id}
                                                className={`
                          flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                          ${reward.readyToClaim
                                                        ? 'bg-white text-black hover:bg-white/90 cursor-pointer shadow-lg shadow-white/10'
                                                        : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                        `}
                                            >
                                                {reward.readyToClaim ? (
                                                    claimingId === reward.id ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            <span>Claiming...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {reward.type === 'credits' && <Gem className="w-3 h-3" />}
                                                            {reward.type === 'voice-pack' && <Lock className="w-3 h-3" />}
                                                            {reward.type === 'badge' && <Trophy className="w-3 h-3" />}
                                                            <span>{reward.rewardAmount > 0 ? `${reward.rewardAmount} Credits` : 'Claim Reward'}</span>
                                                        </>
                                                    )
                                                ) : (
                                                    <>
                                                        <Lock className="w-3 h-3" />
                                                        <span>{reward.rewardAmount > 0 ? `${reward.rewardAmount} Credits` : 'Locked'}</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 p-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-3xl border border-white/5 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-serif italic text-white mb-2">Invite Friends, Earn Credits</h3>
                        <p className="text-white/40 mb-6 max-w-lg mx-auto">Get 500 unallocated credits for every friend who joins properly and crafts their first story.</p>
                        <button className="bg-white text-black hover:bg-purple-50 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 mx-auto transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>Copy Invite Link</span>
                        </button>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                </div>

            </div>
        </div>
    );
}
