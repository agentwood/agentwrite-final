'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Users, BarChart3, ArrowUpRight, Copy, Check, ExternalLink, Loader2 } from 'lucide-react';
import Sidebar from '@/app/components/Sidebar';
import Footer from '@/app/components/Footer';
import { getSession } from '@/lib/auth';

interface AffiliateStats {
    totalClicks: number;
    referrals: number;
    conversionRate: string;
    totalEarnings: number;
    unpaidEarnings: number;
    referralLink: string;
    stripeConnected: boolean;
}

interface Payout {
    id: string;
    date: string;
    amount: number;
    status: string;
    period: string;
}

export default function AffiliatesPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<AffiliateStats | null>(null);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchAffiliateData() {
            try {
                const session = getSession();
                if (!session?.id) {
                    // Use demo data for non-authenticated users
                    setStats({
                        totalClicks: 142,
                        referrals: 7,
                        conversionRate: '4.9',
                        totalEarnings: 0,
                        unpaidEarnings: 0,
                        referralLink: 'https://agentwood.ai/?ref=demo',
                        stripeConnected: false,
                    });
                    setPayouts([]);
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/api/affiliate?userId=${session.id}`);
                if (!response.ok) throw new Error('Failed to fetch affiliate data');

                const data = await response.json();
                setStats(data.stats);
                setPayouts(data.payouts || []);
            } catch (err) {
                console.error('Error fetching affiliate data:', err);
                setError('Unable to load affiliate data');
                // Set fallback demo data
                setStats({
                    totalClicks: 0,
                    referrals: 0,
                    conversionRate: '0.0',
                    totalEarnings: 0,
                    unpaidEarnings: 0,
                    referralLink: 'https://agentwood.ai/?ref=demo',
                    stripeConnected: false,
                });
            } finally {
                setLoading(false);
            }
        }

        fetchAffiliateData();
    }, []);

    const copyToClipboard = () => {
        if (stats?.referralLink) {
            navigator.clipboard.writeText(stats.referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const statCards = [
        {
            label: 'Total Earnings',
            value: stats ? `$${stats.totalEarnings.toFixed(2)}` : '$0.00',
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            label: 'Active Referrals',
            value: stats?.referrals?.toString() || '0',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Conversion Rate',
            value: stats ? `${stats.conversionRate}%` : '0%',
            icon: BarChart3,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="flex min-h-screen bg-[#0f0f0f]">
            <Sidebar recentCharacters={[]} />
            <main className="flex-1 lg:pl-60 flex flex-col">
                <div className="p-10 fade-in flex-1">
                    <div className="mb-12 text-left">
                        <h2 className="text-4xl font-black mb-3 tracking-tight">Affiliate Dashboard</h2>
                        <p className="text-sm opacity-40 font-medium">Manage your referrals and track your earnings in real-time.</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                {statCards.map((stat, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-colors group">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className={`p-3 ${stat.bgColor} rounded-2xl group-hover:scale-110 transition-transform`}>
                                                <stat.icon className={stat.color} size={24} />
                                            </div>
                                            <ArrowUpRight size={20} className="text-white/20" />
                                        </div>
                                        <p className="text-4xl font-black mb-2 tracking-tighter">{stat.value}</p>
                                        <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Referral Link Section */}
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 mb-12">
                                <h3 className="text-lg font-bold mb-4">Your Referral Link</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-black/30 rounded-xl px-4 py-3 text-sm text-white/60 font-mono truncate">
                                        {stats?.referralLink || 'Loading...'}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <p className="text-xs text-white/30 mt-3">
                                    Earn 20% commission on every purchase made through your link for the first 90 days.
                                </p>
                            </div>

                            {/* Payout History */}
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                                <h3 className="text-lg font-bold mb-6">Payout History</h3>
                                {payouts.length > 0 ? (
                                    <div className="space-y-4">
                                        {payouts.map((payout) => (
                                            <div key={payout.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                                <div>
                                                    <p className="font-semibold">${payout.amount.toFixed(2)}</p>
                                                    <p className="text-xs text-white/40">{new Date(payout.date).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${payout.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                                                        payout.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-zinc-500/20 text-zinc-400'
                                                    }`}>
                                                    {payout.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-white/40">
                                        <p>No payouts yet</p>
                                        <p className="text-xs mt-2">Start sharing your referral link to earn commissions!</p>
                                    </div>
                                )}
                            </div>

                            {/* Connect Stripe CTA */}
                            {!stats?.stripeConnected && (
                                <div className="mt-8 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold mb-1">Connect Stripe to receive payouts</h4>
                                        <p className="text-sm text-white/50">Set up your payout method to withdraw your earnings</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-200 transition-colors">
                                        Connect Stripe
                                        <ExternalLink size={16} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <Footer />
            </main>
        </div>
    );
}
