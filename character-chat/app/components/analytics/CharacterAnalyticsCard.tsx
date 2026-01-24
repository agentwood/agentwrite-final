
"use client";

import React from 'react';
import { Eye, MessageSquare, User, Save, TrendingUp, Activity } from 'lucide-react';

interface AnalyticsData {
    totalViews: number;
    totalInteractions: number;
    totalFollowers: number;
    avgRetention: number;
    characters: {
        id: string;
        name: string;
        avatarUrl: string;
        stats: {
            views: number;
            interactions: number;
            followers: number;
            saves: number;
            retention: number;
        };
        createdAt: string;
    }[];
}

interface AnalyticsCardProps {
    data: AnalyticsData;
    isLoading?: boolean;
}

export const CharacterAnalyticsCard: React.FC<AnalyticsCardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-[#151515] border border-white/5 rounded-2xl p-6 h-64 flex items-center justify-center animate-pulse">
                <div className="space-y-4 text-center">
                    <div className="w-8 h-8 bg-white/10 rounded-full mx-auto"></div>
                    <div className="h-2 w-24 bg-white/10 rounded mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-serif italic text-white/50 border-b border-white/5 pb-2">Top Performance</h3>

            {/* Aggregate Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <Eye size={10} /> Total Views
                    </span>
                    <span className="text-2xl font-bold text-white">{data.totalViews.toLocaleString()}</span>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <MessageSquare size={10} /> Chats
                    </span>
                    <span className="text-2xl font-bold text-white">{data.totalInteractions.toLocaleString()}</span>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <User size={10} /> Followers
                    </span>
                    <span className="text-2xl font-bold text-white">{data.totalFollowers.toLocaleString()}</span>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1">
                        <Activity size={10} /> Retention
                    </span>
                    <span className="text-2xl font-bold text-green-400">{data.avgRetention}%</span>
                </div>
            </div>

            {/* Character List */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-4">Character Breakdown</h4>
                {data.characters.length === 0 ? (
                    <div className="p-8 text-center border border-white/5 border-dashed rounded-xl">
                        <p className="text-white/30 text-sm">No data available yet.</p>
                    </div>
                ) : (
                    data.characters.map(char => (
                        <div key={char.id} className="bg-[#151515] p-4 rounded-xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-3">
                                <img src={char.avatarUrl} className="w-10 h-10 rounded-lg object-cover bg-white/5" />
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{char.name}</p>
                                    <p className="text-[10px] text-white/30">Created {new Date(char.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase">Views</p>
                                    <p className="text-xs font-bold text-white">{char.stats.views}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/30 uppercase">Chats</p>
                                    <p className="text-xs font-bold text-white">{char.stats.interactions}</p>
                                </div>
                                <TrendingUp size={16} className="text-green-500/50" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
