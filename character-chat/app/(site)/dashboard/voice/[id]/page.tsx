'use client';

import { useState, useEffect, use } from 'react';
import { TrendingUp, Users, MessageSquare, DollarSign, Clock, Settings, Pause, Play, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getAuthHeaders } from '@/lib/auth';

interface DashboardData {
    voice: {
        id: string;
        displayName: string;
        description: string | null;
        status: string;
        qualityScore: number;
        isPaused: boolean;
        licensingType: string;
        allowEnterpriseResale: boolean;
    };
    usage: {
        totalMinutes: number;
        uniqueUsers: number;
        activeCharacters: number;
        growth: {
            last24h: { minutes: number; events: number };
            last7d: { minutes: number; events: number };
        };
    };
    earnings: {
        accruedAwsTokens: number;
        accruedCashUsd: number;
        lifetimeEarningsUsd: number;
        daysUntilNextPayout: number;
        awsPrice: number;
    };
    characters: Array<{
        characterId: string;
        name: string;
        avatarUrl: string | null;
        totalMinutes: number;
        totalRevenue: number;
        usageCount: number;
    }>;
    settlements: Array<{
        id: string;
        period: string;
        totalAwsTokens: number;
        totalCashUsd: number;
        status: string;
        completedAt: string | null;
    }>;
}

export default function VoiceDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const response = await fetch(`/api/voice/dashboard/${id}`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch dashboard');
                }

                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0c0f16] flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading dashboard...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-[#0c0f16] flex items-center justify-center">
                <div className="text-red-400">{error || 'Failed to load dashboard'}</div>
            </div>
        );
    }

    const { voice, usage, earnings, characters, settlements } = data;

    return (
        <div className="min-h-screen bg-[#0c0f16] text-white">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{voice.displayName}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${voice.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    voice.status === 'pending_review' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-500/20 text-gray-400'
                                }`}>
                                {voice.status.replace('_', ' ').toUpperCase()}
                            </span>
                            {voice.isPaused && (
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">
                                    PAUSED
                                </span>
                            )}
                            <span className="text-gray-500 text-sm">Quality: {voice.qualityScore}/100</span>
                        </div>
                    </div>
                    <Link
                        href={`/dashboard/voice/${id}/settings`}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <Settings size={16} />
                        Settings
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Clock className="text-blue-400" />}
                        label="Total Minutes"
                        value={usage.totalMinutes.toLocaleString()}
                        subtitle={`+${usage.growth.last24h.minutes.toFixed(1)} last 24h`}
                    />
                    <StatCard
                        icon={<Users className="text-purple-400" />}
                        label="Unique Users"
                        value={usage.uniqueUsers.toLocaleString()}
                    />
                    <StatCard
                        icon={<MessageSquare className="text-green-400" />}
                        label="Active Characters"
                        value={usage.activeCharacters.toString()}
                    />
                    <StatCard
                        icon={<TrendingUp className="text-amber-400" />}
                        label="7-Day Growth"
                        value={`+${usage.growth.last7d.minutes.toFixed(0)} min`}
                        subtitle={`${usage.growth.last7d.events} events`}
                    />
                </div>

                {/* Earnings Section */}
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20 mb-8">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <DollarSign className="text-green-400" size={20} />
                        Earnings
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Accrued $AWS</p>
                            <p className="text-2xl font-bold text-purple-400">{earnings.accruedAwsTokens.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Cash Equivalent</p>
                            <p className="text-2xl font-bold text-green-400">${earnings.accruedCashUsd.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Next Payout</p>
                            <p className="text-2xl font-bold">{earnings.daysUntilNextPayout} days</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Lifetime Earnings</p>
                            <p className="text-2xl font-bold">${earnings.lifetimeEarningsUsd.toFixed(2)}</p>
                        </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-4">
                        Current $AWS Price: ${earnings.awsPrice.toFixed(4)} • Rate: $0.01 per 10 minutes
                    </p>
                </div>

                {/* Character Usage Table */}
                <div className="bg-white/5 rounded-2xl border border-white/10 mb-8">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold flex items-center gap-2">
                            <BarChart3 size={18} />
                            Character Usage
                        </h2>
                        <span className="text-gray-500 text-sm">{characters.length} characters</span>
                    </div>
                    <div className="divide-y divide-white/5">
                        {characters.length === 0 ? (
                            <p className="p-6 text-gray-500 text-center">No characters using this voice yet.</p>
                        ) : (
                            characters.map((char) => (
                                <div key={char.characterId} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                            {char.avatarUrl && (
                                                <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{char.name}</p>
                                            <p className="text-gray-500 text-sm">{char.usageCount} uses</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{char.totalMinutes.toFixed(1)} min</p>
                                        <p className="text-green-400 text-sm">${char.totalRevenue.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Settlement History */}
                <div className="bg-white/5 rounded-2xl border border-white/10">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold">Settlement History</h2>
                    </div>
                    <div className="divide-y divide-white/5">
                        {settlements.length === 0 ? (
                            <p className="p-6 text-gray-500 text-center">No settlements yet. First payout after 60 days.</p>
                        ) : (
                            settlements.map((s) => (
                                <div key={s.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{s.period}</p>
                                        <p className="text-gray-500 text-sm">
                                            {s.status === 'completed' && s.completedAt
                                                ? `Paid on ${new Date(s.completedAt).toLocaleDateString()}`
                                                : s.status.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">{s.totalAwsTokens.toLocaleString()} $AWS</p>
                                        <p className="text-green-400 text-sm">${s.totalCashUsd.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    subtitle,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
    );
}
