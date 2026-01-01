'use client';

import { useState } from 'react';
import {
    Copy, Check, DollarSign, Users, MousePointer,
    ArrowUpRight, ExternalLink, AlertCircle, Banknote,
    Download, ChevronDown, ChevronUp, Sparkles, Zap, BarChart3
} from 'lucide-react';

interface PayoutTransaction {
    id: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Processing' | 'Held (90 Days)';
    period: string;
}

// Mock data - will be replaced with real API data
const mockTransactions: PayoutTransaction[] = [
    { id: 'TX-9928', date: 'Oct 01, 2023', amount: 1250.00, status: 'Paid', period: 'June 2023 Earnings' },
    { id: 'TX-9929', date: 'Nov 01, 2023', amount: 840.50, status: 'Paid', period: 'July 2023 Earnings' },
    { id: 'TX-9930', date: 'Dec 01, 2023', amount: 950.00, status: 'Held (90 Days)', period: 'August 2023 Earnings' },
    { id: 'TX-9931', date: 'Jan 01, 2024', amount: 420.00, status: 'Held (90 Days)', period: 'September 2023 Earnings' },
];

const FAQ_ITEMS = [
    {
        q: 'How much can I earn as an affiliate?',
        a: 'For every new paid subscriber, you\'ll earn 30% of all payments for the first 12 months — with no limits! Top affiliates earn thousands monthly.'
    },
    {
        q: 'How do I join the Agentwood Affiliate Program?',
        a: 'Simply sign up for an Agentwood account and navigate to Settings > Affiliates. Your unique referral link is generated automatically.'
    },
    {
        q: 'When and how will I get paid?',
        a: 'Payouts are processed monthly via Stripe Connect. Earnings are held for 90 days for fraud prevention, then automatically deposited to your linked account.'
    },
    {
        q: 'What is the minimum payout threshold?',
        a: 'The minimum payout is $50. Once you reach this threshold, your earnings will be included in the next monthly payout cycle.'
    },
    {
        q: 'How can I track my sales and commissions?',
        a: 'Your affiliate dashboard shows real-time stats including clicks, conversions, and earnings. You can also download detailed CSV reports.'
    },
    {
        q: 'What is the cookie duration for referral links?',
        a: 'Referral cookies last for 60 days. If someone clicks your link and signs up within 60 days, you get credit for the referral.'
    },
];

interface PayoutsProps {
    username?: string;
}

export default function Payouts({ username = 'user' }: PayoutsProps) {
    const [copied, setCopied] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const referralLink = `https://agentwood.ai/?ref=${username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-fade-in font-inter">
            {/* Hero Section */}
            <div className="text-center py-16 px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold mb-6">
                    <Sparkles size={16} className="fill-current" />
                    Affiliate Program
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Become an affiliate<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                        earn with every recommendation
                    </span>
                </h1>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
                    Partner with Agentwood and earn <span className="text-gray-900 font-bold">30% commission</span> for every new paid subscriber you refer. No limits!
                </p>
                <button
                    onClick={copyToClipboard}
                    className="px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 inline-flex items-center gap-2"
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                    {copied ? 'Link Copied!' : 'Get Your Referral Link'}
                </button>
            </div>

            {/* 3 Benefits Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 px-4">
                {[
                    {
                        icon: DollarSign,
                        title: 'Rewarding referrals',
                        desc: 'Earn 30% of all payments for the first 12 months — with no limits!',
                        color: 'bg-green-50 text-green-600'
                    },
                    {
                        icon: Users,
                        title: 'Spread the word',
                        desc: 'Share Agentwood with your friends and followers — help AI become more accessible.',
                        color: 'bg-blue-50 text-blue-600'
                    },
                    {
                        icon: BarChart3,
                        title: 'Transparent tracking',
                        desc: 'Keep an eye on your earnings with our intuitive real-time dashboard.',
                        color: 'bg-purple-50 text-purple-600'
                    },
                ].map((benefit, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-all">
                        <div className={`w-14 h-14 ${benefit.color} rounded-2xl flex items-center justify-center mb-6`}>
                            <benefit.icon size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-500">{benefit.desc}</p>
                    </div>
                ))}
            </div>

            {/* 3 Steps Section */}
            <div className="bg-gray-50 rounded-3xl p-12 mb-20 mx-4">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                    Start earning in <span className="text-indigo-600">3 easy steps</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { step: '1', title: 'Share', desc: 'Copy your unique referral link and share it with your audience' },
                        { step: '2', title: 'Subscribe', desc: 'When someone signs up using your link and subscribes' },
                        { step: '3', title: 'Earn', desc: 'You automatically earn 30% of their subscription for 12 months' },
                    ].map((item, i) => (
                        <div key={i} className="text-center">
                            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                {item.step}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral Link Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 mx-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Your Referral Link</h2>
                <p className="text-gray-500 mb-6 text-sm">Share this link to start earning. Cookies last 60 days.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 flex items-center shadow-inner overflow-x-auto">
                        {referralLink}
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${copied
                            ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                            : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200'
                            }`}
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied' : 'Copy Link'}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 px-4">
                {[
                    { label: 'Total Clicks', value: '1,240', icon: MousePointer },
                    { label: 'Referrals', value: '86', icon: Users },
                    { label: 'Conversion', value: '6.9%', icon: ArrowUpRight },
                    { label: 'Unpaid Earnings', value: '$1,370.00', icon: DollarSign, highlight: true },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`p-6 rounded-2xl border flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md ${stat.highlight
                            ? 'bg-gray-900 text-white border-black'
                            : 'bg-white border-gray-200 text-gray-900'
                            }`}
                    >
                        <div className="flex justify-between items-start">
                            <span className={`text-xs font-bold uppercase tracking-wider ${stat.highlight ? 'text-gray-400' : 'text-gray-400'}`}>
                                {stat.label}
                            </span>
                            <stat.icon size={16} className={stat.highlight ? 'text-gray-400' : 'text-gray-400'} />
                        </div>
                        <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className="border-b border-gray-100 last:border-0">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex items-center justify-between py-4 text-left"
                            >
                                <span className="font-semibold text-gray-900">{item.q}</span>
                                {openFaq === i ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                            </button>
                            {openFaq === i && (
                                <p className="pb-4 text-gray-500 animate-fade-in">{item.a}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Payout History */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Payout History</h3>
                    <button className="text-sm font-semibold text-gray-500 hover:text-black flex items-center gap-1">
                        <Download size={14} /> Download CSV
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tx.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{tx.period}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === 'Paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right font-mono">
                                        ${tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
