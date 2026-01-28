import React, { useState, useEffect } from 'react';
import {
    TrendingUp, Mic, Users, Box, Download, Calendar,
    ArrowUpRight, ArrowDownRight, MoreHorizontal, Play,
    Loader2
} from 'lucide-react';

const AnalyticsView: React.FC = () => {
    const [dateRange, setDateRange] = useState('Last 7 Days');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Get real user ID from local storage (matching auth.ts logic)
                const storedUserId = localStorage.getItem('agentwood_user_id');

                if (!storedUserId) {
                    console.warn("No user ID found, analytics will be empty.");
                    setLoading(false);
                    return;
                }

                const res = await fetch('/api/user/analytics', {
                    headers: { 'x-user-id': storedUserId }
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                } else {
                    console.error("Failed to fetch analytics:", res.statusText);
                    // Keep stats null or empty to indicate no data, rather than fake data
                    setStats(null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    // effective data or zeros
    const views = stats?.totalViews || 0;
    const interactions = stats?.totalInteractions || 0;

    // Dynamic Calculations
    const estPayout = (interactions * 0.05).toFixed(2); // $0.05 per interaction mock
    const voiceMins = Math.floor(interactions * 0.8); // 0.8 mins per interaction avg

    const kpiData = [
        {
            title: 'Est. Payout',
            value: `$${estPayout}`,
            trend: '+12.5%',
            isPositive: true,
            icon: <div className="text-green-400">$</div>,
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            title: 'Voice Mins',
            value: voiceMins.toLocaleString(),
            trend: '+5.2%',
            isPositive: true,
            icon: <Mic size={16} className="text-purple-400" />,
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            title: 'User Sessions',
            value: views.toLocaleString(),
            trend: '-2.1%',
            isPositive: false,
            icon: <Users size={16} className="text-blue-400" />,
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            title: 'Characters',
            value: stats?.characters?.length || 0,
            sub: 'Active',
            icon: <Box size={16} className="text-orange-400" />,
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
                <Loader2 size={32} className="text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white p-8 md:p-12 animate-fade-in font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <button className="flex items-center gap-2 text-white/40 mb-4 hover:text-white transition-colors">
                            <span className="text-2xl font-serif italic text-white/40">&lt;</span>
                        </button>
                        <h1 className="text-5xl font-serif italic text-white mb-2">Data Analytics</h1>
                        <p className="text-white/40 text-sm tracking-wide">Track your created characters and voice performance.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-[#161616] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-white/20 transition-colors flex items-center gap-2 text-white/60">
                            {dateRange} <Calendar size={12} />
                        </button>
                        <button className="px-4 py-2 bg-white text-black border border-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-colors flex items-center gap-2">
                            Export CSV <Download size={12} />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiData.map((kpi, i) => (
                        <div key={i} className="bg-[#161616] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{kpi.title}</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.border} border`}>
                                    {kpi.icon}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1 relative z-10">
                                <span className="text-4xl font-serif italic text-white font-medium tracking-tight">{kpi.value}</span>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {kpi.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {kpi.trend} <span className="text-white/20 font-normal ml-1">vs last week</span>
                                    </div>
                                )}
                                {kpi.sub && <span className="text-xs text-white/40">{kpi.sub}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Asset Performance Table */}
                    <div className="lg:col-span-2 bg-[#161616] border border-white/5 rounded-2xl p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif italic text-white">Asset Performance</h2>
                            <button className="text-white/20 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                        </div>

                        <div className="uppercase text-[10px] font-bold tracking-widest text-white/30 flex justify-between pb-4 border-b border-white/5 mb-4 px-2">
                            <span className="flex-1">Name</span>
                            <span className="w-24 text-right">Users</span>
                            <span className="w-24 text-right">Mins Used</span>
                            <span className="w-24 text-right">Payout</span>
                        </div>

                        <div className="space-y-2">
                            {stats?.characters?.length > 0 ? stats.characters.map((asset: any) => (
                                <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className="flex-1 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center border border-white/10">
                                            {asset.avatarUrl ? (
                                                <img src={asset.avatarUrl} className="w-full h-full object-cover" alt={asset.name} />
                                            ) : (
                                                <Mic size={16} className="text-white/40" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm">{asset.name}</h3>
                                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Character</span>
                                        </div>
                                    </div>
                                    <span className="w-24 text-right text-sm font-medium text-white/80 font-mono">{asset.stats.views}</span>
                                    <span className="w-24 text-right text-sm font-medium text-white/80 font-mono">{Math.floor(asset.stats.interactions * 0.8)}</span>
                                    <span className={`w-24 text-right text-sm font-bold font-mono text-green-400`}>${(asset.stats.interactions * 0.05).toFixed(2)}</span>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-white/40 italic">
                                    No assets found. Create a character to see stats.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Usage Activity Graph (Visual Only) */}
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-8 flex flex-col">
                        <h2 className="text-2xl font-serif italic text-white mb-2">Usage Activity</h2>
                        <div className="flex-1 flex items-end justify-between gap-2 pt-10 min-h-[300px]">
                            {[30, 45, 25, 60, 50, 80, 65].map((h, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group flex-1">
                                    <div className="w-full bg-[#1c1816] rounded-t-lg relative h-full flex flex-col justify-end overflow-hidden group-hover:bg-[#25201d] transition-colors">
                                        <div
                                            className="w-full bg-white/5 group-hover:bg-green-500/20 transition-all duration-500 relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-green-500/50 opacity-0 group-hover:opacity-100"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Day {i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsView;
