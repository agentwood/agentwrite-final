import React, { useState } from 'react';
import { PayoutTransaction } from '../types';
import { 
  Copy, Check, DollarSign, Users, MousePointer, 
  ArrowUpRight, ExternalLink, AlertCircle, Banknote,
  ChevronRight, Download, CreditCard
} from 'lucide-react';

const mockTransactions: PayoutTransaction[] = [
  { id: 'TX-9928', date: 'Oct 01, 2023', amount: 1250.00, status: 'Paid', period: 'June 2023 Earnings' },
  { id: 'TX-9929', date: 'Nov 01, 2023', amount: 840.50, status: 'Paid', period: 'July 2023 Earnings' },
  { id: 'TX-9930', date: 'Dec 01, 2023', amount: 950.00, status: 'Held (90 Days)', period: 'August 2023 Earnings' },
  { id: 'TX-9931', date: 'Jan 01, 2024', amount: 420.00, status: 'Held (90 Days)', period: 'September 2023 Earnings' },
];

export const Payouts: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://agentwood.ai/?ref=sparklycamel";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in font-inter">
       {/* Header */}
       <div className="mb-12 text-center max-w-2xl mx-auto pt-4">
           <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Affiliate Program</h1>
           <p className="text-lg text-gray-500 leading-relaxed">
               Invite friends to Agentwood and earn <span className="text-gray-900 font-semibold">30% recurring commission</span> on all their payments for the first 12 months.
           </p>
       </div>

       {/* Hero Card - Link */}
       <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 shadow-sm relative overflow-hidden group hover:border-gray-300 transition-all">
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex-1 w-full">
                   <h2 className="text-xl font-bold text-gray-900 mb-2">Your Referral Link</h2>
                   <p className="text-gray-500 mb-6 text-sm">Share this link to start earning. Cookies last 60 days.</p>
                   
                   <div className="flex flex-col sm:flex-row gap-3">
                       <div className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 flex items-center shadow-inner">
                           {referralLink}
                       </div>
                       <button 
                            onClick={copyToClipboard}
                            className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                copied 
                                ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                                : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-gray-200'
                            }`}
                       >
                           {copied ? <Check size={18} /> : <Copy size={18} />}
                           {copied ? 'Copied' : 'Copy Link'}
                       </button>
                   </div>
               </div>
                
                {/* Visual Decoration */}
               <div className="hidden md:flex gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users size={28} />
                    </div>
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                        <DollarSign size={28} />
                    </div>
               </div>
           </div>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Total Clicks', value: '1,240', icon: MousePointer },
                { label: 'Referrals', value: '86', icon: Users },
                { label: 'Conversion', value: '6.9%', icon: ArrowUpRight },
                { label: 'Unpaid Earnings', value: '$1,370.00', icon: DollarSign, highlight: true },
            ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-2xl border flex flex-col justify-between h-32 transition-all hover:-translate-y-1 hover:shadow-md ${stat.highlight ? 'bg-gray-900 text-white border-black' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-wider ${stat.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{stat.label}</span>
                        <stat.icon size={16} className={stat.highlight ? 'text-gray-400' : 'text-gray-400'} />
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                </div>
            ))}
       </div>

       {/* Main Content Split */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Transaction History */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
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
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tx.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{tx.period}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                            tx.status === 'Paid' 
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
                     {/* Empty State / Load More */}
                     <div className="p-4 border-t border-gray-100 text-center">
                        <button className="text-sm text-gray-400 hover:text-gray-900 font-medium transition-colors">
                            Show older transactions
                        </button>
                     </div>
                </div>
            </div>

            {/* Right: Payout Configuration */}
            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Payout Method</h3>
                    
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">Stripe Connect</div>
                            <div className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
                                <Check size={10} /> Active
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        Configure Payouts <ExternalLink size={14} />
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <div className="flex gap-3 mb-2">
                         <AlertCircle size={20} className="text-blue-600 shrink-0" />
                         <h4 className="font-bold text-blue-900 text-sm">90-Day Hold</h4>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed mb-4">
                        Commissions are held for 90 days for fraud prevention. Your next payout is scheduled for April 1st.
                    </p>
                    <a href="#" className="text-xs font-bold text-blue-900 hover:underline">Read Policy</a>
                </div>
            </div>
       </div>
    </div>
  );
};